import { useState } from "react";
import { Search } from "lucide-react";

export function LmsAdminUsers() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    { id: "1", initials: "MR", name: "Marcus Reid", email: "marcus.reid@siemens.com", role: "Learner", courses: 3, status: "ACTIVE" },
    { id: "2", initials: "SA", name: "Sofia Almeida", email: "sofia.almeida@fugro.com", role: "Learner", courses: 2, status: "ACTIVE" },
    { id: "3", initials: "PN", name: "Priya Nandakumar", email: "priya.n@iosh.gov", role: "Learner", courses: 1, status: "ACTIVE" },
    { id: "4", initials: "TO", name: "Tom Okafor", email: "tom.okafor@ama.gov", role: "Learner", courses: 1, status: "INVITED" },
    { id: "5", initials: "AC", name: "Ana Coutinho", email: "ana.coutinho@lego.com", role: "Learner", courses: 2, status: "ACTIVE" },
    { id: "6", initials: "LD", name: "Lucas Domingues", email: "lucas@safetytechacademy.com", role: "Instructor", courses: 3, status: "ACTIVE" },
  ];

  const getAvatarColor = (initial: string) => {
    const colors = ["#3434ff", "#8ab815", "#5555ff", "#b8d430", "#2a2ad6", "#7aa80e"];
    const charCode = initial.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const getStatusColor = (status: string) => {
    return status === "ACTIVE" ? { text: "#8ab815", bg: "#f4fbe4" } : { text: "#3434ff", bg: "#f1f4ff" };
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === "All" || u.status === filter;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Search and Filters */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px 10px 38px", fontSize: "13px", color: "#0b0b2c", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["All", "Active", "Invited", "Suspended"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                border: filter === f ? "none" : "1px solid #e2e8f0",
                background: filter === f ? "#3434ff" : "#ffffff",
                color: filter === f ? "#ffffff" : "#0b0b2c",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "6px",
                padding: "8px 14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { if (filter !== f) { e.currentTarget.style.borderColor = "#3434ff"; } }}
              onMouseLeave={(e) => { if (filter !== f) { e.currentTarget.style.borderColor = "#e2e8f0"; } }}
            >
              {f}
            </button>
          ))}
        </div>
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
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2ad6"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#3434ff"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          IMPORT FROM KAJABI
        </button>
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
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2ad6"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#3434ff"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          INVITE USER
        </button>
      </div>

      {/* Users Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 120px 100px 100px 80px", gap: "16px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#69697b", letterSpacing: "0.05em" }}>
          <div>USER</div>
          <div>ROLE</div>
          <div>ENROLLED IN</div>
          <div>STATUS</div>
          <div></div>
        </div>
        {filteredUsers.map((user, idx) => {
          const statusColor = getStatusColor(user.status);
          return (
            <div
              key={user.id}
              style={{
                padding: "20px 28px",
                borderBottom: idx < filteredUsers.length - 1 ? "1px solid #f1f4f8" : "none",
                display: "grid",
                gridTemplateColumns: "1fr 120px 100px 100px 80px",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: getAvatarColor(user.initials[0]),
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "12px",
                    flex: "none",
                  }}
                >
                  {user.initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0b0b2c" }}>{user.name}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{user.email}</div>
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#0b0b2c" }}>{user.role}</div>
              <div style={{ fontSize: "13px", color: "#0b0b2c" }}>{user.courses} course{user.courses !== 1 ? "s" : ""}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: statusColor.text, background: statusColor.bg, padding: "6px 10px", borderRadius: "4px", display: "inline-block" }}>
                {user.status}
              </div>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#3434ff",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#2a2ad6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#3434ff"; }}
              >
                Manage
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
