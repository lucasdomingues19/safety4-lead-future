import React, { useState, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { PlayCircle } from "lucide-react";
import { miaPhoto } from "@/components/learn/MiaAvatar";
import { MiaHelp } from "@/components/learn/MiaHelp";
import { LmsShell, ShellTitle } from "@/components/learn/shell/LmsShell";
import { useLmsProfile } from "@/components/learn/shell/useLmsProfile";
import { dismissTourBanner, markTourDone, tourBannerDismissed, tourSeenLocally } from "@/lib/tour";
const MiaTour = React.lazy(() => import("@/components/learn/tour/MiaTour").then(m => ({ default: m.MiaTour })));
import { toast } from "sonner";

// Screen components - lazy load to isolate errors
const LmsDashboard = React.lazy(() => import("@/components/learn/LmsDashboard").then(m => ({ default: m.LmsDashboard })));
const LmsCommunity = React.lazy(() => import("@/components/learn/LmsCommunity").then(m => ({ default: m.LmsCommunity })));
const LmsSettings = React.lazy(() => import("@/components/learn/LmsSettings").then(m => ({ default: m.LmsSettings })));
const LmsMyLearning = React.lazy(() => import("@/components/learn/LmsMyLearning").then(m => ({ default: m.LmsMyLearning })));
const LmsTeam = React.lazy(() => import("@/components/learn/LmsTeam").then(m => ({ default: m.LmsTeam })));
const LmsAdminTeams = React.lazy(() => import("@/components/learn/admin/LmsAdminTeams").then(m => ({ default: m.LmsAdminTeams })));
const LmsSupport = React.lazy(() => import("@/components/learn/LmsSupport").then(m => ({ default: m.LmsSupport })));
const LmsAdminOverview = React.lazy(() => import("@/components/learn/admin/LmsAdminOverview").then(m => ({ default: m.LmsAdminOverview })));
const LmsAdminUsers = React.lazy(() => import("@/components/learn/admin/LmsAdminUsers").then(m => ({ default: m.LmsAdminUsers })));
const LmsAdminAccess = React.lazy(() => import("@/components/learn/admin/LmsAdminAccess").then(m => ({ default: m.LmsAdminAccess })));
const LmsAdminEmails = React.lazy(() => import("@/components/learn/admin/LmsAdminEmails").then(m => ({ default: m.LmsAdminEmails })));
const LmsAdminReports = React.lazy(() => import("@/components/learn/admin/reports/ReportsHub").then(m => ({ default: m.LmsAdminReports })));
const LmsAdminBilling = React.lazy(() => import("@/components/learn/admin/billing/BillingHub").then(m => ({ default: m.BillingHub })));
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
    const { authUser, authLoading, profile } = useLmsProfile();
    const navigate = useNavigate();

    // Screen State lives in the URL (?view=community, ?view=admin-billing) so a
    // refresh, the Back button, a bookmark or the stale-chunk auto-reload all
    // land on the same screen instead of the dashboard.
    const [params, setParams] = useSearchParams();
    const view = params.get("view") ?? "dash";
    const screen = (view.startsWith("admin-") ? "admin" : LEARNER_SCREENS.includes(view as LearnerScreen) ? view : "dash") as LearnerScreen | "admin";
    const adminTab = (view.startsWith("admin-") && ADMIN_TABS.includes(view.slice(6) as AdminTab) ? view.slice(6) : "overview") as AdminTab;

    const lmsUser = profile ? { id: profile.id, email: profile.email, full_name: profile.full_name, avatar_url: profile.avatar_url } : null;
    const isAdmin = !!profile?.isAdmin;
    // First-run guided tour: offered once, replayable from Support and the sidebar.
    const [tourInvite, setTourInvite] = useState(false);
    const [tourOpen, setTourOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<any>(null);

    useEffect(() => {
      if (profile && !profile.tour_completed_at && !tourSeenLocally(profile.id)) setTourInvite(true);
    }, [profile?.id]);

    // After the popup is skipped or closed, a banner stays on the dashboard until the tour is finished or dismissed.
    const [bannerGone, setBannerGone] = useState(false);
    const showTourBanner = !!profile && screen === "dash" && profile.tour_status !== "completed" && !tourInvite && !tourOpen && !bannerGone && !tourBannerDismissed(profile.id);

    // Pages outside this screen (course, lesson) start the tour with ?tour=1.
    useEffect(() => {
      if (params.get("tour") !== "1") return;
      setTourInvite(false);
      setTourOpen(true);
      setParams((p) => { const q = new URLSearchParams(p); q.delete("tour"); return q; }, { replace: true });
    }, [params]);

  const handleNavigation = (screenName: string, opts: { replace?: boolean } = {}) => {
    const next = screenName.startsWith("admin:") ? `admin-${screenName.slice(6)}` : screenName;
    if (next === view) return;
    setParams((p) => {
      const q = new URLSearchParams(p);
      if (next === "dash") q.delete("view"); else q.set("view", next);
      return q;
    }, { replace: opts.replace });
    window.scrollTo(0, 0);
  };

  // Render screen
  const renderScreen = () => {
    const content = (() => {
      if (screen === "dash") return <LmsDashboard currentCourse={currentCourse} setCurrentCourse={setCurrentCourse} onNavigate={handleNavigation} />;
      if (screen === "learning") return <LmsMyLearning onNavigate={handleNavigation} />;
      if (screen === "team") return <LmsTeam />;
      if (screen === "community") return <LmsCommunity />;
      if (screen === "settings") return <LmsSettings />;
      if (screen === "support") return <LmsSupport onStartTour={() => setTourOpen(true)} />;
      // Admin role is still loading (e.g. right after a refresh on an admin
      // screen): don't flash the dashboard first.
      if (screen === "admin" && !lmsUser) return <div style={{ minHeight: "100vh", background: "#eef1f6" }} />;
      if (screen === "admin" && isAdmin) {
        const ADMIN_PAGES: Record<string, { title: string; sub: string; el: React.ReactNode }> = {
          overview: { title: "Overview", sub: "How your academy is doing at a glance.", el: <LmsAdminOverview /> },
          users: { title: "People", sub: "Everyone on the platform and what they can access.", el: <LmsAdminUsers /> },
          access: { title: "Access", sub: "Who has each course, and until when.", el: <LmsAdminAccess /> },
          teams: { title: "Teams", sub: "Companies, their seats, and invoices for team purchases.", el: <LmsAdminTeams /> },
          emails: { title: "Emails", sub: "Automatic emails to learners, and announcements you send yourself.", el: <LmsAdminEmails /> },
          reports: { title: "Reports", sub: "How learners are progressing — dashboards, learner tracking and quiz analytics, with exports.", el: <LmsAdminReports /> },
          billing: { title: "Billing", sub: "Payments, sales and invoices, discount codes and bundles.", el: <LmsAdminBilling /> },
          community: { title: "Moderation", sub: "Review and remove community content.", el: <LmsAdminCommunity /> },
        };
        const page = ADMIN_PAGES[adminTab];
        if (page) {
          return (
            <div style={{ minHeight: "100vh", background: "#eef1f6", padding: "40px 28px 72px", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0b0b2c" }}>
              <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815" }}>ADMIN</div>
                <h1 style={{ margin: "10px 0 0", fontSize: "34px", lineHeight: 1.1, fontWeight: 700 }}>{page.title}</h1>
                <p style={{ margin: "8px 0 0", fontSize: "15px", color: "#69697b" }}>{page.sub}</p>
                {page.el}
              </div>
            </div>
          );
        }
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
        <ScreenErrorBoundary key={screen + adminTab} screen={screen === "admin" ? `admin:${adminTab}` : screen}>{content}</ScreenErrorBoundary>
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

  const header = currentCourse ? (
    <>
      <ShellTitle label="CURRENT COURSE" title={currentCourse.title} />
      <div style={{ alignItems: "center", gap: "12px", flex: "none" }} className="hidden sm:flex">
        <div style={{ width: "120px", height: "6px", borderRadius: "999px", background: "#eef1f6", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${currentCourse.progressPercent ?? 0}%`, background: "#3434ff", borderRadius: "999px" }}></div>
        </div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#69697b" }}>{currentCourse.progressPercent ?? 0}%</div>
      </div>
      <button
        onClick={() => navigate(currentCourse.nextLessonId ? `/learn/${currentCourse.slug}/lesson/${currentCourse.nextLessonId}` : `/learn/${currentCourse.slug}`)}
        aria-label={currentCourse.started ? "Resume course" : "Start course"}
        className="px-3 sm:px-4"
        style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", border: 0, borderRadius: "10px", background: "#3434ff", color: "#fff", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, minHeight: "40px", cursor: "pointer" }}
      >
        <PlayCircle size={16} /> <span className="hidden sm:inline">{currentCourse.started ? "Resume" : "Start"}</span>
      </button>
    </>
  ) : <ShellTitle label="WELCOME" title="Pick a course to get started" />;

  return (
    <LmsContext.Provider value={{ user: lmsUser, currentCourse, setCurrentCourse, isAdmin }}>
      <LmsShell
        profile={profile}
        active={screen === "admin" ? `admin-${adminTab}` : screen}
        header={header}
        onNavigate={(v) => handleNavigation(v)}
        onStartTour={() => setTourOpen(true)}
      >
          {showTourBanner && lmsUser && (
            <div role="region" aria-label="Take the tour" style={{ margin: "16px 28px 0", maxWidth: 1400, marginInline: "auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "linear-gradient(120deg,#11114a,#0b0b2c)", color: "#fff", borderRadius: 16, padding: "14px 18px", boxShadow: "0 10px 30px rgba(11,11,44,.18)" }}>
              <img src={miaPhoto} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #9eff1f", flex: "none" }} />
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>New here? Take a 2-minute tour with Mia</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 2 }}>See where your lessons, quizzes, certificates and the community live.</div>
              </div>
              <button onClick={() => setTourOpen(true)} style={{ border: 0, borderRadius: 10, background: "#9eff1f", color: "#0b0b2c", fontWeight: 800, fontSize: 14, padding: "10px 18px", cursor: "pointer", fontFamily: "inherit" }}>Start the tour</button>
              <button onClick={() => { dismissTourBanner(lmsUser.id); setBannerGone(true); }} aria-label="Dismiss" style={{ border: 0, background: "none", color: "rgba(255,255,255,.6)", fontSize: 22, lineHeight: 1, cursor: "pointer", padding: "4px 6px" }}>×</button>
            </div>
          )}
          {/* SCREEN CONTENT */}
          <div data-tour-stage style={{ minHeight: "calc(100vh - 72px)" }}>
            {renderScreen()}
          </div>

          {tourInvite && !tourOpen && lmsUser && (
            <div style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(11,11,44,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <div style={{ width: "100%", maxWidth: 440, background: "linear-gradient(160deg,#11114a,#0b0b2c)", color: "#fff", borderRadius: 24, padding: "32px 30px", textAlign: "center", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
                <img src={miaPhoto} alt="Mia" style={{ width: 84, height: 84, margin: "0 auto", borderRadius: "50%", objectFit: "cover", display: "block", boxShadow: "0 0 0 3px #9eff1f" }} />
                <h2 style={{ margin: "18px 0 8px", fontSize: 26, fontWeight: 800 }}>Welcome, {(lmsUser.full_name || "").split(" ")[0] || "there"}!</h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,.72)" }}>I'm Mia, your guide. Let me show you around the academy — it takes about two minutes. Sound on for the best experience.</p>
                <button onClick={() => { setTourInvite(false); setTourOpen(true); }} style={{ marginTop: 22, width: "100%", border: 0, borderRadius: 12, background: "#9eff1f", color: "#0b0b2c", fontWeight: 800, fontSize: 15, padding: "14px 18px", cursor: "pointer", fontFamily: "inherit" }}>Show me around</button>
                <button onClick={() => { setTourInvite(false); markTourDone(lmsUser.id, { completed: false, step: 0 }); }} style={{ marginTop: 10, border: 0, background: "none", color: "rgba(255,255,255,.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Skip — I'll explore myself</button>
              </div>
            </div>
          )}
          {tourOpen && lmsUser && (
            <React.Suspense fallback={null}>
              <MiaTour
                name={lmsUser.full_name || ""}
                isAdmin={isAdmin}
                screen={screen}
                onNavigate={(sc) => handleNavigation(sc, { replace: true })}
                ctaLabel={currentCourse?.nextLessonId ? "Start learning" : "Explore courses"}
                onClose={(outcome) => { setTourOpen(false); markTourDone(lmsUser.id, outcome); }}
                onFinish={() => {
                  setTourOpen(false);
                  markTourDone(lmsUser.id, { completed: true, step: 13 });
                  if (currentCourse?.nextLessonId && currentCourse?.slug) navigate(`/learn/${currentCourse.slug}/lesson/${currentCourse.nextLessonId}`);
                  else handleNavigation("dash");
                }}
              />
            </React.Suspense>
          )}
      </LmsShell>

      <MiaHelp />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </LmsContext.Provider>
    );
}

// A screen whose code was replaced by a newer deploy while the tab stayed open
// fails to load its chunk; reloading once fixes it for good.

const LEARNER_SCREENS = ["dash", "learning", "team", "community", "settings", "support"] as const;
type LearnerScreen = (typeof LEARNER_SCREENS)[number];
const ADMIN_TABS = ["overview", "courses", "users", "access", "teams", "emails", "reports", "billing", "community"] as const;
type AdminTab = (typeof ADMIN_TABS)[number];

const STALE_CHUNK = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading chunk \S+ failed/i;
const RELOAD_KEY = "lms-chunk-reload";

class ScreenErrorBoundary extends React.Component<{ children: React.ReactNode; screen?: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("LMS screen error:", error);
    if (STALE_CHUNK.test(String(error?.message))) {
      let last = 0;
      try { last = Number(sessionStorage.getItem(RELOAD_KEY) || 0); } catch { /* private mode */ }
      if (Date.now() - last > 60_000) {
        try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())); } catch { /* private mode */ }
        window.location.reload();
        return;
      }
    }
    // Record it so admins can see what actually broke.
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("client_errors").insert({
        user_id: data.user.id,
        screen: (this.props.screen ?? "").slice(0, 60),
        message: String(error?.message ?? error).slice(0, 1000),
        stack: String(error?.stack ?? "").slice(0, 4000),
        url: window.location.href.slice(0, 500),
        user_agent: navigator.userAgent.slice(0, 300),
      }).then(() => undefined);
    });
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
