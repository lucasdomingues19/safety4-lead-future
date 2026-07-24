import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";


const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.safetytech.academy";
const BRAND_NAVY = "#11113a";
const BRAND_LIME = "#c1ff72";

interface IssueRequest {
  recipientName?: string;
  recipientEmail?: string;
  courseName?: string;
  completionDate?: string;
  credentialLevel?: string | null;
  cpdHours?: number | null;
  // when resending, pass an existing certificate number instead of creating one
  resendCertificateNumber?: string;
}

const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  };
  return String(text ?? "").replace(/[&<>"']/g, (m) => map[m]);
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const describeEmailError = (error: unknown): string => {
  if (!error) return "Email provider rejected the certificate email";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const maybe = error as { message?: unknown; name?: unknown; statusCode?: unknown };
    const parts = [maybe.name, maybe.message, maybe.statusCode ? `status ${maybe.statusCode}` : null]
      .filter(Boolean)
      .map(String);
    return parts.join(" — ") || JSON.stringify(error);
  }
  return String(error);
};

const monthName = (d: Date) =>
  d.toLocaleString("en-GB", { month: "long" });

const buildEmailHtml = (cert: {
  certificate_number: string;
  recipient_name: string;
  course_name: string;
}, verifyUrl: string) => {
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
          <p style="margin:0 0 16px;">We are pleased to share your SafetyTech Academy certificate. Please click the link below to access your credentials.</p>
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

const handler = async (req: Request): Promise<Response> => {
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

    // Validate the caller and confirm admin role
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin privileges required" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: IssueRequest = await req.json();

    let cert: {
      certificate_number: string;
      recipient_name: string;
      recipient_email: string;
      course_name: string;
      completion_date: string;
      credential_level?: string | null;
      cpd_hours?: number | null;
    };

    if (body.resendCertificateNumber) {
      const { data: existing, error: fetchErr } = await supabaseAdmin
        .from("certificates")
        .select("*")
        .eq("certificate_number", body.resendCertificateNumber)
        .maybeSingle();
      if (fetchErr || !existing) {
        return new Response(JSON.stringify({ error: "Certificate not found" }), {
          status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      cert = existing;
    } else {
      const recipientName = (body.recipientName || "").trim();
      const recipientEmail = (body.recipientEmail || "").trim().toLowerCase();
      const courseName = (body.courseName || "").trim();
      const completionDate = (body.completionDate || "").trim();

      if (recipientName.length < 2 || recipientName.length > 120) {
        return new Response(JSON.stringify({ error: "Invalid recipient name" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      if (!isEmail(recipientEmail) || recipientEmail.length > 255) {
        return new Response(JSON.stringify({ error: "Invalid recipient email" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      if (courseName.length < 2 || courseName.length > 200) {
        return new Response(JSON.stringify({ error: "Invalid course name" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(completionDate)) {
        return new Response(JSON.stringify({ error: "Invalid completion date" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const cpdHours =
        body.cpdHours === null || body.cpdHours === undefined || Number.isNaN(Number(body.cpdHours))
          ? null
          : Math.max(0, Math.min(1000, Number(body.cpdHours)));
      const credentialLevel = body.credentialLevel ? String(body.credentialLevel).trim().slice(0, 80) : null;

      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("certificates")
        .insert({
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          course_name: courseName,
          completion_date: completionDate,
          credential_level: credentialLevel,
          cpd_hours: cpdHours,
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
    }

    const verifyUrl = `${SITE_URL}/verify/${cert.certificate_number}`;

    const html = buildEmailHtml(cert, verifyUrl);

    const emailResponse = await resend.emails.send({
      from: "SafetyTech Academy <noreply@safetyacademy.tech>",
      reply_to: "hello@safetyacademy.tech",
      to: [cert.recipient_email],
      subject: "Your SafetyTech Academy Certificate",
      html,
    });

    if (emailResponse.error) {
      const reason = describeEmailError(emailResponse.error);
      console.error("Certificate email rejected:", cert.certificate_number, reason, emailResponse.error);
      return new Response(JSON.stringify({ error: `Certificate created, but email was not sent: ${reason}` }), {
        status: 502, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Certificate email sent:", cert.certificate_number, emailResponse);

    return new Response(
      JSON.stringify({ success: true, certificate: cert }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("issue-certificate error:", error);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
