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
    <div style={{ marginTop: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>TOTAL LEARNERS</div>
          <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>{totalLearners}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>PUBLISHED COURSES</div>
          <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>{totalCourses}</div>
        </div>
        <div style={{ background: "#f4fbe4", border: "1px solid #d9f09a", borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#8ab815" }}>CERTIFIED</div>
          <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>{totalCertified}</div>
        </div>
        <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#c93636" }}>AT RISK</div>
          <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>{totalAtRisk}</div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700 }}>Courses at a glance</div>
        {courses.map((course, idx) => (
          <div key={idx} style={{ padding: "18px 24px", borderBottom: idx < courses.length - 1 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "180px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>{course.title}</div>
              <div style={{ marginTop: "4px", fontSize: "12px", color: "#94a3b8" }}>{course.learners} learners · {course.certified} certified</div>
            </div>
            <div style={{ flex: 1, minWidth: "140px", maxWidth: "220px", height: "6px", borderRadius: "999px", background: "#eef1f6", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${course.progress}%`, background: "#3434ff", borderRadius: "999px" }}></div>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#69697b", flex: "none" }}>{course.progress}% avg</div>
            <button style={{ border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#0b0b2c", fontFamily: "inherit", fontSize: "12px", fontWeight: 700, padding: "9px 16px", cursor: "pointer", flex: "none" }}>Manage</button>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700 }}>Recent activity</div>
        {activity.map((event, idx) => (
          <div key={idx} style={{ padding: "16px 24px", borderBottom: idx < activity.length - 1 ? "1px solid #f8fafc" : "none", display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: getActivityDot(event.type), flex: "none", marginTop: "6px" }}></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "14px", color: "#0b0b2c" }}>{event.text}</div>
              <div style={{ marginTop: "3px", fontSize: "12px", color: "#94a3b8" }}>{event.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
