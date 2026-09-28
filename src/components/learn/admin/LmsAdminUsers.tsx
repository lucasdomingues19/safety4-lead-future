import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "learner";
  enrollmentCount: number;
  hasActiveEnrollment: boolean;
}

export function LmsAdminUsers() {
  const [filter, setFilter] = useState<"All" | "Active" | "Admins">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [profilesRes, enrollmentsRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name"),
        supabase.from("enrollments").select("user_id, status"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      const profiles = profilesRes.data ?? [];
      const enrollments = enrollmentsRes.data ?? [];
      const roles = rolesRes.data ?? [];
      const adminIds = new Set(roles.filter((r) => r.role === "admin").map((r) => r.user_id));

      const rows: UserRow[] = profiles.map((p) => {
        const userEnrollments = enrollments.filter((e) => e.user_id === p.id);
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          role: adminIds.has(p.id) ? "admin" : "learner",
          enrollmentCount: userEnrollments.length,
          hasActiveEnrollment: userEnrollments.some((e) => e.status === "active"),
        };
      });
      setUsers(rows);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (initial: string) => {
    const colors = ["#3434ff", "#8ab815", "#5555ff", "#b8d430", "#2a2ad6", "#7aa80e"];
    const charCode = initial.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const filteredUsers = users.filter((u) => {
    const matchesFilter = filter === "All" || (filter === "Active" && u.hasActiveEnrollment) || (filter === "Admins" && u.role === "admin");
    const name = u.full_name ?? "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ marginTop: "60px", display: "flex", justifyContent: "center" }}>
        <Loader2 size={28} className="animate-spin" color="#3434ff" />
      </div>
    );
  }

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Search and Filters */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
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
          {(["All", "Active", "Admins"] as const).map((f) => (
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
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 100px 120px 100px", gap: "16px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#69697b", letterSpacing: "0.05em" }}>
          <div>USER</div>
          <div>ROLE</div>
          <div>ENROLLED IN</div>
          <div>STATUS</div>
        </div>
        {filteredUsers.length === 0 && (
          <div style={{ padding: "28px", fontSize: "13px", color: "#94a3b8" }}>No users found.</div>
        )}
        {filteredUsers.map((user, idx) => {
          const displayName = user.full_name || user.email.split("@")[0];
          const initials = displayName.slice(0, 2).toUpperCase();
          return (
            <div
              key={user.id}
              style={{
                padding: "20px 28px",
                borderBottom: idx < filteredUsers.length - 1 ? "1px solid #f1f4f8" : "none",
                display: "grid",
                gridTemplateColumns: "1fr 100px 120px 100px",
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
                    background: getAvatarColor(initials[0]),
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "12px",
                    flex: "none",
                  }}
                >
                  {initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0b0b2c" }}>{displayName}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{user.email}</div>
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#0b0b2c", textTransform: "capitalize" }}>{user.role}</div>
              <div style={{ fontSize: "13px", color: "#0b0b2c" }}>{user.enrollmentCount} course{user.enrollmentCount !== 1 ? "s" : ""}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: user.hasActiveEnrollment ? "#4a5230" : "#69697b", background: user.hasActiveEnrollment ? "#f4fbe4" : "#f8fafc", padding: "6px 10px", borderRadius: "4px", display: "inline-block", textAlign: "center" }}>
                {user.hasActiveEnrollment ? "ACTIVE" : "NO ENROLMENT"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
