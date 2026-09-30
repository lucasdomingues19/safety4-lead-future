import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Menu, Home, Users, Settings, HelpCircle, LogOut, BookOpen, LayoutDashboard, BarChart3, CreditCard, Mail, Award, MessagesSquare, PlayCircle } from "lucide-react";
import brandMarkWhite from "@/assets/brand-mark-white.png";
import { toast } from "sonner";

// Screen components - lazy load to isolate errors
const LmsDashboard = React.lazy(() => import("@/components/learn/LmsDashboard").then(m => ({ default: m.LmsDashboard })));
const LmsCommunity = React.lazy(() => import("@/components/learn/LmsCommunity").then(m => ({ default: m.LmsCommunity })));
const LmsSettings = React.lazy(() => import("@/components/learn/LmsSettings").then(m => ({ default: m.LmsSettings })));
const LmsSupport = React.lazy(() => import("@/components/learn/LmsSupport").then(m => ({ default: m.LmsSupport })));
const LmsAdminOverview = React.lazy(() => import("@/components/learn/admin/LmsAdminOverview").then(m => ({ default: m.LmsAdminOverview })));
const LmsAdminUsers = React.lazy(() => import("@/components/learn/admin/LmsAdminUsers").then(m => ({ default: m.LmsAdminUsers })));
const LmsAdminAccess = React.lazy(() => import("@/components/learn/admin/LmsAdminAccess").then(m => ({ default: m.LmsAdminAccess })));
const LmsAdminEmails = React.lazy(() => import("@/components/learn/admin/LmsAdminEmails").then(m => ({ default: m.LmsAdminEmails })));
const LmsAdminReports = React.lazy(() => import("@/components/learn/admin/LmsAdminReports").then(m => ({ default: m.LmsAdminReports })));
const LmsAdminBilling = React.lazy(() => import("@/components/learn/admin/LmsAdminBilling").then(m => ({ default: m.LmsAdminBilling })));
const LmsAdminCommunity = React.lazy(() => import("@/components/learn/admin/LmsAdminCommunity").then(m => ({ default: m.LmsAdminCommunity })));

interface LmsUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface LmsContextType {
  user: LmsUser | null;
  currentCourse: any;
  setCurrentCourse: (course: any) => void;
  isAdmin: boolean;
}

export const LmsContext = React.createContext<LmsContextType | null>(null);

