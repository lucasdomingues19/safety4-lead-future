// Syngraph AI (syngraph.ai) integration for course final assessments.
//
// Flow: the learner finishes every required lesson and module quiz → the
// final-assessment function asks Syngraph for a one-time launch link bound to
// the learner's LMS identity → the learner takes it embedded in the LMS →
// Syngraph grades it server-side and, on a pass, issues a signed Open Badges
// credential → the result reaches us as a signed callback (syngraph-webhook)
// and/or via api-get-attempt (sync) — both paths end in applyAttemptResult.
// Nothing the browser says about the result is ever trusted.
//
// deno-lint-ignore-file no-explicit-any

const FUNCTIONS_URL = () => Deno.env.get("SYNGRAPH_FUNCTIONS_URL") ?? "https://bzmumnflczajlagnmppd.supabase.co/functions/v1";
const API_KEY = () => Deno.env.get("SYNGRAPH_API_KEY") ?? "";

export const SITE_URL = "https://www.safetytech.academy";

export interface SyngraphAttempt {
  attemptId: string;
  launchId: string | null;
  externalRef: string | null;
  assessmentId: string;
  assessmentTitle: string;
  status: string;
  completed: boolean;
  score: number | null;
  passed: boolean | null;
  completedAt: string | null;
  learner: { firstName: string | null; lastName: string | null; email: string | null };
  credential: { publicId: string; verifyUrl: string; issuedAt: string | null } | null;
}

export async function callSyngraph<T>(fn: string, body: unknown): Promise<T> {
  const res = await fetch(`${FUNCTIONS_URL()}/${fn}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Syngraph ${fn} failed (${res.status})`);
  return data as T;
}

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");

/** Verify `Syngraph-Signature: t=<unix>,v1=<hex>` over `${t}.${rawBody}`. */
export async function verifySyngraphSignature(rawBody: string, header: string | null): Promise<boolean> {
  if (!header || !API_KEY()) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.trim().split("=") as [string, string]));
  const t = Number(parts.t);
  if (!parts.v1 || !Number.isFinite(t) || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const secret = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(API_KEY())));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${rawBody}`)));
  if (expected.length !== parts.v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ parts.v1.charCodeAt(i);
  return diff === 0;
}

/** What still stands between the learner and the final assessment. */
export async function finalAssessmentEligibility(db: any, userId: string, courseId: string) {
  const { data: mods } = await db.from("modules").select("id").eq("course_id", courseId);
  const moduleIds = (mods ?? []).map((m: any) => m.id);
  const { data: lessons } = moduleIds.length
    ? await db.from("lessons").select("id").in("module_id", moduleIds).neq("enforce_progress", false)
    : { data: [] };
  const { data: quizzes } = moduleIds.length ? await db.from("quizzes").select("id").in("module_id", moduleIds) : { data: [] };
  const lessonIds = (lessons ?? []).map((l: any) => l.id);
  const quizIds = (quizzes ?? []).map((q: any) => q.id);
  const { data: done } = lessonIds.length
    ? await db.from("lesson_progress").select("lesson_id").eq("user_id", userId).eq("is_completed", true).in("lesson_id", lessonIds)
    : { data: [] };
  const { data: passes } = quizIds.length
    ? await db.from("quiz_attempts").select("quiz_id").eq("user_id", userId).eq("passed", true).in("quiz_id", quizIds)
    : { data: [] };
  const doneSet = new Set((done ?? []).map((d: any) => d.lesson_id));
  const passedSet = new Set((passes ?? []).map((p: any) => p.quiz_id));
  const missingLessons = lessonIds.filter((id: string) => !doneSet.has(id)).length;
  const missingQuizzes = quizIds.filter((id: string) => !passedSet.has(id)).length;
  return { eligible: missingLessons === 0 && missingQuizzes === 0, missingLessons, missingQuizzes };
}

/**
 * Record a Syngraph result against our attempt row (idempotent). On a pass:
 * mark the enrolment complete and mirror the credential into `certificates`
 * so dashboards, CPD totals and reports pick it up.
 */
export async function applyAttemptResult(db: any, row: any, attempt: SyngraphAttempt) {
  if (!attempt.completed || attempt.launchId !== row.syngraph_launch_id) return row;
  const passed = attempt.passed === true;
  const patch = {
    status: passed ? "passed" : "failed",
    score: attempt.score,
    syngraph_attempt_id: attempt.attemptId,
    completed_at: attempt.completedAt ?? new Date().toISOString(),
    credential_public_id: attempt.credential?.publicId ?? null,
    credential_url: attempt.credential?.verifyUrl ?? null,
  };
  const { data: updated } = await db.from("final_assessment_attempts").update(patch).eq("id", row.id).select("*").single();

  if (passed) {
    await db.from("enrollments").update({ completed_at: patch.completed_at }).eq("user_id", row.user_id).eq("course_id", row.course_id).is("completed_at", null);

    if (attempt.credential) {
      const { data: course } = await db.from("courses").select("title, cpd_hours").eq("id", row.course_id).maybeSingle();
      const { data: userData } = await db.auth.admin.getUserById(row.user_id);
      const email = (userData?.user?.email ?? attempt.learner.email ?? "").toLowerCase();
      const { data: profile } = await db.from("profiles").select("full_name").eq("id", row.user_id).maybeSingle();
      const name = (profile?.full_name || [attempt.learner.firstName, attempt.learner.lastName].filter(Boolean).join(" ") || email.split("@")[0]).trim();
      await db.from("certificates").upsert({
        certificate_number: attempt.credential.publicId,
        recipient_name: name,
        recipient_email: email,
        course_name: course?.title ?? attempt.assessmentTitle,
        completion_date: patch.completed_at.slice(0, 10),
        cpd_hours: course?.cpd_hours ?? null,
        credential_level: "Syngraph verified",
        status: "issued",
        issued_at: attempt.credential.issuedAt ?? patch.completed_at,
        external_url: attempt.credential.verifyUrl,
      }, { onConflict: "certificate_number", ignoreDuplicates: true });
    }
  }
  return updated ?? { ...row, ...patch };
}
