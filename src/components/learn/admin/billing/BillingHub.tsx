import { useState } from "react";
import { LmsAdminBilling } from "../LmsAdminBilling";
import { Sales } from "./Sales";
import { PromoCodes } from "./PromoCodes";
import { Bundles } from "./Bundles";

type Tab = "payments" | "sales" | "codes" | "bundles";
const TABS: { id: Tab; label: string }[] = [
  { id: "payments", label: "Payments" }, { id: "sales", label: "Sales & invoices" }, { id: "codes", label: "Discount codes" }, { id: "bundles", label: "Bundles" },
];

/** Admin > Billing: Stripe payments, sales with invoice links, discount codes and bundles. */
export function BillingHub() {
  const [tab, setTab] = useState<Tab>("payments");
  return (
    <div>
      <div role="tablist" style={{ marginTop: 22, display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "1px solid #dfe5ee" }}>
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            style={{ border: 0, borderBottom: `2px solid ${tab === t.id ? "#3434ff" : "transparent"}`, marginBottom: -1, background: "none", padding: "10px 14px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: tab === t.id ? "#3434ff" : "#69697b", cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>
      {tab === "payments" && <LmsAdminBilling />}
      {tab === "sales" && <Sales />}
      {tab === "codes" && <PromoCodes />}
      {tab === "bundles" && <Bundles />}
    </div>
  );
}
