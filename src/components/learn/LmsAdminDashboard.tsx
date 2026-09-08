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

        {/* Users Tab */}
        {activeTab === "users" && (
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
        )}

        {/* Access Tab */}
        {activeTab === "access" && (
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
        )}

        {/* Emails Tab */}
        {activeTab === "emails" && (
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
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
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
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
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
        )}

        {/* Community Tab */}
        {activeTab === "community" && (
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
        )}
      </div>
    </div>
  );
}
