import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripeRequest } from "../_shared/stripe.ts";
import { EVENTS } from "../_shared/eventEmail.ts";

// Starts a Stripe Checkout for a paid live event. The price and event details come from
// _shared/eventEmail.ts on the server; the request only names the event and the booker.
// The booking is saved and confirmed by handle-stripe-webhook once Stripe says it is paid.

const SITE_URL = "https://www.safetytech.academy";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = (await req.json()) as { event?: string; name?: string; email?: string; company?: string; marketing_consent?: boolean };
    const slug = String(body.event ?? "");
    const ev = EVENTS[slug];
    if (!ev) return json({ error: "Event not found" }, 404);
    if (Date.now() > Date.parse(ev.startsAt)) return json({ error: "Booking for this event has closed" }, 410);

    const name = String(body.name ?? "").trim().slice(0, 100);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 255);
    const company = String(body.company ?? "").trim().slice(0, 200);
    if (!name || !EMAIL_RE.test(email)) return json({ error: "Please add your name and a valid email address" }, 400);

    const path = new URL(ev.url).pathname;
    const taxMode = ["inclusive", "exclusive"].includes(Deno.env.get("STRIPE_TAX_MODE") ?? "") ? Deno.env.get("STRIPE_TAX_MODE")! : null;
    const meta: Record<string, string> = {
      "metadata[kind]": "event",
      "metadata[event]": slug,
      "metadata[name]": name,
      "metadata[company]": company,
      "metadata[marketing_consent]": body.marketing_consent === true ? "1" : "0",
      "payment_intent_data[metadata][kind]": "event",
      "payment_intent_data[metadata][event]": slug,
    };
    const base: Record<string, string> = {
      mode: "payment",
      customer_email: email,
      ...meta,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": ev.currency,
      "line_items[0][price_data][unit_amount]": String(ev.priceCents),
      "line_items[0][price_data][product_data][name]": `Live session: ${ev.title}`,
      "line_items[0][price_data][product_data][description]": `${ev.when}. Live online with Lucas Domingues; the joining link is emailed before the session.`,
      "payment_intent_data[description]": `Live session: ${ev.title} (${ev.short})`,
      success_url: `${SITE_URL}${path}?booked=1`,
      cancel_url: `${SITE_URL}${path}?cancelled=1#register`,
      ...(taxMode ? { billing_address_collection: "required", "automatic_tax[enabled]": "true", "line_items[0][price_data][tax_behavior]": taxMode } : {}),
    };
    const rich: Record<string, string> = {
      ...base,
      "tax_id_collection[enabled]": "true",
      allow_promotion_codes: "true",
      "invoice_creation[enabled]": "true",
      ...(Deno.env.get("STRIPE_ACCOUNT_TAX_ID") ? { "invoice_creation[invoice_data][account_tax_ids][0]": Deno.env.get("STRIPE_ACCOUNT_TAX_ID")! } : {}),
      "invoice_creation[invoice_data][description]": `Live session: ${ev.title}, ${ev.when}`,
      "custom_text[submit][message]": "You'll get a booking confirmation by email straight away, and your joining link before the session.",
    };

    let session: { id: string; url: string };
    try {
      session = await stripeRequest<{ id: string; url: string }>("POST", "/checkout/sessions", rich, { version: "2025-11-17.clover" });
    } catch (richErr) {
      console.error("rich event checkout failed, falling back:", (richErr as Error).message);
      session = await stripeRequest<{ id: string; url: string }>("POST", "/checkout/sessions", base);
    }
    return json({ url: session.url });
  } catch (e) {
    console.error("create-event-checkout:", e);
    return json({ error: "Could not start checkout. Please try again." }, 500);
  }
});
