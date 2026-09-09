export function LmsAdminAccess() {
  return (
    <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700 }}>
        Product Access Control
      </div>
      {[
        { product: "Copilot for EHS (eLearning)", access: "open", learners: 156 },
        { product: "Copilot for EHS (Accelerator)", access: "limited", learners: 8 },
        { product: "Safety 4.0 Fundamentals", access: "open", learners: 89 },
        { product: "Governance & Compliance", access: "waitlist", learners: 34 }
      ].map((item, idx) => (
        <div key={idx} style={{ padding: "16px 24px", borderBottom: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "16px", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{item.product}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{item.learners} learners</div>
          </div>
          <button style={{ border: "1px solid #cbd5e1", borderRadius: "6px", background: "#fff", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            {item.access === "open" ? "Open" : item.access === "limited" ? "Limited" : "Waitlist"}
          </button>
        </div>
      ))}
    </div>
  );
}
