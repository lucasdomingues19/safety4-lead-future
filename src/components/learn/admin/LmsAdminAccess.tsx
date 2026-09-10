import { useState } from "react";

export function LmsAdminAccess() {
  const [selectedDuration, setSelectedDuration] = useState("Lifetime");

  const products = [
    { id: 1, initial: "C", name: "Microsoft Copilot for EHS", type: "COURSE", learners: 34 },
    { id: 2, initial: "AF", name: "AI Fundamentals for Safety Leaders", type: "COURSE", learners: 19 },
    { id: 3, initial: "AC", name: "Safety 4.0 Accelerator", type: "COURSE", learners: 12 },
    { id: 4, initial: "AA", name: "All-Access Bundle", type: "BUNDLE", learners: 6 },
    { id: 5, initial: "CM", name: "Community", type: "COMMUNITY", learners: 41 },
  ];

  const getInitialColor = (initial: string) => {
    const colors = ["#3434ff", "#8ab815", "#5555ff", "#b8d430", "#2a2ad6"];
    const charCode = initial.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "28px", alignItems: "start" }}>
        {/* Product Access */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
          <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>Product access</div>
            <div style={{ fontSize: "12px", color: "#69697b", marginTop: "4px" }}>Who currently has access to each course or bundle.</div>
          </div>
          {products.map((product, idx) => (
            <div
              key={product.id}
              style={{
                padding: "20px 28px",
                borderBottom: idx < products.length - 1 ? "1px solid #f1f4f8" : "none",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: getInitialColor(product.initial[0]),
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "14px",
                  flex: "none",
                }}
              >
                {product.initial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0b0b2c" }}>{product.name}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                  <span style={{ fontWeight: 600 }}>{product.type}</span> · {product.learners} people have access
                </div>
              </div>
              <button
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  background: "#ffffff",
                  color: "#0b0b2c",
                  fontFamily: "inherit",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "8px 12px",
                  cursor: "pointer",
                  flex: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3434ff"; e.currentTarget.style.color = "#3434ff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#0b0b2c"; }}
              >
                VIEW ACCESS
              </button>
            </div>
          ))}
        </div>

        {/* Grant Access Panel */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", height: "fit-content" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c", marginBottom: "20px" }}>Grant access</div>

          {/* User Search */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#69697b", marginBottom: "8px" }}>User</div>
            <input
              type="text"
              placeholder="Search by name or email..."
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "13px",
                color: "#0b0b2c",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Product Dropdown */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#69697b", marginBottom: "8px" }}>Product</div>
            <select
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "13px",
                color: "#0b0b2c",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            >
              <option>Microsoft Copilot for EHS</option>
              <option>AI Fundamentals for Safety Leaders</option>
              <option>Safety 4.0 Accelerator</option>
              <option>All-Access Bundle</option>
              <option>Community</option>
            </select>
          </div>

          {/* Access Duration */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#69697b", marginBottom: "8px" }}>Access duration</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
              {["Lifetime", "30 days", "90 days"].map(duration => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  style={{
                    border: selectedDuration === duration ? "none" : "1px solid #e2e8f0",
                    background: selectedDuration === duration ? "#3434ff" : "#ffffff",
                    color: selectedDuration === duration ? "#ffffff" : "#0b0b2c",
                    fontFamily: "inherit",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    padding: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { if (selectedDuration !== duration) { e.currentTarget.style.borderColor = "#3434ff"; } }}
                  onMouseLeave={(e) => { if (selectedDuration !== duration) { e.currentTarget.style.borderColor = "#e2e8f0"; } }}
                >
                  {duration}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {["1 year", "Custom"].map(duration => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  style={{
                    border: selectedDuration === duration ? "none" : "1px solid #e2e8f0",
                    background: selectedDuration === duration ? "#3434ff" : "#ffffff",
                    color: selectedDuration === duration ? "#ffffff" : "#0b0b2c",
                    fontFamily: "inherit",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    padding: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { if (selectedDuration !== duration) { e.currentTarget.style.borderColor = "#3434ff"; } }}
                  onMouseLeave={(e) => { if (selectedDuration !== duration) { e.currentTarget.style.borderColor = "#e2e8f0"; } }}
                >
                  {duration}
                </button>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>Access never expires unless manually revoked.</div>
          </div>

          {/* Grant Button */}
          <button
            style={{
              width: "100%",
              border: "none",
              background: "#3434ff",
              color: "#ffffff",
              fontFamily: "inherit",
              fontSize: "12px",
              fontWeight: 700,
              borderRadius: "8px",
              padding: "12px 16px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2ad6"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#3434ff"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            GRANT ACCESS
          </button>
        </div>
      </div>
    </div>
  );
}
