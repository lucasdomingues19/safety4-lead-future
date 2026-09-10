import { useState } from "react";
import { Copy } from "lucide-react";

export function LmsAdminCommunity() {
  const [emailInput, setEmailInput] = useState("");

  const flaggedItems = [
    { user: "Anonymous member", description: "Post reported for sharing a client's confidential incident report in full." },
    { user: "J.K.", description: "Comment reported for promoting an unrelated product." },
  ];

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Free Community Access */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", marginBottom: "28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#0b0b2c", marginBottom: "8px" }}>Free community access</div>
        <div style={{ fontSize: "13px", color: "#69697b", marginBottom: "20px" }}>Paid spaces come from a course purchase (365 days). Free spaces can be granted manually or by sharing a join link — no purchase needed.</div>

        {/* Add User */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <input
            type="email"
            placeholder="Add by name or email..."
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            style={{
              flex: 1,
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "13px",
              color: "#0b0b2c",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <button
            style={{
              border: "none",
              background: "#3434ff",
              color: "#ffffff",
              fontFamily: "inherit",
              fontSize: "12px",
              fontWeight: 700,
              borderRadius: "8px",
              padding: "10px 16px",
              cursor: "pointer",
              flex: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2ad6"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#3434ff"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            ADD MANUALLY
          </button>
        </div>

        {/* Join Link */}
        <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "12px", color: "#69697b", marginBottom: "8px" }}>Join link</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="text"
              value="https://app.safetytechacademy.com/join/community-free"
              readOnly
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: "13px",
                color: "#0b0b2c",
                fontFamily: "monospace",
                cursor: "text",
              }}
            />
            <button
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                background: "#ffffff",
                color: "#0b0b2c",
                fontFamily: "inherit",
                fontSize: "12px",
                fontWeight: 700,
                padding: "6px 12px",
                cursor: "pointer",
                flex: "none",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3434ff"; e.currentTarget.style.color = "#3434ff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#0b0b2c"; }}
            >
              <Copy size={14} />
              Copy link
            </button>
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>Anyone with this link joins General discussion free, instantly — no admin approval needed unless you turn that on below.</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        {[
          { label: "MEMBERS", value: "41", color: "#8ab815" },
          { label: "POSTS THIS WEEK", value: "12", color: "#3434ff" },
          { label: "FLAGGED", value: "2", color: "#c93636" },
        ].map((stat, idx) => (
          <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px 28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: stat.color }}></div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase", marginTop: "4px" }}>{stat.label}</div>
            <div style={{ marginTop: "12px", fontSize: "32px", fontWeight: 800, color: "#0b0b2c" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Flagged for Review */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Flagged for review</div>
        </div>
        {flaggedItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: "24px 28px",
              borderBottom: idx < flaggedItems.length - 1 ? "1px solid #f1f4f8" : "none",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0b0b2c", marginBottom: "6px" }}>{item.user}</div>
            <div style={{ fontSize: "13px", color: "#69697b", marginBottom: "16px" }}>{item.description}</div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                style={{
                  border: "none",
                  background: "#f4fbe4",
                  color: "#8ab815",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#e8f8d8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f4fbe4"; }}
              >
                Approve
              </button>
              <button
                style={{
                  border: "none",
                  background: "#fff5f5",
                  color: "#c93636",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#ffecec"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff5f5"; }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
