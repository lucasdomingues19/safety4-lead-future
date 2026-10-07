import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, requireAdmin } from "../_shared/auth.ts";
import { callSyngraph } from "../_shared/syngraph.ts";
import { htmlToText, resendSend, sleep } from "../_shared/emailText.ts";

// Certificates of attendance for a community event (admin only).
//   { event_id, attendees:[{name,email,minutes}], template_id, min_minutes?, mode? , send_email? }
//   mode "sample"  -> issues ONE certificate to the calling admin so they can check the design
//                     (Syngraph only: nothing is copied into the LMS and nobody is emailed)
//   mode "dry_run" -> (default) who would get one, nothing is created
//   mode "issue"   -> issues through Syngraph, copies each into `certificates`,
//                     and only emails people when send_email is true
// Syngraph's issue API never emails the recipient, so emailing is our choice.

const SITE = "https://www.safetytech.academy";
const LINKEDIN_PAGE = "https://www.linkedin.com/company/safety-40-academy";
const MAX_PEOPLE = 150;
const DAILY_BUDGET = 90, RESERVE = 10; // shared with lifecycle + migration emails (Resend allows 100/day)

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (t: string) => String(t ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const mask = (e: string) => e.replace(/^(.).*(@.*)$/, "$1***$2");

interface Attendee { name: string; email: string; minutes?: number }
interface Issued { publicId: string; verifyUrl: string }

const splitName = (full: string) => {
  const parts = full.replace(/\s+/g, " ").trim().split(" ");
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
};

function emailHtml(name: string, title: string, dateText: string, verifyUrl: string) {
  const first = esc((name || "").split(" ")[0] || "there");
  const addToLinkedIn = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(`${title} (Certificate of Attendance)`)}&organizationName=${encodeURIComponent("SafetyTech Academy")}&certUrl=${encodeURIComponent(verifyUrl)}`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#202058;padding:30px 36px;text-align:center;"><p style="margin:0;color:#9eff1f;font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p></td></tr>
<tr><td style="padding:34px 40px 8px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 16px;font-size:24px;color:#0b0b2c;">Thank you for joining, ${first}</h1>
<p style="margin:0 0 14px;">It was great to have you at the live <strong>${esc(title)}</strong> on ${esc(dateText)}. This was a short, 1-hour awareness-level session, and your <strong>Certificate of Attendance</strong> is ready as a record of it. It is signed, so anyone you share it with can check it is genuine.</p>
</td></tr>
<tr><td style="padding:12px 40px 8px;text-align:center;"><a href="${esc(verifyUrl)}" style="display:inline-block;background:#3434ff;color:#ffffff;padding:14px 30px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">View my certificate</a></td></tr>
<tr><td style="padding:6px 40px 18px;text-align:center;"><a href="${esc(addToLinkedIn)}" style="color:#3434ff;font-size:14px;font-weight:700;text-decoration:none;">Add it to your LinkedIn profile →</a></td></tr>
<tr><td style="padding:0 40px 18px;color:#1e293b;font-size:14px;line-height:1.7;">
<p style="margin:0 0 10px;"><strong>Share it and tag us.</strong> If you post about it on LinkedIn, please tag <a href="${LINKEDIN_PAGE}" style="color:#3434ff;text-decoration:none;font-weight:700;">SafetyTech Academy</a> so we can celebrate with you and help others find the session. If it helps, here is a starting point:</p>
<p style="margin:0;padding:12px 14px;background:#f5f7ff;border-radius:8px;color:#334155;font-size:13.5px;">I joined ${esc(title)} with SafetyTech Academy: a quick, practical introduction to using Microsoft 365 Copilot for real EHS work. #EHS #Copilot #AIinEHS</p>
</td></tr>
<tr><td style="padding:0 40px 28px;color:#1e293b;font-size:14px;line-height:1.7;">
<p style="margin:0;">Want to watch the session again? The full recording is in our free learning community. <a href="${SITE}/learn/auth" style="color:#3434ff;font-weight:700;text-decoration:none;">Join here</a>.</p>
</td></tr>
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#94a3b8;font-size:11px;">SafetyTech Academy · Certificate verified by Syngraph AI · Questions? Reply to this email.</p></td></tr>
</table></td></tr></table></body></html>`;
}

