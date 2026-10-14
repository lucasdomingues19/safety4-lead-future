import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { AuthError, requireAdmin } from "../_shared/auth.ts";

// Admin-only. The "outside the database" half of the Health page: is the website up, are the edge
// functions deployed, is Stripe's webhook enabled, is the email domain verified, are the secrets set.
// Read-only. Returns names and statuses only: never a secret value, an email address or a customer.

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SITE = "https://www.safetytech.academy";
const PAGES = ["/", "/learn", "/learn/auth", "/events"];
// Functions the platform depends on every day. A 404 means "not deployed"; anything under 500 means it answered.
const FUNCTIONS = [
  "lifecycle-messages", "migration-welcome-drip", "welcome-link", "community-post-email", "mia-help", "lesson-media", "lesson-tutor",
  "issue-certificate", "issue-self-certificate", "final-assessment", "grade-quiz-attempt", "syngraph-webhook",
  "handle-stripe-webhook", "create-course-checkout", "confirm-course-checkout", "create-team-checkout", "admin-billing-summary",
  "admin-people", "admin-send-email", "capture-lead", "track-page-view", "chat-assistant", "lms-chat",
];
// Secret names only. "critical" ones stop a feature working when missing.
// (GROQ_API_KEY is deliberately not listed: it is only a backup for transcripts, used when there is no ElevenLabs key.)
const SECRETS: { name: string; critical: boolean; used: string }[] = [
  { name: "RESEND_API_KEY", critical: true, used: "all email" },
  { name: "STRIPE_SECRET_KEY", critical: true, used: "checkout and refunds" },
  { name: "STRIPE_WEBHOOK_SECRET", critical: true, used: "payment confirmations" },
  { name: "ANTHROPIC_API_KEY", critical: true, used: "Mia and the AI tutor" },
  { name: "LIFECYCLE_CRON_SECRET", critical: true, used: "scheduled emails" },
  { name: "SYNGRAPH_API_KEY", critical: true, used: "certificates" },
  { name: "SYNGRAPH_FUNCTIONS_URL", critical: true, used: "certificates" },
  { name: "CLOUDFRONT_DOMAIN", critical: false, used: "lesson video delivery" },
  { name: "CLOUDFRONT_KEY_PAIR_ID", critical: false, used: "lesson video delivery" },
  { name: "CLOUDFRONT_PRIVATE_KEY", critical: false, used: "lesson video delivery" },
  { name: "ELEVENLABS_API_KEY", critical: false, used: "transcripts and the tour voice" },
];

async function timed(url: string, init: RequestInit = {}, ms = 8000) {
  const t0 = performance.now();
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(ms), redirect: "manual" });
    await res.body?.cancel();
    return { status: res.status, ms: Math.round(performance.now() - t0) };
  } catch (e) {
    return { status: 0, ms: Math.round(performance.now() - t0), error: (e as Error).name === "TimeoutError" ? "timed out" : "unreachable" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try { await requireAdmin(req); } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }

  const base = Deno.env.get("SUPABASE_URL")!;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  const elevenKey = Deno.env.get("ELEVENLABS_API_KEY");

  const [site, functions, resend, stripe, elevenlabs] = await Promise.all([
    Promise.all(PAGES.map(async (p) => ({ path: p, ...(await timed(`${SITE}${p}`)) }))),
    Promise.all(FUNCTIONS.map(async (name) => ({ name, ...(await timed(`${base}/functions/v1/${name}`, { method: "OPTIONS" }, 6000)) }))),
    (async () => {
      if (!resendKey) return { configured: false };
      try {
        const r = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${resendKey}` }, signal: AbortSignal.timeout(8000) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return { configured: true, error: `Resend answered ${r.status}` };
        return { configured: true, domains: (j.data ?? []).map((d: { name: string; status: string }) => ({ name: d.name, status: d.status })) };
      } catch { return { configured: true, error: "unreachable" }; }
    })(),
    (async () => {
      if (!stripeKey) return { configured: false };
      try {
        const r = await fetch("https://api.stripe.com/v1/webhook_endpoints?limit=20", { headers: { Authorization: `Bearer ${stripeKey}` }, signal: AbortSignal.timeout(8000) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return { configured: true, error: j?.error?.message ?? `Stripe answered ${r.status}` };
        return {
          configured: true,
          mode: stripeKey.startsWith("sk_live") || stripeKey.startsWith("rk_live") ? "live" : "test",
          webhooks: (j.data ?? []).map((w: { url: string; status: string; enabled_events: string[] }) => {
            let host = "";
            try { host = new URL(w.url).host; } catch { /* keep blank */ }
            return { host, status: w.status, events: w.enabled_events.length, has_checkout_completed: w.enabled_events.includes("checkout.session.completed") || w.enabled_events.includes("*"), has_refunds: w.enabled_events.includes("charge.refunded") || w.enabled_events.includes("*") };
          }),
        };
      } catch { return { configured: true, error: "unreachable" }; }
    })(),
    // ElevenLabs does the transcripts and the tour voice. Read-only look at the plan: status and credits used.
    (async () => {
      if (!elevenKey) return { configured: false };
      try {
        const r = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": elevenKey }, signal: AbortSignal.timeout(8000) });
        if (r.status === 401 || r.status === 403) return { configured: true, key_accepted: r.status !== 401, note: "The key works for speech but isn't allowed to read plan details" };
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return { configured: true, error: `ElevenLabs answered ${r.status}` };
        return { configured: true, status: j.status ?? null, tier: j.tier ?? null, used: j.character_count ?? null, limit: j.character_limit ?? null, resets_at: j.next_character_count_reset_unix ? new Date(j.next_character_count_reset_unix * 1000).toISOString() : null };
      } catch { return { configured: true, error: "unreachable" }; }
    })(),
  ]);

  return json({
    checked_at: new Date().toISOString(),
    site, functions, resend, stripe, elevenlabs,
    secrets: SECRETS.map((s) => ({ ...s, set: !!Deno.env.get(s.name) })),
  });
});
