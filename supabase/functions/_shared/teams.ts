// deno-lint-ignore-file no-explicit-any
// Turning a paid team purchase (card checkout or an invoice) into seats. Idempotent:
// the same Stripe reference never grants twice, so the webhook and the browser's
// return trip can both call it.
import { sendSeatsReady, SITE } from "./welcome.ts";

export interface TeamFulfilment {
  ref: string;                 // Stripe session id or invoice id
  buyerId: string;             // the person who bought (becomes owner of a new company)
  courseId: string;
  seats: number;
  accessDays: number | null;
  amountCents: number;
  source: "card" | "invoice" | "manual";
  orgId?: string | null;
  orgName?: string | null;
  note?: string;
}

export async function fulfilTeamPurchase(db: any, f: TeamFulfilment): Promise<{ granted: boolean; orgId: string }> {
  let orgId = f.orgId ?? null;
  if (orgId) {
    const { data: o } = await db.from("organisations").select("id").eq("id", orgId).maybeSingle();
    if (!o) orgId = null;
  }
  if (!orgId) {
    // Idempotency for the "new company" case: a retried event must find the company it already made.
    const { data: prior } = await db.from("organisation_seats").select("organisation_id").eq("reference", f.ref).maybeSingle();
    if (prior) return { granted: false, orgId: prior.organisation_id };
    const { data: buyer } = await db.from("profiles").select("email, organisation").eq("id", f.buyerId).maybeSingle();
    const name = (f.orgName || buyer?.organisation || "Your company").trim().slice(0, 120);
    const { data: created, error } = await db.from("organisations").insert({ name: name.length >= 2 ? name : "Your company", billing_email: buyer?.email ?? null, created_by: f.buyerId }).select("id").single();
    if (error) throw error;
    orgId = created.id as string;
    await db.from("organisation_members").upsert({ organisation_id: orgId, user_id: f.buyerId, role: "owner" }, { onConflict: "organisation_id,user_id" });
  }
  const { data: granted, error } = await db.rpc("grant_team_seats", {
    _org: orgId, _course: f.courseId, _seats: f.seats, _access_days: f.accessDays, _source: f.source, _ref: f.ref, _amount: f.amountCents, _by: f.buyerId, _note: f.note ?? null,
  });
  if (error) throw error;
  if (granted) {
    // Tell the people who run the company that the seats are ready.
    try {
      const [{ data: org }, { data: course }, { data: managers }] = await Promise.all([
        db.from("organisations").select("name").eq("id", orgId).maybeSingle(),
        db.from("courses").select("title").eq("id", f.courseId).maybeSingle(),
        db.from("organisation_members").select("user_id").eq("organisation_id", orgId).in("role", ["owner", "manager"]),
      ]);
      for (const m of managers ?? []) {
        const { data: p } = await db.from("profiles").select("email, full_name").eq("id", m.user_id).maybeSingle();
        if (p?.email) await sendSeatsReady({ to: p.email, name: p.full_name ?? "", org: org?.name ?? "your company", course: course?.title ?? "your course", seats: f.seats });
      }
    } catch (e) { console.error("seats-ready email failed", (e as Error).message); }
  }
  return { granted: !!granted, orgId: orgId! };
}

/** Give a buyer every course in a bundle (lifetime, like a single purchase). Existing active access is kept. */
export async function fulfilBundle(db: any, userId: string, bundleId: string): Promise<number> {
  const { data: items } = await db.from("bundle_courses").select("course_id").eq("bundle_id", bundleId);
  let n = 0;
  for (const it of items ?? []) {
    const { data: ex } = await db.from("enrollments").select("id, status, expires_at").eq("user_id", userId).eq("course_id", it.course_id).maybeSingle();
    const active = ex && ex.status === "active" && (!ex.expires_at || new Date(ex.expires_at) > new Date());
    if (active && !ex.expires_at) continue;
    const { error } = await db.from("enrollments").upsert({ user_id: userId, course_id: it.course_id, status: "active", expires_at: null }, { onConflict: "user_id,course_id" });
    if (error) throw error;
    n++;
  }
  return n;
}

export const TEAM_URL = `${SITE}/learn?view=team`;
