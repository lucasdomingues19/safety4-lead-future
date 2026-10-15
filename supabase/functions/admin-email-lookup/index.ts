import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, requireAdmin } from "../_shared/auth.ts";

// Admin-only, read-only: "did this person get our email?" for one address.
//   POST { email, days? }  ->  { sent: [{ subject, from, at, status }], purchases: [{ ..., stripe }] }
// Looks the address up in Resend's send log (recent sends and what happened to each: delivered, bounced,
// complained, ...) and, for any purchase by that address, in Stripe (was a receipt emailed, and where to).
// Returns nothing about anyone but the address asked about.

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try { await requireAdmin(req); } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }

  const body = await req.json().catch(() => ({})) as { email?: string; days?: number; report?: boolean; recover_contact?: boolean };

  // ---- recover website contact-form messages that never reached hello@ (bounced or blocked) ----
  if (body.recover_contact === true) {
    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) return json({ error: "Resend isn't set up" }, 500);
    const cutoff = Date.now() - Math.min(Math.max(Number(body.days) || 14, 1), 30) * 86_400_000;
    const lost: { id: string; at: string; event: string; subject: string }[] = [];
    let after: string | undefined;
    for (let page = 0; page < 40; page++) {
      const r = await fetch(`https://api.resend.com/emails?limit=100${after ? `&after=${after}` : ""}`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000) }).catch(() => null);
      if (!r || !r.ok) break;
      const j = await r.json().catch(() => ({}));
      const rows = (j.data ?? []) as { id: string; to: string[] | string; subject: string; created_at: string; last_event: string }[];
      for (const m of rows) {
        const to = (Array.isArray(m.to) ? m.to : [m.to]).map((x) => String(x).toLowerCase());
        if (/contact form submission/i.test(m.subject ?? "") && to.includes("hello@safetytech.academy") && !["delivered", "opened", "clicked"].includes(m.last_event)) lost.push({ id: m.id, at: m.created_at, event: m.last_event, subject: m.subject });
      }
      if (!j.has_more || !rows.length || new Date(rows[rows.length - 1].created_at.replace(" ", "T")).getTime() < cutoff) break;
      after = rows[rows.length - 1].id;
      await sleep(600);
    }
    const messages = [];
    for (const m of lost) {
      await sleep(600);
      const r = await fetch(`https://api.resend.com/emails/${m.id}`, { headers: { Authorization: `Bearer ${key}` } }).catch(() => null);
      const j = r && r.ok ? await r.json().catch(() => ({})) : {};
      const text = String((j as { text?: string; html?: string }).text ?? (j as { html?: string }).html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      messages.push({ at: m.at, event: m.event, subject: m.subject, reply_to: (j as { reply_to?: unknown }).reply_to ?? null, body: text.slice(0, 1500) });
    }
    return json({ found: messages.length, messages });
  }

  // ---- delivery report: how every recent email ended, and who did NOT get theirs (recipients masked) ----
  if (body.report === true) {
    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) return json({ error: "Resend isn't set up" }, 500);
    const cutoff = Date.now() - Math.min(Math.max(Number(body.days) || 7, 1), 30) * 86_400_000;
    const byEvent: Record<string, number> = {}, bySubject: Record<string, Record<string, number>> = {};
    const problems: { subject: string; to: string; event: string; at: string }[] = [];
    let scanned = 0, oldest = "", after: string | undefined, note: string | null = null;
    const mask = (a: string) => a.replace(/^(.{2}).*(@.*)$/, "$1***$2");
    for (let page = 0; page < 40; page++) {
      const r = await fetch(`https://api.resend.com/emails?limit=100${after ? `&after=${after}` : ""}`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000) }).catch(() => null);
      if (!r || !r.ok) { note = `Resend answered ${r?.status ?? "no response"}`; break; }
      const j = await r.json().catch(() => ({}));
      const rows = (j.data ?? []) as { id: string; to: string[] | string; subject: string; created_at: string; last_event: string }[];
      for (const m of rows) {
        scanned++; oldest = m.created_at;
        const ev = m.last_event ?? "unknown";
        byEvent[ev] = (byEvent[ev] ?? 0) + 1;
        const subj = (m.subject ?? "").replace(/[A-Z][a-z]+ [A-Z][a-z]+(?= is ready| \()/g, "…").slice(0, 60);
        (bySubject[subj] ??= {})[ev] = ((bySubject[subj] ??= {})[ev] ?? 0) + 1;
        if (!["delivered", "opened", "clicked"].includes(ev)) problems.push({ subject: m.subject, to: mask((Array.isArray(m.to) ? m.to[0] : m.to) ?? ""), event: ev, at: m.created_at });
      }
      if (!j.has_more || !rows.length || new Date(rows[rows.length - 1].created_at.replace(" ", "T")).getTime() < cutoff) break;
      after = rows[rows.length - 1].id;
      await sleep(600);
    }
    return json({ scanned, oldest_seen: oldest, by_event: byEvent, not_delivered: problems.slice(0, 60), not_delivered_count: problems.length, note });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: "Enter a full email address" }, 400);
  const days = Math.min(Math.max(Number(body.days) || 7, 1), 30);
  const since = Date.now() - days * 86_400_000;

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // ---- Resend: page back through recent sends until we pass the cutoff ----
  const sent: { subject: string; from: string; at: string; status: string }[] = [];
  let scanned = 0, resendNote: string | null = null;
  if (!resendKey) resendNote = "Resend isn't set up";
  else {
    let after: string | undefined;
    for (let page = 0; page < 20; page++) {
      const r = await fetch(`https://api.resend.com/emails?limit=100${after ? `&after=${after}` : ""}`, { headers: { Authorization: `Bearer ${resendKey}` }, signal: AbortSignal.timeout(10000) }).catch(() => null);
      if (!r || !r.ok) { resendNote = `Resend answered ${r?.status ?? "no response"} after ${scanned} emails`; break; }
      const j = await r.json().catch(() => ({}));
      const rows = (j.data ?? []) as { id: string; to: string[] | string; from: string; subject: string; created_at: string; last_event: string }[];
      for (const m of rows) {
        scanned++;
        const to = (Array.isArray(m.to) ? m.to : [m.to]).map((x) => String(x).toLowerCase());
        if (to.some((x) => x === email || x.endsWith(`<${email}>`))) sent.push({ subject: m.subject, from: m.from, at: m.created_at, status: m.last_event });
      }
      const oldest = rows.length ? new Date(rows[rows.length - 1].created_at.replace(" ", "T")).getTime() : 0;
      if (!j.has_more || !rows.length || oldest < since) break;
      after = rows[rows.length - 1].id;
      await sleep(600);
    }
  }

  // ---- purchases by this address, and what Stripe did about receipts ----
  const { data: prof } = await db.from("profiles").select("id").ilike("email", email).maybeSingle();
  const purchases: Record<string, unknown>[] = [];
  if (prof?.id) {
    const { data: rows } = await db.from("course_purchases").select("course_title, amount_cents, currency, status, purchased_at, stripe_payment_intent, receipt_url, invoice_url, tax_cents").eq("user_id", prof.id).order("purchased_at", { ascending: false }).limit(5);
    for (const p of rows ?? []) {
      let stripe: Record<string, unknown> | null = null;
      if (stripeKey && p.stripe_payment_intent) {
        const r = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(p.stripe_payment_intent)}?expand[]=latest_charge`, { headers: { Authorization: `Bearer ${stripeKey}` }, signal: AbortSignal.timeout(10000) }).catch(() => null);
        const j = r && r.ok ? await r.json().catch(() => null) : null;
        const ch = j?.latest_charge;
        if (ch) stripe = { charge_status: ch.status, paid: ch.paid, refunded: ch.refunded, receipt_email: ch.receipt_email ?? null, billing_email: ch.billing_details?.email ?? null, has_receipt_page: !!ch.receipt_url };
        else stripe = { error: "Couldn't read the payment from Stripe" };
      }
      purchases.push({ course: p.course_title, amount: p.amount_cents / 100, currency: p.currency, vat: (p.tax_cents ?? 0) / 100, status: p.status, at: p.purchased_at, receipt_link_saved: !!p.receipt_url, invoice_link_saved: !!p.invoice_url, stripe });
    }
  }

  return json({ email, days, emails_scanned: scanned, resend_note: resendNote, sent, account_found: !!prof?.id, purchases });
});
