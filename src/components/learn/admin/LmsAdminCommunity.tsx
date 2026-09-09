export function LmsAdminCommunity() {
  return (
    <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700 }}>
        Community Moderation
      </div>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Active Spaces", value: "4" },
            { label: "Total Posts", value: "342" },
            { label: "Flagged Posts", value: "3" },
            { label: "Weekly Engagement", value: "68%" }
          ].map((stat, idx) => (
            <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>{stat.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "6px" }}>{stat.value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Recent Activity</div>
        {[
          { space: "Safety 4.0", action: "New discussion posted", time: "2 hours ago" },
          { space: "Copilot Tips", action: "32 members active", time: "Just now" },
          { space: "Governance", action: "Weekly challenge starts", time: "Yesterday" }
        ].map((activity, idx) => (
          <div key={idx} style={{ padding: "12px 0", borderBottom: "1px solid #f1f4f8", fontSize: "13px" }}>
            <div style={{ fontWeight: 600 }}>{activity.space}</div>
            <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>{activity.action} • {activity.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
