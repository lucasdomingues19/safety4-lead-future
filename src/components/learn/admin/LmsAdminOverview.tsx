export function LmsAdminOverview() {
  const totalLearners = 247, totalCourses = 3, totalCertified = 84, totalAtRisk = 12;
  const courses = [
    { title: "Copilot for EHS", learners: 156, certified: 72, progress: 68 },
    { title: "Safety 4.0 Fundamentals", learners: 89, certified: 12, progress: 45 },
    { title: "Governance & Compliance", learners: 34, certified: 0, progress: 22 }
  ];
  const activity = [
    { text: "Sarah Chen completed the Copilot assessment", time: "2 hours ago", type: "complete" },
    { text: "Marcus Johnson enrolled in Safety 4.0", time: "5 hours ago", type: "enroll" },
    { text: "Emma Wilson received certificate", time: "Yesterday", type: "cert" },
    { text: "James Miller is 14 days inactive", time: "2 days ago", type: "risk" }
  ];

  const getActivityDot = (type: string) => {
    switch (type) {
      case "complete": return "#8ab815";
      case "enroll": return "#3434ff";
      case "cert": return "#a6e21a";
      case "risk": return "#dc2626";
      default: return "#94a3b8";
    }
  };

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px", marginBottom: "28px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(11,11,44,0.12)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(11,11,44,0.06)"; }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>Total Learners</div>
          <div style={{ marginTop: "12px", fontSize: "32px", fontWeight: 800, color: "#0b0b2c" }}>{totalLearners}</div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#94a3b8" }}>Active this month</div>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(11,11,44,0.12)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(11,11,44,0.06)"; }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>Published Courses</div>
          <div style={{ marginTop: "12px", fontSize: "32px", fontWeight: 800, color: "#0b0b2c" }}>{totalCourses}</div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#94a3b8" }}>Across the platform</div>
        </div>
        <div style={{ background: "#f4fbe4", border: "1px solid #d9f09a", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(138,184,21,0.12)", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(138,184,21,0.18)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(138,184,21,0.12)"; }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#8ab815", textTransform: "uppercase" }}>Certified</div>
          <div style={{ marginTop: "12px", fontSize: "32px", fontWeight: 800, color: "#0b0b2c" }}>{totalCertified}</div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#8ab815" }}>+34% vs last quarter</div>
        </div>
        <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(220,38,38,0.12)", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(220,38,38,0.18)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(220,38,38,0.12)"; }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#c93636", textTransform: "uppercase" }}>At Risk</div>
          <div style={{ marginTop: "12px", fontSize: "32px", fontWeight: 800, color: "#0b0b2c" }}>{totalAtRisk}</div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#c93636" }}>Need intervention</div>
        </div>
      </div>

      {/* Courses Section */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", marginBottom: "28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Courses at a Glance</div>
        {courses.map((course, idx) => (
          <div key={idx} style={{ padding: "20px 28px", borderBottom: idx < courses.length - 1 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>{course.title}</div>
              <div style={{ marginTop: "6px", fontSize: "12px", color: "#94a3b8" }}>{course.learners} learners · {course.certified} certified</div>
            </div>
            <div style={{ flex: 1, minWidth: "160px", maxWidth: "280px" }}>
              <div style={{ height: "8px", borderRadius: "999px", background: "#eef1f6", overflow: "hidden", marginBottom: "6px" }}>
                <div style={{ height: "100%", width: `${course.progress}%`, background: "linear-gradient(90deg, #3434ff, #5555ff)", borderRadius: "999px" }}></div>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#69697b" }}>{course.progress}% completion</div>
            </div>
            <button style={{ border: "none", borderRadius: "8px", background: "#3434ff", color: "#ffffff", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, padding: "10px 20px", cursor: "pointer", flex: "none", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#5555ff"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#3434ff"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Manage
            </button>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Recent Activity</div>
        {activity.map((event, idx) => (
          <div key={idx} style={{ padding: "18px 28px", borderBottom: idx < activity.length - 1 ? "1px solid #f8fafc" : "none", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: getActivityDot(event.type), flex: "none", marginTop: "5px", boxShadow: `0 0 8px ${getActivityDot(event.type)}40` }}></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "14px", color: "#0b0b2c", fontWeight: 500 }}>{event.text}</div>
              <div style={{ marginTop: "4px", fontSize: "12px", color: "#94a3b8" }}>{event.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
