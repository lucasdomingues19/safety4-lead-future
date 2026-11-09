// A paid Stripe Payment Link that unlocks the paid community only (no LMS course attached),
// e.g. the live Copilot for EHS training. The link carries its own settings as metadata:
//   grant_space   "global-network"
//   grant_months  how long the membership runs (whole months)
//   grant_title   what the buyer bought (used in the receipt row and the email)
// Called from the Stripe webhook once the payment is confirmed.
//
// deno-lint-ignore-file no-explicit-any
import { stripeRequest } from "./stripe.ts";
import { recordPurchase } from "./purchases.ts";
import { sendCommunityPurchaseEmail } from "./purchaseEmail.ts";

export interface CommunityGrant { space: "global-network"; months: number; title: string }

/** The community grant a checkout session carries, or null for any other kind of purchase. */
export async function communityGrantOf(session: any, meta: Record<string, string>): Promise<CommunityGrant | null> {
  let m: Record<string, string> = meta ?? {};
  // Metadata set on a Payment Link is copied onto its sessions; read it from the link if it is not there.
  if (!m.grant_space && typeof session?.payment_link === "string") {
    try { m = { ...((await stripeRequest<any>("GET", `/payment_links/${session.payment_link}`)).metadata ?? {}), ...m }; } catch (e) { console.error("payment link lookup failed", (e as Error).message); }
  }
  if (m.grant_space !== "global-network") return null;
  const months = Math.floor(Number(m.grant_months));
  return { space: "global-network", months: Number.isFinite(months) && months > 0 ? Math.min(months, 120) : 12, title: String(m.grant_title || "your purchase").slice(0, 120) };
}

const addMonths = (d: Date, n: number) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };

/**
 * Give someone the paid community for `months`. An open-ended membership is never shortened; a
 * live one is extended from its current end date; a lapsed or cancelled one restarts from today.
 */
export async function grantNetwork(db: any, userId: string, months: number): Promise<{ until: Date | null; changed: boolean }> {
  const { data: cur } = await db.from("community_memberships").select("status, expires_at").eq("user_id", userId).eq("space", "global-network").maybeSingle();
  const now = new Date();
  let base = now;
  if (cur?.status === "active") {
    if (!cur.expires_at) return { until: null, changed: false };
    const e = new Date(cur.expires_at);
    if (e > now) base = e;
  }
  const until = addMonths(base, months);
  const { error } = await db.from("community_memberships").upsert(
    { user_id: userId, space: "global-network", status: "active", source: "stripe", expires_at: until.toISOString() },
    { onConflict: "user_id,space" },
  );
  if (error) throw error;
  return { until, changed: true };
}

/** The account for a buyer's email: the existing one, or a new one (so they can set a password). */
export async function resolveBuyer(db: any, email: string, name: string): Promise<{ userId: string; isNew: boolean }> {
  const { data: prof } = await db.from("profiles").select("id").ilike("email", email).maybeSingle();
  if (prof?.id) return { userId: prof.id, isNew: false };
  const { data: c, error: ce } = await db.auth.admin.createUser({ email, email_confirm: true, user_metadata: name ? { full_name: name } : {} });
  if (!ce && c?.user) return { userId: c.user.id, isNew: true };
  // The address may already exist in sign-in without a profile row: find it there.
  const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = list?.users?.find((u: { email?: string }) => (u.email ?? "").toLowerCase() === email);
  if (!found) throw ce ?? new Error("Could not create the buyer's account");
  return { userId: found.id, isNew: false };
}

export interface FulfilOptions { skipBookkeeping?: boolean }

/** Paid session -> account, community membership, receipt row, welcome email. Safe to run twice for one session. */
export async function fulfilCommunityPurchase(db: any, session: any, g: CommunityGrant, opts: FulfilOptions = {}) {
  const email = String(session.customer_details?.email ?? session.customer_email ?? "").trim().toLowerCase();
  const name = String(session.customer_details?.name ?? session.customer_details?.individual_name ?? "").trim();
  if (!email) { console.error("Community purchase with no email", session.id); return { ok: false as const, reason: "no email" }; }

  if (!opts.skipBookkeeping) {
    const { data: done } = await db.from("course_purchases").select("id").eq("stripe_session_id", session.id).maybeSingle();
    if (done) { console.log("Community purchase already fulfilled", session.id); return { ok: true as const, duplicate: true }; }
  }

  const { userId, isNew } = await resolveBuyer(db, email, name);
  const { until } = await grantNetwork(db, userId, g.months);
  const rec = opts.skipBookkeeping ? null : await recordPurchase(db, session.id, { userId, title: `${g.title} (live training)` });
  console.log("Community access granted via webhook", { userId, isNew, until: until?.toISOString() ?? "no end date" });

  // The email is best-effort: access is already saved.
  let emailError: string | null = null;
  try {
    let link = "https://www.safetytech.academy/learn?view=community";
    if (isNew) {
      const { data: l } = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: "https://www.safetytech.academy/learn/reset-password?welcome=1" } });
      const th = l?.properties?.hashed_token;
      if (th) link = `https://www.safetytech.academy/learn/auth/confirm?token_hash=${encodeURIComponent(th)}&type=recovery&next=${encodeURIComponent("/learn/reset-password?welcome=1")}`;
    }
    emailError = await sendCommunityPurchaseEmail({ to: email, name, title: g.title, link, isNew, until, receiptUrl: rec?.receiptUrl ?? null });
    if (emailError) console.error("community purchase email not sent:", emailError);
  } catch (e) { emailError = (e as Error).message; console.error("community purchase email error:", emailError); }
  return { ok: true as const, userId, isNew, until, emailError };
}
