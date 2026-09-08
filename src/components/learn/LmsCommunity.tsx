import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Heart, MessageCircle, Share2, Award, Zap, TrendingUp, Lock } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  author: string;
  avatar: string;
  level: string;
  content: string;
  space: string;
  time: string;
  reactions: { emoji: string; count: number; liked: boolean }[];
  replies: number;
  pinned?: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  icon: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  locked?: boolean;
}

export function LmsCommunity() {
  const { user } = useAuthUser();
  const [activeTab, setActiveTab] = useState<"leaderboard" | "discussions" | "badges" | "challenges">("leaderboard");
  const [userStats, setUserStats] = useState({
    points: 2840,
    rank: 12,
    level: "Bronze",
    streak: 5,
    totalCPD: 24,
  });

  const mockLeaderboard = [
    { rank: 1, name: "Sarah Chen", points: 5420, hours: 32, avatar: "SC" },
    { rank: 2, name: "Marcus Johnson", points: 4920, hours: 28, avatar: "MJ" },
    { rank: 3, name: "Emma Wilson", points: 4210, hours: 24, avatar: "EW" },
    { rank: 4, name: "James Miller", points: 3850, hours: 22, avatar: "JM" },
    { rank: 5, name: "Lisa Anderson", points: 3420, hours: 19, avatar: "LA" },
    { rank: 6, name: "You", points: userStats.points, hours: userStats.totalCPD, avatar: "YO", highlight: true },
  ];

  const mockSpaces = [
    { name: "Safety 4.0", description: "Discussion on AI-powered EHS", members: 342, posts: 1240 },
    { name: "AI for EHS", description: "General AI safety discussions", members: 289, posts: 856 },
    { name: "Copilot Tips", description: "Share your best Copilot prompts", members: 178, posts: 542 },
    { name: "Governance", description: "AI governance frameworks & policies", members: 145, posts: 328 },
  ];

  const mockPosts: Post[] = [
    {
      id: "1",
      author: "Sarah Chen",
      avatar: "SC",
      level: "Gold",
      content: "Just completed the Safety 4.0 Accelerator! The AI governance module was eye-opening. Highly recommend for anyone managing digital transformation.",
      space: "Safety 4.0",
      time: "2 hours ago",
      reactions: [
        { emoji: "❤️", count: 24, liked: false },
        { emoji: "🔥", count: 12, liked: false },
      ],
      replies: 8,
      pinned: true,
    },
    {
      id: "2",
      author: "Marcus Johnson",
      avatar: "MJ",
      level: "Silver",
      content: "Has anyone integrated Copilot for automated safety reports? Would love to hear about your implementation approach and challenges.",
      space: "Copilot Tips",
      time: "4 hours ago",
      reactions: [
        { emoji: "👍", count: 18, liked: false },
        { emoji: "💡", count: 9, liked: false },
      ],
      replies: 12,
    },
  ];

  const mockChallenges: Challenge[] = [
    {
      id: "1",
      title: "Week 1: Complete One Module",
      description: "Finish any course module this week",
      reward: 100,
      progress: 0,
      total: 1,
      icon: "🎯",
    },
    {
      id: "2",
      title: "Daily Learner",
      description: "Access the LMS 5 days in a row",
      reward: 50,
      progress: 3,
      total: 5,
      icon: "🔥",
    },
    {
      id: "3",
      title: "Community Helper",
      description: "Reply to 3 posts in discussions",
      reward: 75,
      progress: 1,
      total: 3,
      icon: "💬",
    },
  ];

  const mockBadges: Badge[] = [
    { id: "1", name: "First Steps", description: "Complete your first module", icon: "🚀", earned: true },
    { id: "2", name: "Knowledge Seeker", description: "Earn 500 points", icon: "📚", earned: true },
    { id: "3", name: "Community Champion", description: "Make 50 community posts", icon: "⭐", earned: false, progress: 12 },
    { id: "4", name: "Governance Expert", description: "Complete AI Governance module", icon: "🛡️", earned: false, progress: 0, locked: true },
    { id: "5", name: "Week Warrior", description: "Maintain 7-day learning streak", icon: "💪", earned: false, progress: 5 },
    { id: "6", name: "Quiz Master", description: "Score 100% on 3 assessments", icon: "✨", earned: false, progress: 1, locked: true },
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 28px 72px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero Section */}
      <div style={{
        background: "radial-gradient(120% 180% at 88% 10%, #17176e 0%, #0a0a38 58%, #05051e 100%)",
        borderRadius: "20px",
        padding: "48px",
        color: "#fff",
        marginBottom: "36px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "36px 36px", opacity: 0.3 }}></div>
        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: "40px", fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            Learning Community
          </h1>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.6 }}>
            Connect with 2,000+ EHS professionals. Earn points, climb the leaderboard, and learn together.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "36px" }}>
        <StatCard label="Your Points" value={userStats.points} color="#3434FF" icon="⭐" />
        <StatCard label="Your Rank" value={`#${userStats.rank}`} color="#8AB815" icon="📈" />
        <StatCard label="Day Streak" value={userStats.streak} color="#A6E21A" icon="🔥" />
        <StatCard label="Level" value={userStats.level} color="#69697B" icon="🏆" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid #E2E8F0", marginBottom: "28px", overflowX: "auto" }}>
        {["leaderboard", "discussions", "badges", "challenges"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              border: "0",
              background: "transparent",
              padding: "14px 18px",
              fontSize: "15px",
              fontWeight: activeTab === tab ? 700 : 600,
              color: activeTab === tab ? "#0B0B2C" : "#69697B",
              borderBottom: activeTab === tab ? "2px solid #3434FF" : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {activeTab === "leaderboard" && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ padding: "24px 28px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "12px" }}>
            <TrendingUp size={24} color="#3434FF" />
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 700, color: "#0B0B2C" }}>
                This Month's Leaderboard
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8" }}>Top learners by CPD hours</p>
            </div>
          </div>

          {mockLeaderboard.map((user) => (
            <div
              key={user.rank}
              style={{
                padding: "16px 28px",
                borderBottom: "1px solid #F1F4F8",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: user.highlight ? "rgba(52,52,255,0.05)" : "transparent",
              }}
            >
              <div style={{ width: "30px", textAlign: "center", fontSize: "18px", fontWeight: 800 }}>
                {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `#${user.rank}`}
              </div>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3434FF, #A6E21A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#fff",
                  flex: "none",
                }}
              >
                {user.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0B0B2C" }}>{user.name}</div>
              </div>
              <div style={{ textAlign: "right", flex: "none" }}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#0B0B2C" }}>{user.points}</div>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>{user.hours} CPD hrs</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discussions */}
      {activeTab === "discussions" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {mockSpaces.map((space) => (
            <div
              key={space.name}
              style={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: "20px",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 18px 40px rgba(11,11,44,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#0B0B2C" }}>
                {space.name}
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#69697B", lineHeight: 1.6 }}>
                {space.description}
              </p>
              <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#94A3B8" }}>
                <span>👥 {space.members} members</span>
                <span>💬 {space.posts} posts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      {activeTab === "badges" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
          {mockBadges.map((badge) => (
            <div
              key={badge.id}
              style={{
                background: badge.earned ? "#fff" : "#F8FAFC",
                border: badge.earned ? "1px solid #D5DCFF" : "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "20px 16px",
                textAlign: "center",
                opacity: badge.locked ? 0.6 : 1,
                position: "relative",
              }}
            >
              {badge.locked && (
                <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                  <Lock size={14} color="#94A3B8" />
                </div>
              )}
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>{badge.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0B0B2C", marginBottom: "4px" }}>
                {badge.name}
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "12px" }}>
                {badge.description}
              </div>
              {badge.earned && (
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#8AB815" }}>✓ Earned</div>
              )}
              {badge.progress !== undefined && !badge.earned && (
                <div>
                  <div style={{ height: "4px", background: "#EEF1F6", borderRadius: "999px", overflow: "hidden", marginBottom: "6px" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(badge.progress / (badge.name.includes("posts") ? 50 : badge.name.includes("streak") ? 7 : 3)) * 100}%`,
                        background: "#3434FF",
                      }}
                    ></div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#69697B" }}>
                    {badge.progress}/{badge.name.includes("posts") ? 50 : badge.name.includes("streak") ? 7 : 3}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Challenges */}
      {activeTab === "challenges" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mockChallenges.map((challenge) => (
            <div
              key={challenge.id}
              style={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <div style={{ fontSize: "32px", flex: "none" }}>{challenge.icon}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#0B0B2C" }}>
                  {challenge.title}
                </h3>
                <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#69697B" }}>
                  {challenge.description}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ flex: 1, height: "6px", background: "#EEF1F6", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(challenge.progress / challenge.total) * 100}%`,
                        background: "#3434FF",
                        borderRadius: "999px",
                      }}
                    ></div>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#69697B", minWidth: "50px", textAlign: "right" }}>
                    {challenge.progress}/{challenge.total}
                  </div>
                </div>
              </div>
              <div style={{ flex: "none", textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#3434FF" }}>+{challenge.reward}</div>
                <div style={{ fontSize: "11px", color: "#94A3B8" }}>points</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: any) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: "16px",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#69697B", marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
