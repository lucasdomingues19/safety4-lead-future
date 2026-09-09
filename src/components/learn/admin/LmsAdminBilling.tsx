export function LmsAdminBilling() {
  return (
    <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700 }}>
        Subscription & Billing
      </div>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>MRR</div>
            <div style={{ fontSize: "24px", fontWeight: 800 }}>$4,280</div>
            <div style={{ fontSize: "12px", color: "#8ab815", marginTop: "4px" }}>↑ 12% vs last month</div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>Active Subscriptions</div>
            <div style={{ fontSize: "24px", fontWeight: 800 }}>87</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>8 annual · 79 monthly</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Recent Transactions</div>
          {[
            { user: "Sarah Chen", amount: "$497", date: "Today", status: "Paid" },
            { user: "Marcus Johnson", amount: "$99", date: "3/7/26", status: "Paid" },
            { user: "Team Cohort", amount: "$1,497", date: "3/1/26", status: "Paid" }
          ].map((tx, idx) => (
            <div key={idx} style={{ padding: "12px 0", borderBottom: "1px solid #f1f4f8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{tx.user}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{tx.date}</div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{tx.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
