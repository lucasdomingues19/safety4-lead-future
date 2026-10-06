import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { htmlToText } from "../_shared/emailText.ts";

// Supabase Auth "Send Email" hook. Auth calls this instead of its built-in
// (2 emails/hour) mailer; we send the same messages through Resend.
// Requests are signed with the Standard Webhooks scheme using
// SEND_EMAIL_HOOK_SECRET ("v1,whsec_<base64>").

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SITE = "https://www.safetytech.academy";
const NAVY = "#11113a";
const LIME = "#c1ff72";

const b64ToBytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const bytesToB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const esc = (t: string) => t.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));

async function verify(payload: string, headers: Headers): Promise<boolean> {
  const id = headers.get("webhook-id");
  const ts = headers.get("webhook-timestamp");
  const sigHeader = headers.get("webhook-signature");
  if (!id || !ts || !sigHeader || !HOOK_SECRET) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;

  const secret = HOOK_SECRET.replace(/^v1,whsec_/, "");
  const key = await crypto.subtle.importKey("raw", b64ToBytes(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = bytesToB64(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${payload}`))));

  return sigHeader.split(" ").some((part) => {
    const sig = part.replace(/^v1,/, "");
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  });
}

interface HookPayload {
  user: { email: string; new_email?: string; user_metadata?: { full_name?: string } };
  email_data: {
    token: string;
    token_hash: string;
    token_new?: string;
    token_hash_new?: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

function layout(heading: string, intro: string, buttonLabel: string | null, link: string | null, footnote: string, code?: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;">
<tr><td style="background:${NAVY};padding:26px 36px;text-align:center;"><p style="margin:0;color:${LIME};font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p></td></tr>
<tr><td style="padding:34px 40px 12px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;color:#0b0b2c;">${esc(heading)}</h1>
<p style="margin:0 0 8px;">${esc(intro)}</p>
${code ? `<p style="margin:18px 0;font-size:30px;font-weight:800;letter-spacing:6px;color:#0b0b2c;">${esc(code)}</p>` : ""}
</td></tr>
${buttonLabel && link ? `<tr><td style="padding:8px 40px 24px;text-align:center;"><a href="${esc(link)}" style="display:inline-block;background:#3434ff;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">${esc(buttonLabel)}</a></td></tr>
<tr><td style="padding:0 40px 20px;color:#94a3b8;font-size:12px;line-height:1.6;word-break:break-all;">Button not working? Paste this link into your browser:<br>${esc(link)}</td></tr>` : ""}
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#94a3b8;font-size:11px;">${esc(footnote)}</p></td></tr>
</table></td></tr></table></body></html>`;
}

function build(type: string, link: string, token: string) {
  switch (type) {
    case "signup":
      return { subject: "Confirm your SafetyTech Academy account", html: layout("Confirm your email", "Welcome to SafetyTech Academy! Confirm your email address to activate your account.", "Confirm my email", link, "If you didn't create an account, you can ignore this email.") };
    case "recovery":
      return { subject: "Reset your SafetyTech Academy password", html: layout("Reset your password", "We received a request to reset your password. This link works once and expires soon.", "Choose a new password", link, "If you didn't ask for this, you can safely ignore this email — your password won't change.") };
    case "magiclink":
      return { subject: "Your SafetyTech Academy sign-in link", html: layout("Sign in", "Use the button below to sign in.", "Sign in", link, "If you didn't request this, ignore this email.") };
    case "invite":
      return { subject: "You've been invited to SafetyTech Academy", html: layout("You're invited", "You've been invited to join SafetyTech Academy. Accept the invitation to set up your account.", "Accept invitation", link, "If you weren't expecting this, ignore this email.") };
    case "email_change":
      return { subject: "Confirm your new email address", html: layout("Confirm your new email", "Confirm this address to finish changing the email on your account.", "Confirm new email", link, "If you didn't request this change, contact hello@safetytech.academy.") };
    case "reauthentication":
      return { subject: "Your SafetyTech Academy verification code", html: layout("Verification code", "Enter this code to confirm it's you:", null, null, "If you didn't request this, ignore this email.", token) };
    default:
      return { subject: "SafetyTech Academy notification", html: layout("SafetyTech Academy", "Use the link below to continue.", "Continue", link, "If you didn't request this, ignore this email.") };
  }
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const raw = await req.text();

  if (!(await verify(raw, req.headers))) {
    return new Response(JSON.stringify({ error: { http_code: 401, message: "Invalid signature" } }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const { user, email_data: d } = JSON.parse(raw) as HookPayload;
    // Links go to a page on our own domain that asks the person to press a button
    // (see src/pages/learn/AuthConfirm.tsx): trusted by mail filters, and link
    // scanners can't use up the one-time token. Anything unexpected falls back to
    // Supabase's own verify URL, so sign-in never breaks.
    const nextPath = (() => {
      try {
        const u = new URL(d.redirect_to || d.site_url);
        return /(^|\.)safetytech\.academy$/.test(u.hostname) && u.pathname.startsWith("/learn") ? `${u.pathname}${u.search}` : "/learn";
      } catch { return "/learn"; }
    })();
    const ownDomain = ["signup", "invite", "magiclink", "recovery", "email_change", "email"].includes(d.email_action_type);
    const linkFor = (hash: string) => ownDomain
      ? `${SITE}/learn/auth/confirm?token_hash=${encodeURIComponent(hash)}&type=${encodeURIComponent(d.email_action_type)}&next=${encodeURIComponent(nextPath)}`
      : `${SUPABASE_URL}/auth/v1/verify?token=${encodeURIComponent(hash)}&type=${encodeURIComponent(d.email_action_type)}&redirect_to=${encodeURIComponent(d.redirect_to || d.site_url)}`;

    const jobs: Array<{ to: string; link: string; token: string }> = [];
    if (d.email_action_type === "email_change" && user.new_email) {
      if (d.token_hash) jobs.push({ to: user.email, link: linkFor(d.token_hash_new ?? d.token_hash), token: d.token });
      jobs.push({ to: user.new_email, link: linkFor(d.token_hash ?? d.token_hash_new ?? ""), token: d.token_new ?? d.token });
    } else {
      jobs.push({ to: user.email, link: linkFor(d.token_hash), token: d.token });
    }

    for (const job of jobs) {
      const { subject, html } = build(d.email_action_type, job.link, job.token);
      const res = await resend.emails.send({
        from: "SafetyTech Academy <hello@safetytech.academy>",
        reply_to: "hello@safetytech.academy",
        to: [job.to],
        subject,
        html,
        text: htmlToText(html),
      });
      if (res.error) {
        console.error("Resend rejected auth email:", res.error);
        return new Response(JSON.stringify({ error: { http_code: 500, message: `Email provider error: ${res.error.message}` } }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }
    return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("auth-send-email error:", e);
    return new Response(JSON.stringify({ error: { http_code: 500, message: "Unexpected error" } }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
