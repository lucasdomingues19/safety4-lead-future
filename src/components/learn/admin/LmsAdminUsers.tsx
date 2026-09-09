export function LmsAdminUsers() {
  return (
    <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700 }}>
        Learner Directory
      </div>
      {[
        { name: "Sarah Chen", email: "sarah@acme.com", status: "active", courses: 3, certified: 2 },
        { name: "Marcus Johnson", email: "marcus@techcorp.com", status: "active", courses: 2, certified: 1 },
        { name: "Emma Wilson", email: "emma@safetyplus.org", status: "inactive", courses: 1, certified: 1 },
        { name: "James Miller", email: "james@industryco.com", status: "at-risk", courses: 2, certified: 0 }
      ].map((user, idx) => (
        <div key={idx} style={{ padding: "16px 24px", borderBottom: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#3434ff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" }}>
            {user.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>{user.email}</div>
          </div>
          <div style={{ fontSize: "12px", color: "#69697b" }}>{user.courses} courses</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: user.status === "active" ? "#8ab815" : user.status === "inactive" ? "#94a3b8" : "#dc2626" }}>
            {user.status.toUpperCase()}
          </div>
          <button style={{ border: "1px solid #cbd5e1", borderRadius: "6px", background: "#fff", padding: "6px 12px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            View
          </button>
        </div>
      ))}
    </div>
  );
}
