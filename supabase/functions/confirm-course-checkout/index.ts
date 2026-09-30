import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { stripeRequest } from "../_shared/stripe.ts";
import { recordCoursePurchase } from "../_shared/purchases.ts";

// Called by the checkout page when Stripe redirects back. Verifies the
// session with Stripe directly (paid, and bought by this user) and grants the
// enrolment. Idempotent, so it's safe alongside the webhook.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

interface Session { id: string; payment_status: string; payment_intent: string | null; metadata: Record<string, string> }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
    if (!u?.user) return json({ error: "Unauthorized" }, 401);

    const { session_id } = (await req.json()) as { session_id?: string };
    if (!session_id || !/^cs_[A-Za-z0-9_]+$/.test(session_id)) return json({ error: "Invalid session" }, 400);

    const session = await stripeRequest<Session>("GET", `/checkout/sessions/${session_id}`);
    if (session.metadata?.user_id !== u.user.id) return json({ error: "This payment belongs to a different account" }, 403);
    if (session.payment_status !== "paid") return json({ status: "pending" });

    const courseId = session.metadata.course_id;
    const { data: course } = await db.from("courses").select("slug").eq("id", courseId).maybeSingle();
    if (!course) return json({ error: "Course not found" }, 404);

    const { error } = await db.from("enrollments").upsert(
      { user_id: u.user.id, course_id: courseId, status: "active", stripe_subscription_id: session.payment_intent ?? session.id, expires_at: null },
      { onConflict: "user_id,course_id" },
    );
    if (error) throw error;
    await recordCoursePurchase(db, session.id, u.user.id, courseId);

    return json({ status: "enrolled", slug: course.slug });
  } catch (e) {
    console.error("confirm-course-checkout:", e);
    return json({ error: "Could not confirm payment" }, 500);
  }
});
