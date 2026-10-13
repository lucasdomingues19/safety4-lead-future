import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, requireAdmin } from "../_shared/auth.ts";
import { sleep } from "../_shared/emailText.ts";
import { sendMigrationReminder, sendMigrationWelcome, type MovedCourse } from "../_shared/migrationWelcome.ts";
import { createWelcomeToken } from "../_shared/welcomeToken.ts";

// Sends the "your courses have a new home" email to Kajabi learners a few at a time.
//   cron (x-cron-secret)  run    -> sends the next batch, if the drip is switched on
//   admin                 status -> where the queue stands
//                         set    -> { enabled?, daily_cap? }
//                         run    -> preview of who would be sent next (add dry_run:false to really send)
//                         test   -> sends a sample to the admin's own address (fake link, nobody else)
// Budget: shared with the lifecycle emails through email_log, under Resend's 100/day, keeping a reserve.

const SITE = "https://www.safetytech.academy";
const DAY = 86_400_000;
const DAILY_BUDGET = 90;    // matches lifecycle-messages
const RESERVE = 10;         // headroom for certificates, quiz mail and anything else that day
const PER_RUN = 8;          // small batches, spread over the day
const KIND = "migration_welcome";
const REMIND_KIND = "migration_reminder";
const REMIND_AFTER_DAYS = 3;  // a welcome must be at least this old before we nudge

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
function safeEqual(a: string, b: string) {
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const body = await req.json().catch(() => ({})) as { action?: string; enabled?: boolean; daily_cap?: number; dry_run?: boolean };
  const cron = safeEqual(req.headers.get("x-cron-secret") ?? "", Deno.env.get("LIFECYCLE_CRON_SECRET") ?? "");
  let adminEmail: string | null = null;
  let adminId: string | null = null;
  if (!cron) {
    try { const a = await requireAdmin(req); adminEmail = a.email ?? null; adminId = a.id; } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }
  }
  const action = body.action ?? "run";

  const { data: cfg } = await db.from("migration_drip_config").select("enabled, daily_cap, reminder_enabled, reminder_deadline").eq("id", 1).single();
  const since = new Date(Date.now() - DAY).toISOString();
  const { count: sentLast24h } = await db.from("email_log").select("id", { count: "exact", head: true }).gte("sent_at", since);
  const { count: dripLast24h } = await db.from("email_log").select("id", { count: "exact", head: true }).eq("kind", KIND).gte("sent_at", since);
  const room = Math.max(0, Math.min((cfg?.daily_cap ?? 60) - (dripLast24h ?? 0), DAILY_BUDGET - RESERVE - (sentLast24h ?? 0)));

  if (action === "status") {
    const { count: total } = await db.from("migration_welcome_queue").select("user_id", { count: "exact", head: true });
    const { count: sent } = await db.from("migration_welcome_queue").select("user_id", { count: "exact", head: true }).not("sent_at", "is", null);
    const { count: failed } = await db.from("migration_welcome_queue").select("user_id", { count: "exact", head: true }).not("error", "is", null).is("sent_at", null);
    return json({ enabled: cfg?.enabled, daily_cap: cfg?.daily_cap, queued: total, sent, failed, pending: (total ?? 0) - (sent ?? 0), emails_last_24h_all: sentLast24h, welcomes_last_24h: dripLast24h, room_now: room });
  }

  // Read-only look at how Resend has the sending domain set up (no keys are returned).
  if (action === "resend_domains") {
    if (cron) return json({ error: "Admins only" }, 403);
    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) return json({ error: "RESEND_API_KEY missing" }, 500);
    const list = await (await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${key}` } })).json().catch(() => ({}));
    const out = [];
    for (const d of (list?.data ?? [])) {
      const full = await (await fetch(`https://api.resend.com/domains/${d.id}`, { headers: { Authorization: `Bearer ${key}` } })).json().catch(() => ({}));
      out.push({
        name: d.name, status: d.status, region: d.region, created_at: d.created_at,
        open_tracking: full?.open_tracking, click_tracking: full?.click_tracking, tls: full?.tls, capabilities: full?.capabilities,
        records: (full?.records ?? []).map((r: { record: string; type: string; name: string; status: string }) => ({ record: r.record, type: r.type, name: r.name, status: r.status })),
      });
    }
    return json({ domains: out });
  }

  // Read-only delivery outcomes for recent emails (counts only: no addresses).
  if (action === "resend_recent") {
    if (cron) return json({ error: "Admins only" }, 403);
    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) return json({ error: "RESEND_API_KEY missing" }, 500);
    const res = await (await fetch("https://api.resend.com/emails?limit=100", { headers: { Authorization: `Bearer ${key}` } })).json().catch(() => ({}));
    const rows = (res?.data ?? []) as { last_event?: string; subject?: string; created_at?: string }[];
    const by: Record<string, Record<string, number>> = {};
    for (const r of rows) { const subj = (r.subject ?? "").slice(0, 60); (by[subj] ??= {})[r.last_event ?? "unknown"] = ((by[subj] ??= {})[r.last_event ?? "unknown"] ?? 0) + 1; }
    return json({ sampled: rows.length, newest: rows[0]?.created_at, by_subject: by });
  }

  if (action === "set") {
    if (cron) return json({ error: "Admins only" }, 403);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
    if (typeof (body as { reminder_enabled?: boolean }).reminder_enabled === "boolean") patch.reminder_enabled = (body as { reminder_enabled?: boolean }).reminder_enabled;
    if (typeof (body as { reminder_deadline?: string | null }).reminder_deadline !== "undefined") patch.reminder_deadline = String((body as { reminder_deadline?: string | null }).reminder_deadline ?? "").slice(0, 40) || null;
    if (Number.isFinite(body.daily_cap)) patch.daily_cap = Math.max(1, Math.min(90, Math.floor(body.daily_cap!)));
    await db.from("migration_drip_config").update(patch).eq("id", 1);
    return json({ ok: true, ...patch });
  }

  // Where each person is in each course, for the "where you are" list.
  const courseSummary = async (userId: string): Promise<MovedCourse[]> => {
    const courses: MovedCourse[] = [];
    const { data: enr } = await db.from("enrollments").select("course_id, courses(title)").eq("user_id", userId).eq("status", "active");
    for (const e of enr ?? []) {
      const { data: lessons } = await db.from("lessons").select("id, modules!inner(course_id)").eq("modules.course_id", e.course_id);
      const ids = (lessons ?? []).map((l: { id: string }) => l.id);
      const { count: done } = ids.length
        ? await db.from("lesson_progress").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_completed", true).in("lesson_id", ids)
        : { count: 0 };
      const title = (e as unknown as { courses: { title: string } | null }).courses?.title;
      if (title) courses.push({ title, pct: ids.length ? Math.round(((done ?? 0) / ids.length) * 100) : 0 });
    }
    return courses;
  };

  // A 14-day link of our own (Supabase's own one-time links die after 24 hours).
  const link = async (userId: string) => `${SITE}/learn/welcome?t=${encodeURIComponent(await createWelcomeToken(db, userId))}`;

  if (action === "test") {
    if (cron || !adminEmail) return json({ error: "Admins only" }, 403);
    const v = (body as { variant?: string }).variant ?? "learner";
    if (v === "reminder") {
      const err = await sendMigrationReminder(adminEmail, "Alex Morgan", await link(adminId!), [{ title: "Fundamentals of AI in EHS", pct: 52 }], { deadline: cfg?.reminder_deadline ?? null });
      return json({ ok: !err, sent_to: adminEmail, error: err });
    }
    const until = "6 October 2027";
    const err = v === "network"
      ? await sendMigrationWelcome(adminEmail, "Alex Morgan", `${SITE}/learn/auth`, [], { networkUntil: until })
      : v === "free"
        ? await sendMigrationWelcome(adminEmail, "Alex Morgan", `${SITE}/learn/auth`, [])
        : await sendMigrationWelcome(adminEmail, "Alex Morgan", `${SITE}/learn/auth`, [
          { title: "IOSH-approved Safety 4.0 - Leading Safety in the Digital Age", pct: 52 },
          { title: "Fundamentals of AI in EHS", pct: 100 },
        ], { networkUntil: until });
    return json({ ok: !err, sent_to: adminEmail, error: err });
  }

  // ---- run ----
  const sending = cron || body.dry_run === false;
  if (cron && !cfg?.enabled) return json({ skipped: "drip is switched off" });
  const batch = Math.min(PER_RUN, room);
  if (batch <= 0) return json({ skipped: "daily budget used", room });

  // Next in line: not yet sent, never signed in, never welcomed; priority first, then most recently active.
  const { data: queue } = await db.from("migration_welcome_queue")
    .select("user_id, priority, last_active").is("sent_at", null).order("priority").order("last_active", { ascending: false, nullsFirst: false }).limit(batch * 3);
  const picked: { id: string; email: string; name: string }[] = [];
  for (const q of queue ?? []) {
    if (picked.length >= batch) break;
    const { data: prof } = await db.from("profiles").select("id, email, full_name, welcomed_at").eq("id", q.user_id).maybeSingle();
    if (!prof?.email) continue;
    if (prof.welcomed_at) { await db.from("migration_welcome_queue").update({ sent_at: prof.welcomed_at }).eq("user_id", q.user_id); continue; }
    const { data: au } = await db.auth.admin.getUserById(q.user_id);
    if (au?.user?.last_sign_in_at) { await db.from("migration_welcome_queue").update({ sent_at: au.user.last_sign_in_at }).eq("user_id", q.user_id); continue; }
    picked.push({ id: q.user_id, email: prof.email, name: prof.full_name ?? "" });
  }
  // ---- reminders: nobody left to welcome, so nudge the people who still haven't signed in (once each) ----
  if (picked.length === 0 && (cfg?.reminder_enabled || !sending)) {
    const { data: done } = await db.from("email_log").select("user_id").eq("kind", REMIND_KIND);
    const reminded = new Set((done ?? []).map((r: { user_id: string }) => r.user_id));
    const { data: admins } = await db.from("user_roles").select("user_id").eq("role", "admin");
    const adminIds = new Set((admins ?? []).map((a: { user_id: string }) => a.user_id));
    const cutoff = Date.now() - REMIND_AFTER_DAYS * DAY;
    const { data: sentQ } = await db.from("migration_welcome_queue").select("user_id, sent_at, priority, last_active").not("sent_at", "is", null)
      .order("priority").order("last_active", { ascending: false, nullsFirst: false });
    const due: { id: string; email: string; name: string }[] = [];
    for (const q of sentQ ?? []) {
      if (due.length >= batch) break;
      if (reminded.has(q.user_id) || adminIds.has(q.user_id) || new Date(q.sent_at).getTime() > cutoff) continue;
      const { data: prof } = await db.from("profiles").select("id, email, full_name, email_reminders").eq("id", q.user_id).maybeSingle();
      if (!prof?.email || prof.email_reminders === false) continue;
      const { data: au } = await db.auth.admin.getUserById(q.user_id);
      if (au?.user?.last_sign_in_at) continue;
      due.push({ id: q.user_id, email: prof.email, name: prof.full_name ?? "" });
    }
    if (!sending) return json({ dry_run: true, reminders_enabled: !!cfg?.reminder_enabled, would_remind: due.map((p) => ({ name: p.name, email: p.email.replace(/^(.).*(@.*)$/, "$1***$2") })), room });
    const sentR: { email: string; ok: boolean; error?: string }[] = [];
    for (const p of due) {
      const { error: claim } = await db.from("email_log").insert({ user_id: p.id, kind: REMIND_KIND, dedupe_key: "v1", status: "sending" });
      if (claim) { sentR.push({ email: p.email, ok: false, error: "already claimed" }); continue; }
      try {
        const err = await sendMigrationReminder(p.email, p.name, await link(p.id), await courseSummary(p.id), { deadline: cfg?.reminder_deadline ?? null });
        if (err) throw new Error(err);
        await db.from("email_log").update({ status: "sent" }).eq("user_id", p.id).eq("kind", REMIND_KIND).eq("dedupe_key", "v1");
        sentR.push({ email: p.email, ok: true });
      } catch (e) {
        const msg = String((e as Error).message).slice(0, 300);
        await db.from("email_log").update({ status: "failed", error: msg }).eq("user_id", p.id).eq("kind", REMIND_KIND).eq("dedupe_key", "v1");
        sentR.push({ email: p.email, ok: false, error: msg });
        if (/rate|429|quota|limit/i.test(msg)) break;
      }
      await sleep(700);
    }
    return json({ reminders_sent: sentR.filter((r) => r.ok).length, failed: sentR.filter((r) => !r.ok).length, room });
  }

  if (!sending) return json({ dry_run: true, would_send: picked.map((p) => ({ name: p.name, email: p.email.replace(/^(.).*(@.*)$/, "$1***$2") })), room });

  const results: { email: string; ok: boolean; error?: string }[] = [];
  for (const p of picked) {
    // Claim first: the unique key (user, kind, key) means one welcome per person, ever.
    const { error: claim } = await db.from("email_log").insert({ user_id: p.id, kind: KIND, dedupe_key: "v1", status: "sending" });
    if (claim) { results.push({ email: p.email, ok: false, error: "already claimed" }); continue; }
    try {
      const courses = await courseSummary(p.id);
      const { data: mem } = await db.from("community_memberships").select("expires_at").eq("user_id", p.id).eq("space", "global-network").eq("status", "active").maybeSingle();
      const networkUntil = mem?.expires_at ? new Date(mem.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }) : null;
      const err = await sendMigrationWelcome(p.email, p.name, await link(p.id), courses, { networkUntil });
      if (err) throw new Error(err);
      await db.from("email_log").update({ status: "sent" }).eq("user_id", p.id).eq("kind", KIND).eq("dedupe_key", "v1");
      const now = new Date().toISOString();
      await db.from("profiles").update({ welcomed_at: now }).eq("id", p.id);
      await db.from("migration_welcome_queue").update({ sent_at: now, error: null }).eq("user_id", p.id);
      results.push({ email: p.email, ok: true });
    } catch (e) {
      const msg = String((e as Error).message).slice(0, 300);
      await db.from("email_log").update({ status: "failed", error: msg }).eq("user_id", p.id).eq("kind", KIND).eq("dedupe_key", "v1");
      await db.from("migration_welcome_queue").update({ error: msg }).eq("user_id", p.id);
      results.push({ email: p.email, ok: false, error: msg });
      if (/rate|429|quota|limit/i.test(msg)) break; // stop for the day's window; the next run tries again
    }
    await sleep(700);
  }
  return json({ sent: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, room });
});
