// Record a paid course checkout in course_purchases (idempotent on the Stripe
// session id). Called from both the checkout-return confirmation and the
// webhook, whichever arrives first.
//
// deno-lint-ignore-file no-explicit-any
import { stripeRequest } from "./stripe.ts";

export async function recordCoursePurchase(db: any, sessionId: string, userId: string, courseId: string) {
  try {
    const session = await stripeRequest<any>("GET", `/checkout/sessions/${sessionId}`, { "expand[]": "payment_intent.latest_charge" });
    if (session.payment_status !== "paid") return;
    const { data: course } = await db.from("courses").select("title").eq("id", courseId).maybeSingle();
    const pi = session.payment_intent;
    await db.from("course_purchases").upsert({
      user_id: userId,
      course_id: courseId,
      course_title: course?.title ?? "Course",
      stripe_session_id: session.id,
      stripe_payment_intent: typeof pi === "string" ? pi : pi?.id ?? null,
      amount_cents: session.amount_total ?? 0,
      currency: (session.currency ?? "gbp").toUpperCase(),
      receipt_url: typeof pi === "object" ? pi?.latest_charge?.receipt_url ?? null : null,
      purchased_at: new Date((session.created ?? Date.now() / 1000) * 1000).toISOString(),
    }, { onConflict: "stripe_session_id", ignoreDuplicates: true });
  } catch (e) {
    // Never block the enrolment on bookkeeping.
    console.error("recordCoursePurchase failed", (e as Error).message);
  }
}
