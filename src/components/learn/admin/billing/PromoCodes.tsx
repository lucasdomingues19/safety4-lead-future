import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/invoke";
import { PanelHeader, Spinner, adminFont, input, panel } from "../adminUi";

interface Code { id: string; code: string; active: boolean; redeemed: number; max: number | null; expires_at: string | null; percent_off: number | null; amount_off: number | null; currency: string; applies_to: string[]; first_order_only: boolean; min_amount: number | null }
interface Item { id: string; title: string }
const money = (c: number, cur = "GBP") => new Intl.NumberFormat("en-GB", { style: "currency", currency: cur }).format(c / 100);

/** Discount codes live in Stripe, so the code box at checkout (courses, team seats and bundles) just works. */
export function PromoCodes() {
  const [codes, setCodes] = useState<Code[] | null>(null);
  const [courses, setCourses] = useState<Item[]>([]);
  const [bundles, setBundles] = useState<Item[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { const out = await invokeFunction<{ codes: Code[] }>("admin-promos", { action: "list" }); setCodes(out.codes); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Couldn't load the codes"); setCodes([]); }
  }, []);
  useEffect(() => {
    void load();
    void supabase.from("courses").select("id, title").order("title").then(({ data }) => setCourses(data ?? []));
    void supabase.from("bundles").select("id, title").order("title").then(({ data }) => setBundles(data ?? []));
  }, [load]);

  const toggle = async (c: Code) => {
    try { await invokeFunction("admin-promos", { action: "set_active", id: c.id, active: !c.active }); toast.success(c.active ? "Code switched off" : "Code switched on"); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "That didn't work"); }
  };
  if (!codes) return <Spinner />;
  return (
    <div style={{ ...panel, marginTop: 20, fontFamily: adminFont }}>
      <PanelHeader title="Discount codes" sub="Customers type a code in the box on the payment page. Works for single courses, team seats and bundles."
        right={<button onClick={() => setCreating(true)} style={{ display: "inline-flex", gap: 6, alignItems: "center", border: 0, borderRadius: 8, background: "#3434ff", color: "#fff", padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Plus size={14} /> New code</button>} />
      {error && <p role="alert" style={{ margin: "0 28px 14px", color: "#b91c1c", fontSize: 13.5 }}>{error}</p>}
      {codes.length === 0 && !error && <p style={{ margin: "0 28px 24px", fontSize: 14, color: "#69697b" }}>No codes yet.</p>}
      <div style={{ overflowX: "auto" }}>
        {codes.length > 0 && (
          <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead><tr style={{ textAlign: "left", color: "#69697b", fontSize: 12 }}>{["Code", "Discount", "Applies to", "Used", "Expires", ""].map((h) => <th key={h} style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}</tr></thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f1f4f8", opacity: c.active ? 1 : 0.55 }}>
                  <td style={{ padding: "10px 14px", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{c.code}</td>
                  <td style={{ padding: "10px 14px" }}>{c.percent_off ? `${c.percent_off}% off` : c.amount_off ? `${money(c.amount_off, c.currency)} off` : "—"}{c.first_order_only && <div style={{ fontSize: 11.5, color: "#94a3b8" }}>first order only</div>}{c.min_amount ? <div style={{ fontSize: 11.5, color: "#94a3b8" }}>min {money(c.min_amount, c.currency)}</div> : null}</td>
                  <td style={{ padding: "10px 14px", color: "#475569" }}>{c.applies_to.length ? c.applies_to.join(", ") : "Everything"}</td>
                  <td style={{ padding: "10px 14px", fontVariantNumeric: "tabular-nums" }}>{c.redeemed}{c.max ? ` of ${c.max}` : ""}</td>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "Never"}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}><button onClick={() => toggle(c)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: "6px 11px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{c.active ? "Switch off" : "Switch on"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {creating && <NewCode courses={courses} bundles={bundles} onClose={() => setCreating(false)} onDone={() => { setCreating(false); void load(); }} />}
    </div>
  );
}

function NewCode({ courses, bundles, onClose, onDone }: { courses: Item[]; bundles: Item[]; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ code: "", kind: "percent" as "percent" | "amount", percent: 10, amount: 10, max: "", expires: "", first: false, min: "" });
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const toggle = (id: string) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const submit = async () => {
    setBusy(true);
    try {
      await invokeFunction("admin-promos", {
        action: "create", code: f.code, kind: f.kind, percent_off: f.percent, amount_off_cents: Math.round(f.amount * 100),
        course_ids: courses.filter((c) => picked.has(c.id)).map((c) => c.id), bundle_ids: bundles.filter((b) => picked.has(b.id)).map((b) => b.id),
        max_redemptions: f.max ? Number(f.max) : undefined, expires_on: f.expires || undefined, first_order_only: f.first, min_amount_cents: f.min ? Math.round(Number(f.min) * 100) : undefined,
      });
      toast.success(`Code ${f.code.toUpperCase()} created`); onDone();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't create the code"); setBusy(false); }
  };
  const lab: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, marginBottom: 12 };
  return (
    <div role="dialog" aria-label="New discount code" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(11,11,44,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(540px, 100%)", maxHeight: "92vh", overflowY: "auto", background: "#fff", borderRadius: 18, padding: 26 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 19, fontWeight: 800 }}>New discount code</h3>
        <label style={lab}>Code<input style={{ ...input, marginTop: 5, textTransform: "uppercase" }} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="LAUNCH20" /></label>
        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ ...lab, flex: 1 }}>Type<select style={{ ...input, marginTop: 5 }} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as "percent" | "amount" })}><option value="percent">Percent off</option><option value="amount">Amount off (£)</option></select></label>
          <label style={{ ...lab, flex: 1 }}>{f.kind === "percent" ? "Percent off" : "Pounds off"}<input style={{ ...input, marginTop: 5 }} type="number" min={1} value={f.kind === "percent" ? f.percent : f.amount} onChange={(e) => setF(f.kind === "percent" ? { ...f, percent: Number(e.target.value) } : { ...f, amount: Number(e.target.value) })} /></label>
        </div>
        <div style={lab}>Applies to <span style={{ fontWeight: 500, color: "#69697b" }}>(none ticked = everything)</span>
          <div style={{ marginTop: 6, display: "grid", gap: 6, fontWeight: 500 }}>
            {[...courses, ...bundles].map((x) => <label key={x.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5 }}><input type="checkbox" checked={picked.has(x.id)} onChange={() => toggle(x.id)} /> {x.title}{bundles.some((b) => b.id === x.id) ? " (bundle)" : ""}</label>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ ...lab, flex: 1 }}>Max uses (optional)<input style={{ ...input, marginTop: 5 }} type="number" min={1} value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} /></label>
          <label style={{ ...lab, flex: 1 }}>Last day (optional)<input style={{ ...input, marginTop: 5 }} type="date" value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} /></label>
        </div>
        <label style={lab}>Minimum order, £ (optional)<input style={{ ...input, marginTop: 5 }} type="number" min={0} value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} /></label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, fontWeight: 700, marginBottom: 16 }}><input type="checkbox" checked={f.first} onChange={(e) => setF({ ...f, first: e.target.checked })} /> First-time customers only</label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: "9px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={submit} disabled={busy || f.code.trim().length < 3} style={{ display: "inline-flex", gap: 6, alignItems: "center", border: 0, borderRadius: 8, background: "#3434ff", color: "#fff", padding: "9px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: busy || f.code.trim().length < 3 ? 0.5 : 1 }}>{busy && <Loader2 size={14} className="animate-spin" />} Create code</button>
        </div>
      </div>
    </div>
  );
}
