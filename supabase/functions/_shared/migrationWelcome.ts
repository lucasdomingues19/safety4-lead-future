import { htmlToText, resendSend } from "./emailText.ts";

// The one-off "your courses have moved" email for learners who came over from Kajabi.
// Different from the generic "account ready" invite: it says their progress is safe.

const SITE = "https://www.safetytech.academy";
const esc = (t: string) => String(t ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));

export interface MovedCourse { title: string; pct: number }

export function migrationWelcomeHtml(name: string, link: string, courses: MovedCourse[]): string {
  const first = esc((name || "").split(" ")[0] || "there");
  const rows = courses.map((c) => {
    const state = c.pct >= 100 ? "Completed" : c.pct > 0 ? `${c.pct}% complete` : "Ready to start";
    const bar = c.pct > 0 ? `<div style="margin-top:8px;height:6px;border-radius:3px;background:#e2e8f0;"><div style="width:${Math.min(100, c.pct)}%;height:6px;border-radius:3px;background:#3434ff;"></div></div>` : "";
    return `<tr><td style="padding:12px 16px;border:1px solid #e2e8f0;border-radius:10px;"><div style="font-weight:700;color:#0b0b2c;">${esc(c.title)}</div><div style="font-size:13px;color:#69697b;margin-top:2px;">${state}</div>${bar}</td></tr><tr><td style="height:8px;"></td></tr>`;
  }).join("");
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#202058;padding:26px 36px;text-align:center;"><p style="margin:0;color:#9eff1f;font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p></td></tr>
<tr><td style="padding:34px 40px 8px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;color:#0b0b2c;">Your courses have a new home, ${first}</h1>
<p style="margin:0 0 14px;">SafetyTech Academy now runs on its own learning platform, and your progress has come with you. Nothing to redo: you carry on from the lesson where you stopped, and any quizzes you had already moved past are marked as done.</p>
<p style="margin:0 0 10px;font-weight:700;color:#0b0b2c;">Where you are</p>
<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<p style="margin:6px 0 14px;">Your account is ready. Choose a password to get in.</p>
</td></tr>
<tr><td style="padding:4px 40px 22px;text-align:center;"><a href="${esc(link)}" style="display:inline-block;background:#3434ff;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">Set my password and continue</a></td></tr>
<tr><td style="padding:0 40px 18px;color:#1e293b;font-size:14px;line-height:1.7;">
<p style="margin:0 0 6px;font-weight:700;color:#0b0b2c;">What you'll find</p>
<ul style="margin:0;padding-left:20px;"><li>Mia, an AI tutor that answers from the lesson itself</li><li>Quizzes that explain every answer</li><li>Verified certificates you can add to LinkedIn</li><li>The learning community and live sessions</li></ul>
</td></tr>
<tr><td style="padding:0 40px 24px;color:#94a3b8;font-size:12px;line-height:1.6;">This link works once and stays valid for 24 hours. If it has stopped working, go to ${SITE}/learn/auth, choose &ldquo;Forgot password?&rdquo; and enter this email address.</td></tr>
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#94a3b8;font-size:11px;">Something look wrong with your progress? Just reply to this email, or write to hello@safetytech.academy</p></td></tr>
</table></td></tr></table></body></html>`;
}

/** Returns null on success, or an error message. */
export async function sendMigrationWelcome(to: string, name: string, link: string, courses: MovedCourse[]): Promise<string | null> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "RESEND_API_KEY missing";
  const html = migrationWelcomeHtml(name, link, courses);
  const res = await resendSend(key, {
    from: "SafetyTech Academy <hello@safetytech.academy>",
    reply_to: "hello@safetytech.academy",
    to: [to],
    subject: "Your SafetyTech Academy courses have a new home",
    html,
    text: htmlToText(html),
  });
  if (res.ok) return null;
  const body = await res.json().catch(() => ({}));
  return body?.message ?? `Email failed (${res.status})`;
}
