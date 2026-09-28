import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

// Self-service certificate issuance: a learner calls this after passing a
// module quiz. Unlike issue-certificate (admin-only, trusts client-supplied
// recipient/course details), this function trusts nothing from the request
// body except which quiz was passed — recipient name/email and course name
// are always looked up server-side from the caller's own auth record and the
// quiz's own course, via a verified passing row in quiz_attempts. A learner
// can only ever issue a certificate for their own verified pass.

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.safetytech.academy";
const BRAND_NAVY = "#11113a";
const BRAND_LIME = "#c1ff72";

interface SelfIssueRequest {
  quiz_id: string;
}

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
          <p style="margin:0 0 16px;">Congratulations on passing your module quiz! We are pleased to share your SafetyTech Academy certificate. Please click the link below to access your credentials.</p>
          <p style="margin:0 0 16px;">Don't forget to share your achievement on LinkedIn and tag the SafetyTech Academy page.</p>
          <p style="margin:0 0 4px;">Proud of you.</p>
          <p style="margin:0;">Regards,</p>
          <p style="margin:4px 0 0;font-weight:700;">SafetyTech Academy Team</p>
        </td></tr>
        <tr><td style="padding:22px 40px 34px;text-align:center;">
          <a href="${verifyUrl}" style="display:inline-block;background:${BRAND_LIME};color:${BRAND_NAVY};padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">View &amp; Download Your Certificate</a>
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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: SelfIssueRequest = await req.json();
    const quizId = String(body.quiz_id || "").trim();
    if (!quizId) {
      return new Response(JSON.stringify({ error: "quiz_id is required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify a real passing attempt exists for THIS user and THIS quiz.
    const { data: attempt } = await supabaseAdmin
      .from("quiz_attempts")
      .select("id, passed")
      .eq("user_id", userData.user.id)
      .eq("quiz_id", quizId)
      .eq("passed", true)
      .order("attempted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!attempt) {
      return new Response(JSON.stringify({ error: "No passing quiz attempt found for this user" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Resolve the course server-side from the quiz — never trust a
    // client-supplied course name for a credential document.
    const { data: quiz } = await supabaseAdmin
      .from("quizzes")
      .select("id, module_id")
      .eq("id", quizId)
      .maybeSingle();
    if (!quiz) {
      return new Response(JSON.stringify({ error: "Quiz not found" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: module_ } = await supabaseAdmin
      .from("modules")
      .select("id, course_id")
      .eq("id", quiz.module_id)
      .maybeSingle();
    if (!module_) {
      return new Response(JSON.stringify({ error: "Module not found" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: course } = await supabaseAdmin
      .from("courses")
      .select("id, title, cpd_hours")
      .eq("id", module_.course_id)
      .maybeSingle();
    if (!course) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const recipientEmail = (userData.user.email || "").trim().toLowerCase();
    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "No email on file for this user" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const metaName = (userData.user.user_metadata as { full_name?: string } | undefined)?.full_name;
    const recipientName = (metaName && metaName.trim()) || recipientEmail.split("@")[0];

    // Idempotent: if this learner already has a certificate for this course, return it.
    const { data: existing } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("recipient_email", recipientEmail)
      .eq("course_name", course.title)
      .maybeSingle();

    let cert = existing;
    let justCreated = false;

    if (!cert) {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("certificates")
        .insert({
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          course_name: course.title,
          completion_date: new Date().toISOString().slice(0, 10),
          cpd_hours: course.cpd_hours ?? null,
          issued_by: userData.user.id,
        })
        .select("*")
        .single();

      if (insertErr || !inserted) {
        console.error("Insert error:", insertErr);
        return new Response(JSON.stringify({ error: "Failed to create certificate" }), {
          status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      cert = inserted;
      justCreated = true;
    }

    const verifyUrl = `${SITE_URL}/verify/${cert.certificate_number}`;

    if (justCreated) {
      const html = buildEmailHtml(cert, verifyUrl);
      const emailResponse = await resend.emails.send({
        from: "SafetyTech Academy <noreply@safetyacademy.tech>",
        reply_to: "hello@safetyacademy.tech",
        to: [cert.recipient_email],
        subject: "Your SafetyTech Academy Certificate",
        html,
      });
      if (emailResponse.error) {
        console.error("Certificate email rejected:", cert.certificate_number, emailResponse.error);
        // Certificate exists even if the email failed — don't fail the request.
      }
    }

    return new Response(
      JSON.stringify({ certificate_number: cert.certificate_number, verify_url: verifyUrl }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("issue-self-certificate error:", error);
    return new Response(JSON.stringify({ error: "Unexpected error issuing certificate" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
