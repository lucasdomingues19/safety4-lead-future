import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import QRCode from "npm:qrcode@1.5.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.safetyacademy.tech";
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

const monthName = (d: Date) =>
  d.toLocaleString("en-GB", { month: "long" });

const buildEmailHtml = (cert: {
  certificate_number: string;
  recipient_name: string;
  course_name: string;
  completion_date: string;
  credential_level?: string | null;
  cpd_hours?: number | null;
}, verifyUrl: string, linkedInUrl: string) => {
  const completion = new Date(cert.completion_date);
  const completionStr = completion.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const cpdRow = cert.cpd_hours
    ? `<tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;">CPD Hours</td><td style="padding:4px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${escapeHtml(String(cert.cpd_hours))}</td></tr>`
    : "";
  const levelRow = cert.credential_level
    ? `<tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;">Credential</td><td style="padding:4px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${escapeHtml(cert.credential_level)}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,0.10);">

        <tr><td style="background:${BRAND_NAVY};padding:34px 36px 28px;text-align:center;">
          <p style="margin:0 0 6px;color:${BRAND_LIME};font-size:12px;letter-spacing:3px;text-transform:uppercase;">Safety 4.0 Academy</p>
          <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;">Congratulations, ${escapeHtml(cert.recipient_name)}!</h1>
          <p style="margin:12px 0 0;color:#cbd5e1;font-size:14px;">You've earned your official digital certificate</p>
        </td></tr>

        <tr><td style="padding:30px 36px 8px;">
          <div style="border:2px solid ${BRAND_LIME};border-radius:12px;padding:22px 24px;text-align:center;">
            <p style="margin:0 0 4px;color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;">This certifies completion of</p>
            <h2 style="margin:0;color:${BRAND_NAVY};font-size:20px;">${escapeHtml(cert.course_name)}</h2>
            <p style="margin:10px 0 0;color:#475569;font-size:13px;">Completed ${completionStr}</p>
          </div>
        </td></tr>

        <tr><td style="padding:18px 36px 6px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_NAVY};border-radius:10px;padding:18px 22px;">
            <tr><td style="padding:4px 0;color:#94a3b8;font-size:13px;">Certificate No.</td><td style="padding:4px 0;color:${BRAND_LIME};font-size:13px;font-weight:700;text-align:right;letter-spacing:1px;">${escapeHtml(cert.certificate_number)}</td></tr>
            ${levelRow}
            ${cpdRow}
          </table>
        </td></tr>

        <tr><td style="padding:14px 36px 4px;text-align:center;">
          <img src="cid:qrcode" width="120" height="120" alt="Verification QR code" style="border:1px solid #e2e8f0;border-radius:10px;padding:6px;background:#fff;" />
          <p style="margin:8px 0 0;color:#64748b;font-size:11px;">Scan to verify authenticity</p>
        </td></tr>

        <tr><td style="padding:18px 36px 8px;text-align:center;">
          <a href="${verifyUrl}" style="display:inline-block;background:${BRAND_LIME};color:${BRAND_NAVY};padding:14px 30px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">View &amp; Download Your Certificate</a>
        </td></tr>
        <tr><td style="padding:0 36px 26px;text-align:center;">
          <a href="${linkedInUrl}" style="display:inline-block;background:#0a66c2;color:#ffffff;padding:12px 26px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Add to your LinkedIn profile</a>
        </td></tr>

        <tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">Verify anytime at ${escapeHtml(verifyUrl)}</p>
          <p style="margin:6px 0 0;color:#94a3b8;font-size:11px;">© Safety 4.0 Academy · approved training provider by IOSH · www.safetyacademy.tech</p>
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
    const completion = new Date(cert.completion_date);
    const linkedInUrl =
      "https://www.linkedin.com/profile/add?" +
      new URLSearchParams({
        startTask: "CERTIFICATION_NAME",
        name: cert.course_name,
        organizationName: "Safety 4.0 Academy",
        issueYear: String(completion.getFullYear()),
        issueMonth: String(completion.getMonth() + 1),
        certUrl: verifyUrl,
        certId: cert.certificate_number,
      }).toString();

    // Generate QR code PNG for the verification URL
    const qrDataUrl: string = await QRCode.toDataURL(verifyUrl, {
      width: 400, margin: 1, color: { dark: BRAND_NAVY, light: "#ffffff" },
    });
    const qrBase64 = qrDataUrl.split("base64,")[1];

    const html = buildEmailHtml(cert, verifyUrl, linkedInUrl);

    const emailResponse = await resend.emails.send({
      from: "Safety 4.0 Academy <noreply@safetyacademy.tech>",
      to: [cert.recipient_email],
      subject: `Your Safety 4.0 Academy Certificate — ${cert.course_name}`,
      html,
      attachments: [
        {
          filename: "verification-qr.png",
          content: qrBase64,
          content_id: "qrcode",
        },
      ],
    });

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
