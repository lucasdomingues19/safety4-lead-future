import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory IP rate limiting: max 3 sends per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_WINDOW = 3;

const checkRateLimit = (id: string): boolean => {
  const now = Date.now();
  const data = rateLimitMap.get(id);
  if (!data || now > data.resetTime) {
    rateLimitMap.set(id, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (data.count >= MAX_REQUESTS_PER_WINDOW) return false;
  data.count++;
  return true;
};

const isValidEmail = (email: unknown): email is string =>
  typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const escapeHtml = (text: unknown): string =>
  String(text ?? "").replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m] as string,
  );

const clampNum = (v: unknown, min: number, max: number): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
};

const barColor = (score: number): string => {
  if (score <= 1) return "#dc2626";
  if (score <= 2.5) return "#d97706";
  return "#059669";
};

interface Payload {
  name?: string;
  email?: string;
  company?: string;
  bandName?: string;
  bandDescription?: string;
  total?: number;
  domains?: { domain: string; score: number }[];
  actions?: { title: string; why: string }[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const data: Payload = await req.json();

    if (!isValidEmail(data.email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again in a minute." }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const name = escapeHtml(String(data.name ?? "there").slice(0, 120));
    const company = escapeHtml(String(data.company ?? "").slice(0, 160));
    const bandName = escapeHtml(String(data.bandName ?? "").slice(0, 60));
    const bandDescription = escapeHtml(String(data.bandDescription ?? "").slice(0, 1200));
    const total = clampNum(data.total, 0, 20);

    const domains = Array.isArray(data.domains) ? data.domains.slice(0, 8) : [];
    const actions = Array.isArray(data.actions) ? data.actions.slice(0, 5) : [];

    const domainRows = domains
      .map((d) => {
        const score = clampNum(d?.score, 0, 4);
        const pct = (score / 4) * 100;
        return `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600;">${escapeHtml(d?.domain)}</td>
        <td style="padding:8px 12px;width:55%;">
          <div style="background:#f1f5f9;border-radius:8px;height:12px;overflow:hidden;">
            <div style="background:${barColor(score)};height:12px;width:${pct}%;border-radius:8px;"></div>
          </div>
        </td>
        <td style="padding:8px 0;font-size:13px;font-weight:700;color:${barColor(score)};text-align:right;white-space:nowrap;">${score.toFixed(1)}/4</td>
      </tr>`;
      })
      .join("");

    const actionItems = actions
      .map(
        (a) => `
      <div style="border-left:3px solid #3858E9;padding-left:14px;margin-bottom:16px;">
        <div style="font-size:15px;font-weight:700;color:#0f172a;">${escapeHtml(a?.title)}</div>
        <div style="font-size:13px;color:#475569;margin-top:4px;line-height:1.6;">${escapeHtml(a?.why)}</div>
      </div>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,Helvetica,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:#0a1530;padding:28px 32px;">
      <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8ea2ff;font-family:monospace;">AI in EHS Governance Readiness</div>
      <div style="font-size:24px;font-weight:800;color:#ffffff;margin-top:8px;">Your written position</div>
    </div>

    <div style="padding:32px;">
      <p style="font-size:15px;color:#334155;margin:0 0 20px;">Hi ${name},</p>
      <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 24px;">
        Here is the result of your AI in EHS Governance Readiness assessment${company ? ` for ${company}` : ""}. Forward it internally as it stands.
      </p>

      <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
        <div style="padding:20px;">
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;font-family:monospace;">Summary position</div>
          <div style="font-size:36px;font-weight:800;color:#0f172a;margin-top:6px;">${bandName}</div>
          <div style="font-family:monospace;font-size:13px;color:#64748b;margin-top:6px;">${total.toFixed(1)} / 20</div>
        </div>
        <div style="padding:18px 20px;background:#f8fafc;font-size:14px;color:#475569;line-height:1.7;">${bandDescription}</div>
      </div>

      <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;font-family:monospace;margin-bottom:10px;">Domain breakdown</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">${domainRows}</table>

      ${actionItems ? `<div style="font-size:18px;font-weight:800;color:#0f172a;margin-bottom:14px;">What to fix first</div>${actionItems}` : ""}

      <div style="border:1px solid #3858E9;border-radius:12px;padding:24px;background:#f8fafc;margin-top:28px;">
        <div style="font-size:18px;font-weight:800;color:#0f172a;margin-bottom:8px;">Close the evidence gap</div>
        <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 18px;">
          SafetyTech Academy runs IOSH-approved, CPD-certified training that produces the certificated evidence the AI literacy obligation asks for.
        </p>
        <a href="https://safetytech.academy/#pricing" style="display:block;text-align:center;background:#3858E9;color:#ffffff;font-weight:800;text-decoration:none;padding:15px 20px;border-radius:8px;">Discover SafetyTech Academy</a>
        <a href="https://safetytech.academy/contact" style="display:block;text-align:center;border:1px solid #cbd5e1;color:#3858E9;font-weight:600;text-decoration:none;padding:14px 20px;border-radius:8px;margin-top:12px;">Book a call with us</a>
      </div>

      <p style="font-size:12px;color:#94a3b8;line-height:1.7;margin-top:28px;border-top:1px solid #e2e8f0;padding-top:18px;">
        This assessment is a self-reported indicator, not a legal opinion or a formal audit. You received this email because you requested your results at safetytech.academy.
      </p>
    </div>
  </div>
</body></html>`;

    const { error } = await resend.emails.send({
      from: "SafetyTech Academy <noreply@safetyacademy.tech>",
      to: [data.email],
      reply_to: "hello@safetyacademy.tech",
      subject: `Your AI in EHS Governance Readiness position — ${bandName || "results"}`,
      html,
    });

    if (error) {
      console.error("Resend error sending governance readiness email:", error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("send-governance-email failure:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
