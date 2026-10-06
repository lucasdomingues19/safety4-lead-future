import { useCallback, useEffect, useState } from "react";
import { Building2, ChevronDown, ChevronRight, ExternalLink, FileText, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/invoke";
import { LmsTeam } from "@/components/learn/LmsTeam";
import { PanelHeader, Spinner, adminFont, input, panel } from "./adminUi";

// Admin > Teams: companies, their seats, the seat invoices, and team pricing per course.

interface Org { id: string; name: string; billing_email: string | null; vat_id: string | null; created_at: string; owner: string | null; seats: number; used: number }
interface Course { id: string; title: string; price_cents: number; currency: string | null; published: boolean; team_enabled: boolean; team_tiers: { min: number; pct: number }[] }
interface Invoice { stripe_invoice_id: string; organisation_id: string; course_id: string; seats: number; amount_cents: number; currency: string; status: string; number: string | null; hosted_url: string | null; due_date: string | null; po_number: string | null; created_at: string }
const money = (c: number, cur = "GBP") => new Intl.NumberFormat("en-GB", { style: "currency", currency: cur }).format(c / 100);
const btn = (primary = false): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 6, border: primary ? 0 : "1px solid #e2e8f0", borderRadius: 8, background: primary ? "#3434ff" : "#fff", color: primary ? "#fff" : "#0b0b2c", padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" });

export function LmsAdminTeams() {
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | { kind: "org" } | { kind: "seats" | "invoice"; org: Org }>(null);

  const load = useCallback(async () => {
    const [{ data: o }, { data: c }, { data: inv }, { data: mem }] = await Promise.all([
      supabase.from("organisations").select("id, name, billing_email, vat_id, created_at").order("created_at", { ascending: false }),
      supabase.from("courses").select("id, title, price_cents, currency, published, team_enabled, team_tiers").order("title"),
      supabase.from("team_invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("organisation_members").select("organisation_id, role, profiles(email)").eq("role", "owner"),
    ]);
    const owners = new Map((mem ?? []).map((m) => [m.organisation_id, (m.profiles as { email?: string } | null)?.email ?? null]));
    const rows: Org[] = [];
    for (const org of o ?? []) {
      const { data: sum } = await supabase.rpc("org_seat_summary", { _org: org.id });
      rows.push({ ...org, owner: owners.get(org.id) ?? null, seats: (sum ?? []).reduce((n, s) => n + s.seats, 0), used: (sum ?? []).reduce((n, s) => n + s.used, 0) });
    }
    setOrgs(rows);
    setCourses(((c ?? []) as unknown as Course[]).map((x) => ({ ...x, team_tiers: Array.isArray(x.team_tiers) ? x.team_tiers : [] })));
    setInvoices((inv ?? []) as Invoice[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const act = async (name: string, body: Record<string, unknown>, ok: string) => {
    try { await invokeFunction(name, body); toast.success(ok); await load(); } catch (e) { toast.error(e instanceof Error ? e.message : "That didn't work"); }
  };
  const del = async (o: Org) => {
    if (!window.confirm(`Delete ${o.name}? Their seats and invoices records go. People keep any course access they already have.`)) return;
    await act("admin-teams", { action: "delete_org", org_id: o.id }, "Company deleted");
  };

  if (!orgs) return <Spinner />;
  const openInv = invoices.filter((i) => i.status === "open");

  return (
    <div style={{ marginTop: 28, fontFamily: adminFont, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 20 }}>
      <div style={panel}>
        <PanelHeader title="Companies" sub={`${orgs.length} compan${orgs.length === 1 ? "y" : "ies"} · ${openInv.length} unpaid invoice${openInv.length === 1 ? "" : "s"}. Companies can also buy seats themselves by card.`}
          right={<button style={btn(true)} onClick={() => setDialog({ kind: "org" })}><Plus size={14} /> New company</button>} />
        {orgs.length === 0 && <p style={{ margin: "0 28px 24px", fontSize: 14, color: "#69697b" }}>No companies yet. Create one, add seats, or send an invoice.</p>}
        {orgs.map((o) => {
          const isOpen = open === o.id;
          const myInv = invoices.filter((i) => i.organisation_id === o.id);
          return (
            <div key={o.id} style={{ borderTop: "1px solid #f1f4f8" }}>
              <div style={{ padding: "14px 24px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <button onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen} aria-label={`${isOpen ? "Hide" : "Show"} ${o.name}`} style={{ border: 0, background: "none", cursor: "pointer", color: "#0b0b2c", padding: 0, display: "flex" }}>{isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><Building2 size={16} color="#3434ff" /> {o.name}</div>
                  <div style={{ fontSize: 12.5, color: "#94a3b8" }}>{o.owner ?? "No manager"}{o.vat_id ? ` · VAT ${o.vat_id}` : ""}</div>
                </div>
                <div style={{ fontSize: 13, color: "#69697b", fontVariantNumeric: "tabular-nums" }}><strong style={{ color: "#0b0b2c" }}>{o.used}</strong> of {o.seats} seats used</div>
                <button style={btn()} onClick={() => setDialog({ kind: "seats", org: o })}>Add seats</button>
                <button style={btn()} onClick={() => setDialog({ kind: "invoice", org: o })}><FileText size={14} /> Invoice seats</button>
                <button style={{ ...btn(), color: "#b91c1c" }} onClick={() => del(o)} aria-label={`Delete ${o.name}`}><Trash2 size={14} /></button>
              </div>
              {isOpen && (
                <div style={{ padding: "4px 24px 22px" }}>
                  {myInv.length > 0 && (
                    <div style={{ marginBottom: 18, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                      {myInv.map((i) => (
                        <div key={i.stripe_invoice_id} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", padding: "10px 14px", borderTop: "1px solid #f1f4f8", fontSize: 13 }}>
                          <strong>{i.number ?? "Draft"}</strong>
                          <span style={{ color: "#69697b" }}>{i.seats} seats · {money(i.amount_cents, i.currency)}{i.po_number ? ` · PO ${i.po_number}` : ""}{i.due_date ? ` · due ${new Date(i.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}</span>
                          <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 800, background: i.status === "paid" ? "#ecffd1" : i.status === "open" ? "#fff4e5" : "#f1f5f9", color: i.status === "paid" ? "#3f6212" : i.status === "open" ? "#9a3412" : "#475569" }}>{i.status}</span>
                          <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                            {i.hosted_url && <a href={i.hosted_url} target="_blank" rel="noopener noreferrer" style={{ ...btn(), textDecoration: "none" }}><ExternalLink size={13} /> Open</a>}
                            {i.status === "open" && <button style={btn()} onClick={() => act("admin-teams", { action: "sync_invoice", stripe_invoice_id: i.stripe_invoice_id }, "Checked with Stripe")}><RefreshCw size={13} /> Check payment</button>}
                            {i.status === "open" && <button style={{ ...btn(), color: "#b91c1c" }} onClick={() => window.confirm("Void this invoice? It can't be paid afterwards.") && act("admin-teams", { action: "void_invoice", stripe_invoice_id: i.stripe_invoice_id }, "Invoice voided")}>Void</button>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <LmsTeam orgId={o.id} embedded />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TeamPricing courses={courses} onSaved={load} />
      {dialog?.kind === "org" && <OrgDialog onClose={() => setDialog(null)} onDone={() => { setDialog(null); void load(); }} />}
      {dialog && dialog.kind !== "org" && <SeatsDialog kind={dialog.kind} org={dialog.org} courses={courses.filter((c) => c.price_cents > 0)} onClose={() => setDialog(null)} onDone={() => { setDialog(null); void load(); }} />}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div role="dialog" aria-label={title} onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(11,11,44,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(520px, 100%)", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 18, padding: 26, boxShadow: "0 30px 80px rgba(11,11,44,.3)" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 19, fontWeight: 800 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{label}<div style={{ marginTop: 5 }}>{children}</div></label>;

function OrgDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ name: "", owner_email: "", billing_email: "", vat_id: "" });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await invokeFunction("admin-teams", { action: "create_org", ...f }); toast.success("Company created"); onDone(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't create it"); setBusy(false); }
  };
  return (
    <Modal title="New company" onClose={onClose}>
      <Field label="Company name"><input style={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Acme Safety Ltd" /></Field>
      <Field label="Manager's email (they run the team)"><input style={input} type="email" value={f.owner_email} onChange={(e) => setF({ ...f, owner_email: e.target.value })} placeholder="ana@acme.com" /></Field>
      <Field label="Billing email for invoices (optional)"><input style={input} type="email" value={f.billing_email} onChange={(e) => setF({ ...f, billing_email: e.target.value })} placeholder="accounts@acme.com" /></Field>
      <Field label="VAT number (optional)"><input style={input} value={f.vat_id} onChange={(e) => setF({ ...f, vat_id: e.target.value })} placeholder="GB123456789" /></Field>
      <p style={{ fontSize: 12.5, color: "#69697b", margin: "0 0 14px" }}>If the manager is new, they get an email to set a password.</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}><button style={btn()} onClick={onClose}>Cancel</button><button style={btn(true)} disabled={busy || f.name.trim().length < 2 || !f.owner_email.includes("@")} onClick={submit}>{busy && <Loader2 size={14} className="animate-spin" />} Create company</button></div>
    </Modal>
  );
}

function SeatsDialog({ kind, org, courses, onClose, onDone }: { kind: "seats" | "invoice"; org: Org; courses: Course[]; onClose: () => void; onDone: () => void }) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [seats, setSeats] = useState(10);
  const [days, setDays] = useState(365);
  const [due, setDue] = useState(30);
  const [po, setPo] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const course = courses.find((c) => c.id === courseId);
  const pct = course ? course.team_tiers.reduce((p, t) => (seats >= t.min && t.pct > p ? t.pct : p), 0) : 0;
  const unit = course ? Math.round((course.price_cents * (100 - pct)) / 100) : 0;
  const submit = async () => {
    setBusy(true);
    try {
      if (kind === "seats") { await invokeFunction("admin-teams", { action: "grant_seats", org_id: org.id, course_id: courseId, seats, access_days: days, note }); toast.success(`${seats} seats added. The manager has been emailed.`); }
      else { await invokeFunction("admin-teams", { action: "create_invoice", org_id: org.id, course_id: courseId, seats, access_days: days, days_until_due: due, po_number: po, note }); toast.success("Invoice sent. Seats unlock when it is paid."); }
      onDone();
    } catch (e) { toast.error(e instanceof Error ? e.message : "That didn't work"); setBusy(false); }
  };
  return (
    <Modal title={kind === "seats" ? `Add seats for ${org.name}` : `Invoice ${org.name} for seats`} onClose={onClose}>
      <Field label="Course"><select style={input} value={courseId} onChange={(e) => setCourseId(e.target.value)}>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Seats"><input style={input} type="number" min={1} value={seats} onChange={(e) => setSeats(Math.floor(Number(e.target.value)) || 0)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Access (days, 0 = lifetime)"><input style={input} type="number" min={0} value={days} onChange={(e) => setDays(Math.max(0, Math.floor(Number(e.target.value)) || 0))} /></Field></div>
      </div>
      {kind === "invoice" && (
        <>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Payment due in (days)"><input style={input} type="number" min={1} max={120} value={due} onChange={(e) => setDue(Math.floor(Number(e.target.value)) || 30)} /></Field></div>
            <div style={{ flex: 1 }}><Field label="Their PO number (optional)"><input style={input} value={po} onChange={(e) => setPo(e.target.value)} /></Field></div>
          </div>
          {course && seats > 0 && <div style={{ background: "#f5f7ff", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, marginBottom: 12 }}><strong>{seats} × {money(unit)}</strong> = <strong>{money(unit * seats)}</strong>{pct ? ` (${pct}% volume discount)` : ""}{" "}<span style={{ color: "#69697b" }}>plus VAT if switched on in Stripe</span></div>}
        </>
      )}
      <Field label={kind === "invoice" ? "Note on the invoice (optional)" : "Internal note (optional)"}><input style={input} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      {kind === "invoice" && <p style={{ fontSize: 12.5, color: "#69697b", margin: "0 0 14px" }}>Stripe emails the invoice to {org.billing_email ?? "the billing email"}. Their seats unlock automatically once it is paid.</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}><button style={btn()} onClick={onClose}>Cancel</button><button style={btn(true)} disabled={busy || !courseId || seats < 1} onClick={submit}>{busy && <Loader2 size={14} className="animate-spin" />} {kind === "seats" ? "Add seats" : "Send invoice"}</button></div>
    </Modal>
  );
}

/** Per-course team switch and volume tiers. */
function TeamPricing({ courses, onSaved }: { courses: Course[]; onSaved: () => void }) {
  const [draft, setDraft] = useState<Record<string, Course>>({});
  useEffect(() => { setDraft(Object.fromEntries(courses.map((c) => [c.id, { ...c, team_tiers: [...c.team_tiers] }]))); }, [courses]);
  const save = async (id: string) => {
    const c = draft[id];
    const tiers = c.team_tiers.filter((t) => t.min >= 2 && t.pct > 0 && t.pct < 100).sort((a, b) => a.min - b.min);
    const { error } = await supabase.from("courses").update({ team_enabled: c.team_enabled, team_tiers: tiers }).eq("id", id);
    if (error) toast.error("Couldn't save"); else { toast.success("Team pricing saved"); onSaved(); }
  };
  const paid = courses.filter((c) => c.price_cents > 0);
  return (
    <div style={panel}>
      <PanelHeader title="Team pricing" sub="Volume discounts per course. The highest tier a company qualifies for applies to every seat, in card checkout and on invoices." />
      <div style={{ padding: "0 24px 22px", display: "grid", gap: 12 }}>
        {paid.map((c) => {
          const d = draft[c.id];
          if (!d) return null;
          return (
            <div key={c.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.title} <span style={{ fontWeight: 500, color: "#94a3b8" }}>· {money(c.price_cents, c.currency ?? "GBP")}{c.published ? "" : " · not published"}</span></div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 }}><input type="checkbox" checked={d.team_enabled} onChange={(e) => setDraft({ ...draft, [c.id]: { ...d, team_enabled: e.target.checked } })} /> Sold as team seats</label>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10, alignItems: "center", fontSize: 13 }}>
                {d.team_tiers.map((t, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <input aria-label="Minimum seats" style={{ ...input, width: 64, padding: "6px 8px" }} type="number" min={2} value={t.min} onChange={(e) => { const tt = [...d.team_tiers]; tt[i] = { ...t, min: Math.floor(Number(e.target.value)) || 0 }; setDraft({ ...draft, [c.id]: { ...d, team_tiers: tt } }); }} />
                    + seats →
                    <input aria-label="Percent off" style={{ ...input, width: 60, padding: "6px 8px" }} type="number" min={1} max={99} value={t.pct} onChange={(e) => { const tt = [...d.team_tiers]; tt[i] = { ...t, pct: Math.floor(Number(e.target.value)) || 0 }; setDraft({ ...draft, [c.id]: { ...d, team_tiers: tt } }); }} /> % off
                  </span>
                ))}
                <button style={btn()} onClick={() => setDraft({ ...draft, [c.id]: { ...d, team_tiers: [...d.team_tiers, { min: 50, pct: 25 }] } })}>Add tier</button>
                <button style={btn(true)} onClick={() => save(c.id)}>Save</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
