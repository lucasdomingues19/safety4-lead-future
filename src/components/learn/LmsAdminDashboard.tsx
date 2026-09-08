import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";

interface CourseOverview {
  title: string;
  learners: number;
  certified: number;
  progress: number;
}

interface ActivityEvent {
  text: string;
  time: string;
  type: "enroll" | "complete" | "cert" | "risk";
}

export function LmsAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "users" | "access" | "emails" | "reports" | "billing" | "community">("overview");
  const [newCourseOpen, setNewCourseOpen] = useState(false);
  const [courseType, setCourseType] = useState<"evergreen" | "cohort" | null>(null);

  const [totalLearners] = useState(247);
  const [totalCourses] = useState(3);
  const [totalCertified] = useState(84);
  const [totalAtRisk] = useState(12);

  const [courses] = useState<CourseOverview[]>([
    { title: "Copilot for EHS", learners: 156, certified: 72, progress: 68 },
    { title: "Safety 4.0 Fundamentals", learners: 89, certified: 12, progress: 45 },
    { title: "Governance & Compliance", learners: 34, certified: 0, progress: 22 }
  ]);

  const [activity] = useState<ActivityEvent[]>([
    { text: "Sarah Chen completed the Copilot assessment", time: "2 hours ago", type: "complete" },
    { text: "Marcus Johnson enrolled in Safety 4.0", time: "5 hours ago", type: "enroll" },
    { text: "Emma Wilson received certificate", time: "Yesterday", type: "cert" },
    { text: "James Miller is 14 days inactive", time: "2 days ago", type: "risk" }
  ]);

  const getActivityDot = (type: string) => {
    switch (type) {
      case "complete": return "#8ab815";
      case "enroll": return "#3434ff";
      case "cert": return "#a6e21a";
      case "risk": return "#dc2626";
      default: return "#94a3b8";
    }
  };

  const adminTabs = [
    { id: "overview", label: "Overview" },
    { id: "courses", label: "Courses" },
    { id: "users", label: "Users" },
    { id: "access", label: "Products & access" },
    { id: "emails", label: "Emails" },
    { id: "reports", label: "Reports" },
    { id: "billing", label: "Billing" },
    { id: "community", label: "Community" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", color: "#0b0b2c", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "40px 28px 72px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815", marginBottom: "12px" }}>
          ADMIN
        </div>
        <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em" }}>
          Dashboard
        </h1>

        {/* Admin Tabs */}
        <div style={{ marginTop: "28px", display: "flex", gap: "8px", overflowX: "auto", borderBottom: "1px solid #e2e8f0", paddingBottom: "2px" }}>
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                border: "0",
                background: "transparent",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 700,
                color: activeTab === tab.id ? "#3434ff" : "#69697b",
                borderBottom: activeTab === tab.id ? "2px solid #3434ff" : "2px solid transparent",
                padding: "11px 18px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div style={{ marginTop: "24px" }}>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "24px" }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>
                  TOTAL LEARNERS
                </div>
                <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>
                  {totalLearners}
                </div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>
                  PUBLISHED COURSES
                </div>
                <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>
                  {totalCourses}
                </div>
              </div>
              <div style={{ background: "#f4fbe4", border: "1px solid #d9f09a", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#8ab815" }}>
                  CERTIFIED
                </div>
                <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>
                  {totalCertified}
                </div>
              </div>
              <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#c93636" }}>
                  AT RISK
                </div>
                <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>
                  {totalAtRisk}
                </div>
              </div>
            </div>

            {/* Courses at a Glance */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", marginBottom: "20px" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700 }}>
                Courses at a glance
              </div>
              {courses.map((course, idx) => (
                <div key={idx} style={{ padding: "18px 24px", borderBottom: idx < courses.length - 1 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{ fontSize: "15px", fontWeight: 700 }}>{course.title}</div>
                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#94a3b8" }}>
                      {course.learners} learners · {course.certified} certified
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: "140px", maxWidth: "220px", height: "6px", borderRadius: "999px", background: "#eef1f6", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${course.progress}%`, background: "#3434ff", borderRadius: "999px" }}></div>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#69697b", flex: "none" }}>
                    {course.progress}% avg
                  </div>
                  <button
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#0b0b2c",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "9px 16px",
                      cursor: "pointer",
                      flex: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f4ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700 }}>
                Recent activity
              </div>
              {activity.map((event, idx) => (
                <div key={idx} style={{ padding: "16px 24px", borderBottom: idx < activity.length - 1 ? "1px solid #f8fafc" : "none", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: getActivityDot(event.type),
                      flex: "none",
                      marginTop: "6px",
                    }}
                  ></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", color: "#0b0b2c" }}>{event.text}</div>
                    <div style={{ marginTop: "3px", fontSize: "12px", color: "#94a3b8" }}>
                      {event.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div style={{ marginTop: "24px" }}>
            <button
              onClick={() => setNewCourseOpen(true)}
              style={{
                border: "1px dashed #94a3b8",
                background: "transparent",
                color: "#69697b",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "10px",
                padding: "11px 18px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3434ff";
                e.currentTarget.style.color = "#3434ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#94a3b8";
                e.currentTarget.style.color = "#69697b";
              }}
            >
              <Plus size={15} />
              New course
            </button>

            {newCourseOpen && (
              <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(11,11,44,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
                <div style={{ background: "#fff", borderRadius: "20px", maxWidth: "560px", width: "100%", padding: "32px", boxShadow: "0 30px 60px rgba(11,11,44,0.3)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815" }}>
                    NEW COURSE
                  </div>
                  <h2 style={{ margin: "10px 0 0", fontSize: "26px", fontWeight: 700 }}>
                    Choose a course type
                  </h2>
                  <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#69697b" }}>
                    This decides how learners enrol and progress. You can't change it after learners join.
                  </p>

                  <div style={{ marginTop: "22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <button
                      onClick={() => setCourseType("evergreen")}
                      style={{
                        textAlign: "left",
                        border: courseType === "evergreen" ? "2px solid #3434ff" : "2px solid #e2e8f0",
                        background: courseType === "evergreen" ? "#f1f4ff" : "transparent",
                        borderRadius: "16px",
                        padding: "20px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ♾️
                      </div>
                      <div style={{ marginTop: "14px", fontSize: "16px", fontWeight: 700 }}>Evergreen</div>
                      <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.55, color: "#69697b" }}>
                        Self-paced. Learners enrol any time and move at their own speed.
                      </div>
                    </button>
                    <button
                      onClick={() => setCourseType("cohort")}
                      style={{
                        textAlign: "left",
                        border: courseType === "cohort" ? "2px solid #8ab815" : "2px solid #e2e8f0",
                        background: courseType === "cohort" ? "#f4fbe4" : "transparent",
                        borderRadius: "16px",
                        padding: "20px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(166,226,26,0.24)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        👥
                      </div>
                      <div style={{ marginTop: "14px", fontSize: "16px", fontWeight: 700 }}>Cohort</div>
                      <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.55, color: "#69697b" }}>
                        Fixed start date. Learners move through modules together with live sessions.
                      </div>
                    </button>
                  </div>

                  <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => {
                        setNewCourseOpen(false);
                        setCourseType(null);
                      }}
                      style={{
                        flex: 1,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        color: "#0b0b2c",
                        fontFamily: "inherit",
                        fontSize: "14px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        padding: "11px 16px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!courseType}
                      style={{
                        flex: 1,
                        border: "0",
                        background: courseType ? "#3434ff" : "#e2e8f0",
                        color: courseType ? "#fff" : "#94a3b8",
                        fontFamily: "inherit",
                        fontSize: "14px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        padding: "11px 16px",
                        cursor: courseType ? "pointer" : "not-allowed",
                      }}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Placeholder for other tabs */}
        {["users", "access", "emails", "reports", "billing", "community"].includes(activeTab) && (
          <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b0b2c" }}>
              {adminTabs.find((t) => t.id === activeTab)?.label} Management
            </div>
            <p style={{ marginTop: "8px", fontSize: "14px", color: "#94a3b8" }}>
              Coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
