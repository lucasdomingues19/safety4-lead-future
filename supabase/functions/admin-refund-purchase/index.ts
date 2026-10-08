import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, requireAdmin } from "../_shared/auth.ts";
import { stripeKey, stripeRequest } from "../_shared/stripe.ts";

// Admin-only: refunds one card payment in full through Stripe. Access ends and the purchase is
// marked refunded, here straight away and again when Stripe sends charge.refunded to the webhook.
// Body: { charge_id: "ch_..." }. Stripe's idempotency key means pressing it twice never refunds twice.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  let caller: { id: string };
  try { caller = await requireAdmin(req); } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }

  const body = (await req.json().catch(() => ({}))) as { charge_id?: string };
  const chargeId = String(body.charge_id ?? "");
  if (!/^ch_[A-Za-z0-9]+$/.test(chargeId)) return json({ error: "Choose a card payment to refund" }, 400);

  let charge: Record<string, unknown> & { status: string; refunded: boolean; amount: number; amount_refunded: number; currency: string; payment_intent?: unknown; billing_details?: { email?: string }; receipt_email?: string };
  try { charge = await stripeRequest("GET", `/charges/${chargeId}`); } catch (e) { return json({ error: (e as Error).message }, 502); }
  if (charge.status !== "succeeded") return json({ error: "Only a successful payment can be refunded" }, 409);
  if (charge.refunded) return json({ error: "This payment has already been refunded" }, 409);

  const res = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `admin-refund-${chargeId}`,
    },
    body: new URLSearchParams({ charge: chargeId, reason: "requested_by_customer", "metadata[refunded_by]": caller.id }),
  });
  const refund = await res.json().catch(() => ({}));
  if (!res.ok) return json({ error: refund?.error?.message ?? "Stripe refused the refund" }, 502);

  const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : (charge.payment_intent as { id?: string } | null)?.id;
  if (pi) {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await db.from("course_purchases").update({ status: "refunded" }).eq("stripe_payment_intent", pi);
    await db.from("enrollments").update({ status: "cancelled" }).eq("stripe_subscription_id", pi);
  }

  return json({
    ok: true,
    refund_id: refund.id,
    refund_status: refund.status,
    amount: (charge.amount - (charge.amount_refunded ?? 0)) / 100,
    currency: String(charge.currency).toUpperCase(),
    email: charge.billing_details?.email ?? charge.receipt_email ?? null,
  });
});
