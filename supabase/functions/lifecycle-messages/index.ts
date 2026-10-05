// Lifecycle emails + in-app notifications for learners. Runs every 15 minutes
// from pg_cron (header x-cron-secret = LIFECYCLE_CRON_SECRET). Each message is
// sent at most once per (user, kind, dedupe key): the email_log row is claimed
// before sending, so overlapping runs can't double-send.
//
//   welcome_course   enrolment in the last 3 days            email
//   onboarding_day1  signed up 1–3 days ago, no lesson done  email
//   onboarding_day3  signed up 3–6 days ago                  email
//   module_complete  finished a module (last 3 days)         email + in-app
//   final_ready      finished all lessons, final assessment  email + in-app
//   course_complete  finished all lessons, no final          in-app (certificate email is separate)
//   nudge_7/nudge_21 no activity for 7 / 21 days             email + in-app   (reminder)
//   access_expiring  access ends within 7 days               email + in-app   (reminder)
//   event_reminder   RSVP'd live session within the hour     email + in-app
//
// "Reminder" kinds respect profiles.email_reminders and carry a one-click
// unsubscribe link (GET ?unsubscribe=<token>). Admins can POST
// { dryRun: true } to see what would be sent, without sending.
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, requireAdmin } from "../_shared/auth.ts";

const SITE = "https://www.safetytech.academy";
const FN_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/lifecycle-messages`;
const FROM = "SafetyTech Academy <hello@safetytech.academy>";
const NAVY = "#0b0b2c", LIME = "#9eff1f", BLUE = "#3434ff";
const MAX_PER_RUN = 25;          // keep each run small
const MAX_PER_DAY = 90;          // Resend free plan allows 100/day
const DAY = 86_400_000;
const REMINDER_KINDS = new Set(["nudge_7", "nudge_21", "access_expiring", "onboarding_day1", "onboarding_day3"]);

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (t: string) => String(t ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));
const firstName = (n?: string | null) => (n ?? "").trim().split(/\s+/)[0] || "there";
const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "Europe/London" });
const fmtTime = (d: string | Date) => new Date(d).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London", timeZoneName: "short" });

function safeEqual(a: string, b: string) {
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// ---------- unsubscribe tokens (HMAC of the user id) ----------
async function hmac(text: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(Deno.env.get("LIFECYCLE_CRON_SECRET") ?? ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text)));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "").slice(0, 32);
}
const unsubToken = async (userId: string) => `${userId}.${await hmac(`unsub:${userId}`)}`;

// ---------- email layout (matches the auth emails) ----------
function layout(o: { heading: string; paras: string[]; cta?: { label: string; url: string }; reminderFooter?: string }) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden;">
<tr><td style="background:${NAVY};padding:26px 36px;text-align:center;"><p style="margin:0;color:${LIME};font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p></td></tr>
<tr><td style="padding:34px 40px 8px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:${NAVY};">${esc(o.heading)}</h1>
${o.paras.map((p) => `<p style="margin:0 0 12px;">${p}</p>`).join("")}
</td></tr>
${o.cta ? `<tr><td style="padding:10px 40px 30px;"><a href="${esc(o.cta.url)}" style="display:inline-block;background:${BLUE};color:#fff;padding:14px 30px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">${esc(o.cta.label)}</a></td></tr>` : ""}
<tr><td style="padding:16px 36px;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:11.5px;line-height:1.6;text-align:center;">
SafetyTech Academy · Shield360 Ltd, 20 Wenlock Road, London N1 7GU<br>Questions? Just reply to this email.${o.reminderFooter ? `<br>${o.reminderFooter}` : ""}
</td></tr></table></td></tr></table></body></html>`;
}

