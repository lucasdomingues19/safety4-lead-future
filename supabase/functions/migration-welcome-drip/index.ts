import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, requireAdmin } from "../_shared/auth.ts";
import { sleep } from "../_shared/emailText.ts";
import { sendMigrationWelcome, type MovedCourse } from "../_shared/migrationWelcome.ts";

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
  if (!cron) {
    try { adminEmail = (await requireAdmin(req)).email ?? null; } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }
  }
  const action = body.action ?? "run";

  const { data: cfg } = await db.from("migration_drip_config").select("enabled, daily_cap").eq("id", 1).single();
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

  if (action === "set") {
    if (cron) return json({ error: "Admins only" }, 403);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
    if (Number.isFinite(body.daily_cap)) patch.daily_cap = Math.max(1, Math.min(90, Math.floor(body.daily_cap!)));
    await db.from("migration_drip_config").update(patch).eq("id", 1);
    return json({ ok: true, ...patch });
  }

  const link = async (email: string) => {
    const { data, error } = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: `${SITE}/learn/reset-password?welcome=1` } });
    if (error || !data?.properties?.hashed_token) throw new Error(error?.message ?? "Could not create link");
    return `${SITE}/learn/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery&next=${encodeURIComponent("/learn/reset-password?welcome=1")}`;
  };

  if (action === "test") {
    if (cron || !adminEmail) return json({ error: "Admins only" }, 403);
    const v = (body as { variant?: string }).variant ?? "learner";
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
  if (!sending) return json({ dry_run: true, would_send: picked.map((p) => ({ name: p.name, email: p.email.replace(/^(.).*(@.*)$/, "$1***$2") })), room });

  const results: { email: string; ok: boolean; error?: string }[] = [];
  for (const p of picked) {
    // Claim first: the unique key (user, kind, key) means one welcome per person, ever.
    const { error: claim } = await db.from("email_log").insert({ user_id: p.id, kind: KIND, dedupe_key: "v1", status: "sending" });
    if (claim) { results.push({ email: p.email, ok: false, error: "already claimed" }); continue; }
    try {
      const { data: enr } = await db.from("enrollments").select("course_id, courses(title)").eq("user_id", p.id).eq("status", "active");
      const courses: MovedCourse[] = [];
      for (const e of enr ?? []) {
        const { data: lessons } = await db.from("lessons").select("id, modules!inner(course_id)").eq("modules.course_id", e.course_id);
        const ids = (lessons ?? []).map((l: { id: string }) => l.id);
        const { count: done } = ids.length
          ? await db.from("lesson_progress").select("id", { count: "exact", head: true }).eq("user_id", p.id).eq("is_completed", true).in("lesson_id", ids)
          : { count: 0 };
        const title = (e as unknown as { courses: { title: string } | null }).courses?.title;
        if (title) courses.push({ title, pct: ids.length ? Math.round(((done ?? 0) / ids.length) * 100) : 0 });
      }
      const { data: mem } = await db.from("community_memberships").select("expires_at").eq("user_id", p.id).eq("space", "global-network").eq("status", "active").maybeSingle();
      const networkUntil = mem?.expires_at ? new Date(mem.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }) : null;
      const err = await sendMigrationWelcome(p.email, p.name, await link(p.email), courses, { networkUntil });
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
