import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

// Admin-only: recent Stripe payments + headline revenue numbers.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await db.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!u?.user) return json({ error: "Unauthorized" }, 401);
    const { data: role } = await db.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Admin privileges required" }, 403);

    const key = Deno.env.get("STRIPE_SECRET_KEY");
    if (!key) return json({ error: "Stripe is not configured" }, 500);

    const res = await fetch("https://api.stripe.com/v1/charges?limit=50", { headers: { Authorization: `Bearer ${key}` } });
    const body = await res.json();
    if (!res.ok) return json({ error: body?.error?.message ?? "Stripe request failed" }, 502);

    const charges = (body.data as Array<Record<string, unknown>>).map((c) => ({
      id: c.id,
      amount: (c.amount as number) / 100,
      refunded: ((c.amount_refunded as number) ?? 0) / 100,
      currency: String(c.currency).toUpperCase(),
      status: c.status,
      created: new Date((c.created as number) * 1000).toISOString(),
      email: (c.billing_details as { email?: string })?.email ?? (c.receipt_email as string) ?? null,
      description: (c.description as string) ?? null,
    }));

    const whRes = await fetch("https://api.stripe.com/v1/webhook_endpoints?limit=20", { headers: { Authorization: `Bearer ${key}` } });
    const whBody = whRes.ok ? await whRes.json() : { data: [] };
    const expectedUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/handle-stripe-webhook`;
    const webhooks = (whBody.data as Array<Record<string, unknown>>).map((w) => ({
      url: String(w.url),
      status: String(w.status),
      events: (w.enabled_events as string[]) ?? [],
    }));
    const webhook = webhooks.find((w) => w.url === expectedUrl);
    const needed = ["checkout.session.completed", "charge.refunded"];
    const webhookHealth = {
      expectedUrl,
      configured: !!webhook && webhook.status === "enabled",
      missingEvents: webhook ? needed.filter((e) => !webhook.events.includes(e) && !webhook.events.includes("*")) : needed,
      others: webhooks.filter((w) => w.url !== expectedUrl).map((w) => w.url),
    };

    const paid = charges.filter((c) => c.status === "succeeded");
    const monthAgo = Date.now() - 30 * 86400000;
    const last30 = paid.filter((c) => new Date(c.created).getTime() >= monthAgo);
    const sum = (rows: typeof paid) => rows.reduce((t, c) => t + c.amount - c.refunded, 0);

    return json({
      live: String(key).startsWith("sk_live"),
      charges,
      totals: { last30Days: sum(last30), allShown: sum(paid), paymentsLast30Days: last30.length },
      currency: paid[0]?.currency ?? "GBP",
      webhookHealth,
    });
  } catch (e) {
    console.error(e);
    return json({ error: "Unexpected error" }, 500);
  }
});
