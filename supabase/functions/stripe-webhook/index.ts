import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeWebhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    // Verify webhook signature
    const crypto = await import("https://deno.land/std@0.208.0/crypto/mod.ts");

    // Parse event
    const event = JSON.parse(body);

    // Handle payment_intent.succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Supabase credentials not configured");
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Extract metadata
      const { userId, courseId, userEmail } = paymentIntent.metadata;

      if (!userId || !courseId) {
        console.error("Missing metadata:", { userId, courseId });
        return new Response("Missing metadata", { status: 400 });
      }

      // Record enrollment
      const { error: enrollmentError } = await supabase
        .from("enrollments")
        .insert({
          user_id: userId,
          course_id: courseId,
          payment_status: "completed",
          stripe_payment_intent_id: paymentIntent.id,
          amount_paid: paymentIntent.amount / 100,
          enrolled_at: new Date().toISOString(),
        });

      if (enrollmentError) {
        console.error("Enrollment error:", enrollmentError);
        throw enrollmentError;
      }

      // Send confirmation email
      const emailFunction = await supabase.functions.invoke(
        "send-enrollment-email",
        {
          body: {
            userEmail,
            courseId,
            courseName: paymentIntent.metadata.courseName,
          },
        }
      );

      if (emailFunction.error) {
        console.error("Email error:", emailFunction.error);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle payment_intent.payment_failed
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      console.error("Payment failed:", paymentIntent.id);

      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
