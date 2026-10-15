import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, requireAdmin } from "../_shared/auth.ts";
import { htmlToText, resendSend, sleep } from "../_shared/emailText.ts";
import { purchaseEmailHtml, sendPurchaseEmail } from "../_shared/purchaseEmail.ts";
import { stripeRequest } from "../_shared/stripe.ts";
import { createWelcomeToken } from "../_shared/welcomeToken.ts";

// Receipts and mail checks.
//   admin   backfill_invoices            attach Stripe invoice links to purchases that have none (up to 100 a run)
//   admin   test_email { purchase_id }   the purchase email, built from a real purchase, sent to the admin only
//   admin   resend_email { purchase_id, confirm: true }   send that email to the buyer (needs confirm)
//   admin   suppression_status { email }   is this address on Resend's block list, and why (our own domains only)
//   admin   suppression_remove { email }    take it off the block list (our own domains only)
//   admin or cron   probe_inbox          send a test message to our own hello@ address and see whether it is accepted;
//                                         the result is stored for the Health page. Run daily by the scheduler.

const SITE = "https://www.safetytech.academy";
const FROM = "SafetyTech Academy <hello@safetytech.academy>";
const PROBE_TO = "hello@safetytech.academy";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
function safeEqual(a: string, b: string) {
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const body = await req.json().catch(() => ({})) as { action?: string; purchase_id?: string; confirm?: boolean; email?: string };
  const action = body.action ?? "";
  const cron = safeEqual(req.headers.get("x-cron-secret") ?? "", Deno.env.get("LIFECYCLE_CRON_SECRET") ?? "");
  let adminEmail: string | null = null;
  if (!cron) {
    try { adminEmail = (await requireAdmin(req)).email ?? null; } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }
  }
  if (cron && action !== "probe_inbox") return json({ error: "Admins only" }, 403);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const resendKey = Deno.env.get("RESEND_API_KEY");

  // ---------- Resend block list (our own addresses only) ----------
  if (action === "suppression_status" || action === "suppression_remove") {
    const addr = String(body.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@(safetytech\.academy|safetyacademy\.tech)$/.test(addr)) return json({ error: "Only addresses on our own domains" }, 400);
    if (!resendKey) return json({ error: "RESEND_API_KEY missing" }, 500);
    const r = await fetch(`https://api.resend.com/suppressions/${encodeURIComponent(addr)}`, { method: action === "suppression_remove" ? "DELETE" : "GET", headers: { Authorization: `Bearer ${resendKey}` } });
    const j = await r.json().catch(() => ({})) as Record<string, unknown>;
    if (r.status === 404) return json({ email: addr, on_block_list: false });
    if (!r.ok) return json({ error: String(j.message ?? `Resend answered ${r.status}`), resend_status: r.status }, 502);
    return json(action === "suppression_remove" ? { email: addr, removed: true } : { email: addr, on_block_list: true, origin: j.origin ?? null, reason: j.reason ?? null, since: j.created_at ?? null });
  }

  // ---------- inbox probe ----------
  if (action === "probe_inbox") {
    if (!resendKey) return json({ error: "RESEND_API_KEY missing" }, 500);
    const html = `<p>Automatic check that ${PROBE_TO} can receive mail. Nothing to do. If you are reading this in the inbox, it works.</p>`;
    const res = await resendSend(resendKey, { from: FROM, to: [PROBE_TO], subject: "Inbox check (automatic)", html, text: htmlToText(html) });
    const sent = await res.json().catch(() => ({})) as { id?: string; message?: string };
    if (!res.ok || !sent.id) {
      await db.from("mail_probes").insert({ address: PROBE_TO, ok: false, last_event: "not_sent", detail: String(sent.message ?? `Resend answered ${res.status}`).slice(0, 300) });
      return json({ ok: false, event: "not_sent", detail: sent.message ?? res.status });
    }
    // Resend reports what the receiving server said: delivered, bounced, delivery_delayed...
    let event = "queued";
    for (let i = 0; i < 8; i++) {
      await sleep(3000);
      const r = await fetch(`https://api.resend.com/emails/${sent.id}`, { headers: { Authorization: `Bearer ${resendKey}` } }).catch(() => null);
      const j = r && r.ok ? await r.json().catch(() => ({})) : {};
      event = (j as { last_event?: string }).last_event ?? event;
      if (["delivered", "bounced", "complained", "failed"].includes(event)) break;
    }
    const ok = event === "delivered";
    await db.from("mail_probes").insert({ address: PROBE_TO, resend_id: sent.id, last_event: event, ok, detail: ok ? "Accepted by the mail server"
      : event === "suppressed" ? "Resend has hello@ on its suppression list because it bounced before. Make sure the mailbox exists, then remove the address from Resend's suppression list"
      : event === "queued" || event === "sent" || event === "delivery_delayed" ? "No answer yet from the mail server"
      : "The mail server refused it: the mailbox probably doesn't exist" });
    return json({ ok, event });
  }

  // ---------- backfill ----------
  if (action === "backfill_invoices") {
    const { data: rows } = await db.from("course_purchases").select("id, stripe_session_id").is("invoice_url", null).not("stripe_session_id", "is", null).eq("status", "paid").limit(100);
    let filled = 0, none = 0, failed = 0;
    for (const r of rows ?? []) {
      try {
        const s = await stripeRequest<any>("GET", `/checkout/sessions/${r.stripe_session_id}`, { "expand[0]": "invoice" });
        const inv = s.invoice && typeof s.invoice === "object" ? s.invoice : null;
        if (inv?.hosted_invoice_url) { await db.from("course_purchases").update({ invoice_url: inv.hosted_invoice_url, invoice_pdf: inv.invoice_pdf ?? null }).eq("id", r.id); filled++; }
        else none++;
      } catch { failed++; }
      await sleep(250);
    }
    return json({ checked: (rows ?? []).length, filled, no_invoice_in_stripe: none, failed });
  }

  // ---------- test / resend the purchase email ----------
  if (action === "test_email" || action === "resend_email") {
    const id = String(body.purchase_id ?? "");
    const { data: p } = await db.from("course_purchases").select("id, user_id, course_title, amount_cents, currency, tax_cents, receipt_url, invoice_url, stripe_session_id").eq("id", id).maybeSingle();
    if (!p) return json({ error: "Purchase not found" }, 404);
    const { data: au } = await db.auth.admin.getUserById(p.user_id);
    const buyer = au?.user;
    if (!buyer?.email) return json({ error: "The buyer's account has no email" }, 404);
    const { data: prof } = await db.from("profiles").select("full_name").eq("id", p.user_id).maybeSingle();
    const neverSignedIn = !buyer.last_sign_in_at;
    const link = neverSignedIn ? `${SITE}/learn/welcome?t=${encodeURIComponent(await createWelcomeToken(db, p.user_id))}` : `${SITE}/learn/auth`;
    const input = { to: buyer.email, name: prof?.full_name ?? "", course: p.course_title, link, isNew: neverSignedIn, receiptUrl: p.receipt_url, invoiceUrl: p.invoice_url, amount: p.amount_cents / 100, currency: p.currency, tax: (p.tax_cents ?? 0) / 100 };
    if (action === "test_email") {
      if (!adminEmail) return json({ error: "Admins only" }, 403);
      const html = purchaseEmailHtml(input);
      const r = await resendSend(resendKey ?? "", { from: FROM, reply_to: "hello@safetytech.academy", to: [adminEmail], subject: `[Test] Your ${p.course_title} is ready`, html, text: htmlToText(html) });
      return json({ ok: r.ok, sent_to: adminEmail });
    }
    if (body.confirm !== true) return json({ error: "Send needs confirm: true" }, 400);
    const day = new Date().toISOString().slice(0, 10);
    const { error: claim } = await db.from("email_log").insert({ user_id: p.user_id, kind: "purchase_resend", dedupe_key: `${p.id}:${day}`, status: "sending" });
    if (claim) return json({ error: "Already resent today" }, 409);
    const err = await sendPurchaseEmail(input);
    await db.from("email_log").update(err ? { status: "failed", error: String(err).slice(0, 300) } : { status: "sent" }).eq("user_id", p.user_id).eq("kind", "purchase_resend").eq("dedupe_key", `${p.id}:${day}`);
    return json({ ok: !err, error: err, sent_to: buyer.email.replace(/^(.).*(@.*)$/, "$1***$2") });
  }

  return json({ error: "Unknown action" }, 400);
});
