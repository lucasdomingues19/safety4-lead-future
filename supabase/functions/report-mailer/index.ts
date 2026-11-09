// Sends a plain-text status report to Lucas only. Used by scheduled monitoring tasks (e.g. Search Console checks).
// The recipient is fixed in code, so even with the secret this cannot email anyone else.
// Requires verify_jwt = false; callers send the shared cron secret in x-cron-secret.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { resendSend } from "../_shared/emailText.ts";

const TO = "lucas@safetytech.academy";
const esc = (t: string) => t.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));

serve(async (req) => {
  const secret = Deno.env.get("LIFECYCLE_CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) return new Response("Unauthorized", { status: 401 });
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return Response.json({ error: "RESEND_API_KEY missing" }, { status: 500 });
  const b = (await req.json().catch(() => ({}))) as { subject?: string; body?: string };
  const subject = String(b.subject ?? "").trim().slice(0, 150);
  const body = String(b.body ?? "").trim().slice(0, 20000);
  if (subject.length < 3 || body.length < 5) return Response.json({ error: "subject and body are required" }, { status: 400 });
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1e293b;white-space:pre-wrap;">${esc(body)}</div>`;
  const res = await resendSend(key, { from: "SafetyTech Academy <hello@safetytech.academy>", to: [TO], subject, html, text: body });
  if (res.ok) return Response.json({ ok: true });
  const e = await res.json().catch(() => ({}));
  return Response.json({ error: e?.message ?? `Email failed (${res.status})` }, { status: 502 });
});
