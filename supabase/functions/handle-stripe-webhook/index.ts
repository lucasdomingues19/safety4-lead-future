import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

// Stripe webhook (backup to confirm-course-checkout).
// Point the Stripe endpoint at .../functions/v1/handle-stripe-webhook and
// subscribe to: checkout.session.completed, checkout.session.async_payment_succeeded,
// charge.refunded. Requires verify_jwt = false (Stripe sends no Supabase JWT).

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const TOLERANCE_SECONDS = 300;

async function verifySignature(payload: string, header: string): Promise<boolean> {
  if (!WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const timestamp = parts["t"];
  const signatures = header.split(",").filter((p) => p.trim().startsWith("v1=")).map((p) => p.trim().slice(3));
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`)));
  const expected = Array.from(mac).map((b) => b.toString(16).padStart(2, "0")).join("");

  // constant-time compare
  return signatures.some((sig) => {
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  });
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const payload = await req.text();
  try {
    if (!(await verifySignature(payload, signature))) return new Response("Invalid signature", { status: 400 });
  } catch (e) {
    console.error(e);
    return new Response("Webhook not configured", { status: 500 });
  }

  const event = JSON.parse(payload);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const { course_id, user_id } = session.metadata ?? {};
        if (!course_id || !user_id) {
          console.log("Ignoring checkout session without course metadata", session.id);
          break;
        }
        if (session.payment_status !== "paid") {
          console.log("Checkout session not paid yet", session.id);
          break;
        }
        const { error } = await db.from("enrollments").upsert(
          { user_id, course_id, status: "active", stripe_subscription_id: session.payment_intent ?? session.id, expires_at: null },
          { onConflict: "user_id,course_id" },
        );
        if (error) throw error;
        console.log("Enrolled via webhook", { user_id, course_id });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        if (charge.refunded && charge.payment_intent) {
          const { error } = await db.from("enrollments").update({ status: "cancelled" }).eq("stripe_subscription_id", charge.payment_intent);
          if (error) throw error;
          console.log("Access revoked after full refund", charge.payment_intent);
        }
        break;
      }
      default:
        console.log("Unhandled event", event.type);
    }
    return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Webhook handler error:", e);
    return new Response("Handler error", { status: 500 });
  }
});
