import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { recordCoursePurchase, recordPurchase } from "../_shared/purchases.ts";
import { fulfilBundle, fulfilTeamPurchase } from "../_shared/teams.ts";
import { sendPurchaseEmail } from "../_shared/purchaseEmail.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

// Stripe webhook (backup to confirm-course-checkout).
// Point the Stripe endpoint at .../functions/v1/handle-stripe-webhook and
// subscribe to: checkout.session.completed, checkout.session.async_payment_succeeded,
// charge.refunded, invoice.paid (company seat invoices). Requires verify_jwt = false (Stripe sends no Supabase JWT).

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const TOLERANCE_SECONDS = 300;

async function verifySignature(payload: string, header: string): Promise<boolean> {
  if (!WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const timestamp = parts["t"];
  const signatures = header.split(",").filter((p) => p.trim().startsWith("v1=")).map((p) => p.trim().slice(3));
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`)));
  const expected = Array.from(mac).map((b) => b.toString(16).padStart(2, "0")).join("");

  // constant-time compare
  return signatures.some((sig) => {
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  });
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const payload = await req.text();
  try {
    if (!(await verifySignature(payload, signature))) return new Response("Invalid signature", { status: 400 });
  } catch (e) {
    console.error(e);
    return new Response("Webhook not configured", { status: 500 });
  }

  const event = JSON.parse(payload);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const meta = session.metadata ?? {};
        if (meta.kind === "team") {
          if (session.payment_status !== "paid") break;
          const r = await fulfilTeamPurchase(db, {
            ref: session.id, buyerId: meta.user_id, courseId: meta.course_id, seats: Number(meta.seats), accessDays: Number(meta.access_days) > 0 ? Number(meta.access_days) : null,
            amountCents: session.amount_total ?? 0, source: "card", orgId: meta.org_id ?? null, orgName: meta.org_name ?? null,
          });
          const { data: tc } = await db.from("courses").select("title").eq("id", meta.course_id).maybeSingle();
          await recordPurchase(db, session.id, { userId: meta.user_id, courseId: meta.course_id, organisationId: r.orgId, quantity: Number(meta.seats), title: `${tc?.title ?? "Course"} (team seats)` });
          console.log("Team seats granted via webhook", { ref: session.id, granted: r.granted });
          break;
        }
        if (meta.kind === "bundle") {
          if (session.payment_status !== "paid") break;
          const n = await fulfilBundle(db, meta.user_id, meta.bundle_id);
          const { data: bd } = await db.from("bundles").select("title").eq("id", meta.bundle_id).maybeSingle();
          await recordPurchase(db, session.id, { userId: meta.user_id, bundleId: meta.bundle_id, title: `${bd?.title ?? "Bundle"} (bundle)` });
          console.log("Bundle granted via webhook", { bundle: meta.bundle_id, enrolments: n });
          break;
        }
        const { course_id } = meta;
        if (!course_id) {
          console.log("Ignoring checkout session without course metadata", session.id);
          break;
        }
        if (session.payment_status !== "paid") {
          console.log("Checkout session not paid yet", session.id);
          break;
        }
        // A guest (no account when they paid): find the account for their email, or create one.
        const buyerEmail = String(session.customer_details?.email ?? session.customer_email ?? "").trim().toLowerCase();
        const buyerName = String(session.customer_details?.name ?? "").trim();
        let user_id: string | undefined = meta.user_id || undefined;
        let isNew = false;
        if (!user_id) {
          if (!buyerEmail) { console.error("Guest purchase with no email", session.id); break; }
          const { data: prof } = await db.from("profiles").select("id").ilike("email", buyerEmail).maybeSingle();
          if (prof?.id) user_id = prof.id;
          else {
            const { data: c, error: ce } = await db.auth.admin.createUser({ email: buyerEmail, email_confirm: true, user_metadata: buyerName ? { full_name: buyerName } : {} });
            if (ce || !c?.user) {
              // The address may already exist in sign-in without a profile row: find it there.
              const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
              const found = list?.users?.find((u: { email?: string }) => (u.email ?? "").toLowerCase() === buyerEmail);
              if (!found) throw ce ?? new Error("Could not create the buyer's account");
              user_id = found.id;
            } else { user_id = c.user.id; isNew = true; }
          }
        }
        const { error } = await db.from("enrollments").upsert(
          { user_id, course_id, status: "active", stripe_subscription_id: session.payment_intent ?? session.id, expires_at: null },
          { onConflict: "user_id,course_id" },
        );
        if (error) throw error;
        await recordCoursePurchase(db, session.id, user_id!, course_id);
        console.log("Enrolled via webhook", { user_id, course_id, isNew });
        // Welcome email is best-effort: the enrolment above is already saved.
        try {
          const { data: course } = await db.from("courses").select("title").eq("id", course_id).maybeSingle();
          let link = "https://www.safetytech.academy/learn/auth";
          if (isNew) {
            const { data: l } = await db.auth.admin.generateLink({ type: "recovery", email: buyerEmail, options: { redirectTo: "https://www.safetytech.academy/learn/reset-password?welcome=1" } });
            const th = l?.properties?.hashed_token;
            if (th) link = `https://www.safetytech.academy/learn/auth/confirm?token_hash=${encodeURIComponent(th)}&type=recovery&next=${encodeURIComponent("/learn/reset-password?welcome=1")}`;
          }
          const err = buyerEmail ? await sendPurchaseEmail({ to: buyerEmail, name: buyerName, course: course?.title ?? "your course", link, isNew }) : "no email";
          if (err) console.error("purchase email not sent:", err);
        } catch (e) { console.error("purchase email error:", (e as Error).message); }
        break;
      }
      case "invoice.paid": {
        // Company seat invoices raised from admin carry metadata.kind = "team".
        const inv = event.data.object;
        const m = inv.metadata ?? {};
        if (m.kind !== "team") break;
        const amount = inv.amount_paid ?? inv.total ?? 0;
        await db.from("team_invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("stripe_invoice_id", inv.id);
        const r = await fulfilTeamPurchase(db, {
          ref: inv.id, buyerId: m.created_by, courseId: m.course_id, seats: Number(m.seats), accessDays: Number(m.access_days) > 0 ? Number(m.access_days) : null,
          amountCents: amount, source: "invoice", orgId: m.org_id, note: inv.number ? `Invoice ${inv.number}` : undefined,
        });
        console.log("Team seats granted from invoice", { invoice: inv.id, granted: r.granted });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        if (charge.refunded && charge.payment_intent) {
          const { error } = await db.from("enrollments").update({ status: "cancelled" }).eq("stripe_subscription_id", charge.payment_intent);
          if (error) throw error;
          await db.from("course_purchases").update({ status: "refunded" }).eq("stripe_payment_intent", charge.payment_intent);
          console.log("Access revoked after full refund", charge.payment_intent);
        }
        break;
      }
      default:
        console.log("Unhandled event", event.type);
    }
    return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Webhook handler error:", e);
    return new Response("Handler error", { status: 500 });
  }
});
