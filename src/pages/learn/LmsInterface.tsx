import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Menu, Home, Users, Settings, HelpCircle, LogOut, Search, Bell, BookOpen, Award, BarChart3, CreditCard, MessageCircle } from "lucide-react";
import { toast } from "sonner";

// Screen components (to be built)
import { LmsDashboard } from "@/components/learn/LmsDashboard";
import { LmsCommunity } from "@/components/learn/LmsCommunity";
import { LmsCourseView } from "@/components/learn/LmsCourseView";
import { LmsModulePlayer } from "@/components/learn/LmsModulePlayer";
import { LmsSettings } from "@/components/learn/LmsSettings";
import { LmsSupport } from "@/components/learn/LmsSupport";
import { LmsAdminOverview } from "@/components/learn/admin/LmsAdminOverview";
import { LmsAdminCourses } from "@/components/learn/admin/LmsAdminCourses";
import { LmsAdminUsers } from "@/components/learn/admin/LmsAdminUsers";
import { LmsAdminAccess } from "@/components/learn/admin/LmsAdminAccess";
import { LmsAdminEmails } from "@/components/learn/admin/LmsAdminEmails";
import { LmsAdminReports } from "@/components/learn/admin/LmsAdminReports";
import { LmsAdminBilling } from "@/components/learn/admin/LmsAdminBilling";
import { LmsAdminCommunity } from "@/components/learn/admin/LmsAdminCommunity";

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
  const [railOpen, setRailOpen] = useState(true);
  const [railWidth, setRailWidth] = useState(railOpen ? 240 : 80);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);

  // Screen State
  const [screen, setScreen] = useState<"dash" | "community" | "course" | "player" | "settings" | "support" | "admin">("dash");
  const [adminTab, setAdminTab] = useState<"overview" | "courses" | "users" | "access" | "emails" | "reports" | "billing" | "community">("overview");

  // Data
  const [lmsUser, setLmsUser] = useState<LmsUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Auth guard
  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate("/learn/auth");
    }
  }, [authLoading, authUser, navigate]);

  // Load LMS user data
  useEffect(() => {
    if (authUser) {
      loadLmsUser();
    }
  }, [authUser]);

  const loadLmsUser = async () => {
    if (!authUser) return;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id)
        .single();

      setLmsUser({
        id: authUser.id,
        email: authUser.email || "",
        full_name: profile?.full_name || authUser.email?.split("@")[0],
        avatar_url: profile?.avatar_url,
      });

      setIsAdmin(roles?.role === "admin");
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
    if (screen === "dash") return <LmsDashboard currentCourse={currentCourse} />;
    if (screen === "community") return <LmsCommunity />;
    if (screen === "course") return <LmsCourseView course={currentCourse} />;
    if (screen === "player") return <LmsModulePlayer course={currentCourse} />;
    if (screen === "settings") return <LmsSettings />;
    if (screen === "support") return <LmsSupport />;
    if (screen === "admin") {
      if (adminTab === "overview") return <LmsAdminOverview />;
      if (adminTab === "courses") return <LmsAdminCourses />;
      if (adminTab === "users") return <LmsAdminUsers />;
      if (adminTab === "access") return <LmsAdminAccess />;
      if (adminTab === "emails") return <LmsAdminEmails />;
      if (adminTab === "reports") return <LmsAdminReports />;
      if (adminTab === "billing") return <LmsAdminBilling />;
      if (adminTab === "community") return <LmsAdminCommunity />;
    }
    return <LmsDashboard currentCourse={currentCourse} />;
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#EEF1F6" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "#69697B", marginBottom: "12px" }}>Loading LMS...</div>
          <div style={{ width: "32px", height: "32px", border: "3px solid #E2E8F0", borderTop: "3px solid #3434FF", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  return (
    <LmsContext.Provider value={{ user: lmsUser, currentCourse, setCurrentCourse, isAdmin }}>
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0B0B2C", background: "#EEF1F6" }}>
        {/* SIDEBAR */}
        <aside style={{
          width: railWidth,
          flex: "none",
          background: "#0B0B2C",
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
              <img src="assets/brand-mark-white.png" alt="SafetyTech Academy" style={{ height: "26px", width: "auto", flex: "none" }} />
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
                  icon={<BookOpen size={19} />}
                  label="Courses"
                  active={screen === "admin" && adminTab === "courses"}
                  onClick={() => handleNavigation("admin:courses")}
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
                  icon={<MessageCircle size={19} />}
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
                  background: "#3434FF",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                }}>
                  {getInitials(lmsUser?.full_name)}
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
                      {lmsUser?.full_name || "User"}
                    </div>
                    <div style={{
                      marginTop: "2px",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.5)",
                    }}>
                      0 CPD hours
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
            borderBottom: "1px solid #E2E8F0",
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
              <div style={{ flex: "none", minWidth: 0 }}>
                <div style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.12em", color: "#8AB815" }}>
                  CURRENT COURSE
                </div>
                <div style={{
                  marginTop: "3px",
                  fontSize: "15px",
                  fontWeight: "700",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "260px",
                }}>
                  {currentCourse?.title || "No course selected"}
                </div>
              </div>

              <div style={{ flex: 1 }}></div>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                title="Search"
                style={{
                  width: "38px",
                  height: "38px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  background: "#fff",
                  color: "#69697B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F1F4FF";
                  e.currentTarget.style.color = "#3434FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#69697B";
                }}
              >
                <Search size={17} />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setNotifsOpen(!notifsOpen)}
                title="Notifications"
                style={{
                  width: "38px",
                  height: "38px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  background: "#fff",
                  color: "#69697B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F1F4FF";
                  e.currentTarget.style.color = "#3434FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#69697B";
                }}
              >
                <Bell size={17} />
                {notifications.length > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#FF4D4D",
                    border: "2px solid #fff",
                  }}></span>
                )}
              </button>

              {/* Progress */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "none" }}>
                <div style={{ width: "120px", height: "6px", borderRadius: "999px", background: "#EEF1F6", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "45%", background: "#3434FF", borderRadius: "999px" }}></div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#69697B" }}>45%</div>
              </div>
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
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        }
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
