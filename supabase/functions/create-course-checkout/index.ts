import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { stripeRequest } from "../_shared/stripe.ts";

// Creates a one-time Stripe Checkout Session for a course. The price, the
// buyer and the course are all resolved server-side — nothing in the request
// body beyond the course id is trusted.

const SITE_URL = "https://www.safetytech.academy";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Please sign in first" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
    const user = u?.user;
    if (!user?.email) return json({ error: "Please sign in first" }, 401);

    const { course_id } = (await req.json()) as { course_id?: string };
    if (!course_id) return json({ error: "course_id is required" }, 400);

    const { data: course } = await db
      .from("courses")
      .select("id, title, slug, description, price_cents, currency, published")
      .eq("id", course_id)
      .maybeSingle();
    if (!course || !course.published) return json({ error: "Course not available" }, 404);
    if (!course.price_cents || course.price_cents <= 0) return json({ error: "This course is free — enrol from your dashboard" }, 400);

    const { data: existing } = await db.from("enrollments").select("status, expires_at").eq("user_id", user.id).eq("course_id", course.id).maybeSingle();
    if (existing && existing.status === "active" && (!existing.expires_at || new Date(existing.expires_at) > new Date())) {
      return json({ alreadyEnrolled: true, slug: course.slug });
    }

    const session = await stripeRequest<{ id: string; url: string }>("POST", "/checkout/sessions", {
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": (course.currency || "GBP").toLowerCase(),
      "line_items[0][price_data][unit_amount]": String(course.price_cents),
      "line_items[0][price_data][product_data][name]": course.title,
      ...(course.description ? { "line_items[0][price_data][product_data][description]": course.description.slice(0, 500) } : {}),
      "metadata[course_id]": course.id,
      "metadata[user_id]": user.id,
      "payment_intent_data[metadata][course_id]": course.id,
      "payment_intent_data[metadata][user_id]": user.id,
      "payment_intent_data[description]": `Course: ${course.title}`,
      success_url: `${SITE_URL}/student/checkout/${course.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/student/checkout/${course.id}?cancelled=1`,
    });

    return json({ url: session.url });
  } catch (e) {
    console.error("create-course-checkout:", e);
    return json({ error: e instanceof Error ? e.message : "Could not start checkout" }, 500);
  }
});
