import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { htmlToText, resendSend } from "../_shared/emailText.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

// Self-service certificate issuance: a learner calls this after passing a
// module quiz. Unlike issue-certificate (admin-only, trusts client-supplied
// recipient/course details), this function trusts nothing from the request
// body except which quiz was passed — recipient name/email and course name
// are always looked up server-side from the caller's own auth record and the
// quiz's own course, via a verified passing row in quiz_attempts. A learner
// can only ever issue a certificate for their own verified pass.


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.safetytech.academy";
const BRAND_NAVY = "#11113a";
const BRAND_LIME = "#c1ff72";

const buildEmailHtml = (cert: {
  certificate_number: string;
  recipient_name: string;
  course_name: string;
}, verifyUrl: string) => {
  const escapeHtml = (text: string) =>
    String(text ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));
  const firstName = escapeHtml(cert.recipient_name.split(" ")[0] || cert.recipient_name);

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,0.10);">
        <tr><td style="background:${BRAND_NAVY};padding:30px 36px;text-align:center;">
          <p style="margin:0;color:${BRAND_LIME};font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p>
        </td></tr>
        <tr><td style="padding:34px 40px 8px;color:#1e293b;font-size:15px;line-height:1.7;">
          <p style="margin:0 0 16px;">Hi ${firstName},</p>
          <p style="margin:0 0 16px;">Congratulations on completing your course! We are pleased to share your SafetyTech Academy certificate. Please click the link below to access your credentials.</p>
          <p style="margin:0 0 16px;">Don't forget to share your achievement on LinkedIn and tag the SafetyTech Academy page.</p>
          <p style="margin:0 0 4px;">Proud of you.</p>
          <p style="margin:0;">Regards,</p>
          <p style="margin:4px 0 0;font-weight:700;">SafetyTech Academy Team</p>
        </td></tr>
        <tr><td style="padding:22px 40px 34px;text-align:center;">
          <a href="${verifyUrl}" style="display:inline-block;background:${BRAND_LIME};color:${BRAND_NAVY};padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">View &amp; Download Your Certificate</a>
          <p style="margin:18px 0 0;font-size:13px;color:#475569;line-height:1.6;">Enjoyed the course? A short Google review helps other safety professionals find us: <a href="https://g.page/r/CaJFIuivG8u-EAE/review" style="color:#3434ff;font-weight:700;">leave a review</a>.</p>
        </td></tr>
        <tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">© SafetyTech Academy · approved training provider by IOSH · www.safetytech.academy</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: userData, error: userError } = await db.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const body = (await req.json()) as { course_id?: string; quiz_id?: string };

    // Resolve the course (accepts either a course_id or a quiz_id from that course).
    let courseId = String(body.course_id || "").trim();
    if (!courseId && body.quiz_id) {
      const { data: q } = await db.from("quizzes").select("module_id").eq("id", body.quiz_id).maybeSingle();
      if (q) {
        const { data: m } = await db.from("modules").select("course_id").eq("id", q.module_id).maybeSingle();
        courseId = m?.course_id ?? "";
      }
    }
    if (!courseId) return json({ error: "course_id is required" }, 400);

    const { data: course } = await db.from("courses").select("id, title, cpd_hours, final_assessment_ref").eq("id", courseId).maybeSingle();
    if (!course) return json({ error: "Course not found" }, 404);
    // Courses with a Syngraph final assessment get the Syngraph credential
    // instead (issued when the learner passes it — see final-assessment).
    if (course.final_assessment_ref) return json({ status: "final_assessment_required" });

    // Must hold a current, active enrolment.
    const { data: enrolment } = await db
      .from("enrollments")
      .select("id, status, expires_at")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    const active = enrolment && enrolment.status === "active" && (!enrolment.expires_at || new Date(enrolment.expires_at) > new Date());
    if (!active) return json({ error: "Not enrolled in this course" }, 403);

    // Course completion = every required lesson done AND every module quiz passed.
    // Lessons the admin marked optional (enforce_progress = false) don't count.
    const { data: modules } = await db.from("modules").select("id").eq("course_id", courseId);
    const moduleIds = (modules ?? []).map((m) => m.id);
    const { data: lessons } = moduleIds.length ? await db.from("lessons").select("id, enforce_progress").in("module_id", moduleIds) : { data: [] as { id: string; enforce_progress: boolean }[] };
    const { data: quizzes } = moduleIds.length ? await db.from("quizzes").select("id").in("module_id", moduleIds) : { data: [] as { id: string }[] };

    const lessonIds = (lessons ?? []).map((l) => l.id);
    const requiredIds = (lessons ?? []).filter((l) => l.enforce_progress !== false).map((l) => l.id);
    const quizIds = (quizzes ?? []).map((q) => q.id);
    if (lessonIds.length === 0) return json({ status: "incomplete", missing: { lessons: 0, quizzes: 0 }, reason: "Course has no lessons" });

    const { data: done } = await db.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("is_completed", true).in("lesson_id", lessonIds);
    const doneSet = new Set((done ?? []).map((d) => d.lesson_id));
    const { data: passes } = quizIds.length
      ? await db.from("quiz_attempts").select("quiz_id").eq("user_id", user.id).eq("passed", true).in("quiz_id", quizIds)
      : { data: [] as { quiz_id: string }[] };
    const passedSet = new Set((passes ?? []).map((p) => p.quiz_id));

    const missingLessons = requiredIds.filter((id) => !doneSet.has(id)).length;
    const missingQuizzes = quizIds.filter((id) => !passedSet.has(id)).length;
    if (missingLessons > 0 || missingQuizzes > 0) {
      return json({ status: "incomplete", missing: { lessons: missingLessons, quizzes: missingQuizzes } });
    }

    const recipientEmail = (user.email || "").trim().toLowerCase();
    if (!recipientEmail) return json({ error: "No email on file for this user" }, 400);
    const { data: profile } = await db.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    const metaName = (user.user_metadata as { full_name?: string } | undefined)?.full_name;
    const recipientName = (profile?.full_name || metaName || "").trim() || recipientEmail.split("@")[0];

    await db.from("enrollments").update({ completed_at: new Date().toISOString() }).eq("id", enrolment!.id).is("completed_at", null);

    // Idempotent: one certificate per learner per course.
    const { data: existing } = await db
      .from("certificates")
      .select("*")
      .eq("recipient_email", recipientEmail)
      .eq("course_name", course.title)
      .maybeSingle();
    if (existing) {
      return json({ status: "existing", certificate_number: existing.certificate_number, verify_url: `${SITE_URL}/verify/${existing.certificate_number}` });
    }

    const { data: cert, error: insertErr } = await db
      .from("certificates")
      .insert({
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        course_name: course.title,
        completion_date: new Date().toISOString().slice(0, 10),
        cpd_hours: course.cpd_hours ?? null,
        issued_by: user.id,
      })
      .select("*")
      .single();
    if (insertErr || !cert) {
      console.error("Insert error:", insertErr);
      return json({ error: "Failed to create certificate" }, 500);
    }

    const verifyUrl = `${SITE_URL}/verify/${cert.certificate_number}`;
    const certHtml = buildEmailHtml(cert, verifyUrl);
    let emailed = false;
    try {
      const res = await resendSend(Deno.env.get("RESEND_API_KEY") ?? "", {
        from: "SafetyTech Academy <hello@safetytech.academy>",
        reply_to: "hello@safetytech.academy",
        to: [cert.recipient_email],
        subject: "Your SafetyTech Academy Certificate",
        html: certHtml,
        text: htmlToText(certHtml),
      });
      emailed = res.ok;
      if (!res.ok) console.error("Certificate email rejected:", cert.certificate_number, res.status, (await res.text()).slice(0, 200));
    } catch (e) {
      console.error("Certificate email failed:", cert.certificate_number, e);
    }

    return json({ status: "issued", certificate_number: cert.certificate_number, verify_url: verifyUrl, emailed });
  } catch (error) {
    console.error("issue-self-certificate error:", error);
    return json({ error: "Unexpected error issuing certificate" }, 500);
  }
});
