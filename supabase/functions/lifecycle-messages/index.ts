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
import { htmlToText, resendSend, sleep } from "../_shared/emailText.ts";

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

// ---------- templates (shared by sending and the admin preview) ----------
interface Ctx {
  first: string; course: string; courseUrl: string;
  lesson?: string; lessonUrl?: string; mins?: number | null; pct?: number; started?: boolean;
  module?: string; nextModule?: string; finalUrl?: string;
  date?: string; event?: string; when?: string; joinUrl?: string;
}
const minsText = (m?: number | null) => (m ? ` — about ${m} minutes` : "");
const T: Record<string, (c: Ctx) => { subject: string; html: string }> = {
  welcome_course: (c) => ({
    subject: `Welcome to ${c.course}`,
    html: layout({ heading: `You're in, ${c.first}!`, paras: [
      `Your access to <strong>${esc(c.course)}</strong> is ready.`,
      c.lesson ? `Start with <strong>${esc(c.lesson)}</strong>${minsText(c.mins)}. Most learners finish a module in about a week, at their own pace.` : "",
      `Every lesson has captions and a transcript, you can ask Mia, your AI learning guide, about any lesson, and the community is there for questions at any time.`,
    ].filter(Boolean), cta: { label: c.lesson ? "Start the first lesson" : "Open the course", url: c.lessonUrl ?? c.courseUrl } }),
  }),
  onboarding_day1: (c) => ({
    subject: `Your first lesson takes ${c.mins ?? 5} minutes`,
    html: layout({ heading: `Let's get you started, ${c.first}`, paras: [
      `The hardest part of any course is the first lesson. Yours is <strong>${esc(c.lesson ?? "")}</strong> in ${esc(c.course)}${minsText(c.mins)}.`,
      `New to the platform? The 2-minute tour with Mia shows you around.`,
    ], cta: { label: "Start the first lesson", url: c.lessonUrl ?? c.courseUrl } }),
  }),
  onboarding_day3: (c) => ({
    subject: "Meet the people learning with you",
    html: layout({ heading: "You're not learning alone", paras: [
      `Hi ${esc(c.first)}, the SafetyTech Academy community is where EHS professionals share wins, ask questions and swap ideas on applying AI at work.`,
      `It's also where you'll find our live webinars, roundtables and podcast episodes.`,
    ], cta: { label: "Visit the community", url: `${SITE}/learn?view=community` } }),
  }),
  module_complete: (c) => ({
    subject: `You've finished ${(c.module ?? "a module").replace(/^Module \d+:\s*/i, "")}`,
    html: layout({ heading: `Module complete — nice work, ${c.first}`, paras: [
      `You've finished <strong>${esc(c.module ?? "")}</strong> in ${esc(c.course)}. You're now ${c.pct ?? 0}% of the way through.`,
      c.lesson ? `Next up: <strong>${esc(c.nextModule ?? "")}</strong>, starting with ${esc(c.lesson)}.` : "",
    ].filter(Boolean), cta: c.lessonUrl ? { label: "Start the next module", url: c.lessonUrl } : undefined }),
  }),
  final_ready: (c) => ({
    subject: "You're ready for your final assessment",
    html: layout({ heading: `Every lesson done, ${c.first}`, paras: [
      `You've completed all of <strong>${esc(c.course)}</strong>. The last step is the final assessment — pass it and your verified certificate and digital badge are issued straight away.`,
      `It takes around 30 minutes. You can stop and come back, and your answers are saved.`,
    ], cta: { label: "Take the final assessment", url: c.finalUrl ?? c.courseUrl } }),
  }),
  access_expiring: (c) => ({
    subject: `Your access to ${c.course} ends on ${c.date}`,
    html: layout({ heading: "Your access ends soon", paras: [
      `Hi ${esc(c.first)}, your access to <strong>${esc(c.course)}</strong> ends on <strong>${esc(c.date ?? "")}</strong>. You're ${c.pct ?? 0}% of the way through.`,
      c.lesson ? `Your next lesson is <strong>${esc(c.lesson)}</strong>.` : "",
    ].filter(Boolean), cta: c.lessonUrl ? { label: "Continue learning", url: c.lessonUrl } : undefined }),
  }),
  nudge_7: (c) => ({
    subject: `Pick up where you left off: ${c.lesson}`,
    html: layout({ heading: `Ready for the next one, ${c.first}?`, paras: [
      c.started ? `You're ${c.pct ?? 0}% of the way through <strong>${esc(c.course)}</strong>.` : `<strong>${esc(c.course)}</strong> is waiting for you.`,
      `Your next lesson is <strong>${esc(c.lesson ?? "")}</strong>${minsText(c.mins)}. A short session today keeps the momentum going.`,
    ], cta: { label: "Continue learning", url: c.lessonUrl ?? c.courseUrl } }),
  }),
  nudge_21: (c) => ({
    subject: `Your progress in ${c.course} is saved`,
    html: layout({ heading: "Your place is saved", paras: [
      `Hi ${esc(c.first)}, it's been a few weeks. Everything you've done in <strong>${esc(c.course)}</strong> is saved${c.started ? ` (${c.pct ?? 0}% complete)` : ""}.`,
      `Even 10 minutes a week adds up. Your next lesson: <strong>${esc(c.lesson ?? "")}</strong>.`,
    ], cta: { label: "Continue learning", url: c.lessonUrl ?? c.courseUrl } }),
  }),
  event_reminder: (c) => ({
    subject: `Starting in an hour: ${c.event}`,
    html: layout({ heading: c.event ?? "Live session", paras: [`Starts ${esc(c.when ?? "")}. See you there.`], cta: { label: "Join the session", url: c.joinUrl ?? `${SITE}/learn?view=community` } }),
  }),
};

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
    let admin;
    try { admin = await requireAdmin(req); } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }
    dryRun = body.dryRun !== false; // admins get a preview unless they explicitly ask to send

    // Preview one automation's email, filled in with real course data.
    if (typeof body.preview === "string") {
      const tpl = T[body.preview];
      if (!tpl) return json({ error: "This automation has no email" }, 404);
      const { data: prof } = await db.from("profiles").select("full_name").eq("id", admin.id).maybeSingle();
      const { data: cs } = await db.from("courses").select("id, title, slug").order("published", { ascending: false }).order("created_at");
      let sample: Ctx = { first: firstName(prof?.full_name), course: "Your course", courseUrl: `${SITE}/learn` };
      const ordered = [...(cs ?? []).filter((c) => !/test/i.test(c.title)), ...(cs ?? []).filter((c) => /test/i.test(c.title))];
      for (const c of ordered) {
        const { data: mods } = await db.from("modules").select("id, title, position").eq("course_id", c.id).order("position").limit(2);
        if (!mods?.length) continue;
        const { data: ls } = await db.from("lessons").select("id, title, duration_minutes, video_duration_seconds").in("module_id", mods.map((m) => m.id)).order("position").limit(1);
        if (!ls?.length) continue;
        const l = ls[0];
        sample = { first: firstName(prof?.full_name), course: c.title, courseUrl: `${SITE}/learn/${c.slug}`, lesson: l.title, lessonUrl: `${SITE}/learn/${c.slug}/lesson/${l.id}`,
          mins: l.duration_minutes || (l.video_duration_seconds ? Math.round(l.video_duration_seconds / 60) : null), pct: 30, started: true,
          module: mods[0].title, nextModule: mods[1]?.title ?? mods[0].title, finalUrl: `${SITE}/learn/${c.slug}/final-assessment`,
          date: fmtDate(new Date(Date.now() + 5 * DAY)), event: "Live roundtable: AI in EHS", when: fmtTime(new Date(Date.now() + 60 * 60_000)) };
        break;
      }
      const out = tpl(sample);
      if (REMINDER_KINDS.has(body.preview)) {
        out.html = out.html.replace("Questions? Just reply to this email.", `Questions? Just reply to this email.<br><a href="#" style="color:#94a3b8;">Stop learning reminders</a> · <a href="#" style="color:#94a3b8;">Email settings</a>`);
      }
      return json(out);
    }
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
      all("profiles", "id, full_name, email_reminders, tour_completed_at, welcomed_at"),
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
    const { data: autos } = await db.from("email_automations").select("kind, enabled");
    const disabledKinds = new Set((autos ?? []).filter((a: any) => a.enabled === false).map((a: any) => a.kind));
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
        const base: Ctx = { first, course: c.title, courseUrl: `${SITE}/learn/${c.slug}`, pct, started: completedCount > 0,
          ...(next ? { lesson: next.title, lessonUrl: lessonUrl(c, next), mins: mins(next) } : {}) };

        // Welcome to the course (learners who have actually signed in; imported
        // learners get the admin "account ready" invite instead).
        // Skipped when the "Your account is ready" invite (which lists their courses) went out in the last 2 days.
        const justInvited = p.welcomed_at && now - new Date(p.welcomed_at).getTime() < 2 * DAY;
        if (signedIn && !justInvited && now - enrolledAt < 3 * DAY && completedCount === 0) {
          want({ userId: u.id, email: u.email, kind: "welcome_course", key: e.id, ...T.welcome_course(base) });
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
              ...T.module_complete({ ...base, module: m.module.title, nextModule: nm?.module.title, lesson: nl?.title, lessonUrl: nl ? lessonUrl(c, nl) : undefined }),
              notify: { title: `Module complete: ${m.module.title}`, body: nl ? `Next up: ${nl.title}` : `${pct}% of ${c.title} done`, link: nl ? `/learn/${c.slug}/lesson/${nl.id}` : `/learn/${c.slug}` } });
          });
        }

        // Finished every lesson.
        if (completedCount === all.length) {
          const finishedAt = Math.max(...all.map((l: any) => myDone.get(l.id) || 0));
          if (now - finishedAt < 7 * DAY) {
            const passed = (finals ?? []).some((f: any) => f.user_id === u.id && f.course_id === c.id && /pass/i.test(f.status ?? ""));
            if (c.final_assessment_ref && !passed) {
              want({ userId: u.id, email: u.email, kind: "final_ready", key: c.id, ...T.final_ready({ ...base, finalUrl: `${SITE}/learn/${c.slug}/final-assessment` }),
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
            want({ userId: u.id, email: u.email, kind: "access_expiring", key: `${e.id}:${e.expires_at.slice(0, 10)}`, ...T.access_expiring({ ...base, date: fmtDate(e.expires_at) }),
              notify: { title: `Access ends ${fmtDate(e.expires_at)}`, body: `${c.title} — ${pct}% complete`, link: `/learn/${c.slug}` } });
          }
        }

        // Inactivity nudges (one per quiet spell, at 7 and 21 days).
        if (signedIn && next && completedCount < all.length) {
          const last = Math.max(lastActive.get(u.id) ?? 0, enrolledAt);
          const quiet = now - last;
          const spell = new Date(last).toISOString().slice(0, 10);
          if (quiet >= 7 * DAY && quiet < 21 * DAY) {
            want({ userId: u.id, email: u.email, kind: "nudge_7", key: `${c.id}:${spell}`, ...T.nudge_7(base),
              notify: { title: "Pick up where you left off", body: next.title, link: `/learn/${c.slug}/lesson/${next.id}` } });
          } else if (quiet >= 21 * DAY && quiet < 60 * DAY) {
            want({ userId: u.id, email: u.email, kind: "nudge_21", key: `${c.id}:${spell}`, ...T.nudge_21(base),
              notify: { title: "Your progress is saved", body: `Next: ${next.title}`, link: `/learn/${c.slug}/lesson/${next.id}` } });
          }
        }
      }

      // Onboarding (signed-in learners with at least one course).
      if (signedIn && myEnrols.length) {
        const age = now - created;
        const c0: any = course.get(myEnrols[0].course_id);
        const first0 = (outline.get(c0.id) ?? []).flatMap((m) => m.lessons)[0];
        const base0: Ctx = { first, course: c0.title, courseUrl: `${SITE}/learn/${c0.slug}`, ...(first0 ? { lesson: first0.title, lessonUrl: lessonUrl(c0, first0), mins: mins(first0) } : {}) };
        if (age > DAY && age < 3 * DAY && myDone.size === 0 && first0) {
          want({ userId: u.id, email: u.email, kind: "onboarding_day1", key: "", ...T.onboarding_day1(base0) });
        }
        if (age > 3 * DAY && age < 6 * DAY) {
          want({ userId: u.id, email: u.email, kind: "onboarding_day3", key: "", ...T.onboarding_day3(base0) });
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
        const p: any = prof.get(u.id) ?? {};
        want({ userId: u.id, email: u.email, kind: "event_reminder", key: ev.id,
          ...T.event_reminder({ first: firstName(p.full_name), course: "", courseUrl: SITE, event: ev.title, when: fmtTime(ev.starts_at), joinUrl: ev.join_url || undefined }),
          notify: { title: `Starting soon: ${ev.title}`, body: fmtTime(ev.starts_at), link: "/learn?view=community" } });
      }
    }

    // Automations switched off in admin > Emails.
    const enabledMsgs = msgs.filter((m) => !disabledKinds.has(m.kind));

    // Reminder opt-outs.
    const allowed = enabledMsgs.filter((m) => !REMINDER_KINDS.has(m.kind) || (prof.get(m.userId) as any)?.email_reminders !== false);

    if (dryRun) {
      return json({ dryRun: true, wouldSend: allowed.map((m) => ({ email: m.email, kind: m.kind, subject: m.subject ?? null, inApp: m.notify?.title ?? null })),
        skippedOptOut: enabledMsgs.length - allowed.length, skippedDisabled: msgs.length - enabledMsgs.length, sentToday });
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
        const res = await resendSend(resendKey ?? "", { from: FROM, to: [m.email], reply_to: "hello@safetytech.academy", subject: m.subject, html, text: htmlToText(html), headers });
        await sleep(600); // stay under the email provider's rate limit
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
