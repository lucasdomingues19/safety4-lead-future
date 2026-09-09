export function LmsAdminEmails() {
  return (
    <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Email Campaigns</span>
        <button style={{ border: "1px solid #cbd5e1", borderRadius: "6px", background: "#fff", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>+ New</button>
      </div>
      {[
        { name: "Welcome to Copilot for EHS", sent: "3/8/26", opens: 82, clicks: 24 },
        { name: "Week 2 Reminder", sent: "2/15/26", opens: 156, clicks: 48 },
        { name: "Assessment Available", sent: "2/1/26", opens: 203, clicks: 89 }
      ].map((email, idx) => (
        <div key={idx} style={{ padding: "16px 24px", borderBottom: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "16px", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{email.name}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{email.opens} opens • {email.clicks} clicks</div>
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>{email.sent}</div>
        </div>
      ))}
    </div>
  );
}
