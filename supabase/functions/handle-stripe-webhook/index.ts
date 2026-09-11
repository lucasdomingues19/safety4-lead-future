import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const crypto = await import("https://deno.land/std@0.133.0/crypto/mod.ts");

async function verifyStripeWebhook(
  body: string,
  signature: string
): Promise<boolean> {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Extract timestamp and signature from header
  const parts = signature.split(",");
  let timestamp = "";
  let receivedSignature = "";

  for (const part of parts) {
    const [key, value] = part.trim().split("=");
    if (key === "t") timestamp = value;
    if (key === "v1") receivedSignature = value;
  }

  // Create signed content
  const signedContent = `${timestamp}.${body}`;
  const computedSignature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedContent)
  );

  // Convert to hex string
  const computedHex = Array.from(new Uint8Array(computedSignature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHex === receivedSignature;
}

async function handleCheckoutSessionCompleted(
  event: any,
  supabase: any
): Promise<void> {
  const session = event.data.object;
  const courseId = session.subscription_data?.metadata?.course_id;
  const userId = session.subscription_data?.metadata?.user_id;
  const subscriptionId = session.subscription;

  if (!courseId || !userId || !subscriptionId) {
    console.warn("Missing metadata in checkout session:", {
      courseId,
      userId,
      subscriptionId,
    });
    return;
  }

  // Create enrollment record
  const { error } = await supabase
    .from("enrollments")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        stripe_subscription_id: subscriptionId,
        status: "active",
        enrolled_at: new Date().toISOString(),
        expires_at: null, // Will be set by subscription.updated event
      },
      { onConflict: "user_id,course_id" }
    );

  if (error) {
    console.error("Failed to create enrollment:", error);
    throw error;
  }

  console.log(`Enrollment created for user ${userId} in course ${courseId}`);
}

async function handleSubscriptionUpdated(
  event: any,
  supabase: any
): Promise<void> {
  const subscription = event.data.object;
  const courseId = subscription.metadata?.course_id;
  const userId = subscription.metadata?.user_id;

  if (!courseId || !userId) {
    console.warn("Missing metadata in subscription:", { courseId, userId });
    return;
  }

  // Determine status
  let status = "active";
  if (subscription.status === "canceled") {
    status = "cancelled";
  } else if (subscription.status === "past_due") {
    status = "past_due";
  }

  // Get current period end (subscription expiration)
  const expiresAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  // Update enrollment
  const { error } = await supabase
    .from("enrollments")
    .update({
      status,
      expires_at: expiresAt,
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Failed to update enrollment:", error);
    throw error;
  }

  console.log(
    `Enrollment updated: ${userId} in course ${courseId}, status: ${status}`
  );
}

async function handleSubscriptionDeleted(
  event: any,
  supabase: any
): Promise<void> {
  const subscription = event.data.object;

  // Mark enrollment as cancelled
  const { error } = await supabase
    .from("enrollments")
    .update({
      status: "cancelled",
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Failed to cancel enrollment:", error);
    throw error;
  }

  console.log(`Enrollment cancelled for subscription ${subscription.id}`);
}

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!signature) {
      return new Response("Missing signature", { status: 401 });
    }

    // Verify webhook signature
    const isValid = await verifyStripeWebhook(body, signature);
    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }

    // Parse event
    const event = JSON.parse(body);

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Handle event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event, supabase);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event, supabase);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
