// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { stripeRequest } from "../_shared/stripe.ts";
import { fulfilBundle } from "../_shared/teams.ts";
import { recordPurchase } from "../_shared/purchases.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...corsHeaders } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Please sign in first" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
    if (!u?.user) return json({ error: "Please sign in first" }, 401);
    const { session_id } = (await req.json().catch(() => ({}))) as { session_id?: string };
    if (!session_id || !/^cs_[A-Za-z0-9_]+$/.test(session_id)) return json({ error: "Missing session" }, 400);
    const session = await stripeRequest<any>("GET", `/checkout/sessions/${session_id}`);
    const m = session.metadata ?? {};
    if (m.kind !== "bundle" || m.user_id !== u.user.id) return json({ error: "That payment isn't yours" }, 403);
    if (session.payment_status !== "paid") return json({ status: "pending" });
    const n = await fulfilBundle(db, m.user_id, m.bundle_id);
    const { data: bundle } = await db.from("bundles").select("title").eq("id", m.bundle_id).maybeSingle();
    await recordPurchase(db, session.id, { userId: m.user_id, bundleId: m.bundle_id, title: `${bundle?.title ?? "Bundle"} (bundle)` });
    return json({ status: "paid", title: bundle?.title ?? "your bundle", added: n });
  } catch (e) {
    console.error("confirm-bundle-checkout:", e);
    return json({ error: e instanceof Error ? e.message : "Could not confirm the payment" }, 500);
  }
});
