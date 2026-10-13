import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { WELCOME_TOKEN_MAX_USES, sha256Hex } from "../_shared/welcomeToken.ts";

// Public (no sign-in). Swaps a welcome-email token for a fresh one-time Supabase sign-in link.
//   POST { token } -> { token_hash }   (the page then calls supabase.auth.verifyOtp with it)
// Tokens last 14 days and can be used a handful of times, so a person who didn't finish the first
// time can try again. The email's token is useless without pressing the button on our page, so email
// security scanners cannot use it up. Every failure returns the same answer, so nothing leaks.

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const buckets = new Map<string, { n: number; reset: number }>();
function allow(key: string, max = 20, windowMs = 10 * 60_000) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) { buckets.set(key, { n: 1, reset: now + windowMs }); return true; }
  if (b.n >= max) return false;
  b.n++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "expired" }, 405);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) return json({ error: "slow_down" }, 429);

  const { token } = await req.json().catch(() => ({})) as { token?: string };
  if (typeof token !== "string" || token.length < 20 || token.length > 100) return json({ error: "expired" }, 410);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: row } = await db.from("welcome_tokens").select("id, user_id, expires_at, uses").eq("token_hash", await sha256Hex(token)).maybeSingle();
  if (!row || new Date(row.expires_at) < new Date() || row.uses >= WELCOME_TOKEN_MAX_USES) return json({ error: "expired" }, 410);

  const { data: au } = await db.auth.admin.getUserById(row.user_id);
  const email = au?.user?.email;
  if (!email) return json({ error: "expired" }, 410);

  const { data: link, error } = await db.auth.admin.generateLink({ type: "recovery", email });
  if (error || !link?.properties?.hashed_token) return json({ error: "try_again" }, 500);

  await db.from("welcome_tokens").update({ uses: row.uses + 1, last_used_at: new Date().toISOString() }).eq("id", row.id);
  return json({ token_hash: link.properties.hashed_token });
});
