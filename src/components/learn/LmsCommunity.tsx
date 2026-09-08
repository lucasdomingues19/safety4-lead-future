import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Heart, MessageCircle, Share2, Award, Zap, TrendingUp, Lock, Image, Video, BarChart3, Send, Plus } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  author: string;
  initials: string;
  avBg: string;
  avFg: string;
  levelLabel: string;
  space: string;
  time: string;
  textNode: string;
  pinned?: boolean;
  reactions: { emoji: string; count: number; bg: string; fg: string; onClick: () => void }[];
  replies: number;
}

interface LearnerSpace {
  name: string;
  onClick: () => void;
  bg: string;
  fg: string;
  weight: string;
  tierLabel: string;
  tierBg: string;
  tierFg: string;
  lockShow: string;
  lockIcon: string;
}

interface TopContributor {
  medal: string;
  medalFg: string;
  initials: string;
  avBg: string;
  avFg: string;
  name: string;
  points: string;
}

export function LmsCommunity() {
  const { user } = useAuthUser();
  const [initials, setInitials] = useState("LU");
  const [learnerName, setLearnerName] = useState("You");
  const [cpdHours, setCpdHours] = useState("8+");

  // Community Hero States
  const [heroName, setHeroName] = useState("Safety 4.0 Community");
  const [heroTagline, setHeroTagline] = useState("Share insights, learn from peers, and grow together in our thriving Safety 4.0 ecosystem.");
  const [heroTierLabel, setHeroTierLabel] = useState("FREE SPACE");
  const [heroIsPaid, setHeroIsPaid] = useState(false);
  const [heroIsFree, setHeroIsFree] = useState(true);
  const [communityMemberCount, setCommunityMemberCount] = useState("2,847");
  const [myStreak, setMyStreak] = useState(12);
  const [paidAccessDays, setPaidAccessDays] = useState(0);
  const [heroAccessShow, setHeroAccessShow] = useState("none");

  // Composer States
  const [composerPlaceholder, setComposerPlaceholder] = useState("Share a prompt, ask a question, celebrate a win…");
  const [showPhotoAttach, setShowPhotoAttach] = useState(false);
  const [showVideoAttach, setShowVideoAttach] = useState(false);
  const [showPollAttach, setShowPollAttach] = useState(false);
  const [photoBtnBg, setPhotoBtnBg] = useState("transparent");
  const [photoBtnFg, setPhotoBtnFg] = useState("#69697b");
  const [videoBtnBg, setVideoBtnBg] = useState("transparent");
  const [videoBtnFg, setVideoBtnFg] = useState("#69697b");
  const [pollBtnBg, setPollBtnBg] = useState("transparent");
  const [pollBtnFg, setPollBtnFg] = useState("#69697b");
  const [pollOptions, setPollOptions] = useState([{ label: "Option 1" }, { label: "Option 2" }]);

  // User Stats
  const [myPoints, setMyPoints] = useState(2840);
  const [myRank, setMyRank] = useState(12);
  const [myLevelLabel, setMyLevelLabel] = useState("Silver");
  const [myLevelPct, setMyLevelPct] = useState("65%");
  const [myLevelHint, setMyLevelHint] = useState("645 pts to Gold");

  // Upgrade Card
  const [showUpgradeCard, setShowUpgradeCard] = useState(false);
  const [showOfferSlot, setShowOfferSlot] = useState(true);

  // Leaderboard
  const [topContributors, setTopContributors] = useState<TopContributor[]>([
    {
      medal: "🥇",
      medalFg: "#fbbf24",
      initials: "SC",
      avBg: "#3434ff",
      avFg: "#fff",
      name: "Sarah Chen",
      points: "5,420",
    },
    {
      medal: "🥈",
      medalFg: "#94a3b8",
      initials: "MJ",
      avBg: "#8ab815",
      avFg: "#fff",
      name: "Marcus Johnson",
      points: "4,920",
    },
    {
      medal: "🥉",
      medalFg: "#d97706",
      initials: "EW",
      avBg: "#ec4899",
      avFg: "#fff",
      name: "Emma Wilson",
      points: "4,210",
    },
    {
      medal: "4",
      medalFg: "#94a3b8",
      initials: "JM",
      avBg: "#f59e0b",
      avFg: "#fff",
      name: "James Miller",
      points: "3,850",
    },
  ]);

  // Learner Spaces
  const [learnerSpaces, setLearnerSpaces] = useState<LearnerSpace[]>([
    {
      name: "Safety 4.0",
      onClick: () => {},
      bg: "#f1f4ff",
      fg: "#3434ff",
      weight: "700",
      tierLabel: "FREE",
      tierBg: "#eef1f6",
      tierFg: "#69697b",
      lockShow: "none",
      lockIcon: "🔓",
    },
    {
      name: "AI for EHS",
      onClick: () => {},
      bg: "transparent",
      fg: "#69697b",
      weight: "600",
      tierLabel: "FREE",
      tierBg: "transparent",
      tierFg: "#94a3b8",
      lockShow: "none",
      lockIcon: "",
    },
    {
      name: "Copilot Tips",
      onClick: () => {},
      bg: "transparent",
      fg: "#69697b",
      weight: "600",
      tierLabel: "PAID",
      tierBg: "transparent",
      tierFg: "#94a3b8",
      lockShow: "inline",
      lockIcon: "🔒",
    },
    {
      name: "Governance",
      onClick: () => {},
      bg: "transparent",
      fg: "#69697b",
      weight: "600",
      tierLabel: "PAID",
      tierBg: "transparent",
      tierFg: "#94a3b8",
      lockShow: "inline",
      lockIcon: "🔒",
    },
  ]);

  // Community Feed
  const [communityFeed, setCommunityFeed] = useState<Post[]>([
    {
      id: "1",
      author: "Sarah Chen",
      initials: "SC",
      avBg: "#3434ff",
      avFg: "#fff",
      levelLabel: "Gold",
      space: "Safety 4.0",
      time: "2 hours ago",
      textNode: "Just completed the Safety 4.0 Accelerator! The AI governance module was eye-opening. Highly recommend for anyone managing digital transformation.",
      pinned: true,
      reactions: [
        { emoji: "❤️", count: 24, bg: "#fef2f2", fg: "#dc2626", onClick: () => {} },
        { emoji: "🔥", count: 12, bg: "#fef3c7", fg: "#f59e0b", onClick: () => {} },
      ],
      replies: 8,
    },
    {
      id: "2",
      author: "Marcus Johnson",
      initials: "MJ",
      avBg: "#8ab815",
      avFg: "#fff",
      levelLabel: "Silver",
      space: "Copilot Tips",
      time: "4 hours ago",
      textNode: "Has anyone integrated Copilot for automated safety reports? Would love to hear about your implementation approach and challenges.",
      reactions: [
        { emoji: "👍", count: 18, bg: "#dbeafe", fg: "#3434ff", onClick: () => {} },
        { emoji: "💡", count: 9, bg: "#fef3c7", fg: "#f59e0b", onClick: () => {} },
      ],
      replies: 12,
    },
  ]);

  useEffect(() => {
    if (user?.email) {
      const parts = user.email.split("@")[0].split(".");
      const initials = (parts[0]?.[0] + parts[1]?.[0] || user.email.slice(0, 2)).toUpperCase();
      setInitials(initials);
      setLearnerName(parts[0]?.charAt(0).toUpperCase() + parts[0]?.slice(1) || "Learner");
    }
  }, [user]);

  const togglePhotoAttach = () => {
    setShowPhotoAttach(!showPhotoAttach);
    if (!showPhotoAttach) {
      setShowVideoAttach(false);
      setShowPollAttach(false);
      setPhotoBtnBg("#f1f4ff");
      setPhotoBtnFg("#3434ff");
    } else {
      setPhotoBtnBg("transparent");
      setPhotoBtnFg("#69697b");
    }
  };

  const toggleVideoAttach = () => {
    setShowVideoAttach(!showVideoAttach);
    if (!showVideoAttach) {
      setShowPhotoAttach(false);
      setShowPollAttach(false);
      setVideoBtnBg("#f1f4ff");
      setVideoBtnFg("#3434ff");
    } else {
      setVideoBtnBg("transparent");
      setVideoBtnFg("#69697b");
    }
  };

  const togglePollAttach = () => {
    setShowPollAttach(!showPollAttach);
    if (!showPollAttach) {
      setShowPhotoAttach(false);
      setShowVideoAttach(false);
      setPollBtnBg("#f1f4ff");
      setPollBtnFg("#3434ff");
    } else {
      setPollBtnBg("transparent");
      setPollBtnFg("#69697b");
    }
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, { label: `Option ${pollOptions.length + 1}` }]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", color: "#0b0b2c", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero Section */}
      <div style={{ background: "#1a1a3e", position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(52,52,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(52,52,255,0.1) 1px, transparent 1px)", backgroundSize: "36px 36px", animation: "heroGridPan 14s linear infinite" }}></div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 50%, rgba(52,52,255,0.15) 0%, transparent 50%)", animation: "heroGlow 6s ease-in-out infinite", pointerEvents: "none" }}></div>

        <div style={{ position: "relative", maxWidth: "1400px", margin: "0 auto", padding: "48px 28px 38px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "9px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px", padding: "7px 16px", background: "rgba(255,255,255,0.08)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3434ff" }}></span>
              <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.12em", color: "#fff" }}>{heroTierLabel}</span>
            </div>
            <h1 style={{ margin: "18px 0 0", fontSize: "40px", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.015em", color: "#fff" }}>
              {heroName}
            </h1>
            <p style={{ margin: "10px 0 0", fontSize: "15.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: "520px" }}>
              {heroTagline}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", color: "rgba(255,255,255,0.7)" }}>
            {heroIsFree && <div style={{ fontSize: "13px", fontWeight: 600 }}>✓</div>}
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{communityMemberCount} members</div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <Zap size={15} />
              <span style={{ fontSize: "13px", fontWeight: 700 }}>{myStreak}-day streak</span>
            </div>
            {heroAccessShow === "flex" && (
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <Lock size={15} />
                <span style={{ fontSize: "13px", fontWeight: 700 }}>{paidAccessDays} days left</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 28px 72px" }}>
        {/* Weekly Challenge */}
        <div style={{ background: "radial-gradient(120% 180% at 88% 10%, #17176e 0%, #0a0a38 58%, #05051e 100%)", borderRadius: "20px", padding: "24px 26px", position: "relative", overflow: "hidden", marginBottom: "22px" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "36px 36px", opacity: 0.3 }}></div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(166,226,26,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={21} color="#a6e21a" />
            </div>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em", color: "#a6e21a" }}>THIS WEEK'S CHALLENGE</div>
              <div style={{ marginTop: "6px", fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                Share the prompt that saved you the most time this month — best one gets pinned.
              </div>
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>+50 pts to enter</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "240px minmax(0,1fr) 300px", gap: "24px", alignItems: "start" }}>
          {/* Left: Spaces */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {learnerSpaces.map((sp, idx) => (
              <button
                key={idx}
                onClick={sp.onClick}
                style={{
                  textAlign: "left",
                  border: "0",
                  background: sp.bg,
                  color: sp.fg,
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: sp.weight as any,
                  borderRadius: "10px",
                  padding: "11px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(52,52,255,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = sp.bg)}
              >
                <span>{sp.name}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.04em", color: sp.tierFg, background: sp.tierBg, borderRadius: "999px", padding: "2px 6px" }}>
                    {sp.tierLabel}
                  </span>
                  {sp.lockShow === "inline" && <span style={{ fontSize: "10px", fontWeight: 800, color: "#3434ff" }}>{sp.lockIcon}</span>}
                </span>
              </button>
            ))}
          </div>

          {/* Middle: Posts & Composer */}
          <div>
            {/* Composer Card */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "20px 22px", marginBottom: "18px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#3434ff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flex: "none" }}>
                  {initials}
                </div>
                <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px 16px", fontSize: "14.5px", color: "#94a3b8" }}>
                  {composerPlaceholder}
                </div>
              </div>
              <div style={{ marginTop: "6px", marginLeft: "52px", fontSize: "11.5px", color: "#94a3b8" }}>
                Type @ to mention someone — they'll be notified even outside this space.
              </div>

              {/* Attachments */}
              {showPhotoAttach && (
                <div style={{ marginTop: "12px", marginLeft: "52px", width: "200px", height: "130px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                  📸 Photo attached
                </div>
              )}
              {showVideoAttach && (
                <div style={{ marginTop: "12px", marginLeft: "52px", width: "240px", height: "130px", borderRadius: "12px", border: "1.5px dashed #cbd5e1", background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Video size={22} color="#94a3b8" />
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Click to attach a video</div>
                </div>
              )}
              {showPollAttach && (
                <div style={{ marginTop: "12px", marginLeft: "52px", maxWidth: "340px", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#94a3b8" }}>POLL</div>
                  {pollOptions.map((po, idx) => (
                    <div key={idx} style={{ marginTop: "8px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "9px 12px", fontSize: "13.5px", color: "#69697b" }}>
                      {po.label}
                    </div>
                  ))}
                  <button
                    onClick={addPollOption}
                    style={{
                      marginTop: "8px",
                      border: "1px dashed #cbd5e1",
                      borderRadius: "8px",
                      background: "transparent",
                      color: "#69697b",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "8px 12px",
                      cursor: "pointer",
                      width: "100%",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#3434ff";
                      e.currentTarget.style.color = "#3434ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.color = "#69697b";
                    }}
                  >
                    + Add option
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: "12px", marginLeft: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={togglePhotoAttach}
                    title="Photo"
                    style={{
                      border: "0",
                      background: photoBtnBg,
                      color: photoBtnFg,
                      borderRadius: "8px",
                      padding: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <Image size={17} />
                  </button>
                  <button
                    onClick={toggleVideoAttach}
                    title="Video"
                    style={{
                      border: "0",
                      background: videoBtnBg,
                      color: videoBtnFg,
                      borderRadius: "8px",
                      padding: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <Video size={17} />
                  </button>
                  <button
                    onClick={togglePollAttach}
                    title="Poll"
                    style={{
                      border: "0",
                      background: pollBtnBg,
                      color: pollBtnFg,
                      borderRadius: "8px",
                      padding: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <BarChart3 size={17} />
                  </button>
                </div>
                <button
                  style={{
                    border: "0",
                    borderRadius: "8px",
                    background: "#3434ff",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "11px 20px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2ad6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#3434ff")}
                >
                  Post
                </button>
              </div>
            </div>

            {/* Feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {communityFeed.map((p) => (
                <div key={p.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: p.avBg,
                        color: p.avFg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        flex: "none",
                      }}
                    >
                      {p.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14.5px", fontWeight: 700 }}>{p.author}</span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>{p.levelLabel}</span>
                        {p.pinned && <span style={{ fontSize: "11px", fontWeight: 700, color: "#8ab815" }}>· Pinned</span>}
                      </div>
                      <div style={{ marginTop: "2px", fontSize: "12.5px", color: "#94a3b8" }}>
                        {p.space} · {p.time}
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: "14px 0 0", fontSize: "14.5px", lineHeight: 1.7, color: "#3d3d54" }}>
                    {p.textNode}
                  </p>
                  <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    {p.reactions.map((rx, idx) => (
                      <button
                        key={idx}
                        onClick={rx.onClick}
                        style={{
                          border: "0",
                          background: rx.bg,
                          borderRadius: "8px",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: rx.fg,
                          cursor: "pointer",
                          padding: "4px 8px",
                          transition: "all 0.2s",
                        }}
                      >
                        <span>{rx.emoji}</span>
                        <span>{rx.count}</span>
                      </button>
                    ))}
                    <button style={{ border: "0", background: "transparent", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, color: "#69697b", cursor: "pointer", padding: "0" }}>
                      {p.replies} replies
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stats & Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* User Standing */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", color: "#94a3b8" }}>YOUR STANDING</div>
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <span style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.01em" }}>{myPoints}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8" }}>pts</span>
              </div>
              <div style={{ marginTop: "6px", fontSize: "12.5px", fontWeight: 700, color: "#3434ff" }}>
                {myLevelLabel} · rank #{myRank}
              </div>
              <div style={{ marginTop: "14px", height: "6px", borderRadius: "999px", background: "#eef1f6", overflow: "hidden" }}>
                <div style={{ height: "100%", width: myLevelPct, background: "#3434ff", borderRadius: "999px" }}></div>
              </div>
              <div style={{ marginTop: "8px", fontSize: "11.5px", color: "#94a3b8" }}>
                {myLevelHint}
              </div>
            </div>

            {/* Top Contributors */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700 }}>Top contributors</div>
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "11px" }}>
                {topContributors.map((m, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "22px", fontSize: "13px", fontWeight: 800, color: m.medalFg, flex: "none" }}>
                      {m.medal}
                    </div>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: m.avBg,
                        color: m.avFg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 700,
                        flex: "none",
                      }}
                    >
                      {m.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", flex: "none" }}>
                      {m.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Guidelines */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700 }}>Community guidelines</div>
              <p style={{ margin: "10px 0 0", fontSize: "12.5px", lineHeight: 1.7, color: "#94a3b8" }}>
                Be specific, share real examples, and keep client data confidential. Off-topic promotion isn't welcome here.
              </p>
            </div>

            {/* Upgrade Card */}
            {showUpgradeCard && (
              <div style={{ background: "#f1f4ff", border: "1px solid #d5dcff", borderRadius: "20px", padding: "20px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.06em", color: "#3434ff" }}>
                  LOCKED SPACE
                </div>
                <div style={{ marginTop: "8px", fontSize: "13.5px", fontWeight: 700 }}>
                  Enrol in that course to unlock its space — free members stay in free spaces until they upgrade.
                </div>
                <button
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    border: "0",
                    borderRadius: "8px",
                    background: "#3434ff",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "11px 16px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2ad6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#3434ff")}
                >
                  View courses
                </button>
              </div>
            )}

            {/* Offer Banner */}
            {showOfferSlot && (
              <div style={{ border: "1.5px dashed #cbd5e1", borderRadius: "20px", overflow: "hidden", background: "#f8fafc" }}>
                <div style={{ width: "100%", height: "120px", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                  📢 Offer banner
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#94a3b8" }}>
                    SPONSORED · OFFER PLACEHOLDER
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "13.5px", fontWeight: 700 }}>
                    Feature a course or promotion here
                  </div>
                  <a href="#" style={{ display: "inline-block", marginTop: "8px", fontSize: "12.5px", fontWeight: 700, color: "#3434ff", textDecoration: "none" }}>
                    Configure in admin →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroGridPan {
          0% { background-position: 0px 0px, 0px 0px; }
          100% { background-position: 36px 36px, 36px 36px; }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
