import { htmlToText, resendSend } from "./emailText.ts";

// After a purchase: a new buyer gets a password link (the course is waiting); an existing member gets a sign-in link.
const esc = (t: string) => String(t ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));

export async function sendPurchaseEmail(o: { to: string; name: string; course: string; link: string; isNew: boolean }): Promise<string | null> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "RESEND_API_KEY missing";
  const first = esc((o.name || "").split(" ")[0] || "there");
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#202058;padding:26px 36px;text-align:center;"><p style="margin:0;color:#9eff1f;font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p></td></tr>
<tr><td style="padding:34px 40px 8px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;color:#0b0b2c;">Thank you, ${first}. Your course is ready.</h1>
<p style="margin:0 0 14px;">Your payment for <strong>${esc(o.course)}</strong> is confirmed.</p>
<p style="margin:0 0 14px;">${o.isNew ? "Choose a password to open your account. Your course is waiting for you." : "You already have an account, so sign in to start the course."}</p>
</td></tr>
<tr><td style="padding:8px 40px 28px;text-align:center;"><a href="${esc(o.link)}" style="display:inline-block;background:#3434ff;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">${o.isNew ? "Set my password" : "Sign in"}</a></td></tr>
<tr><td style="padding:0 40px 24px;color:#94a3b8;font-size:12px;line-height:1.6;">${o.isNew ? "This link works once and stays valid for 24 hours. If it has stopped working, go to safetytech.academy/learn/auth and choose Forgot password." : ""}</td></tr>
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#94a3b8;font-size:11px;">Questions? Reply to this email or write to hello@safetytech.academy</p></td></tr>
</table></td></tr></table></body></html>`;
  const res = await resendSend(key, {
    from: "SafetyTech Academy <hello@safetytech.academy>", reply_to: "hello@safetytech.academy", to: [o.to],
    subject: `Your ${o.course} is ready`, html, text: htmlToText(html),
  });
  if (res.ok) return null;
  const b = await res.json().catch(() => ({}));
  return b?.message ?? `Email failed (${res.status})`;
}
