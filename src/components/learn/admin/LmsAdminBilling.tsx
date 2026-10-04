import { useEffect, useState } from "react";
import { invokeFunction } from "@/lib/invoke";
import { Kpi, PanelHeader, Spinner, adminFont, panel, ghostBtn } from "./adminUi";

interface Charge { id: string; amount: number; refunded: number; currency: string; status: string; created: string; email: string | null; description: string | null }
interface WebhookHealth { expectedUrl: string; configured: boolean; missingEvents: string[]; others: string[] }
interface Summary { live: boolean; charges: Charge[]; totals: { last30Days: number; allShown: number; paymentsLast30Days: number }; currency: string; otherCurrencies?: Record<string, number>; webhookHealth: WebhookHealth }

const money = (n: number, currency: string) => new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);

export function LmsAdminBilling() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Summary | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await invokeFunction<Summary>("admin-billing-summary"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load billing data");
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;

  return (
    <div style={{ marginTop: 28, fontFamily: adminFont }}>
      {error && (
        <div style={{ ...panel, padding: 24, borderColor: "#ffd6d6", background: "#fff5f5" }}>
          <div style={{ fontWeight: 700, color: "#c93636" }}>Couldn't load Stripe data</div>
          <div style={{ marginTop: 6, fontSize: 13, color: "#69697b" }}>{error}</div>
          <button onClick={load} style={{ ...ghostBtn, marginTop: 14 }}>Try again</button>
        </div>
      )}
      {data && (
        <>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999, background: data.live ? "#f4fbe4" : "#fff7e6", color: data.live ? "#4a5230" : "#a05a00" }}>
              {data.live ? "Stripe: live mode" : "Stripe: TEST mode — payments below are not real money"}
            </span>
          </div>
          {(!data.webhookHealth.configured || data.webhookHealth.missingEvents.length > 0) && (
            <div style={{ ...panel, padding: 20, marginBottom: 20, background: "#fff7e6", borderColor: "#ffd9a0" }}>
              <div style={{ fontWeight: 700, color: "#a05a00" }}>Stripe webhook needs attention (backup payment confirmation)</div>
              <div style={{ marginTop: 6, fontSize: 13, color: "#69697b", lineHeight: 1.6 }}>
                Payments are confirmed automatically when learners return from Stripe, but if they close the tab first the webhook grants access.
                In Stripe → Developers → Webhooks, add an endpoint for <code style={{ background: "#fff", padding: "1px 5px", borderRadius: 4 }}>{data.webhookHealth.expectedUrl}</code> with events
                {" "}<strong>checkout.session.completed</strong> and <strong>charge.refunded</strong>, then save its signing secret as STRIPE_WEBHOOK_SECRET in Supabase.
                {data.webhookHealth.others.length > 0 && <> Existing endpoints point elsewhere: {data.webhookHealth.others.join(", ")}.</>}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(220px, 100%), 1fr))", gap: 20, marginBottom: 28 }}>
            <Kpi label="Revenue (30 days)" value={money(data.totals.last30Days, data.currency)} sub="Net of refunds" tone="good" />
            <Kpi label="Payments (30 days)" value={data.totals.paymentsLast30Days} sub="Successful charges" />
            <Kpi
              label="Recent payments total"
              value={money(data.totals.allShown, data.currency)}
              sub={["Last 50 charges", ...Object.entries(data.otherCurrencies ?? {}).map(([cur, amt]) => `+ ${money(amt, cur)}`)].join(" · ")}
            />
          </div>
          <div style={panel}>
            <PanelHeader title="Recent payments" sub="Straight from Stripe" right={<button onClick={load} style={ghostBtn}>Refresh</button>} />
            {data.charges.length === 0 && <div style={{ padding: 28, fontSize: 13, color: "#94a3b8" }}>No payments yet. Paid enrolments will appear here.</div>}
            {data.charges.map((c, i) => (
              <div key={c.id} style={{ padding: "16px 28px", borderBottom: i < data.charges.length - 1 ? "1px solid #f1f4f8" : "none", display: "grid", gridTemplateColumns: "1fr 120px 110px", gap: 16, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email ?? "Unknown customer"}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{new Date(c.created).toLocaleString()}{c.description ? ` · ${c.description}` : ""}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, textAlign: "right" }}>{money(c.amount, c.currency)}{c.refunded > 0 && <div style={{ fontSize: 11, color: "#c93636", fontWeight: 600 }}>-{money(c.refunded, c.currency)} refunded</div>}</div>
                <div style={{ fontSize: 11, fontWeight: 700, textAlign: "center", padding: "6px 10px", borderRadius: 4, background: c.status === "succeeded" ? "#f4fbe4" : "#fff5f5", color: c.status === "succeeded" ? "#4a5230" : "#c93636", textTransform: "uppercase" }}>{c.status}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
