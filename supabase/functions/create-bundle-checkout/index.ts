// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { stripeRequest } from "../_shared/stripe.ts";
import { ensureStripeProduct } from "../_shared/catalog.ts";

// Card checkout for a bundle (several courses, one price). Price and contents come from
// the database; the request only names the bundle.

const SITE_URL = "https://www.safetytech.academy";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...corsHeaders } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Please sign in first" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
    const user = u?.user;
    if (!user?.email) return json({ error: "Please sign in first" }, 401);

    const { bundle_id } = (await req.json().catch(() => ({}))) as { bundle_id?: string };
    const { data: bundle } = await db.from("bundles").select("id, title, description, price_cents, currency, published, stripe_product_id").eq("id", String(bundle_id ?? "")).maybeSingle();
    if (!bundle || !bundle.published) return json({ error: "That bundle isn't available" }, 404);

    const { data: items } = await db.from("bundle_courses").select("course_id").eq("bundle_id", bundle.id);
    const ids = (items ?? []).map((i: any) => i.course_id);
    if (ids.length < 2) return json({ error: "That bundle isn't set up yet" }, 400);
    const { data: owned } = await db.from("enrollments").select("course_id, status, expires_at").eq("user_id", user.id).in("course_id", ids);
    const have = (owned ?? []).filter((e: any) => e.status === "active" && (!e.expires_at || new Date(e.expires_at) > new Date())).length;
    if (have === ids.length) return json({ alreadyOwned: true });

    const productId = await ensureStripeProduct(db, "bundles", bundle);
    const taxMode = ["inclusive", "exclusive"].includes(Deno.env.get("STRIPE_TAX_MODE") ?? "") ? Deno.env.get("STRIPE_TAX_MODE")! : null;
    const meta = { kind: "bundle", user_id: user.id, bundle_id: bundle.id };
    const metaParams = Object.fromEntries(Object.entries(meta).flatMap(([k, v]) => [[`metadata[${k}]`, v], [`payment_intent_data[metadata][${k}]`, v]]));
    const base: Record<string, string> = {
      mode: "payment", customer_email: user.email, client_reference_id: user.id,
      "line_items[0][quantity]": "1", "line_items[0][price_data][currency]": (bundle.currency || "GBP").toLowerCase(), "line_items[0][price_data][unit_amount]": String(bundle.price_cents),
      ...(productId ? { "line_items[0][price_data][product]": productId } : { "line_items[0][price_data][product_data][name]": bundle.title }),
      ...metaParams, "payment_intent_data[description]": `Bundle: ${bundle.title}`,
      success_url: `${SITE_URL}/learn?bundle_session={CHECKOUT_SESSION_ID}`, cancel_url: `${SITE_URL}/learn?bundle_cancelled=1`,
    };
    const rich: Record<string, string> = {
      ...base, customer_creation: "always", billing_address_collection: "required", "phone_number_collection[enabled]": "true",
      "name_collection[individual][enabled]": "true", "name_collection[business][enabled]": "true", "name_collection[business][optional]": "true",
      "tax_id_collection[enabled]": "true", allow_promotion_codes: "true",
      "invoice_creation[enabled]": "true",
      ...(Deno.env.get("STRIPE_ACCOUNT_TAX_ID") ? { "invoice_creation[invoice_data][account_tax_ids][0]": Deno.env.get("STRIPE_ACCOUNT_TAX_ID")! } : {}), "invoice_creation[invoice_data][description]": `Course bundle: ${bundle.title}`,
      "custom_text[submit][message]": `You get instant access to all ${ids.length} courses in the bundle as soon as the payment goes through.`,
      ...(taxMode ? { "automatic_tax[enabled]": "true", "line_items[0][price_data][tax_behavior]": taxMode } : {}),
    };
    let session: { url: string };
    try { session = await stripeRequest("POST", "/checkout/sessions", rich, { version: "2025-11-17.clover" }); }
    catch (e) {
      console.error("rich bundle checkout failed, falling back:", (e as Error).message);
      session = await stripeRequest("POST", "/checkout/sessions", taxMode ? { ...base, billing_address_collection: "required", "automatic_tax[enabled]": "true", "line_items[0][price_data][tax_behavior]": taxMode } : base);
    }
    return json({ url: session.url });
  } catch (e) {
    console.error("create-bundle-checkout:", e);
    return json({ error: e instanceof Error ? e.message : "Could not start checkout" }, 500);
  }
});
