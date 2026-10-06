// deno-lint-ignore-file no-explicit-any
import { stripeRequest } from "./stripe.ts";

/**
 * One Stripe Product per course/bundle, created on first use. Checkout lines point at it,
 * which is what lets a discount code be limited to a particular course.
 * Returns null (and the caller falls back to an ad-hoc product) if Stripe refuses.
 */
export async function ensureStripeProduct(db: any, table: "courses" | "bundles", row: { id: string; title: string; description?: string | null; stripe_product_id?: string | null }): Promise<string | null> {
  if (row.stripe_product_id) return row.stripe_product_id;
  try {
    const p = await stripeRequest<{ id: string }>("POST", "/products", {
      name: row.title,
      ...(row.description ? { description: row.description.slice(0, 500) } : {}),
      [`metadata[${table === "courses" ? "course_id" : "bundle_id"}]`]: row.id,
    });
    await db.from(table).update({ stripe_product_id: p.id }).eq("id", row.id);
    return p.id;
  } catch (e) {
    console.error("ensureStripeProduct failed", (e as Error).message);
    return null;
  }
}
