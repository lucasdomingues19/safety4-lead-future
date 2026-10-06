// Record a paid checkout in course_purchases (idempotent on the Stripe session id).
// Called from both the checkout-return confirmation and the webhook, whichever
// arrives first. Stores what the buyer typed at checkout, the invoice links, and
// any discount code used.
//
// deno-lint-ignore-file no-explicit-any
import { stripeRequest } from "./stripe.ts";

export interface PurchaseTarget {
  userId: string;
  title: string;
  courseId?: string | null;
  bundleId?: string | null;
  organisationId?: string | null;
  quantity?: number;
}

export async function recordPurchase(db: any, sessionId: string, t: PurchaseTarget) {
  try {
    let session: any;
    try {
      session = await stripeRequest<any>("GET", `/checkout/sessions/${sessionId}`, {
        "expand[0]": "payment_intent.latest_charge", "expand[1]": "invoice", "expand[2]": "total_details.breakdown.discounts.discount.promotion_code",
      });
    } catch {
      session = await stripeRequest<any>("GET", `/checkout/sessions/${sessionId}`, { "expand[0]": "payment_intent.latest_charge" });
    }
    if (session.payment_status !== "paid") return;
    const pi = session.payment_intent;
    const cd = session.customer_details ?? {};
    const taxId = Array.isArray(cd.tax_ids) && cd.tax_ids.length ? String(cd.tax_ids[0].value ?? "") : null;
    const individual = (cd.individual_name || cd.name || "").trim() || null;
    const business = (cd.business_name || "").trim() || null;
    const inv = session.invoice && typeof session.invoice === "object" ? session.invoice : null;
    const promo = session.total_details?.breakdown?.discounts?.[0]?.discount?.promotion_code;
    const promoCode = promo && typeof promo === "object" ? promo.code ?? null : null;

    // Fill the buyer's profile from what they typed at checkout, never overwriting what's there.
    const { data: prof } = await db.from("profiles").select("full_name, organisation").eq("id", t.userId).maybeSingle();
    const patch: Record<string, string> = {};
    if (!prof?.full_name && individual) patch.full_name = individual;
    if (!prof?.organisation && business) patch.organisation = business;
    if (Object.keys(patch).length) await db.from("profiles").update(patch).eq("id", t.userId);

    await db.from("course_purchases").upsert({
      user_id: t.userId,
      course_id: t.courseId ?? null,
      bundle_id: t.bundleId ?? null,
      organisation_id: t.organisationId ?? null,
      quantity: t.quantity ?? 1,
      course_title: t.title,
      stripe_session_id: session.id,
      stripe_payment_intent: typeof pi === "string" ? pi : pi?.id ?? null,
      amount_cents: session.amount_total ?? 0,
      currency: (session.currency ?? "gbp").toUpperCase(),
      receipt_url: typeof pi === "object" ? pi?.latest_charge?.receipt_url ?? null : null,
      invoice_url: inv?.hosted_invoice_url ?? null,
      invoice_pdf: inv?.invoice_pdf ?? null,
      discount_cents: session.total_details?.amount_discount ?? 0,
      promo_code: promoCode,
      customer_name: individual,
      customer_business: business,
      customer_country: cd.address?.country ?? null,
      customer_vat_id: taxId,
      tax_cents: session.total_details?.amount_tax ?? 0,
      purchased_at: new Date((session.created ?? Date.now() / 1000) * 1000).toISOString(),
    }, { onConflict: "stripe_session_id", ignoreDuplicates: true });
  } catch (e) {
    // Never block the enrolment on bookkeeping.
    console.error("recordPurchase failed", (e as Error).message);
  }
}

/** Single course purchase (kept for the existing callers). */
export async function recordCoursePurchase(db: any, sessionId: string, userId: string, courseId: string) {
  const { data: course } = await db.from("courses").select("title").eq("id", courseId).maybeSingle();
  await recordPurchase(db, sessionId, { userId, courseId, title: course?.title ?? "Course" });
}
