// Invite emails for people added by a company manager. The admin import uses its own
// copy of the account-ready email (admin-people); this one adds "who invited you".
import { htmlToText, resendSend } from "./emailText.ts";

export const SITE = "https://www.safetytech.academy";
export const esc = (t: string) => String(t ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));

const frame = (inner: string) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#202058;padding:26px 36px;text-align:center;"><p style="margin:0;color:#9eff1f;font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p></td></tr>
${inner}
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#94a3b8;font-size:11px;">Questions? Reply to this email or write to hello@safetytech.academy</p></td></tr>
</table></td></tr></table></body></html>`;

async function send(to: string, subject: string, html: string): Promise<string | null> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "RESEND_API_KEY missing";
  const res = await resendSend(key, { from: "SafetyTech Academy <hello@safetytech.academy>", reply_to: "hello@safetytech.academy", to: [to], subject, html, text: htmlToText(html) });
  if (res.ok) return null;
  const body = await res.json().catch(() => ({}));
  return body?.message ?? `Email failed (${res.status})`;
}

/** New account: "your company has set you up", with the one-time set-password link. */
export function sendTeamWelcome(o: { to: string; name: string; link: string; course: string; org: string }) {
  const first = esc((o.name || "").split(" ")[0] || "there");
  const html = frame(`<tr><td style="padding:34px 40px 10px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;color:#0b0b2c;">Welcome to SafetyTech Academy, ${first}</h1>
<p style="margin:0 0 14px;"><strong>${esc(o.org)}</strong> has given you access to <strong>${esc(o.course)}</strong>. Your account is ready. Just choose a password to get started.</p>
</td></tr>
<tr><td style="padding:8px 40px 26px;text-align:center;"><a href="${esc(o.link)}" style="display:inline-block;background:#3434ff;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">Set my password</a></td></tr>
<tr><td style="padding:0 40px 24px;color:#94a3b8;font-size:12px;line-height:1.6;">This link works once and stays valid for 24 hours. If it has stopped working, go to ${SITE}/learn/auth, choose “Forgot password?” and enter this email address to get a new one.</td></tr>`);
  return send(o.to, `${o.org} has given you access to ${o.course}`, html);
}

/** Existing account: just tell them the course is there. */
export function sendTeamAccess(o: { to: string; name: string; course: string; org: string; url: string }) {
  const first = esc((o.name || "").split(" ")[0] || "there");
  const html = frame(`<tr><td style="padding:34px 40px 10px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;color:#0b0b2c;">New course for you, ${first}</h1>
<p style="margin:0 0 14px;"><strong>${esc(o.org)}</strong> has given you access to <strong>${esc(o.course)}</strong> on SafetyTech Academy. Sign in with your usual email address to start.</p>
</td></tr>
<tr><td style="padding:8px 40px 30px;text-align:center;"><a href="${esc(o.url)}" style="display:inline-block;background:#3434ff;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">Open the course</a></td></tr>`);
  return send(o.to, `${o.org} has given you access to ${o.course}`, html);
}

/** The manager's confirmation that seats were bought. */
export function sendSeatsReady(o: { to: string; name: string; org: string; course: string; seats: number }) {
  const first = esc((o.name || "").split(" ")[0] || "there");
  const html = frame(`<tr><td style="padding:34px 40px 10px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;color:#0b0b2c;">Your team seats are ready, ${first}</h1>
<p style="margin:0 0 14px;"><strong>${o.seats} seat${o.seats === 1 ? "" : "s"}</strong> for <strong>${esc(o.course)}</strong> have been added to <strong>${esc(o.org)}</strong>. Add the people who should take it, and follow their progress, from <em>My team</em> in the learning platform.</p>
</td></tr>
<tr><td style="padding:8px 40px 30px;text-align:center;"><a href="${SITE}/learn?view=team" style="display:inline-block;background:#3434ff;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">Open My team</a></td></tr>`);
  return send(o.to, `Your ${o.course} team seats are ready`, html);
}

/** A company owner who is new to the platform: set a password, then open My team. */
export function sendOwnerWelcome(o: { to: string; name: string; org: string; link: string }) {
  const first = esc((o.name || "").split(" ")[0] || "there");
  const html = frame(`<tr><td style="padding:34px 40px 10px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;color:#0b0b2c;">Your company account is ready, ${first}</h1>
<p style="margin:0 0 14px;">We've set up <strong>${esc(o.org)}</strong> on SafetyTech Academy and made you its manager. Choose a password, then open <em>My team</em> to add the people who will take the courses and to follow their progress.</p>
</td></tr>
<tr><td style="padding:8px 40px 26px;text-align:center;"><a href="${esc(o.link)}" style="display:inline-block;background:#3434ff;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">Set my password</a></td></tr>
<tr><td style="padding:0 40px 24px;color:#94a3b8;font-size:12px;line-height:1.6;">This link works once and stays valid for 24 hours. If it has stopped working, go to ${SITE}/learn/auth, choose “Forgot password?” and enter this email address to get a new one.</td></tr>`);
  return send(o.to, `Your ${o.org} account on SafetyTech Academy is ready`, html);
}
