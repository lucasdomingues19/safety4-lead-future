// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { stripeRequest } from "../_shared/stripe.ts";
import { ensureStripeProduct } from "../_shared/catalog.ts";

// Card checkout for team seats. The per-seat price (with the volume discount) is
// worked out here from the database; nothing but the course, the number of seats
// and the company is taken from the request.

const SITE_URL = "https://www.safetytech.academy";
const DEFAULT_ACCESS_DAYS = 365;
const MIN_SEATS = 2, MAX_SEATS = 500;
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

    const b = (await req.json().catch(() => ({}))) as any;
    const seats = Math.floor(Number(b.seats));
    if (!Number.isFinite(seats) || seats < MIN_SEATS || seats > MAX_SEATS) return json({ error: `Choose between ${MIN_SEATS} and ${MAX_SEATS} seats. For one person, buy the course directly.` }, 400);

    const { data: course } = await db.from("courses").select("id, title, description, currency, published, team_enabled, stripe_product_id, price_cents").eq("id", String(b.course_id ?? "")).maybeSingle();
    if (!course || !course.published || !course.team_enabled) return json({ error: "Team seats aren't available for this course" }, 404);

    let orgId: string | null = null;
    let orgName: string | null = null;
    if (b.org_id) {
      orgId = String(b.org_id);
      const { data: ok } = await db.rpc("is_org_manager", { _user: user.id, _org: orgId });
      if (!ok) return json({ error: "You don't manage that company" }, 403);
    } else {
      orgName = String(b.org_name ?? "").trim().slice(0, 120);
      if (orgName.length < 2) return json({ error: "Enter your company name" }, 400);
    }

    const { data: price } = await db.rpc("team_price", { _course: course.id, _seats: seats });
    const p = Array.isArray(price) ? price[0] : price;
    if (!p?.unit_cents) return json({ error: "This course can't be bought as team seats" }, 400);

    let accessDays = DEFAULT_ACCESS_DAYS;
    if (orgId) {
      const { data: last } = await db.from("organisation_seats").select("access_days").eq("organisation_id", orgId).eq("course_id", course.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (last) accessDays = last.access_days ?? 0;
    }

    const productId = await ensureStripeProduct(db, "courses", course);
    const taxMode = ["inclusive", "exclusive"].includes(Deno.env.get("STRIPE_TAX_MODE") ?? "") ? Deno.env.get("STRIPE_TAX_MODE")! : null;
    const returnUrl = `${SITE_URL}/learn?view=team`;
    const meta: Record<string, string> = { kind: "team", user_id: user.id, course_id: course.id, seats: String(seats), access_days: String(accessDays), ...(orgId ? { org_id: orgId } : { org_name: orgName! }) };
    const metaParams = Object.fromEntries(Object.entries(meta).flatMap(([k, v]) => [[`metadata[${k}]`, v], [`payment_intent_data[metadata][${k}]`, v]]));

    const label = `Team seats: ${course.title} (${seats} seats${p.discount_pct ? `, ${p.discount_pct}% volume discount` : ""})`;
    const rich: Record<string, string> = {
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      "line_items[0][quantity]": String(seats),
      "line_items[0][price_data][currency]": (course.currency || "GBP").toLowerCase(),
      "line_items[0][price_data][unit_amount]": String(p.unit_cents),
      ...(productId ? { "line_items[0][price_data][product]": productId } : { "line_items[0][price_data][product_data][name]": course.title }),
      ...metaParams,
      "payment_intent_data[description]": label,
      success_url: `${returnUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}&cancelled=1`,
      customer_creation: "always",
      billing_address_collection: "required",
      "phone_number_collection[enabled]": "true",
      "name_collection[business][enabled]": "true",
      "name_collection[individual][enabled]": "true",
      "tax_id_collection[enabled]": "true",
      allow_promotion_codes: "true",
      "invoice_creation[enabled]": "true",
      ...(Deno.env.get("STRIPE_ACCOUNT_TAX_ID") ? { "invoice_creation[invoice_data][account_tax_ids][0]": Deno.env.get("STRIPE_ACCOUNT_TAX_ID")! } : {}),
      "invoice_creation[invoice_data][description]": label,
      "custom_text[submit][message]": `${seats} seat${seats === 1 ? "" : "s"} are added to your company as soon as the payment goes through. You then choose who gets them.`,
      ...(taxMode ? { "automatic_tax[enabled]": "true", "line_items[0][price_data][tax_behavior]": taxMode } : {}),
    };

    let session: { id: string; url: string };
    try {
      session = await stripeRequest<{ id: string; url: string }>("POST", "/checkout/sessions", rich, { version: "2025-11-17.clover" });
    } catch (richErr) {
      // Never lose a sale over a nice-to-have field; never skip tax when it is switched on.
      console.error("rich team checkout failed, falling back:", (richErr as Error).message);
      const plain: Record<string, string> = {
        mode: "payment", customer_email: user.email, client_reference_id: user.id,
        "line_items[0][quantity]": String(seats), "line_items[0][price_data][currency]": (course.currency || "GBP").toLowerCase(),
        "line_items[0][price_data][unit_amount]": String(p.unit_cents), "line_items[0][price_data][product_data][name]": course.title,
        ...metaParams, success_url: rich.success_url, cancel_url: rich.cancel_url, billing_address_collection: "required",
        ...(taxMode ? { "automatic_tax[enabled]": "true", "line_items[0][price_data][tax_behavior]": taxMode } : {}),
      };
      session = await stripeRequest<{ id: string; url: string }>("POST", "/checkout/sessions", plain);
    }
    return json({ url: session.url, unit_cents: p.unit_cents, discount_pct: p.discount_pct, total_cents: p.total_cents });
  } catch (e) {
    console.error("create-team-checkout:", e);
    return json({ error: e instanceof Error ? e.message : "Could not start checkout" }, 500);
  }
});
