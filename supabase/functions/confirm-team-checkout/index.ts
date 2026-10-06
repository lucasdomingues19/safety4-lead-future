// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { stripeRequest } from "../_shared/stripe.ts";
import { fulfilTeamPurchase } from "../_shared/teams.ts";
import { recordPurchase } from "../_shared/purchases.ts";

// The browser comes back from Stripe with a session id; this grants the seats straight
// away (the webhook does the same job as a backup, and both are safe to repeat).

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...corsHeaders } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Please sign in first" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
    if (!u?.user) return json({ error: "Please sign in first" }, 401);

    const { session_id } = (await req.json().catch(() => ({}))) as { session_id?: string };
    if (!session_id || !/^cs_[A-Za-z0-9_]+$/.test(session_id)) return json({ error: "Missing session" }, 400);
    const session = await stripeRequest<any>("GET", `/checkout/sessions/${session_id}`);
    const m = session.metadata ?? {};
    if (m.kind !== "team" || m.user_id !== u.user.id) return json({ error: "That payment isn't yours" }, 403);
    if (session.payment_status !== "paid") return json({ status: "pending" });

    const r = await fulfilTeamPurchase(db, {
      ref: session.id, buyerId: m.user_id, courseId: m.course_id, seats: Number(m.seats), accessDays: Number(m.access_days) > 0 ? Number(m.access_days) : null,
      amountCents: session.amount_total ?? 0, source: "card", orgId: m.org_id ?? null, orgName: m.org_name ?? null,
    });
    const { data: course } = await db.from("courses").select("title").eq("id", m.course_id).maybeSingle();
    await recordPurchase(db, session.id, { userId: m.user_id, courseId: m.course_id, organisationId: r.orgId, quantity: Number(m.seats), title: `${course?.title ?? "Course"} (team seats)` });
    return json({ status: "paid", org_id: r.orgId, seats: Number(m.seats) });
  } catch (e) {
    console.error("confirm-team-checkout:", e);
    return json({ error: e instanceof Error ? e.message : "Could not confirm the payment" }, 500);
  }
});
