import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Home, Users, Settings, HelpCircle, LogOut, BookOpen, LayoutDashboard, BarChart3, CreditCard, Mail, Award, MessagesSquare, Sparkles, GraduationCap, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import brandMarkWhite from "@/assets/brand-mark-white.png";
import { NotificationBell } from "./NotificationBell";
import type { LmsProfile } from "./useLmsProfile";

/** Which nav item is highlighted: a learner screen, or `admin-<tab>`. */
export type ShellActive = "dash" | "learning" | "community" | "settings" | "support" | `admin-${string}` | null;

const RAIL_KEY = "lms-rail-open";
const readRail = () => {
  try { const v = localStorage.getItem(RAIL_KEY); if (v !== null) return v === "1"; } catch { /* private mode */ }
  return typeof window === "undefined" ? true : window.innerWidth >= 900;
};
const isPhone = () => typeof window !== "undefined" && window.innerWidth < 640;

/**
 * The one frame every signed-in LMS page sits in: the navy sidebar (a slide-out
 * menu on phones) and the sticky top bar with the notification bell. Pages pass
 * their own top-bar content (`header`) and highlight their nav item (`active`).
 */
export function LmsShell({ profile, active, header, onNavigate, onStartTour, children }: {
  profile: LmsProfile | null;
  active: ShellActive;
  header?: ReactNode;
  /** Inside the dashboard app, screen changes go through its own router state. */
  onNavigate?: (view: string) => void;
  onStartTour?: () => void;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [railOpen, setRailOpen] = useState(readRail);
  const [phone, setPhone] = useState(isPhone);
  const [menuOpen, setMenuOpen] = useState(false); // phones only

  useEffect(() => {
    const onResize = () => setPhone(isPhone());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleRail = () => {
    if (phone) { setMenuOpen((o) => !o); return; }
    setRailOpen((o) => { try { localStorage.setItem(RAIL_KEY, o ? "0" : "1"); } catch { /* ignore */ } return !o; });
  };

  const go = (view: string) => {
    setMenuOpen(false);
    if (onNavigate) onNavigate(view);
    else navigate(view === "dash" ? "/learn" : `/learn?view=${view.replace(/^admin:/, "admin-")}`);
  };
  const startTour = () => {
    setMenuOpen(false);
    if (onStartTour) onStartTour();
    else navigate("/learn?tour=1");
  };

  const open = phone ? true : railOpen;          // the phone menu always shows labels
  const width = open ? 240 : 80;
  const offset = phone ? 0 : width;
  const isActive = (key: string) => active === key;

  const initials = (profile?.full_name ?? "").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0b0b2c", background: "#eef1f6" }}>
      {phone && menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,11,44,.45)", zIndex: 39 }} />}

      {/* SIDEBAR */}
      <aside
        aria-label="Main menu"
        style={{
          width, flex: "none", background: "#0b0b2c", display: "flex", flexDirection: "column",
          position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 40, overflow: "hidden",
          transform: phone && !menuOpen ? "translateX(-100%)" : "none",
          transition: "width .25s cubic-bezier(.4,0,.2,1), transform .25s cubic-bezier(.4,0,.2,1)",
          boxShadow: (phone && menuOpen) || (!phone && railOpen) ? "0 18px 40px rgba(11,11,44,.16)" : "none",
        }}
      >
        <div style={{ height: 72, flex: "none", display: "flex", alignItems: "center", gap: 12, padding: "0 18px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <button onClick={toggleRail} title={phone ? "Close menu" : "Toggle menu"} aria-label={phone ? "Close menu" : "Toggle menu"} style={iconBtn}>
            {phone ? <X size={19} /> : <Menu size={19} />}
          </button>
          {open && <img src={brandMarkWhite} alt="SafetyTech Academy" style={{ height: 26, width: "auto", flex: "none" }} />}
        </div>

        <nav style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div data-tour="nav" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <NavButton icon={<Home size={19} />} label="Dashboard" active={isActive("dash")} onClick={() => go("dash")} open={open} />
            <NavButton icon={<GraduationCap size={19} />} label="My learning" active={isActive("learning")} onClick={() => go("learning")} open={open} />
            <NavButton icon={<Users size={19} />} label="Community" active={isActive("community")} onClick={() => go("community")} open={open} />
            <NavButton icon={<Settings size={19} />} label="Settings" active={isActive("settings")} onClick={() => go("settings")} open={open} />
            <NavButton icon={<Sparkles size={19} />} label="Take the tour" active={false} onClick={startTour} open={open} />
            <NavButton icon={<HelpCircle size={19} />} label="Support" tour="nav-support" active={isActive("support")} onClick={() => go("support")} open={open} />
          </div>

          {profile?.isAdmin && (
            <div data-tour-admin style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 1, background: "rgba(255,255,255,.1)", margin: "10px 4px" }} />
              {open && <div style={{ padding: "0 12px 8px", fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "rgba(255,255,255,.32)" }}>ADMIN</div>}
              <NavButton icon={<LayoutDashboard size={19} />} label="Overview" active={isActive("admin-overview")} onClick={() => go("admin:overview")} open={open} />
              <NavButton icon={<BookOpen size={19} />} label="Courses" active={isActive("admin-courses")} onClick={() => { setMenuOpen(false); navigate("/admin/courses"); }} open={open} />
              <NavButton icon={<Users size={19} />} label="Users" active={isActive("admin-users")} onClick={() => go("admin:users")} open={open} />
              <NavButton icon={<Award size={19} />} label="Access" active={isActive("admin-access")} onClick={() => go("admin:access")} open={open} />
              <NavButton icon={<Mail size={19} />} label="Emails" active={isActive("admin-emails")} onClick={() => go("admin:emails")} open={open} />
              <NavButton icon={<BarChart3 size={19} />} label="Reports" active={isActive("admin-reports")} onClick={() => go("admin:reports")} open={open} />
              <NavButton icon={<CreditCard size={19} />} label="Billing" active={isActive("admin-billing")} onClick={() => go("admin:billing")} open={open} />
              <NavButton icon={<MessagesSquare size={19} />} label="Moderation" active={isActive("admin-community")} onClick={() => go("admin:community")} open={open} />
            </div>
          )}

          <div style={{ marginTop: "auto", flex: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ height: 1, background: "rgba(255,255,255,.1)", margin: "8px 4px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, borderRadius: 10, background: "rgba(255,255,255,.06)" }}>
              <div style={{ width: 34, height: 34, flex: "none", borderRadius: "50%", background: "#3434ff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials}
              </div>
              {open && (
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span data-private={profile?.full_name ? undefined : ""}>{profile?.full_name || profile?.email.split("@")[0] || "You"}</span>
                  </div>
                  <div style={{ marginTop: 2, fontSize: 12, color: "rgba(255,255,255,.5)" }}>{profile?.cpdHours ?? 0} CPD hour{profile?.cpdHours === 1 ? "" : "s"}</div>
                </div>
              )}
            </div>
            <NavButton icon={<LogOut size={19} style={{ flex: "none" }} />} label="Sign out" active={false} open={open}
              onClick={async () => { await supabase.auth.signOut(); navigate("/learn/auth"); }} />
          </div>
        </nav>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, minWidth: 0, marginLeft: offset, transition: "margin-left .25s cubic-bezier(.4,0,.2,1)" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.86)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: phone ? "0 12px" : "0 28px", height: 72, display: "flex", alignItems: "center", gap: phone ? 12 : 24 }}>
            {phone && (
              <button onClick={() => setMenuOpen(true)} aria-label="Open menu" style={{ ...iconBtn, background: "#0b0b2c" }}>
                <Menu size={19} />
              </button>
            )}
            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 20 }}>{header}</div>
            {profile && <NotificationBell userId={profile.id} />}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 40, height: 40, flex: "none", border: 0, borderRadius: 10, background: "rgba(255,255,255,.08)", color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};

function NavButton({ icon, label, active, onClick, open, tour }: { icon: ReactNode; label: string; active: boolean; onClick: () => void; open: boolean; tour?: string }) {
  return (
    <button
      data-tour={tour}
      onClick={onClick}
      title={label}
      aria-current={active ? "page" : undefined}
      style={{
        border: 0, background: active ? "rgba(255,255,255,.12)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,.6)",
        fontFamily: "inherit", fontSize: 14, fontWeight: 600, borderRadius: 10, padding: 12, display: "flex", alignItems: "center",
        gap: 14, cursor: "pointer", textAlign: "left", whiteSpace: "nowrap", transition: "background .2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {icon}
      {open && <span>{label}</span>}
    </button>
  );
}

/** The standard top-bar title block: small label over a bold line. */
export function ShellTitle({ label, title }: { label: string; title: ReactNode }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "#8ab815" }}>{label}</div>
      <div style={{ marginTop: 3, fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
    </div>
  );
}
