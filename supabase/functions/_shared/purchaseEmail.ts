import { htmlToText, resendSend } from "./emailText.ts";

// After a purchase: a new buyer gets a password link (the course is waiting); an existing member gets a sign-in link.
const esc = (t: string) => String(t ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));

export interface PurchaseEmailInput {
  to: string; name: string; course: string; link: string; isNew: boolean;
  receiptUrl?: string | null; invoiceUrl?: string | null; amount?: number; currency?: string; tax?: number;
}

export function purchaseEmailHtml(o: PurchaseEmailInput): string {
  const first = esc((o.name || "").split(" ")[0] || "there");
  const money = (n: number) => `${(o.currency ?? "GBP").toUpperCase() === "GBP" ? "£" : ""}${n.toFixed(2)}${(o.currency ?? "GBP").toUpperCase() === "GBP" ? "" : ` ${o.currency}`}`;
  const paid = typeof o.amount === "number" && o.amount > 0
    ? `<p style="margin:0 0 14px;">Payment received: <strong>${money(o.amount)}</strong>${o.tax ? ` (includes VAT of ${money(o.tax)})` : ""}.</p>` : "";
  const docs = o.receiptUrl || o.invoiceUrl
    ? `<tr><td style="padding:0 40px 18px;text-align:center;font-size:14px;line-height:1.8;color:#1e293b;">
${o.receiptUrl ? `<a href="${esc(o.receiptUrl)}" style="color:#3434ff;font-weight:700;">View your receipt${o.invoiceUrl ? " and invoice" : ""}</a>` : ""}${o.invoiceUrl && !o.receiptUrl ? "" : ""}
${o.invoiceUrl ? `<br><a href="${esc(o.invoiceUrl)}" style="color:#3434ff;font-weight:700;">Open your invoice</a>` : ""}
</td></tr>` : `<tr><td style="padding:0 40px 18px;text-align:center;font-size:13px;line-height:1.7;color:#69697b;">Your receipt and invoice will be in your account under Settings, Purchase history.</td></tr>`;
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#202058;padding:26px 36px;text-align:center;"><p style="margin:0;color:#9eff1f;font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p></td></tr>
<tr><td style="padding:34px 40px 8px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;color:#0b0b2c;">Thank you, ${first}. Your course is ready.</h1>
<p style="margin:0 0 14px;">Your payment for <strong>${esc(o.course)}</strong> is confirmed.</p>
${paid}
<p style="margin:0 0 14px;">${o.isNew ? "Choose a password to open your account. Your course is waiting for you." : "You already have an account, so sign in to start the course."}</p>
</td></tr>
<tr><td style="padding:8px 40px 22px;text-align:center;"><a href="${esc(o.link)}" style="display:inline-block;background:#3434ff;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">${o.isNew ? "Set my password" : "Sign in"}</a></td></tr>
${docs}
<tr><td style="padding:0 40px 24px;color:#94a3b8;font-size:12px;line-height:1.6;">${o.isNew ? "This link stays valid for 14 days. If it has stopped working, go to safetytech.academy/learn/auth and choose Forgot password.<br>" : ""}Usually sign in with a different email address? Sign in with that one and reply to this email, and we will move your course across.</td></tr>
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#94a3b8;font-size:11px;">Questions? Reply to this email or write to hello@safetytech.academy</p></td></tr>
</table></td></tr></table></body></html>`;
}

export async function sendPurchaseEmail(o: PurchaseEmailInput): Promise<string | null> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "RESEND_API_KEY missing";
  const html = purchaseEmailHtml(o);
  const res = await resendSend(key, {
    from: "SafetyTech Academy <hello@safetytech.academy>", reply_to: "hello@safetytech.academy", to: [o.to],
    subject: `Your ${o.course} is ready`, html, text: htmlToText(html),
  });
  if (res.ok) return null;
  const b = await res.json().catch(() => ({}));
  return b?.message ?? `Email failed (${res.status})`;
}

/**
 * After a payment that unlocks the paid community only (e.g. the live Copilot training, which runs on
 * Teams, so there is no course to open). Lucas is copied in so he knows to send the joining details.
 */
export async function sendCommunityPurchaseEmail(o: { to: string; name: string; title: string; link: string; isNew: boolean; until: Date | null; receiptUrl?: string | null }): Promise<string | null> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "RESEND_API_KEY missing";
  const first = esc((o.name || "").split(" ")[0] || "there");
  const until = o.until ? o.until.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }) : null;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#202058;padding:26px 36px;text-align:center;"><p style="margin:0;color:#9eff1f;font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p></td></tr>
<tr><td style="padding:34px 40px 8px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;color:#0b0b2c;">Thank you, ${first}. Your place is confirmed.</h1>
<p style="margin:0 0 14px;">Your payment for <strong>${esc(o.title)}</strong> is confirmed.</p>
<p style="margin:0 0 14px;">The training runs live on Microsoft Teams, so there is nothing to open on the learning platform for it. We will email you the date and your joining details separately.</p>
<p style="margin:0 0 14px;">Your VAT invoice and receipt are saved under <strong>Settings, then Purchase history</strong> on the learning platform${o.receiptUrl ? `, and you can <a href="${esc(o.receiptUrl)}" style="color:#3434ff;">open your receipt here</a>` : ""}.</p>
<p style="margin:0 0 14px;">Your <strong>SafetyTech Global Network</strong> membership is now active${until ? ` until <strong>${until}</strong>` : ""}. It is the members-only community of SafetyTech Academy.</p>
<p style="margin:0 0 14px;">${o.isNew ? "Choose a password to open your account and join the community." : "You already have an account, so sign in to join the community."}</p>
</td></tr>
<tr><td style="padding:8px 40px 28px;text-align:center;"><a href="${esc(o.link)}" style="display:inline-block;background:#3434ff;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">${o.isNew ? "Set my password and join" : "Open the community"}</a></td></tr>
<tr><td style="padding:0 40px 24px;color:#94a3b8;font-size:12px;line-height:1.6;">${o.isNew ? "This link works once and stays valid for 24 hours. If it has stopped working, go to safetytech.academy/learn/auth and choose Forgot password." : ""}</td></tr>
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#94a3b8;font-size:11px;">Questions? Reply to this email or write to hello@safetytech.academy</p></td></tr>
</table></td></tr></table></body></html>`;
  const res = await resendSend(key, {
    from: "SafetyTech Academy <hello@safetytech.academy>", reply_to: "hello@safetytech.academy", to: [o.to], bcc: ["lucas@safetytech.academy"],
    subject: `Your place on ${o.title} is confirmed`, html, text: htmlToText(html),
  });
  if (res.ok) return null;
  const b = await res.json().catch(() => ({}));
  return b?.message ?? `Email failed (${res.status})`;
}
