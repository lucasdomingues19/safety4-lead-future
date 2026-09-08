export function LmsCommunity() {
  const mockUser = { name: "You", level: "Bronze", points: 2840, rank: 12, streak: 5 };
  const mockLeaderboard = [
    { rank: 1, name: "Sarah Chen", points: 5420, hours: 32 },
    { rank: 2, name: "Marcus Johnson", points: 4920, hours: 28 },
    { rank: 3, name: "Emma Wilson", points: 4210, hours: 24 },
    { rank: 4, name: "James Miller", points: 3850, hours: 22 },
    { rank: 5, name: "Lisa Anderson", points: 3420, hours: 19 },
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 28px 72px" }}>
      {/* Header */}
      <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "0.12em", color: "#8AB815" }}>
        LEARNING COMMUNITY
      </div>
      <h1 style={{ margin: "12px 0 0", fontSize: "38px", fontWeight: 700 }}>
        Connect & Learn Together
      </h1>
      <p style={{ margin: "12px 0 0", fontSize: "17px", color: "#69697B" }}>
        Earn points, climb the leaderboard, and collaborate with fellow EHS professionals.
      </p>

      {/* Stats Grid */}
      <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard label="Your Points" value={mockUser.points} />
        <StatCard label="Your Rank" value={`#${mockUser.rank}`} color="#3434FF" />
        <StatCard label="Day Streak" value={mockUser.streak} color="#8AB815" />
        <StatCard label="Level" value={mockUser.level} color="#A6E21A" />
      </div>

      {/* Leaderboard */}
      <div style={{ marginTop: "36px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: "20px", overflow: "hidden" }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #E2E8F0" }}>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>This Month's Leaderboard</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {mockLeaderboard.map((user) => (
            <div
              key={user.rank}
              style={{
                padding: "16px 28px",
                borderBottom: "1px solid #F1F4F8",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: user.rank === 1 ? "rgba(166,226,26,0.08)" : "transparent",
              }}
            >
              <div style={{ width: "30px", fontWeight: 800, fontSize: "16px", color: "#69697B", textAlign: "center" }}>
                {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `#${user.rank}`}
              </div>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(52,52,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#3434FF",
                  flex: "none",
                }}
              >
                {user.name.charAt(0)}
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
      </div>

      {/* Coming Soon Section */}
      <div style={{ marginTop: "36px", background: "linear-gradient(135deg, #17176e 0%, #0a0a38 100%)", borderRadius: "20px", padding: "36px", color: "#fff", textAlign: "center" }}>
        <h3 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 12px" }}>
          🚀 Community Features Coming Soon
        </h3>
        <p style={{ margin: "0 0 24px", color: "rgba(255,255,255,0.8)", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
          Discussion spaces, badges, achievements, and weekly challenges launching next. Start earning points now!
        </p>
        <div style={{ display: "inline-flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 20px", fontSize: "14px" }}>
            📊 Discussion Spaces
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 20px", fontSize: "14px" }}>
            🏆 Badges System
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 20px", fontSize: "14px" }}>
            ⭐ Weekly Challenges
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "#0B0B2C" }: any) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#69697B", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
