// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, requireAdmin } from "../_shared/auth.ts";
import { stripeRequest } from "../_shared/stripe.ts";
import { fulfilTeamPurchase } from "../_shared/teams.ts";
import { ensureStripeProduct } from "../_shared/catalog.ts";
import { SITE, sendOwnerWelcome } from "../_shared/welcome.ts";

// Admin-only: companies, seats and seat invoices.
//   create_org      { name, owner_email, billing_email?, vat_id? }
//   update_org      { org_id, name?, billing_email?, vat_id? }
//   grant_seats     { org_id, course_id, seats, access_days?, note? }    (manual / paid offline)
//   create_invoice  { org_id, course_id, seats, access_days?, days_until_due?, po_number?, note?, send?, draft_only? }
//   sync_invoice    { stripe_invoice_id }   (re-reads Stripe; grants the seats if it is paid)
//   void_invoice    { stripe_invoice_id }

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...corsHeaders } });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Billing address as the form sends it, trimmed to what Stripe accepts. */
const cleanAddress = (a: any) => {
  if (!a || typeof a !== "object") return null;
  const f = (k: string, n = 120) => String(a[k] ?? "").trim().slice(0, n);
  const out = { line1: f("line1"), line2: f("line2"), city: f("city", 80), postal_code: f("postal_code", 20), country: f("country", 2).toUpperCase() };
  return out.line1 && out.city && out.postal_code && /^[A-Z]{2}$/.test(out.country) ? out : null;
};
const addressParams = (a: any, prefix = "address") => a ? Object.fromEntries(Object.entries({ line1: a.line1, line2: a.line2, city: a.city, postal_code: a.postal_code, country: a.country }).filter(([, v]) => v).map(([k, v]) => [`${prefix}[${k}]`, String(v)])) : {};
const uuid = (v: unknown) => (typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v) ? v : null);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    let admin;
    try { admin = await requireAdmin(req); } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const b = (await req.json().catch(() => ({}))) as any;
    const taxMode = ["inclusive", "exclusive"].includes(Deno.env.get("STRIPE_TAX_MODE") ?? "") ? Deno.env.get("STRIPE_TAX_MODE")! : null;
    const accessDaysOf = (v: unknown) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n > 0 ? Math.min(n, 3650) : null; };

    // ---------- is Stripe Tax ready? (read-only; decides whether VAT can be switched on) ----------
    if (b.action === "stripe_tax_status") {
      const out: Record<string, unknown> = { tax_mode: taxMode };
      try { const st = await stripeRequest<any>("GET", "/tax/settings"); out.settings = { status: st.status, head_office: st.head_office?.address?.country ?? null, default_tax_code: st.defaults?.tax_code ?? null, tax_behavior: st.defaults?.tax_behavior ?? null, pending: st.status_details?.pending?.missing_fields ?? null }; }
      catch (e) { out.settings_error = (e as Error).message; }
      try { const rg = await stripeRequest<any>("GET", "/tax/registrations", { status: "all", limit: "20" }); out.registrations = (rg.data ?? []).map((r: any) => ({ country: r.country, status: r.status, type: r.country_options?.[String(r.country).toLowerCase()]?.type ?? null })); }
      catch (e) { out.registrations_error = (e as Error).message; }
      try { const t = await stripeRequest<any>("GET", "/tax_ids", { "owner[type]": "self", limit: "20" }); out.account_tax_ids = (t.data ?? []).map((x: any) => ({ id: x.id, type: x.type, value: x.value, verification: x.verification?.status ?? null })); }
      catch (e) { out.tax_ids_error = (e as Error).message; }
      return json(out);
    }

    // ---------- read-only look at an unpaid checkout session (to confirm tax and invoice settings) ----------
    if (b.action === "inspect_session") {
      const id = String(b.id ?? "");
      if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) return json({ error: "Bad session id" }, 400);
      const x = await stripeRequest<any>("GET", `/checkout/sessions/${id}`);
      return json({ status: x.status, payment_status: x.payment_status, amount_subtotal: x.amount_subtotal, amount_total: x.amount_total, tax: x.total_details?.amount_tax ?? null, automatic_tax: x.automatic_tax?.enabled ?? null,
        invoice_creation: x.invoice_creation?.enabled ?? null, invoice_account_tax_ids: x.invoice_creation?.invoice_data?.account_tax_ids ?? null, allow_promotion_codes: x.allow_promotion_codes ?? null });
    }

    // ---------- register the seller's own VAT number with Stripe, so it prints on every invoice ----------
    if (b.action === "set_vat_id") {
      const value = String(b.value ?? "").replace(/\s+/g, "").toUpperCase();
      if (!/^GB\d{9}(\d{3})?$/.test(value)) return json({ error: "That doesn't look like a UK VAT number (GB followed by 9 digits)" }, 400);
      const existing = await stripeRequest<any>("GET", "/tax_ids", { "owner[type]": "self", limit: "20" });
      const have = (existing.data ?? []).find((x: any) => x.value === value);
      if (have) return json({ id: have.id, value, created: false });
      const t = await stripeRequest<any>("POST", "/tax_ids", { type: "gb_vat", value, "owner[type]": "self" });
      return json({ id: t.id, value: t.value, verification: t.verification?.status ?? null, created: true });
    }

    // ---------- create a company ----------
    if (b.action === "create_org") {
      const name = String(b.name ?? "").trim();
      const email = String(b.owner_email ?? "").trim().toLowerCase();
      if (name.length < 2 || name.length > 120) return json({ error: "Enter the company name" }, 400);
      if (!EMAIL_RE.test(email)) return json({ error: "Enter the manager's email address" }, 400);
      const billing = String(b.billing_email ?? "").trim().toLowerCase();
      let { data: p } = await db.from("profiles").select("id, full_name").ilike("email", email).maybeSingle();
      let created = false;
      if (!p) {
        const { data: c, error } = await db.auth.admin.createUser({ email, email_confirm: true });
        if (error || !c.user) return json({ error: error?.message ?? "Could not create the manager's account" }, 400);
        p = { id: c.user.id, full_name: null };
        created = true;
      }
      const { data: org, error: oErr } = await db.from("organisations").insert({
        name, billing_email: EMAIL_RE.test(billing) ? billing : email, vat_id: String(b.vat_id ?? "").trim().slice(0, 40) || null, billing_address: cleanAddress(b.address), created_by: admin.id,
      }).select("id").single();
      if (oErr) throw oErr;
      await db.from("organisation_members").upsert({ organisation_id: org.id, user_id: p.id, role: "owner" }, { onConflict: "organisation_id,user_id" });
      if (created) {
        const { data: link } = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: `${SITE}/learn/reset-password?welcome=1` } });
        const th = link?.properties?.hashed_token;
        if (th) {
          const url = `${SITE}/learn/auth/confirm?token_hash=${encodeURIComponent(th)}&type=recovery&next=${encodeURIComponent("/learn/reset-password?welcome=1")}`;
          await sendOwnerWelcome({ to: email, name: "", org: name, link: url });
          await db.from("profiles").update({ welcomed_at: new Date().toISOString() }).eq("id", p.id);
        }
      }
      return json({ org_id: org.id, owner_created: created });
    }

    const orgId = uuid(b.org_id);

    if (b.action === "update_org") {
      if (!orgId) return json({ error: "Missing company" }, 400);
      const patch: Record<string, string | null> = {};
      if (typeof b.name === "string" && b.name.trim().length >= 2) patch.name = b.name.trim().slice(0, 120);
      if (typeof b.billing_email === "string") patch.billing_email = EMAIL_RE.test(b.billing_email.trim()) ? b.billing_email.trim().toLowerCase() : null;
      if (typeof b.vat_id === "string") patch.vat_id = b.vat_id.trim().slice(0, 40) || null;
      const update: Record<string, unknown> = { ...patch };
      if (b.address !== undefined) update.billing_address = cleanAddress(b.address);
      const { error } = await db.from("organisations").update(update).eq("id", orgId);
      if (error) throw error;
      // Keep the Stripe customer (if there is one) in step, so the next invoice uses the new details.
      const { data: o } = await db.from("organisations").select("name, billing_email, billing_address, stripe_customer_id").eq("id", orgId).maybeSingle();
      if (o?.stripe_customer_id) {
        try { await stripeRequest("POST", `/customers/${o.stripe_customer_id}`, { name: o.name, ...(o.billing_email ? { email: o.billing_email } : {}), ...addressParams(o.billing_address) }); }
        catch (e) { console.error("customer not updated:", (e as Error).message); }
      }
      return json({ ok: true });
    }

    // ---------- add seats by hand ----------
    if (b.action === "grant_seats") {
      const courseId = uuid(b.course_id), seats = Math.floor(Number(b.seats));
      if (!orgId || !courseId) return json({ error: "Choose a company and a course" }, 400);
      if (!Number.isFinite(seats) || seats < 1 || seats > 5000) return json({ error: "Seats must be between 1 and 5000" }, 400);
      const { data: owner } = await db.from("organisation_members").select("user_id").eq("organisation_id", orgId).eq("role", "owner").limit(1).maybeSingle();
      const r = await fulfilTeamPurchase(db, {
        ref: `manual:${crypto.randomUUID()}`, buyerId: owner?.user_id ?? admin.id, courseId, seats, accessDays: accessDaysOf(b.access_days ?? 365),
        amountCents: 0, source: "manual", orgId, note: String(b.note ?? "").slice(0, 300) || undefined,
      });
      return json({ ok: true, org_id: r.orgId });
    }

    // ---------- raise a Stripe invoice for seats ----------
    if (b.action === "create_invoice") {
      const courseId = uuid(b.course_id), seats = Math.floor(Number(b.seats));
      if (!orgId || !courseId) return json({ error: "Choose a company and a course" }, 400);
      if (!Number.isFinite(seats) || seats < 1 || seats > 5000) return json({ error: "Seats must be between 1 and 5000" }, 400);
      const [{ data: org }, { data: course }, { data: price }] = await Promise.all([
        db.from("organisations").select("id, name, billing_email, vat_id, billing_address, stripe_customer_id").eq("id", orgId).maybeSingle(),
        db.from("courses").select("id, title, description, currency, stripe_product_id").eq("id", courseId).maybeSingle(),
        db.rpc("team_price", { _course: courseId, _seats: seats }),
      ]);
      const p = Array.isArray(price) ? price[0] : price;
      if (!org || !course || !p?.unit_cents) return json({ error: "That course can't be invoiced as seats" }, 400);
      if (!org.billing_email) return json({ error: "Add a billing email to the company first" }, 400);
      if (taxMode && !cleanAddress(org.billing_address)) return json({ error: "Add the company's billing address first (Edit company). Stripe needs it to work out VAT." }, 400);
      const accessDays = accessDaysOf(b.access_days ?? 365);
      const days = Math.min(Math.max(Math.floor(Number(b.days_until_due)) || 30, 1), 120);
      const currency = (course.currency || "GBP").toLowerCase();

      let customer = org.stripe_customer_id as string | null;
      if (!customer) {
        const c = await stripeRequest<{ id: string }>("POST", "/customers", { name: org.name, email: org.billing_email, "metadata[organisation_id]": org.id, ...addressParams(cleanAddress(org.billing_address)) });
        customer = c.id;
        await db.from("organisations").update({ stripe_customer_id: customer }).eq("id", org.id);
        const vat = String(org.vat_id ?? "").replace(/\s+/g, "").toUpperCase();
        if (/^GB\d{9,12}$/.test(vat)) {
          try { await stripeRequest("POST", `/customers/${customer}/tax_ids`, { type: "gb_vat", value: vat }); } catch (e) { console.error("tax id not added:", (e as Error).message); }
        }
      }

      const label = `${course.title}: ${seats} team seat${seats === 1 ? "" : "s"}${p.discount_pct ? ` (${p.discount_pct}% volume discount)` : ""}`;
      let invoiceId: string | null = null;
      try {
        const meta = { kind: "team", org_id: org.id, course_id: course.id, seats: String(seats), access_days: String(accessDays ?? 0), created_by: admin.id };
        const po = String(b.po_number ?? "").trim().slice(0, 60);
        const inv = await stripeRequest<any>("POST", "/invoices", {
          customer, collection_method: "send_invoice", days_until_due: String(days), auto_advance: "false", pending_invoice_items_behavior: "exclude", currency,
          ...(String(b.note ?? "").trim() ? { description: String(b.note).trim().slice(0, 500) } : {}),
          ...Object.fromEntries(Object.entries(meta).map(([k, v]) => [`metadata[${k}]`, v])),
          ...(po ? { "custom_fields[0][name]": "PO number", "custom_fields[0][value]": po } : {}),
          ...(taxMode ? { "automatic_tax[enabled]": "true" } : {}),
          ...(Deno.env.get("STRIPE_ACCOUNT_TAX_ID") ? { "account_tax_ids[0]": Deno.env.get("STRIPE_ACCOUNT_TAX_ID")! } : {}),
        });
        invoiceId = inv.id;
        const productId = await ensureStripeProduct(db, "courses", course);
        if (!productId) throw new Error("Could not set up the course in Stripe");
        await stripeRequest("POST", "/invoiceitems", {
          customer, invoice: inv.id, quantity: String(seats), description: label,
          "price_data[currency]": currency, "price_data[product]": productId, "price_data[unit_amount]": String(p.unit_cents),
          ...(taxMode ? { "price_data[tax_behavior]": taxMode } : {}),
        });
        if (b.draft_only) {
          const draft = await stripeRequest<any>("GET", `/invoices/${inv.id}`);
          return json({ draft: true, stripe_invoice_id: inv.id, total_cents: draft.total, subtotal_cents: draft.subtotal, tax_cents: draft.tax ?? 0, unit_cents: p.unit_cents, discount_pct: p.discount_pct, label });
        }
        let final = await stripeRequest<any>("POST", `/invoices/${inv.id}/finalize`);
        if (b.send !== false) final = await stripeRequest<any>("POST", `/invoices/${inv.id}/send`);
        await db.from("team_invoices").upsert({
          stripe_invoice_id: final.id, organisation_id: org.id, course_id: course.id, seats, access_days: accessDays, amount_cents: final.total ?? 0, currency: currency.toUpperCase(),
          status: final.status === "paid" ? "paid" : "open", number: final.number ?? null, hosted_url: final.hosted_invoice_url ?? null, pdf_url: final.invoice_pdf ?? null,
          due_date: final.due_date ? new Date(final.due_date * 1000).toISOString().slice(0, 10) : null, po_number: po || null, created_by: admin.id,
        });
        return json({ stripe_invoice_id: final.id, number: final.number, hosted_url: final.hosted_invoice_url, sent: b.send !== false, total_cents: final.total });
      } catch (e) {
        // Don't leave a half-built draft behind.
        if (invoiceId) { try { await stripeRequest("DELETE", `/invoices/${invoiceId}`); } catch { /* already finalised or gone */ } }
        throw e;
      }
    }

    // ---------- delete a company (admin cleanup). Enrolments stay; they just stop being on a seat. ----------
    if (b.action === "delete_org") {
      if (!orgId) return json({ error: "Missing company" }, 400);
      const { data: org } = await db.from("organisations").select("stripe_customer_id").eq("id", orgId).maybeSingle();
      const { count: paid } = await db.from("team_invoices").select("stripe_invoice_id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("status", "paid");
      if ((paid ?? 0) > 0 && b.force !== true) return json({ error: "This company has paid invoices. Keep it for your records." }, 400);
      if (org?.stripe_customer_id) { try { await stripeRequest("DELETE", `/customers/${org.stripe_customer_id}`); } catch (e) { console.error("customer not deleted:", (e as Error).message); } }
      const { error } = await db.from("organisations").delete().eq("id", orgId);
      if (error) throw error;
      return json({ ok: true });
    }

    // ---------- clean up a draft made by draft_only (for previews and tests) ----------
    if (b.action === "discard_draft") {
      const id = String(b.stripe_invoice_id ?? "");
      if (!/^in_[A-Za-z0-9]+$/.test(id)) return json({ error: "Bad invoice id" }, 400);
      const inv = await stripeRequest<any>("GET", `/invoices/${id}`);
      if (inv.status !== "draft") return json({ error: "Only drafts can be discarded" }, 400);
      await stripeRequest("DELETE", `/invoices/${id}`);
      return json({ ok: true });
    }

    // ---------- re-read an invoice from Stripe; grant the seats if it is paid ----------
    if (b.action === "sync_invoice" || b.action === "void_invoice") {
      const id = String(b.stripe_invoice_id ?? "");
      if (!/^in_[A-Za-z0-9]+$/.test(id)) return json({ error: "Bad invoice id" }, 400);
      let inv = await stripeRequest<any>("GET", `/invoices/${id}`);
      if (b.action === "void_invoice") {
        if (inv.status !== "open") return json({ error: "Only an open invoice can be voided" }, 400);
        inv = await stripeRequest<any>("POST", `/invoices/${id}/void`);
      }
      const status = ["draft", "open", "paid", "void", "uncollectible"].includes(inv.status) ? inv.status : "open";
      await db.from("team_invoices").update({ status, hosted_url: inv.hosted_invoice_url ?? null, pdf_url: inv.invoice_pdf ?? null, number: inv.number ?? null, ...(status === "paid" ? { paid_at: new Date().toISOString() } : {}) }).eq("stripe_invoice_id", id);
      let granted = false;
      if (status === "paid" && inv.metadata?.kind === "team") {
        const r = await fulfilTeamPurchase(db, {
          ref: inv.id, buyerId: inv.metadata.created_by, courseId: inv.metadata.course_id, seats: Number(inv.metadata.seats), accessDays: Number(inv.metadata.access_days) > 0 ? Number(inv.metadata.access_days) : null,
          amountCents: inv.amount_paid ?? inv.total ?? 0, source: "invoice", orgId: inv.metadata.org_id, note: inv.number ? `Invoice ${inv.number}` : undefined,
        });
        granted = r.granted;
      }
      return json({ status, granted });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("admin-teams:", e);
    return json({ error: e instanceof Error ? e.message : "Something went wrong" }, 500);
  }
});
