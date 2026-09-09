export function LmsAdminReports() {
  return (
    <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
      {[
        { title: "Engagement Report", desc: "Course completion rates by module", icon: "📊" },
        { title: "Revenue Analytics", desc: "Subscription and course sales data", icon: "💰" },
        { title: "Learner Progress", desc: "Individual and cohort progression tracking", icon: "📈" },
        { title: "Certificate Audit", desc: "All issued certifications and validity", icon: "🏆" }
      ].map((report, idx) => (
        <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(11,11,44,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>{report.icon}</div>
          <div style={{ fontSize: "15px", fontWeight: 700 }}>{report.title}</div>
          <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>{report.desc}</div>
          <a href="#" style={{ display: "inline-block", marginTop: "12px", fontSize: "13px", fontWeight: 700, color: "#3434ff" }}>View →</a>
        </div>
      ))}
    </div>
  );
}
