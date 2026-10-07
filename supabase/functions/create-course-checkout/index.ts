import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { stripeRequest } from "../_shared/stripe.ts";
import { ensureStripeProduct } from "../_shared/catalog.ts";

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
      .select("id, title, slug, description, price_cents, currency, published, stripe_product_id")
      .eq("id", course_id)
      .maybeSingle();
    if (!course || !course.published) return json({ error: "Course not available" }, 404);
    if (!course.price_cents || course.price_cents <= 0) return json({ error: "This course is free — enrol from your dashboard" }, 400);

    const { data: existing } = await db.from("enrollments").select("status, expires_at").eq("user_id", user.id).eq("course_id", course.id).maybeSingle();
    if (existing && existing.status === "active" && (!existing.expires_at || new Date(existing.expires_at) > new Date())) {
      return json({ alreadyEnrolled: true, slug: course.slug });
    }

    // Sales tax: off until Stripe Tax is set up. STRIPE_TAX_MODE = "inclusive" (prices already
    // include VAT) or "exclusive" (VAT is added on top) switches on automatic calculation.
    const taxMode = ["inclusive", "exclusive"].includes(Deno.env.get("STRIPE_TAX_MODE") ?? "") ? Deno.env.get("STRIPE_TAX_MODE")! : null;

    // A Stripe Product per course lets a discount code be limited to this course.
    const productId = await ensureStripeProduct(db, "courses", course);

    const base: Record<string, string> = {
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": (course.currency || "GBP").toLowerCase(),
      "line_items[0][price_data][unit_amount]": String(course.price_cents),
      ...(productId
        ? { "line_items[0][price_data][product]": productId }
        : { "line_items[0][price_data][product_data][name]": course.title,
            ...(course.description ? { "line_items[0][price_data][product_data][description]": course.description.slice(0, 500) } : {}) }),
      "metadata[course_id]": course.id,
      "metadata[user_id]": user.id,
      "payment_intent_data[metadata][course_id]": course.id,
      "payment_intent_data[metadata][user_id]": user.id,
      "payment_intent_data[description]": `Course: ${course.title}`,
      success_url: `${SITE_URL}/student/checkout/${course.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/student/checkout/${course.id}?cancelled=1`,
    };

    // What Kajabi-style checkouts collect: full name (or a business name), billing
    // address, phone, VAT number for businesses, promo codes and a proper invoice.
    const rich: Record<string, string> = {
      ...base,
      customer_creation: "always",
      billing_address_collection: "required",
      "phone_number_collection[enabled]": "true",
      "name_collection[individual][enabled]": "true",
      "name_collection[business][enabled]": "true",
      "name_collection[business][optional]": "true",
      "tax_id_collection[enabled]": "true",
      allow_promotion_codes: "true",
      "invoice_creation[enabled]": "true",
      ...(Deno.env.get("STRIPE_ACCOUNT_TAX_ID") ? { "invoice_creation[invoice_data][account_tax_ids][0]": Deno.env.get("STRIPE_ACCOUNT_TAX_ID")! } : {}),
      "invoice_creation[invoice_data][description]": `Online course: ${course.title}`,
      "custom_text[submit][message]": "You get instant access to your course as soon as the payment goes through.",
      ...(taxMode ? { "automatic_tax[enabled]": "true", "line_items[0][price_data][tax_behavior]": taxMode } : {}),
    };

    // Stripe's account API version predates some of these fields, so pin a current one.
    let session: { id: string; url: string };
    try {
      session = await stripeRequest<{ id: string; url: string }>("POST", "/checkout/sessions", rich, { version: "2025-11-17.clover" });
    } catch (richErr) {
      // Never lose a sale over a nice-to-have field (e.g. a key permission): fall back to a plainer
      // checkout — but never one that skips tax when tax is switched on.
      console.error("rich checkout failed, falling back:", (richErr as Error).message);
      const plain: Record<string, string> = taxMode
        ? { ...base, billing_address_collection: "required", "automatic_tax[enabled]": "true", "line_items[0][price_data][tax_behavior]": taxMode }
        : base;
      session = await stripeRequest<{ id: string; url: string }>("POST", "/checkout/sessions", plain);
    }

    return json({ url: session.url });
  } catch (e) {
    console.error("create-course-checkout:", e);
    return json({ error: e instanceof Error ? e.message : "Could not start checkout" }, 500);
  }
});