async function sendEmail(to: string, name: string, title: string, dateText: string, verifyUrl: string): Promise<string | null> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "RESEND_API_KEY missing";
  const html = emailHtml(name, title, dateText, verifyUrl);
  const res = await resendSend(key, {
    from: "SafetyTech Academy <hello@safetytech.academy>", reply_to: "hello@safetytech.academy", to: [to],
    subject: `Your ${title} certificate`, html, text: htmlToText(html),
  });
  if (res.ok) return null;
  const b = await res.json().catch(() => ({}));
  return b?.message ?? `Email failed (${res.status})`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  let admin;
  try { admin = await requireAdmin(req); } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const b = await req.json().catch(() => ({})) as { event_id?: string; attendees?: Attendee[]; template_id?: string; badge_id?: string; min_minutes?: number; mode?: string; send_email?: boolean; description?: string };

  const { data: ev } = await db.from("community_events").select("id, title, starts_at").eq("id", b.event_id ?? "").maybeSingle();
  if (!ev) return json({ error: "Event not found" }, 404);
  if (!b.template_id) return json({ error: "template_id (the Syngraph certificate design) is required" }, 400);
  const title = ev.title;
  const when = new Date(ev.starts_at);
  const dateText = when.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
  const completionDate = ev.starts_at.slice(0, 10);
  const achievement = {
    name: title,
    description: b.description ?? `Attended the live ${title} on ${dateText}: a 1-hour, awareness-level introduction to using Microsoft 365 Copilot for real EHS work. A short course, not an accredited qualification.`,
    criteria: `Attended the live ${title} session (1 hour, awareness level).`,
    templateId: b.template_id,
    badgeId: b.badge_id ?? null,
  };
  // Syngraph creates a NEW achievement whenever it is not given an achievementId, so find ours once
  // (by name) and reuse it for every recipient; the first call creates it, with the design and badge.
  let achievementId: string | null = null;
  let looked = false;
  const findAchievement = async () => {
    looked = true;
    const base = Deno.env.get("SYNGRAPH_FUNCTIONS_URL") ?? "https://bzmumnflczajlagnmppd.supabase.co/functions/v1";
    const res = await fetch(`${base}/api-list-achievements`, { headers: { Authorization: `Bearer ${Deno.env.get("SYNGRAPH_API_KEY") ?? ""}` }, signal: AbortSignal.timeout(15_000) });
    const data = await res.json().catch(() => ({}));
    achievementId = (data?.achievements ?? []).find((x: { id: string; name: string }) => x.name === title)?.id ?? null;
  };
  const issue = async (a: { name: string; email: string }) => {
    if (!looked) await findAchievement();
    const n = splitName(a.name);
    const r = await callSyngraph<Issued & { ok?: boolean; achievementId?: string }>("api-issue-credential", {
      ...(achievementId ? { achievementId } : { achievement }),
      kind: "certificate", recipient: { firstName: n.firstName, lastName: n.lastName, email: a.email }, issuedAt: ev.starts_at,
    });
    if (!achievementId && r.achievementId) achievementId = r.achievementId;
    return r;
  };
  const mode = b.mode ?? "dry_run";

  // ---- sample: one certificate for the calling admin, to check the design ----
  if (mode === "sample") {
    const me = { name: "Lucas Domingues", email: admin.email! };
    const r = await issue(me);
    return json({ sample: true, issued_to: me.email, verifyUrl: r.verifyUrl, publicId: r.publicId, note: "Syngraph only. Nothing copied into the LMS and no email sent." });
  }

  if (mode === "email_preview") {
    const link = typeof (b as { preview_url?: string }).preview_url === "string" ? (b as { preview_url?: string }).preview_url! : `${SITE}/learn`;
    const err = await sendEmail(admin.email!, "Lucas Domingues", title, dateText, link);
    return json({ preview_sent_to: admin.email, error: err });
  }

  // ---- real list ----
  const min = Number.isFinite(b.min_minutes) ? b.min_minutes! : 30;
  const seen = new Set<string>();
  const eligible: Attendee[] = [], belowThreshold: Attendee[] = [], invalid: string[] = [];
  for (const a of (b.attendees ?? []).slice(0, MAX_PEOPLE)) {
    const email = String(a.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) { invalid.push(a.name); continue; }
    if (seen.has(email)) continue;
    seen.add(email);
    const person = { name: String(a.name ?? "").trim() || email.split("@")[0], email, minutes: a.minutes };
    if ((a.minutes ?? min) < min) belowThreshold.push(person); else eligible.push(person);
  }
  const { data: existing } = await db.from("certificates").select("recipient_email").eq("course_name", title).eq("status", "issued");
  const have = new Set((existing ?? []).map((r: { recipient_email: string }) => r.recipient_email.toLowerCase()));
  const todo = eligible.filter((a) => !have.has(a.email));

  // ---- send_emails: email people who already hold the certificate, exactly once each ----
  if (mode === "send_emails") {
    const { data: certs } = await db.from("certificates").select("recipient_email, recipient_name, external_url").eq("course_name", title).eq("status", "issued");
    const byEmail = new Map((certs ?? []).map((c: { recipient_email: string; recipient_name: string; external_url: string | null }) => [c.recipient_email.toLowerCase(), c]));
    const { data: sentRows } = await db.from("email_log").select("dedupe_key").eq("kind", "event_certificate").like("dedupe_key", `${ev.id}:%`);
    const already = new Set((sentRows ?? []).map((r: { dedupe_key: string }) => r.dedupe_key.split(":")[1]));
    const { count } = await db.from("email_log").select("id", { count: "exact", head: true }).gte("sent_at", new Date(Date.now() - 86_400_000).toISOString());
    let room = Math.max(0, DAILY_BUDGET - RESERVE - (count ?? 0));
    const sentTo: string[] = [], failed: { email: string; error: string }[] = [];
    let skippedBudget = 0, skippedAlready = 0;
    for (const a of eligible) {
      const c = byEmail.get(a.email);
      if (!c?.external_url) { failed.push({ email: mask(a.email), error: "no certificate to send" }); continue; }
      if (already.has(a.email)) { skippedAlready++; continue; }
      if (room <= 0) { skippedBudget++; continue; }
      const err = await sendEmail(a.email, c.recipient_name, title, dateText, c.external_url);
      if (err) failed.push({ email: mask(a.email), error: err });
      else { room--; sentTo.push(mask(a.email)); await db.from("email_log").insert({ kind: "event_certificate", dedupe_key: `${ev.id}:${a.email}`, status: "sent" }); }
      await sleep(700);
    }
    return json({ emailed: sentTo.length, failed, already_emailed_before: skippedAlready, held_for_daily_budget: skippedBudget });
  }

  if (mode !== "issue") {
    return json({ dry_run: true, event: title, date: dateText, min_minutes: min, would_issue: todo.length, already_have: eligible.length - todo.length, below_threshold: belowThreshold.map((p) => ({ name: p.name, minutes: p.minutes })), invalid, list: todo.map((p) => ({ name: p.name, email: mask(p.email), minutes: p.minutes })), would_email: !!b.send_email });
  }

  const results: { email: string; ok: boolean; emailed?: boolean; error?: string }[] = [];
  let emailRoom = 0;
  if (b.send_email) {
    const { count } = await db.from("email_log").select("id", { count: "exact", head: true }).gte("sent_at", new Date(Date.now() - 86_400_000).toISOString());
    emailRoom = Math.max(0, DAILY_BUDGET - RESERVE - (count ?? 0));
  }
  for (const a of todo) {
    try {
      const r = await issue(a);
      const { error } = await db.from("certificates").insert({
        recipient_name: a.name, recipient_email: a.email, course_name: title, completion_date: completionDate,
        credential_level: "Certificate of Attendance", status: "issued", issued_by: admin.id, issued_at: ev.starts_at, external_url: r.verifyUrl,
      });
      if (error) throw new Error(`certificate saved in Syngraph but not mirrored: ${error.message}`);
      let emailed = false;
      if (b.send_email) {
        if (emailRoom > 0) {
          const err = await sendEmail(a.email, a.name, title, dateText, r.verifyUrl);
          if (!err) { emailed = true; emailRoom--; await db.from("email_log").insert({ kind: "event_certificate", dedupe_key: `${ev.id}:${a.email}`, status: "sent" }); }
          await sleep(700);
        }
      }
      results.push({ email: mask(a.email), ok: true, emailed });
    } catch (e) {
      results.push({ email: mask(a.email), ok: false, error: String((e as Error).message).slice(0, 200) });
    }
  }
  return json({ issued: results.filter((r) => r.ok).length, emailed: results.filter((r) => r.emailed).length, failed: results.filter((r) => !r.ok), skipped_no_email_budget: b.send_email ? results.filter((r) => r.ok && !r.emailed).length : 0 });
});
