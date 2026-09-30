import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import {
  SITE_URL,
  applyAttemptResult,
  callSyngraph,
  finalAssessmentEligibility,
  type SyngraphAttempt,
} from "../_shared/syngraph.ts";

// Course final assessment (taken in Syngraph, embedded in the LMS).
//   status { course_id }  -> configuration, eligibility, latest attempt (a
//                            pending attempt is re-checked with Syngraph)
//   launch { course_id }  -> one-time Syngraph link for this learner
//   sync   { attempt_id } -> pull the authoritative result from Syngraph
//   list   (admin)        -> the Syngraph assessments available to link

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const ALLOWED_ORIGINS = new Set(["https://www.safetytech.academy", "https://safetytech.academy", "http://localhost:8080"]);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: userData } = await db.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: role } = await db.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    const isAdmin = !!role;

    const body = await req.json().catch(() => ({})) as { action?: string; course_id?: string; attempt_id?: string };

    const syncRow = async (row: any) => {
      if (row?.status !== "launched" || !row.syngraph_launch_id) return row;
      try {
        const { attempt } = await callSyngraph<{ attempt: SyngraphAttempt | null }>("api-get-attempt", { launchId: row.syngraph_launch_id });
        return attempt ? await applyAttemptResult(db, row, attempt) : row;
      } catch (e) {
        console.warn("sync failed", (e as Error).message);
        return row;
      }
    };

    if (body.action === "sync") {
      const { data: row } = await db.from("final_assessment_attempts").select("*").eq("id", body.attempt_id ?? "").maybeSingle();
      if (!row || row.user_id !== user.id) return json({ error: "Attempt not found" }, 404);
      return json({ attempt: await syncRow(row) });
    }

    if (body.action === "list") {
      if (!isAdmin) return json({ error: "Forbidden" }, 403);
      try {
        return json(await callSyngraph("api-list-assessments", {}));
      } catch (e) {
        return json({ error: `Syngraph: ${(e as Error).message}` }, 502);
      }
    }

    const { data: course } = await db.from("courses").select("id, title, final_assessment_ref").eq("id", body.course_id ?? "").maybeSingle();
    if (!course) return json({ error: "Course not found" }, 404);
    if (!course.final_assessment_ref) return json({ configured: false });

    const { data: enr } = await db.from("enrollments").select("status, expires_at").eq("user_id", user.id).eq("course_id", course.id).maybeSingle();
    const enrolled = !!enr && enr.status === "active" && (!enr.expires_at || new Date(enr.expires_at) > new Date());
    if (!enrolled && !isAdmin) return json({ error: "No active enrolment" }, 403);

    const eligibility = await finalAssessmentEligibility(db, user.id, course.id);
    const { data: rows } = await db.from("final_assessment_attempts").select("*").eq("user_id", user.id).eq("course_id", course.id).order("created_at", { ascending: false }).limit(5);
    let latest = rows?.[0] ?? null;
    // A recent pending attempt may have finished without its callback arriving yet.
    if (latest?.status === "launched" && Date.now() - new Date(latest.created_at).getTime() < 48 * 3600_000) latest = await syncRow(latest);
    const passedRow = latest?.status === "passed" ? latest : (rows ?? []).find((r: any) => r.status === "passed") ?? null;

    if (body.action === "status") {
      // Retake rules live in Syngraph; ask it whether another attempt is allowed.
      let allowance: { allowed: boolean; attemptsUsed: number; maxAttempts: number | null; reason: string | null } | null = null;
      if (!passedRow && user.email) {
        try {
          allowance = await callSyngraph("api-create-launch", { assessmentId: course.final_assessment_ref, learner: { email: user.email }, dryRun: true });
        } catch (e) {
          console.warn("allowance check failed", (e as Error).message);
        }
      }
      return json({
        attempts_used: allowance?.attemptsUsed ?? null,
        max_attempts: allowance?.maxAttempts ?? null,
        can_attempt: allowance ? allowance.allowed : true,
        block_reason: allowance?.reason ?? null,
        configured: true,
        preview: !enrolled && isAdmin,
        eligible: eligibility.eligible || isAdmin,
        missing_lessons: eligibility.missingLessons,
        missing_quizzes: eligibility.missingQuizzes,
        latest,
        passed: passedRow,
        attempts: (rows ?? []).filter((r: any) => r.status !== "launched").length,
      });
    }

    if (body.action === "launch") {
      if (passedRow) return json({ error: "You've already passed this assessment" }, 409);
      if (!eligibility.eligible && !isAdmin) {
        return json({ error: "Finish every lesson and module quiz to unlock the final assessment" }, 403);
      }

      const { data: profile } = await db.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      const fullName = (profile?.full_name || (user.user_metadata as { full_name?: string })?.full_name || "").trim();
      const [firstName, ...rest] = fullName ? fullName.split(/\s+/) : [(user.email ?? "").split("@")[0]];

      const { data: row, error: insErr } = await db.from("final_assessment_attempts")
        .insert({ user_id: user.id, course_id: course.id, assessment_ref: course.final_assessment_ref })
        .select("*").single();
      if (insErr || !row) return json({ error: "Could not start the assessment" }, 500);

      const origin = req.headers.get("Origin") ?? "";
      try {
        const launch = await callSyngraph<{ launchId: string; url: string; expiresAt: string }>("api-create-launch", {
          assessmentId: course.final_assessment_ref,
          learner: { firstName, lastName: rest.join(" "), email: user.email },
          externalRef: row.id,
          callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/syngraph-webhook`,
          returnOrigin: ALLOWED_ORIGINS.has(origin) ? origin : SITE_URL,
        });
        await db.from("final_assessment_attempts").update({ syngraph_launch_id: launch.launchId }).eq("id", row.id);
        return json({ url: launch.url, attempt_id: row.id, expires_at: launch.expiresAt });
      } catch (e) {
        await db.from("final_assessment_attempts").delete().eq("id", row.id);
        console.error("launch failed", (e as Error).message);
        const msg = (e as Error).message;
        // Retake limits come back from Syngraph as plain-language messages.
        if (/attempts have been used|only be taken once|already passed/i.test(msg)) return json({ error: msg }, 409);
        return json({ error: isAdmin ? `Syngraph: ${msg}` : "The assessment couldn't be opened. Please try again shortly." }, 502);
      }
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("final-assessment error", err);
    return json({ error: "Internal error" }, 500);
  }
});
