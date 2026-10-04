// A learner's GDPR rights, self-service from Settings:
//   { action: "export" }  -> everything we hold about the signed-in learner (JSON)
//   { action: "delete", confirm: "DELETE", deleteCertificates?: boolean }
//                         -> erases their account and personal data
//
// Deleting the auth user cascades to profiles, enrolments, progress, quiz and
// final-assessment attempts, community content and purchases (see FKs on
// auth.users). Rows keyed by email instead (leads, scorecard results and,
// only if asked, certificates) and the avatar files are removed here first.
// Certificates are kept by default so verification links on CVs/LinkedIn keep
// working. Payment records stay with Stripe (legal retention).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, allow, requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Tables holding the learner's rows by user_id (all cascade on account deletion).
const BY_USER = [
  "enrollments", "course_purchases", "lesson_progress", "lesson_watch", "quiz_attempts",
  "final_assessment_attempts", "learning_activity_days", "lesson_comments", "community_posts",
  "community_comments", "community_likes", "community_reactions", "community_event_rsvps",
  "community_memberships", "people_tags", "user_roles",
];

// Rows in `table` whose `col` is exactly this email (case-insensitive). ilike
// alone would treat "_" and "%" in an address as wildcards and could match
// someone else, so candidates are re-checked exactly in code.
// deno-lint-ignore no-explicit-any
async function rowsForEmail(db: any, table: string, col: string, email: string) {
  const { data, error } = await db.from(table).select("*").ilike(col, email.replace(/[%_*\\]/g, "_"));
  if (error) return { error };
  return { rows: (data ?? []).filter((r: Record<string, unknown>) => String(r[col] ?? "").toLowerCase() === email) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let user;
  try {
    user = await requireUser(req);
  } catch (e) {
    return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401);
  }
  if (!allow(`account-data:${user.id}`, 5, 60_000)) return json({ error: "Too many requests — try again in a minute." }, 429);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const email = (user.email ?? "").toLowerCase();
  const body = await req.json().catch(() => ({}));

  try {
    if (body.action === "export") {
      const out: Record<string, unknown> = {
        generated_at: new Date().toISOString(),
        controller: "Shield360 Ltd (SafetyTech Academy), 20 Wenlock Road, London N1 7GU — hello@safetytech.academy",
        account: {
          id: user.id, email: user.email, created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at, email_confirmed_at: user.email_confirmed_at,
        },
      };
      const { data: profile } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
      out.profile = profile;
      for (const t of BY_USER) {
        const { data, error } = await db.from(t).select("*").eq("user_id", user.id);
        out[t] = error ? { error: "unavailable" } : data;
      }
      if (email) {
        for (const [t, col] of [["certificates", "recipient_email"], ["leads", "email"], ["scorecard_results", "email"]] as const) {
          const r = await rowsForEmail(db, t, col, email);
          out[t] = r.error ? { error: "unavailable" } : r.rows;
        }
      }
      return json(out);
    }

    if (body.action === "delete") {
      if (body.confirm !== "DELETE") return json({ error: 'Type "DELETE" to confirm.' }, 400);
      // Never let the academy's own admin account delete itself by accident.
      const { data: isAdmin } = await db.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (isAdmin) return json({ error: "Admin accounts can't be deleted here. Remove the admin role first." }, 403);

      if (email) {
        const targets: [string, string][] = [["leads", "email"], ["scorecard_results", "email"]];
        if (body.deleteCertificates === true) targets.push(["certificates", "recipient_email"]);
        for (const [t, col] of targets) {
          const r = await rowsForEmail(db, t, col, email);
          const ids = (r.rows ?? []).map((row: Record<string, unknown>) => row.id).filter(Boolean);
          if (ids.length) await db.from(t).delete().in("id", ids);
        }
      }
      const { data: files } = await db.storage.from("avatars").list(user.id);
      if (files?.length) await db.storage.from("avatars").remove(files.map((f) => `${user.id}/${f.name}`));

      const { error } = await db.auth.admin.deleteUser(user.id);
      if (error) {
        console.error("[account-data] deleteUser failed", error.message);
        return json({ error: "We couldn't finish deleting your account. Email hello@safetytech.academy and we'll do it for you." }, 500);
      }
      console.log("[account-data] account deleted", { user: user.id, certificates: body.deleteCertificates === true });
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("[account-data] failed", e);
    return json({ error: "Something went wrong. Email hello@safetytech.academy and we'll help." }, 500);
  }
});
