import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CategoryScore {
  category: string;
  percentage: number;
}

interface ScorecardData {
  firstName: string;
  lastName: string;
  email: string;
  overallScore: number;
  rankNumber: number;
  rankLabel: string;
  rankColor: string;
  rankDescription: string;
  categoryScores: CategoryScore[];
  pdfBase64?: string;
}

const getBarColor = (pct: number): string => {
  if (pct >= 85) return "#22c55e";
  if (pct >= 70) return "#3b82f6";
  if (pct >= 55) return "#eab308";
  if (pct >= 35) return "#f97316";
  return "#ef4444";
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ScorecardData = await req.json();

    if (!data.email || !data.firstName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const categoryRows = data.categoryScores
      .map(
        (cat) => `
        <tr>
          <td style="padding:8px 12px;font-size:14px;color:#334155;border-bottom:1px solid #f1f5f9;">${cat.category}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;width:55%;">
            <div style="background:#f1f5f9;border-radius:8px;height:14px;overflow:hidden;">
              <div style="background:${getBarColor(cat.percentage)};height:100%;width:${cat.percentage}%;border-radius:8px;"></div>
            </div>
          </td>
          <td style="padding:8px 12px;font-size:14px;font-weight:700;color:${getBarColor(cat.percentage)};text-align:right;border-bottom:1px solid #f1f5f9;">${cat.percentage}%</td>
        </tr>`
      )
      .join("");

    const stars = Array.from({ length: 5 }, (_, i) =>
      i < data.rankNumber
        ? `<span style="color:#D6FF00;font-size:22px;">★</span>`
        : `<span style="color:#64748b;font-size:22px;">★</span>`
    ).join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#11113a;padding:28px 32px;">
          <h1 style="margin:0;color:#D6FF00;font-size:22px;">Safety 4.0 Readiness Scorecard</h1>
          <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">${data.firstName} ${data.lastName} · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        </td></tr>

        <!-- Score & Rank -->
        <tr><td style="padding:28px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="48%" style="background:#f8fafc;border-radius:10px;padding:20px;text-align:center;">
                <div style="font-size:42px;font-weight:800;color:#11113a;">${data.overallScore}</div>
                <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Overall Score / 100</div>
              </td>
              <td width="4%"></td>
              <td width="48%" style="background:${data.rankColor};border-radius:10px;padding:20px;text-align:center;">
                <div style="margin-bottom:4px;">${stars}</div>
                <div style="font-size:16px;font-weight:700;color:#fff;">${data.rankLabel}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.85);margin-top:4px;">${data.rankDescription}</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Category Breakdown -->
        <tr><td style="padding:24px 32px;">
          <h2 style="margin:0 0 14px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#11113a;">Category Breakdown</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${categoryRows}
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 32px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#11113a;border-radius:10px;">
            <tr><td style="padding:24px 28px;text-align:center;">
              <h3 style="margin:0 0 8px;color:#D6FF00;font-size:16px;">Ready to Level Up?</h3>
              <p style="margin:0 0 16px;color:#cbd5e1;font-size:13px;">Join the Safety 4.0 Academy — the world's first IOSH-approved Safety 4.0 certification.</p>
              <a href="https://safety4-lead-future.lovable.app/enroll" style="display:inline-block;background:#D6FF00;color:#11113a;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Enrol Now</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">© Safety 4.0 Academy · www.safetyacademy.tech</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const attachments = data.pdfBase64
      ? [{
          filename: `Safety-4.0-Scorecard-${data.firstName}-${data.lastName}.pdf`,
          content: data.pdfBase64,
        }]
      : [];

    const emailResponse = await resend.emails.send({
      from: "Safety 4.0 Academy <onboarding@resend.dev>",
      to: [data.email],
      subject: `Your Safety 4.0 Readiness Score: ${data.overallScore}/100 — ${data.rankLabel}`,
      html,
      attachments,
    });

    // Also notify admin
    await resend.emails.send({
      from: "Safety 4.0 Academy <onboarding@resend.dev>",
      to: ["lucas@getshield360.com"],
      replyTo: data.email,
      subject: `Scorecard Completed: ${data.firstName} ${data.lastName} — ${data.overallScore}/100`,
      html: `<p><strong>${data.firstName} ${data.lastName}</strong> (${data.email}) completed the Safety 4.0 Scorecard.</p>
             <p>Score: ${data.overallScore}/100 — ${data.rankLabel}</p>`,
    });

    console.log("Scorecard email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending scorecard email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