export default function LmsInterface() {
    const { user: authUser, loading: authLoading } = useAuthUser();
    const navigate = useNavigate();

    // UI State
    const initialOpen = typeof window === "undefined" ? true : window.innerWidth >= 900;
    const [railOpen, setRailOpen] = useState(initialOpen);
    const [railWidth, setRailWidth] = useState(initialOpen ? 240 : 80);
    const [cpdHours, setCpdHours] = useState(0);

    // Screen State
    const [screen, setScreen] = useState<"dash" | "community" | "settings" | "support" | "admin">("dash");
    const [adminTab, setAdminTab] = useState<"overview" | "courses" | "users" | "access" | "emails" | "reports" | "billing" | "community">("overview");

    // Data
    const [lmsUser, setLmsUser] = useState<LmsUser | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<any>(null);

    // Auth guard - removed, now checked in render

    // Load LMS user data
    useEffect(() => {
      if (authUser) {
        loadLmsUser();
      }
      // Settings saves (name, photo) refresh the sidebar straight away.
      const onProfileUpdated = () => { if (authUser) loadLmsUser(); };
      window.addEventListener("lms-profile-updated", onProfileUpdated);
      return () => window.removeEventListener("lms-profile-updated", onProfileUpdated);
    }, [authUser]);

  const loadLmsUser = async () => {
    if (!authUser) return;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", authUser.id)
        .maybeSingle();

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id)
        .eq("role", "admin")
        .maybeSingle();

      const metaName = (authUser.user_metadata as { full_name?: string } | undefined)?.full_name;
      setLmsUser({
        id: authUser.id,
        email: authUser.email || "",
        full_name: profile?.full_name || metaName || undefined,
        avatar_url: profile?.avatar_url || undefined,
      });

      const [{ data: certs }, { data: cpdCourses }] = await Promise.all([
        supabase.from("certificates").select("course_name").eq("recipient_email", (authUser.email ?? "").toLowerCase()),
        supabase.from("courses").select("title, cpd_hours"),
      ]);
      const cpdByTitle = new Map((cpdCourses ?? []).map((c) => [c.title, Number(c.cpd_hours ?? 0)]));
      setCpdHours(Math.round((certs ?? []).reduce((sum, c) => sum + (cpdByTitle.get(c.course_name) ?? 0), 0) * 10) / 10);

      // Only set as admin if role exists and equals "admin"
      setIsAdmin(roles?.role === "admin" && !rolesError);
    } catch (err) {
      console.error("Error loading LMS user:", err);
      toast.error("Could not load user profile");
    }
  };

  const handleToggleRail = () => {
    setRailOpen(!railOpen);
    setRailWidth(!railOpen ? 240 : 80);
  };

  const handleNavigation = (screenName: string) => {
    if (screenName.startsWith("admin:")) {
      setScreen("admin");
      setAdminTab(screenName.replace("admin:", "") as any);
    } else {
      setScreen(screenName as any);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Render screen
  const renderScreen = () => {
    const content = (() => {
      if (screen === "dash") return <LmsDashboard currentCourse={currentCourse} setCurrentCourse={setCurrentCourse} onNavigate={handleNavigation} />;
      if (screen === "community") return <LmsCommunity />;
      if (screen === "settings") return <LmsSettings />;
      if (screen === "support") return <LmsSupport />;
      if (screen === "admin" && isAdmin) {
        if (adminTab === "overview") return <LmsAdminOverview />;
        if (adminTab === "users") return <LmsAdminUsers />;
        if (adminTab === "access") return <LmsAdminAccess />;
        if (adminTab === "emails") return <LmsAdminEmails />;
        if (adminTab === "reports") return <LmsAdminReports />;
        if (adminTab === "billing") return <LmsAdminBilling />;
        if (adminTab === "community") return <LmsAdminCommunity />;
      }
      return <LmsDashboard currentCourse={currentCourse} setCurrentCourse={setCurrentCourse} onNavigate={handleNavigation} />;
    })();

    return (
      <React.Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#eef1f6" }}>
        <div style={{ textAlign: "center", color: "#0b0b2c" }}>
          <div style={{ fontSize: "14px", marginBottom: "12px" }}>Loading...</div>
          <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #3434ff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      </div>}>
        <ScreenErrorBoundary key={screen + adminTab}>{content}</ScreenErrorBoundary>
      </React.Suspense>
    );
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#eef1f6" }}>
        <div style={{ textAlign: "center", color: "#0b0b2c" }}>
          <div style={{ fontSize: "14px", marginBottom: "12px" }}>Loading LMS...</div>
          <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #3434ff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/learn/auth" replace />;
  }

  return (
    <LmsContext.Provider value={{ user: lmsUser, currentCourse, setCurrentCourse, isAdmin }}>
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0b0b2c", background: "#eef1f6" }}>
        {/* SIDEBAR */}
        <aside style={{
          width: railWidth,
          flex: "none",
          background: "#0b0b2c",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 40,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          boxShadow: railOpen ? "0 18px 40px rgba(11,11,44,0.16)" : "none",
        }}>
          {/* Header */}
          <div style={{
            height: "72px",
            flex: "none",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 18px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}>
            <button
              onClick={handleToggleRail}
              title="Toggle menu"
              style={{
                width: "40px",
                height: "40px",
                flex: "none",
                border: "0",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            >
              <Menu size={19} />
            </button>
            {railOpen && (
              <img src={brandMarkWhite} alt="SafetyTech Academy" style={{ height: "26px", width: "auto", flex: "none", display: railOpen ? "block" : "none" }} />
            )}
          </div>

          {/* Navigation */}
          <nav style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "18px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}>
            {/* Learner Nav */}
            <NavButton
              icon={<Home size={19} />}
              label="Dashboard"
              active={screen === "dash"}
              onClick={() => handleNavigation("dash")}
              open={railOpen}
            />
            <NavButton
              icon={<Users size={19} />}
              label="Community"
              active={screen === "community"}
              onClick={() => handleNavigation("community")}
              open={railOpen}
            />
            <NavButton
              icon={<Settings size={19} />}
              label="Settings"
              active={screen === "settings"}
              onClick={() => handleNavigation("settings")}
              open={railOpen}
            />
            <NavButton
              icon={<HelpCircle size={19} />}
              label="Support"
              active={screen === "support"}
              onClick={() => handleNavigation("support")}
              open={railOpen}
            />

            {/* Admin Section */}
            {isAdmin && (
              <>
                <div style={{
                  height: "1px",
                  background: "rgba(255,255,255,0.1)",
                  margin: "10px 4px",
                }}></div>
                {railOpen && (
                  <div style={{
                    padding: "0 12px 8px",
                    fontSize: "11px",
                    fontWeight: "800",
                    letterSpacing: "0.12em",
                    color: "rgba(255,255,255,0.32)",
                  }}>
                    ADMIN
                  </div>
                )}
                <NavButton
                  icon={<LayoutDashboard size={19} />}
                  label="Overview"
                  active={screen === "admin" && adminTab === "overview"}
                  onClick={() => handleNavigation("admin:overview")}
                  open={railOpen}
                />
                <NavButton
                  icon={<BookOpen size={19} />}
                  label="Courses"
                  active={false}
                  onClick={() => navigate("/admin/courses")}
                  open={railOpen}
                />
                <NavButton
                  icon={<Users size={19} />}
                  label="Users"
                  active={screen === "admin" && adminTab === "users"}
                  onClick={() => handleNavigation("admin:users")}
                  open={railOpen}
                />
                <NavButton
                  icon={<Award size={19} />}
                  label="Access"
                  active={screen === "admin" && adminTab === "access"}
                  onClick={() => handleNavigation("admin:access")}
                  open={railOpen}
                />
                <NavButton
                  icon={<Mail size={19} />}
                  label="Emails"
                  active={screen === "admin" && adminTab === "emails"}
                  onClick={() => handleNavigation("admin:emails")}
                  open={railOpen}
                />
                <NavButton
                  icon={<BarChart3 size={19} />}
                  label="Reports"
                  active={screen === "admin" && adminTab === "reports"}
                  onClick={() => handleNavigation("admin:reports")}
                  open={railOpen}
                />
                <NavButton
                  icon={<CreditCard size={19} />}
                  label="Billing"
                  active={screen === "admin" && adminTab === "billing"}
                  onClick={() => handleNavigation("admin:billing")}
                  open={railOpen}
                />
                <NavButton
                  icon={<MessagesSquare size={19} />}
                  label="Moderation"
                  active={screen === "admin" && adminTab === "community"}
                  onClick={() => handleNavigation("admin:community")}
                  open={railOpen}
                />
              </>
            )}

            {/* Bottom section */}
            <div style={{ marginTop: "auto", flex: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "8px 4px" }}></div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.06)",
              }}>
                <div style={{
                  width: "34px",
                  height: "34px",
                  flex: "none",
                  borderRadius: "50%",
                  background: "#3434ff",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                }}>
                  {lmsUser?.avatar_url ? <img src={lmsUser.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : getInitials(lmsUser?.full_name)}
                </div>
                {railOpen && (
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {lmsUser?.full_name || authUser.email?.split("@")[0] || "You"}
                    </div>
                    <div style={{
                      marginTop: "2px",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.5)",
                    }}>
                      {cpdHours} CPD hour{cpdHours === 1 ? "" : "s"}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/learn/auth");
                }}
                style={{
                  border: "0",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "10px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  cursor: "pointer",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }}
              >
                <LogOut size={19} style={{ flex: "none" }} />
                {railOpen && <span>Sign out</span>}
              </button>
            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, minWidth: 0, marginLeft: railWidth }}>
          {/* HEADER */}
          <div style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "rgba(255,255,255,0.86)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid #e2e8f0",
          }}>
            <div style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "0 28px",
              height: "72px",
              display: "flex",
              alignItems: "center",
              gap: "28px",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.12em", color: "#8ab815" }}>{currentCourse ? "CURRENT COURSE" : "WELCOME"}</div>
                <div style={{ marginTop: "3px", fontSize: "15px", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentCourse?.title ?? "Pick a course to get started"}</div>
              </div>
              {currentCourse && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "none" }}>
                    <div style={{ width: "120px", height: "6px", borderRadius: "999px", background: "#eef1f6", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${currentCourse.progressPercent ?? 0}%`, background: "#3434ff", borderRadius: "999px" }}></div>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#69697b" }}>{currentCourse.progressPercent ?? 0}%</div>
                  </div>
                  <button
                    onClick={() => navigate(currentCourse.nextLessonId ? `/learn/${currentCourse.slug}/lesson/${currentCourse.nextLessonId}` : `/learn/${currentCourse.slug}`)}
                    style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", border: 0, borderRadius: "10px", background: "#3434ff", color: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, padding: "10px 16px", cursor: "pointer" }}
                  >
                    <PlayCircle size={16} /> {currentCourse.completedLessons > 0 ? "Continue" : "Start"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SCREEN CONTENT */}
          <div style={{ minHeight: "calc(100vh - 72px)" }}>
            {renderScreen()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </LmsContext.Provider>
    );
}

class ScreenErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("LMS screen error:", error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", color: "#0b0b2c" }}>Something went wrong on this page</h2>
          <p style={{ fontSize: 14, color: "#69697b", margin: 0 }}>Try reloading. If it keeps happening, email hello@safetytech.academy.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 18, padding: "11px 22px", background: "#3434ff", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>Reload</button>
        </div>
      </div>
    );
  }
}

// Nav Button Component
function NavButton({ icon, label, active, onClick, open }: any) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        border: "0",
        background: active ? "rgba(255,255,255,0.12)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.6)",
        fontFamily: "inherit",
        fontSize: "14px",
        fontWeight: "600",
        borderRadius: "10px",
        padding: "12px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        cursor: "pointer",
        textAlign: "left",
        whiteSpace: "nowrap",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {icon}
      {open && <span>{label}</span>}
    </button>
  );
}
