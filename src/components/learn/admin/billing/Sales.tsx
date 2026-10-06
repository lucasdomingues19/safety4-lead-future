import { useEffect, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PanelHeader, Spinner, adminFont, downloadCsv, panel } from "../adminUi";

interface Sale { id: string; course_title: string; customer_name: string | null; customer_business: string | null; customer_vat_id: string | null; amount_cents: number; currency: string; tax_cents: number | null; discount_cents: number; promo_code: string | null; quantity: number; status: string; purchased_at: string; invoice_url: string | null; invoice_pdf: string | null; receipt_url: string | null; bundle_id: string | null; organisation_id: string | null; user_id: string }
const money = (c: number, cur = "GBP") => new Intl.NumberFormat("en-GB", { style: "currency", currency: cur }).format(c / 100);

/** Every sale we have recorded, with the buyer's invoice and receipt, discount used and team/bundle labels. */
export function Sales() {
  const [rows, setRows] = useState<Sale[] | null>(null);
  const [emails, setEmails] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("course_purchases").select("*").order("purchased_at", { ascending: false }).limit(500);
      const list = (data ?? []) as unknown as Sale[];
      setRows(list);
      const ids = [...new Set(list.map((r) => r.user_id))];
      if (ids.length) { const { data: p } = await supabase.from("profiles").select("id, email").in("id", ids); setEmails(new Map((p ?? []).map((x) => [x.id, x.email]))); }
    })();
  }, []);
  if (!rows) return <Spinner />;
  const total = rows.filter((r) => r.status !== "refunded").reduce((n, r) => n + r.amount_cents, 0);
  const exportCsv = () => downloadCsv(`sales-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => ({
    Date: r.purchased_at.slice(0, 10), Product: r.course_title, Seats: r.quantity, Buyer: emails.get(r.user_id) ?? "", Business: r.customer_business ?? "", "VAT number": r.customer_vat_id ?? "",
    Total: (r.amount_cents / 100).toFixed(2), VAT: ((r.tax_cents ?? 0) / 100).toFixed(2), Discount: (r.discount_cents / 100).toFixed(2), Code: r.promo_code ?? "", Status: r.status, Invoice: r.invoice_pdf ?? r.invoice_url ?? r.receipt_url ?? "",
  })));
  return (
    <div style={{ ...panel, marginTop: 20, fontFamily: adminFont }}>
      <PanelHeader title="Sales & invoices" sub={`${rows.length} sale${rows.length === 1 ? "" : "s"} · ${money(total)} taken (refunds excluded)`} right={rows.length ? <button onClick={exportCsv} style={{ display: "inline-flex", gap: 6, alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Download size={14} /> Export CSV</button> : undefined} />
      {rows.length === 0 ? <p style={{ margin: "0 28px 24px", fontSize: 14, color: "#69697b" }}>No sales recorded yet.</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead><tr style={{ textAlign: "left", color: "#69697b", fontSize: 12 }}>{["Date", "Product", "Buyer", "Total", "Discount", "Status", "Invoice"].map((h, i) => <th key={h} style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", textAlign: i === 3 || i === 4 ? "right" : "left" }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f1f4f8" }}>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>{new Date(r.purchased_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}</td>
                  <td style={{ padding: "10px 14px" }}><div style={{ fontWeight: 700 }}>{r.course_title}</div>{r.quantity > 1 && <div style={{ fontSize: 12, color: "#94a3b8" }}>{r.quantity} seats</div>}</td>
                  <td style={{ padding: "10px 14px" }}><div>{emails.get(r.user_id) ?? "—"}</div>{r.customer_business && <div style={{ fontSize: 12, color: "#94a3b8" }}>{r.customer_business}{r.customer_vat_id ? ` · VAT ${r.customer_vat_id}` : ""}</div>}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{money(r.amount_cents, r.currency)}{!!r.tax_cents && <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>incl. {money(r.tax_cents, r.currency)} VAT</div>}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.discount_cents ? <>−{money(r.discount_cents, r.currency)}{r.promo_code && <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{r.promo_code}</div>}</> : "—"}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 800, background: r.status === "refunded" ? "#fee2e2" : "#ecffd1", color: r.status === "refunded" ? "#b91c1c" : "#3f6212" }}>{r.status}</span></td>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    {(r.invoice_pdf ?? r.invoice_url) ? <a href={(r.invoice_pdf ?? r.invoice_url)!} target="_blank" rel="noopener noreferrer" style={{ color: "#3434ff", fontWeight: 700, display: "inline-flex", gap: 4, alignItems: "center" }}>Invoice <ExternalLink size={12} /></a> : r.receipt_url ? <a href={r.receipt_url} target="_blank" rel="noopener noreferrer" style={{ color: "#3434ff", fontWeight: 700, display: "inline-flex", gap: 4, alignItems: "center" }}>Receipt <ExternalLink size={12} /></a> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
