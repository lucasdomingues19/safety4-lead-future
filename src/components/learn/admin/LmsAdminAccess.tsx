import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CourseAccess {
  id: string;
  title: string;
  learners: number;
}

interface ProfileHit {
  id: string;
  email: string;
  full_name: string | null;
}

const DURATIONS = ["Lifetime", "30 days", "90 days", "1 year"] as const;

export function LmsAdminAccess() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseAccess[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<(typeof DURATIONS)[number]>("Lifetime");
  const [userQuery, setUserQuery] = useState("");
  const [userMatches, setUserMatches] = useState<ProfileHit[]>([]);
  const [selectedUser, setSelectedUser] = useState<ProfileHit | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const [coursesRes, enrollmentsRes] = await Promise.all([
      supabase.from("courses").select("id, title"),
      supabase.from("enrollments").select("course_id"),
    ]);
    const enrollments = enrollmentsRes.data ?? [];
    const rows = (coursesRes.data ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      learners: enrollments.filter((e) => e.course_id === c.id).length,
    }));
    setCourses(rows);
    if (rows.length && !selectedCourseId) setSelectedCourseId(rows[0].id);
    setLoading(false);
  };

  const searchUsers = async (q: string) => {
    setUserQuery(q);
    setSelectedUser(null);
    if (q.trim().length < 2) {
      setUserMatches([]);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(6);
    setUserMatches(data ?? []);
  };

  const expiresAt = (): string | null => {
    const now = Date.now();
    switch (selectedDuration) {
      case "30 days": return new Date(now + 30 * 86400000).toISOString();
      case "90 days": return new Date(now + 90 * 86400000).toISOString();
      case "1 year": return new Date(now + 365 * 86400000).toISOString();
      default: return null;
    }
  };

  const grantAccess = async () => {
    if (!selectedUser) {
      toast.error("Search for and select a user first");
      return;
    }
    if (!selectedCourseId) {
      toast.error("Select a course");
      return;
    }
    setGranting(true);
    try {
      const { error } = await supabase.from("enrollments").upsert(
        {
          user_id: selectedUser.id,
          course_id: selectedCourseId,
          status: "active",
          expires_at: expiresAt(),
        },
        { onConflict: "user_id,course_id" },
      );
      if (error) throw error;
      toast.success(`Access granted to ${selectedUser.full_name || selectedUser.email}`);
      setSelectedUser(null);
      setUserQuery("");
      setUserMatches([]);
      load();
    } catch (err) {
      console.error(err);
      toast.error("Could not grant access");
    } finally {
      setGranting(false);
    }
  };

  const getInitialColor = (initial: string) => {
    const colors = ["#3434ff", "#8ab815", "#5555ff", "#b8d430", "#2a2ad6"];
    return colors[initial.charCodeAt(0) % colors.length];
  };

  if (loading) {
    return (
      <div style={{ marginTop: "60px", display: "flex", justifyContent: "center" }}>
        <Loader2 size={28} className="animate-spin" color="#3434ff" />
      </div>
    );
  }

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "28px", alignItems: "start" }}>
        {/* Product Access */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
          <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>Course access</div>
            <div style={{ fontSize: "12px", color: "#69697b", marginTop: "4px" }}>Real enrollment counts per course.</div>
          </div>
          {courses.length === 0 && <div style={{ padding: "28px", fontSize: "13px", color: "#94a3b8" }}>No courses yet.</div>}
          {courses.map((product, idx) => (
            <div key={product.id} style={{ padding: "20px 28px", borderBottom: idx < courses.length - 1 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: getInitialColor(product.title[0]), color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flex: "none" }}>
                {product.title.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0b0b2c" }}>{product.title}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{product.learners} people have access</div>
              </div>
            </div>
          ))}
        </div>

        {/* Grant Access Panel */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", height: "fit-content" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c", marginBottom: "20px" }}>Grant access</div>

          <div style={{ marginBottom: "20px", position: "relative" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#69697b", marginBottom: "8px" }}>User</div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={selectedUser ? (selectedUser.full_name || selectedUser.email) : userQuery}
              onChange={(e) => searchUsers(e.target.value)}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#0b0b2c", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            {userMatches.length > 0 && !selectedUser && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", marginTop: "4px", zIndex: 10, boxShadow: "0 8px 24px rgba(11,11,44,0.12)" }}>
                {userMatches.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => { setSelectedUser(m); setUserMatches([]); }}
                    style={{ padding: "10px 12px", cursor: "pointer", fontSize: "13px", borderBottom: "1px solid #f1f4f8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <div style={{ fontWeight: 700, color: "#0b0b2c" }}>{m.full_name || m.email}</div>
                    <div style={{ color: "#94a3b8", fontSize: "11px" }}>{m.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#69697b", marginBottom: "8px" }}>Course</div>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#0b0b2c", fontFamily: "inherit", boxSizing: "border-box" }}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#69697b", marginBottom: "8px" }}>Access duration</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {DURATIONS.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  style={{
                    border: selectedDuration === duration ? "none" : "1px solid #e2e8f0",
                    background: selectedDuration === duration ? "#3434ff" : "#ffffff",
                    color: selectedDuration === duration ? "#ffffff" : "#0b0b2c",
                    fontFamily: "inherit", fontSize: "12px", fontWeight: 700, borderRadius: "6px", padding: "8px", cursor: "pointer",
                  }}
                >
                  {duration}
                </button>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
              {selectedDuration === "Lifetime" ? "Access never expires unless manually revoked." : `Access expires ${selectedDuration} from now.`}
            </div>
          </div>

          <button
            onClick={grantAccess}
            disabled={granting || !selectedUser}
            style={{ width: "100%", border: "none", background: "#3434ff", color: "#ffffff", fontFamily: "inherit", fontSize: "12px", fontWeight: 700, borderRadius: "8px", padding: "12px 16px", cursor: granting || !selectedUser ? "not-allowed" : "pointer", opacity: granting || !selectedUser ? 0.6 : 1 }}
          >
            {granting ? "GRANTING..." : "GRANT ACCESS"}
          </button>
        </div>
      </div>
    </div>
  );
}