interface Msg { userId: string; email: string; kind: string; key: string; subject?: string; html?: string; notify?: { title: string; body: string; link: string } }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // ---- one-click unsubscribe from reminders ----
  const url = new URL(req.url);
  const unsub = url.searchParams.get("unsubscribe");
  if (unsub) {
    const [uid, sig] = unsub.split(".");
    const ok = !!uid && !!sig && safeEqual(sig, await hmac(`unsub:${uid}`));
    if (ok) await db.from("profiles").update({ email_reminders: false }).eq("id", uid);
    const msg = ok
      ? "You won't get learning reminders any more. Account, payment and certificate emails will still reach you. You can switch reminders back on in Settings."
      : "This link isn't valid. You can manage reminders in Settings in the learning platform.";
    return new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email reminders</title></head><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;"><div style="max-width:460px;margin:60px auto;background:#fff;border-radius:14px;padding:32px;color:#1e293b;line-height:1.6"><h1 style="font-size:20px;color:${NAVY};margin:0 0 10px">${ok ? "Unsubscribed from reminders" : "Link not recognised"}</h1><p style="margin:0 0 18px">${msg}</p><a href="${SITE}/learn?view=settings" style="color:${BLUE};font-weight:700">Open Settings</a></div></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // ---- who's calling ----
  const body = await req.json().catch(() => ({}));
  const cron = safeEqual(req.headers.get("x-cron-secret") ?? "", Deno.env.get("LIFECYCLE_CRON_SECRET") ?? "");
  let dryRun = false;
  if (!cron) {
    try { await requireAdmin(req); } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }
    dryRun = body.dryRun !== false; // admins get a preview unless they explicitly ask to send
  }

  try {
    const now = Date.now();

    // ---- load everything once ----
    const users: any[] = [];
    for (let page = 1; page < 50; page++) {
      const { data } = await db.auth.admin.listUsers({ page, perPage: 1000 });
      users.push(...(data?.users ?? []));
      if (!data?.users?.length || data.users.length < 1000) break;
    }
    const byId = new Map(users.map((u) => [u.id, u]));
    // PostgREST returns at most 1,000 rows per request, so page through.
    const all = async (table: string, cols: string, filter?: (q: any) => any) => {
      const rows: any[] = [];
      for (let from = 0; ; from += 1000) {
        let q = db.from(table).select(cols).range(from, from + 999);
        if (filter) q = filter(q);
        const { data, error } = await q;
        if (error) throw new Error(`${table}: ${error.message}`);
        rows.push(...(data ?? []));
        if (!data || data.length < 1000) return { data: rows };
      }
    };
    const [{ data: profiles }, { data: enrolls }, { data: courses }, { data: modules }, { data: lessons }, { data: progress }, { data: watches }, { data: days }, { data: finals }, { data: logs }, { data: admins }] = await Promise.all([
      all("profiles", "id, full_name, email_reminders, tour_completed_at"),
      all("enrollments", "id, user_id, course_id, status, enrolled_at, expires_at", (q) => q.eq("status", "active")),
      all("courses", "id, title, slug, final_assessment_ref"),
      all("modules", "id, course_id, title, position"),
      all("lessons", "id, module_id, title, position, duration_minutes, video_duration_seconds"),
      all("lesson_progress", "user_id, lesson_id, completed_at", (q) => q.eq("is_completed", true)),
      all("lesson_watch", "user_id, last_heartbeat_at"),
      all("learning_activity_days", "user_id, day", (q) => q.gte("day", new Date(Date.now() - 90 * DAY).toISOString().slice(0, 10))),
      all("final_assessment_attempts", "user_id, course_id, status"),
      all("email_log", "user_id, kind, dedupe_key, sent_at"),
      all("user_roles", "user_id", (q) => q.eq("role", "admin")),
    ]);
    const adminIds = new Set((admins ?? []).map((a: any) => a.user_id));
    const prof = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const sent = new Set((logs ?? []).map((l: any) => `${l.user_id}|${l.kind}|${l.dedupe_key}`));
    const sentToday = (logs ?? []).filter((l: any) => now - new Date(l.sent_at).getTime() < DAY).length;
    const course = new Map((courses ?? []).map((c: any) => [c.id, c]));

    // Course outline in learning order.
    const outline = new Map<string, { module: any; lessons: any[] }[]>();
    for (const c of courses ?? []) {
      const mods = (modules ?? []).filter((m: any) => m.course_id === c.id).sort((a: any, b: any) => a.position - b.position);
      outline.set(c.id, mods.map((m: any) => ({ module: m, lessons: (lessons ?? []).filter((l: any) => l.module_id === m.id).sort((a: any, b: any) => a.position - b.position) })));
    }
    const done = new Map<string, Map<string, number>>(); // user -> lesson -> completed ms
    for (const p of progress ?? []) {
      if (!done.has(p.user_id)) done.set(p.user_id, new Map());
      done.get(p.user_id)!.set(p.lesson_id, p.completed_at ? new Date(p.completed_at).getTime() : 0);
    }
    const lastActive = new Map<string, number>();
    const bump = (u: string, t: number) => { if (t && t > (lastActive.get(u) ?? 0)) lastActive.set(u, t); };
    for (const p of progress ?? []) bump(p.user_id, p.completed_at ? new Date(p.completed_at).getTime() : 0);
    for (const w of watches ?? []) bump(w.user_id, w.last_heartbeat_at ? new Date(w.last_heartbeat_at).getTime() : 0);
    for (const d of days ?? []) bump(d.user_id, new Date(`${d.day}T12:00:00Z`).getTime());

    const mins = (l: any) => l?.duration_minutes || (l?.video_duration_seconds ? Math.max(1, Math.round(l.video_duration_seconds / 60)) : null);
    const lessonUrl = (c: any, l: any) => `${SITE}/learn/${c.slug}/lesson/${l.id}`;

    const msgs: Msg[] = [];
    const want = (m: Msg) => { if (!sent.has(`${m.userId}|${m.kind}|${m.key}`)) msgs.push(m); };

    for (const u of users) {
      if (!u.email || adminIds.has(u.id)) continue;               // never message admins
      const p: any = prof.get(u.id) ?? {};
      const first = firstName(p.full_name || u.user_metadata?.full_name);
      const signedIn = !!u.last_sign_in_at;
      const created = new Date(u.created_at).getTime();
      const myEnrols = (enrolls ?? []).filter((e: any) => e.user_id === u.id && course.has(e.course_id));
      const myDone = done.get(u.id) ?? new Map();

      for (const e of myEnrols) {
        const c: any = course.get(e.course_id);
        const mods = outline.get(c.id) ?? [];
        const all = mods.flatMap((m) => m.lessons);
        if (!all.length) continue;
        const next = all.find((l: any) => !myDone.has(l.id));
        const completedCount = all.filter((l: any) => myDone.has(l.id)).length;
        const pct = Math.round((completedCount / all.length) * 100);
        const enrolledAt = new Date(e.enrolled_at).getTime();

        // Welcome to the course (learners who have actually signed in; imported
        // learners get the admin "account ready" invite instead).
        if (signedIn && now - enrolledAt < 3 * DAY && completedCount === 0) {
          want({ userId: u.id, email: u.email, kind: "welcome_course", key: e.id,
            subject: `Welcome to ${c.title}`,
            html: layout({ heading: `You're in, ${first}!`, paras: [
              `Your access to <strong>${esc(c.title)}</strong> is ready.`,
              next ? `Start with <strong>${esc(next.title)}</strong>${mins(next) ? ` — about ${mins(next)} minutes` : ""}. Most learners finish a module in about a week, at their own pace.` : "",
              `Every lesson has captions and a transcript, and you can ask questions in the community at any time.`,
            ].filter(Boolean), cta: next ? { label: "Start the first lesson", url: lessonUrl(c, next) } : { label: "Open the course", url: `${SITE}/learn/${c.slug}` } }) });
        }

        // Module complete (most recent finish within 3 days).
        if (completedCount < all.length) {
          mods.forEach((m, i) => {
            if (!m.lessons.length || !m.lessons.every((l: any) => myDone.has(l.id))) return;
            const finishedAt = Math.max(...m.lessons.map((l: any) => myDone.get(l.id) || 0));
            if (now - finishedAt > 3 * DAY) return;
            const nm = mods.slice(i + 1).find((x) => x.lessons.some((l: any) => !myDone.has(l.id)));
            const nl = nm?.lessons.find((l: any) => !myDone.has(l.id)) ?? next;
            want({ userId: u.id, email: u.email, kind: "module_complete", key: m.module.id,
              subject: `You've finished ${m.module.title.replace(/^Module \d+:\s*/i, "")}`,
              html: layout({ heading: `Module complete — nice work, ${first}`, paras: [
                `You've finished <strong>${esc(m.module.title)}</strong> in ${esc(c.title)}. You're now ${pct}% of the way through.`,
                nl ? `Next up: <strong>${esc(nm?.module.title ?? "")}</strong>, starting with ${esc(nl.title)}.` : "",
              ].filter(Boolean), cta: nl ? { label: "Start the next module", url: lessonUrl(c, nl) } : undefined }),
              notify: { title: `Module complete: ${m.module.title}`, body: nl ? `Next up: ${nl.title}` : `${pct}% of ${c.title} done`, link: nl ? `/learn/${c.slug}/lesson/${nl.id}` : `/learn/${c.slug}` } });
          });
        }

        // Finished every lesson.
        if (completedCount === all.length) {
          const finishedAt = Math.max(...all.map((l: any) => myDone.get(l.id) || 0));
          if (now - finishedAt < 7 * DAY) {
            const passed = (finals ?? []).some((f: any) => f.user_id === u.id && f.course_id === c.id && /pass/i.test(f.status ?? ""));
            if (c.final_assessment_ref && !passed) {
              want({ userId: u.id, email: u.email, kind: "final_ready", key: c.id,
                subject: "You're ready for your final assessment",
                html: layout({ heading: `Every lesson done, ${first}`, paras: [
                  `You've completed all of <strong>${esc(c.title)}</strong>. The last step is the final assessment — pass it and your verified certificate and digital badge are issued straight away.`,
                  `It takes around 30 minutes. You can stop and come back, and your answers are saved.`,
                ], cta: { label: "Take the final assessment", url: `${SITE}/learn/${c.slug}/final-assessment` } }),
                notify: { title: "You're ready for the final assessment", body: c.title, link: `/learn/${c.slug}/final-assessment` } });
            } else if (!c.final_assessment_ref) {
              want({ userId: u.id, email: u.email, kind: "course_complete", key: c.id,
                notify: { title: `Course complete: ${c.title}`, body: "Your certificate is in My learning.", link: "/learn?view=learning" } });
            }
          }
        }

        // Access ending soon.
        if (e.expires_at && completedCount < all.length) {
          const left = new Date(e.expires_at).getTime() - now;
          if (left > 0 && left < 7 * DAY) {
            want({ userId: u.id, email: u.email, kind: "access_expiring", key: `${e.id}:${e.expires_at.slice(0, 10)}`,
              subject: `Your access to ${c.title} ends on ${fmtDate(e.expires_at)}`,
              html: layout({ heading: "Your access ends soon", paras: [
                `Hi ${esc(first)}, your access to <strong>${esc(c.title)}</strong> ends on <strong>${fmtDate(e.expires_at)}</strong>. You're ${pct}% of the way through.`,
                next ? `Your next lesson is <strong>${esc(next.title)}</strong>.` : "",
              ].filter(Boolean), cta: next ? { label: "Continue learning", url: lessonUrl(c, next) } : undefined }),
              notify: { title: `Access ends ${fmtDate(e.expires_at)}`, body: `${c.title} — ${pct}% complete`, link: `/learn/${c.slug}` } });
          }
        }

        // Inactivity nudges (one per quiet spell, at 7 and 21 days).
        if (signedIn && next && completedCount < all.length) {
          const last = Math.max(lastActive.get(u.id) ?? 0, enrolledAt);
          const quiet = now - last;
          const spell = new Date(last).toISOString().slice(0, 10);
          const continueUrl = lessonUrl(c, next);
          if (quiet >= 7 * DAY && quiet < 21 * DAY) {
            want({ userId: u.id, email: u.email, kind: "nudge_7", key: `${c.id}:${spell}`,
              subject: `Pick up where you left off: ${next.title}`,
              html: layout({ heading: `Ready for the next one, ${first}?`, paras: [
                completedCount ? `You're ${pct}% of the way through <strong>${esc(c.title)}</strong>.` : `<strong>${esc(c.title)}</strong> is waiting for you.`,
                `Your next lesson is <strong>${esc(next.title)}</strong>${mins(next) ? ` — about ${mins(next)} minutes` : ""}. A short session today keeps the momentum going.`,
              ], cta: { label: "Continue learning", url: continueUrl } }),
              notify: { title: "Pick up where you left off", body: next.title, link: `/learn/${c.slug}/lesson/${next.id}` } });
          } else if (quiet >= 21 * DAY && quiet < 60 * DAY) {
            want({ userId: u.id, email: u.email, kind: "nudge_21", key: `${c.id}:${spell}`,
              subject: `Your progress in ${c.title} is saved`,
              html: layout({ heading: "Your place is saved", paras: [
                `Hi ${esc(first)}, it's been a few weeks. Everything you've done in <strong>${esc(c.title)}</strong> is saved${completedCount ? ` (${pct}% complete)` : ""}.`,
                `Even 10 minutes a week adds up. Your next lesson: <strong>${esc(next.title)}</strong>.`,
              ], cta: { label: "Continue learning", url: continueUrl } }),
              notify: { title: "Your progress is saved", body: `Next: ${next.title}`, link: `/learn/${c.slug}/lesson/${next.id}` } });
          }
        }
      }

      // Onboarding (signed-in learners with at least one course).
      if (signedIn && myEnrols.length) {
        const age = now - created;
        const c0: any = course.get(myEnrols[0].course_id);
        const first0 = (outline.get(c0.id) ?? []).flatMap((m) => m.lessons)[0];
        if (age > DAY && age < 3 * DAY && myDone.size === 0 && first0) {
          want({ userId: u.id, email: u.email, kind: "onboarding_day1", key: "",
            subject: `Your first lesson takes ${mins(first0) ?? 5} minutes`,
            html: layout({ heading: `Let's get you started, ${first}`, paras: [
              `The hardest part of any course is the first lesson. Yours is <strong>${esc(first0.title)}</strong> in ${esc(c0.title)}${mins(first0) ? ` — about ${mins(first0)} minutes` : ""}.`,
              `New to the platform? The 2-minute tour with Mia shows you around.`,
            ], cta: { label: "Start the first lesson", url: lessonUrl(c0, first0) } }) });
        }
        if (age > 3 * DAY && age < 6 * DAY) {
          want({ userId: u.id, email: u.email, kind: "onboarding_day3", key: "",
            subject: "Meet the people learning with you",
            html: layout({ heading: "You're not learning alone", paras: [
              `Hi ${esc(first)}, the SafetyTech Academy community is where EHS professionals share wins, ask questions and swap ideas on applying AI at work.`,
              `It's also where you'll find our live webinars, roundtables and podcast episodes.`,
            ], cta: { label: "Visit the community", url: `${SITE}/learn?view=community` } }) });
        }
      }
    }

    // Live session reminders (RSVP'd, starting within the hour).
    const { data: soon } = await db.from("community_events").select("id, title, starts_at, join_url").gt("starts_at", new Date(now).toISOString()).lt("starts_at", new Date(now + 70 * 60_000).toISOString());
    for (const ev of soon ?? []) {
      const { data: rsvps } = await db.from("community_event_rsvps").select("user_id").eq("event_id", ev.id);
      for (const r of rsvps ?? []) {
        const u = byId.get(r.user_id);
        if (!u?.email) continue;
        want({ userId: u.id, email: u.email, kind: "event_reminder", key: ev.id,
          subject: `Starting in an hour: ${ev.title}`,
          html: layout({ heading: ev.title, paras: [`Starts ${esc(fmtTime(ev.starts_at))}. See you there.`], cta: { label: "Join the session", url: ev.join_url || `${SITE}/learn?view=community` } }),
          notify: { title: `Starting soon: ${ev.title}`, body: fmtTime(ev.starts_at), link: "/learn?view=community" } });
      }
    }

    // Reminder opt-outs.
    const allowed = msgs.filter((m) => !REMINDER_KINDS.has(m.kind) || (prof.get(m.userId) as any)?.email_reminders !== false);

    if (dryRun) {
      return json({ dryRun: true, wouldSend: allowed.map((m) => ({ email: m.email, kind: m.kind, subject: m.subject ?? null, inApp: m.notify?.title ?? null })),
        skippedOptOut: msgs.length - allowed.length, sentToday });
    }

    // ---- send ----
    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emails = 0, notes = 0, failed = 0, deferred = 0;
    for (const m of allowed) {
      const willEmail = !!(m.subject && m.html);
      if (willEmail && (emails >= MAX_PER_RUN || sentToday + emails >= MAX_PER_DAY)) { deferred++; continue; }
      // Claim first: the unique (user, kind, key) makes this exactly-once.
      const { error: claimErr } = await db.from("email_log").insert({ user_id: m.userId, kind: m.kind, dedupe_key: m.key, status: willEmail ? "sending" : "in_app" });
      if (claimErr) continue; // someone else already sent it
      if (m.notify) { await db.rpc("notify", { _user: m.userId, _kind: m.kind, _title: m.notify.title, _body: m.notify.body, _link: m.notify.link }); notes++; }
      if (!willEmail) continue;
      try {
        let html = m.html!;
        const headers: Record<string, string> = {};
        if (REMINDER_KINDS.has(m.kind)) {
          const link = `${FN_URL}?unsubscribe=${encodeURIComponent(await unsubToken(m.userId))}`;
          html = html.replace("Questions? Just reply to this email.", `Questions? Just reply to this email.<br><a href="${link}" style="color:#94a3b8;">Stop learning reminders</a> · <a href="${SITE}/learn?view=settings" style="color:#94a3b8;">Email settings</a>`);
          headers["List-Unsubscribe"] = `<${link}>`;
          headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
        }
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM, to: [m.email], reply_to: "hello@safetytech.academy", subject: m.subject, html, headers }),
        });
        if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
        await db.from("email_log").update({ status: "sent" }).eq("user_id", m.userId).eq("kind", m.kind).eq("dedupe_key", m.key);
        emails++;
      } catch (e) {
        failed++;
        await db.from("email_log").update({ status: "failed", error: String((e as Error).message).slice(0, 300) }).eq("user_id", m.userId).eq("kind", m.kind).eq("dedupe_key", m.key);
      }
    }
    console.log("[lifecycle-messages]", { candidates: allowed.length, emails, notes, failed, deferred });
    return json({ ok: true, emails, notifications: notes, failed, deferred });
  } catch (e) {
    console.error("[lifecycle-messages] failed", e);
    return json({ error: "failed" }, 500);
  }
});
