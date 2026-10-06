// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, requireAdmin } from "../_shared/auth.ts";
import { stripeRequest } from "../_shared/stripe.ts";
import { ensureStripeProduct } from "../_shared/catalog.ts";

// Admin-only discount codes, kept in Stripe so the code box at checkout just works.
//   list
//   create  { code, kind: "percent" | "amount", percent_off?, amount_off_cents?, course_ids?, bundle_ids?,
//             max_redemptions?, expires_on?, first_order_only?, min_amount_cents? }
//   set_active { id, active }

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...corsHeaders } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    try { await requireAdmin(req); } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const b = (await req.json().catch(() => ({}))) as any;

    if (b.action === "list") {
      // Newer Stripe API versions nest the coupon under "promotion"; older ones expose it directly.
      let list: any;
      try { list = await stripeRequest<any>("GET", "/promotion_codes", { limit: "100", "expand[0]": "data.promotion.coupon", "expand[1]": "data.promotion.coupon.applies_to" }); }
      catch { list = await stripeRequest<any>("GET", "/promotion_codes", { limit: "100", "expand[0]": "data.coupon", "expand[1]": "data.coupon.applies_to" }); }
      const couponOf = (p: any) => (p.promotion?.coupon && typeof p.promotion.coupon === "object" ? p.promotion.coupon : p.coupon) ?? {};
      const [{ data: cs }, { data: bs }] = await Promise.all([db.from("courses").select("title, stripe_product_id"), db.from("bundles").select("title, stripe_product_id")]);
      const names = new Map<string, string>([...(cs ?? []), ...(bs ?? [])].filter((x: any) => x.stripe_product_id).map((x: any) => [x.stripe_product_id, x.title]));
      return json({
        codes: (list.data ?? []).map((p: any) => ({
          id: p.id, code: p.code, active: p.active && couponOf(p).valid !== false, redeemed: p.times_redeemed ?? 0, max: p.max_redemptions ?? null,
          expires_at: p.expires_at ? new Date(p.expires_at * 1000).toISOString() : null,
          percent_off: couponOf(p).percent_off ?? null, amount_off: couponOf(p).amount_off ?? null, currency: (couponOf(p).currency ?? "gbp").toUpperCase(),
          applies_to: (couponOf(p).applies_to?.products ?? []).map((id: string) => names.get(id) ?? "Other product"),
          first_order_only: !!p.restrictions?.first_time_transaction, min_amount: p.restrictions?.minimum_amount ?? null,
          created_at: new Date(p.created * 1000).toISOString(),
        })),
      });
    }

    if (b.action === "set_active") {
      const id = String(b.id ?? "");
      if (!/^promo_[A-Za-z0-9]+$/.test(id)) return json({ error: "Bad code id" }, 400);
      await stripeRequest("POST", `/promotion_codes/${id}`, { active: b.active ? "true" : "false" });
      return json({ ok: true });
    }

    if (b.action === "create") {
      const code = String(b.code ?? "").trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return json({ error: "Codes are 3 to 30 letters, numbers, - or _" }, 400);
      const params: Record<string, string> = { duration: "once", name: code };
      if (b.kind === "percent") {
        const pct = Number(b.percent_off);
        if (!(pct > 0 && pct <= 100)) return json({ error: "Percent off must be between 1 and 100" }, 400);
        params.percent_off = String(pct);
      } else {
        const amt = Math.round(Number(b.amount_off_cents));
        if (!(amt >= 100)) return json({ error: "Amount off must be at least £1" }, 400);
        params.amount_off = String(amt); params.currency = "gbp";
      }
      // Limit to particular courses / bundles (each has a Stripe product).
      const productIds: string[] = [];
      for (const id of Array.isArray(b.course_ids) ? b.course_ids : []) {
        const { data: c } = await db.from("courses").select("id, title, description, stripe_product_id").eq("id", id).maybeSingle();
        const pid = c ? await ensureStripeProduct(db, "courses", c) : null; if (pid) productIds.push(pid);
      }
      for (const id of Array.isArray(b.bundle_ids) ? b.bundle_ids : []) {
        const { data: x } = await db.from("bundles").select("id, title, description, stripe_product_id").eq("id", id).maybeSingle();
        const pid = x ? await ensureStripeProduct(db, "bundles", x) : null; if (pid) productIds.push(pid);
      }
      productIds.forEach((pid, i) => { params[`applies_to[products][${i}]`] = pid; });

      const coupon = await stripeRequest<{ id: string }>("POST", "/coupons", params);
      const pc: Record<string, string> = { code };
      const max = Math.floor(Number(b.max_redemptions));
      if (max > 0) pc.max_redemptions = String(max);
      if (b.expires_on) {
        const t = Math.floor(new Date(`${b.expires_on}T23:59:59Z`).getTime() / 1000);
        if (Number.isFinite(t) && t > Date.now() / 1000) pc.expires_at = String(t);
      }
      if (b.first_order_only) pc["restrictions[first_time_transaction]"] = "true";
      const min = Math.round(Number(b.min_amount_cents));
      if (min > 0) { pc["restrictions[minimum_amount]"] = String(min); pc["restrictions[minimum_amount_currency]"] = "gbp"; }
      try {
        let promo: { id: string };
        try { promo = await stripeRequest<{ id: string }>("POST", "/promotion_codes", { ...pc, "promotion[type]": "coupon", "promotion[coupon]": coupon.id }); }
        catch (e1) {
          if (!/unknown parameter.*promotion|promotion/i.test((e1 as Error).message)) throw e1;
          promo = await stripeRequest<{ id: string }>("POST", "/promotion_codes", { ...pc, coupon: coupon.id });
        }
        return json({ ok: true, id: promo.id });
      } catch (e) {
        try { await stripeRequest("DELETE", `/coupons/${coupon.id}`); } catch { /* ignore */ }
        throw e;
      }
    }
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("admin-promos:", e);
    const msg = e instanceof Error ? e.message : "Something went wrong";
    return json({ error: /already exists/i.test(msg) ? "That code already exists. Pick a different one." : msg }, 500);
  }
});
