import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { EVENTS, sendEventReminder } from "../_shared/eventEmail.ts";
import { sleep } from "../_shared/emailText.ts";

// Sends the morning-of reminder (with the Teams link) to everyone who paid for a live event.
// Called by pg_cron (header x-cron-secret = LIFECYCLE_CRON_SECRET). It only sends in the
// 8 hours before an event starts, and email_log makes every reminder go out once.

const WINDOW_MS = 8 * 60 * 60 * 1000;

const sameSecret = (a: string, b: string) => {
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

Deno.serve(async (req) => {
  if (!sameSecret(req.headers.get("x-cron-secret") ?? "", Deno.env.get("LIFECYCLE_CRON_SECRET") ?? "")) {
    return new Response("Unauthorized", { status: 401 });
  }
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const report: Record<string, unknown>[] = [];
  const now = Date.now();

  for (const [slug, ev] of Object.entries(EVENTS)) {
    const start = Date.parse(ev.startsAt);
    if (now < start - WINDOW_MS || now >= start) continue;
    const { data: bookings, error } = await db.from("leads").select("name, email")
      .eq("source", "event_registration").like("inquiry_type", `Event booking: ${ev.title}%`);
    if (error) { report.push({ slug, error: error.message }); continue; }
    const seen = new Set<string>();
    let sent = 0, skipped = 0, failed = 0;
    for (const b of bookings ?? []) {
      const email = String(b.email ?? "").trim().toLowerCase();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      const dedupe = `${slug}:${email}`;
      const { data: done } = await db.from("email_log").select("id").is("user_id", null).eq("kind", "event_reminder").eq("dedupe_key", dedupe).maybeSingle();
      if (done) { skipped++; continue; }
      const err = await sendEventReminder(slug, email, String(b.name ?? ""));
      await db.from("email_log").insert({ user_id: null, kind: "event_reminder", dedupe_key: dedupe, status: err ? "failed" : "sent", error: err });
      if (err) failed++; else sent++;
      await sleep(600); // stay under Resend's rate limit
    }
    report.push({ slug, bookings: seen.size, sent, skipped, failed });
  }
  console.log("event-reminders", JSON.stringify(report));
  return Response.json({ report });
});
