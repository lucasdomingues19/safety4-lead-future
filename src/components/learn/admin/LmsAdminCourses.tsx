export function LmsAdminCourses() {
  return (
    <div style={{ marginTop: "24px" }}>
      <button style={{ border: "1px dashed #94a3b8", background: "transparent", color: "#69697b", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, borderRadius: "10px", padding: "11px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3434ff"; e.currentTarget.style.color = "#3434ff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "#69697b"; }}>
        ✚ New course
      </button>
      <div style={{ marginTop: "20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Published Courses</div>
        {["Copilot for EHS", "Safety 4.0 Fundamentals", "Governance & Compliance"].map((name, idx) => (
          <div key={idx} style={{ padding: "12px 0", borderBottom: "1px solid #f1f4f8", fontSize: "13px" }}>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Active learners</div>
          </div>
        ))}
      </div>
    </div>
  );
}
