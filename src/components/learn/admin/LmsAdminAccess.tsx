import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";

interface Learner {
  user_id: string;
  name: string;
  email: string;
  status: string;
  expires_at: string | null;
  enrolled_at: string;
}

interface CourseAccess {
  id: string;
  title: string;
  learners: Learner[];
}

const isLive = (l: Learner) => l.status === "active" && (!l.expires_at || new Date(l.expires_at) > new Date());
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

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
  const [openCourse, setOpenCourse] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const [coursesRes, enrollmentsRes, profilesRes] = await Promise.all([
      supabase.from("courses").select("id, title").order("title"),
      supabase.from("enrollments").select("user_id, course_id, status, expires_at, enrolled_at").order("enrolled_at", { ascending: false }),
      supabase.from("profiles").select("id, email, full_name"),
    ]);
    const enrollments = enrollmentsRes.data ?? [];
    const pById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
    const rows = (coursesRes.data ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      learners: enrollments.filter((e) => e.course_id === c.id).map((e) => ({
        user_id: e.user_id,
        name: pById.get(e.user_id)?.full_name || pById.get(e.user_id)?.email?.split("@")[0] || "Unknown",
        email: pById.get(e.user_id)?.email ?? "",
        status: e.status,
        expires_at: e.expires_at,
        enrolled_at: e.enrolled_at,
      })),
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

  const updateEnrollment = async (courseId: string, l: Learner, patch: { status?: string; expires_at?: string | null }, done: string) => {
    const key = `${courseId}:${l.user_id}`;
    setBusyKey(key);
    const { error } = await supabase.from("enrollments").update(patch).eq("course_id", courseId).eq("user_id", l.user_id);
    setBusyKey(null);
    if (error) { toast.error("Could not update access"); return; }
    toast.success(done);
    load();
  };

  const extend = (courseId: string, l: Learner, days: number | null) => {
    const base = l.expires_at && new Date(l.expires_at) > new Date() ? new Date(l.expires_at).getTime() : Date.now();
    const expires = days === null ? null : new Date(base + days * 86400000).toISOString();
    updateEnrollment(courseId, l, { status: "active", expires_at: expires }, days === null ? `${l.name} now has lifetime access` : `Access extended to ${fmt(expires!)}`);
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
            <div style={{ fontSize: "12px", color: "#69697b", marginTop: "4px" }}>Click a course to see who has access, extend it or remove it.</div>
          </div>
          {courses.length === 0 && <div style={{ padding: "28px", fontSize: "13px", color: "#94a3b8" }}>No courses yet.</div>}
          {courses.map((product, idx) => {
            const open = openCourse === product.id;
            const live = product.learners.filter(isLive).length;
            return (
              <div key={product.id} style={{ borderBottom: idx < courses.length - 1 ? "1px solid #f1f4f8" : "none" }}>
                <button onClick={() => setOpenCourse(open ? null : product.id)} aria-expanded={open} style={{ width: "100%", padding: "20px 28px", display: "flex", alignItems: "center", gap: "14px", background: open ? "#fafbff" : "transparent", border: 0, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: getInitialColor(product.title[0]), color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flex: "none" }}>
                    {product.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0b0b2c" }}>{product.title}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{live} with access{product.learners.length > live ? ` · ${product.learners.length - live} expired or removed` : ""}</div>
                  </div>
                  <ChevronDown size={16} color="#94a3b8" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </button>
                {open && (
                  <div style={{ padding: "0 28px 18px" }}>
                    {product.learners.length === 0 && <div style={{ fontSize: "12px", color: "#94a3b8", padding: "4px 0 6px" }}>Nobody has access to this course yet.</div>}
                    {product.learners.map((l) => {
                      const ok = isLive(l);
                      const busy = busyKey === `${product.id}:${l.user_id}`;
                      return (
                        <div key={l.user_id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderTop: "1px solid #f1f4f8", flexWrap: "wrap", opacity: busy ? 0.5 : 1 }}>
                          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0b0b2c" }}>{l.name}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{l.email} · since {fmt(l.enrolled_at)}</div>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: ok ? "#f4fbe4" : "#f8fafc", color: ok ? "#4a5230" : "#69697b" }}>
                            {l.status !== "active" ? "Removed" : !ok ? `Expired ${fmt(l.expires_at!)}` : l.expires_at ? `Until ${fmt(l.expires_at)}` : "Lifetime"}
                          </span>
                          <select
                            value=""
                            disabled={busy}
                            onChange={(e) => { const v = e.target.value; if (v) extend(product.id, l, v === "life" ? null : Number(v)); }}
                            style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 8px", fontSize: 12, fontFamily: "inherit", color: "#0b0b2c", background: "#fff" }}
                            aria-label={`Extend access for ${l.name}`}
                          >
                            <option value="">{ok ? "Extend…" : "Restore…"}</option>
                            <option value="30">+30 days</option>
                            <option value="90">+90 days</option>
                            <option value="365">+1 year</option>
                            <option value="life">Lifetime</option>
                          </select>
                          {l.status === "active" && (
                            <button
                              disabled={busy}
                              onClick={() => { if (confirm(`Remove ${l.name}'s access to ${product.title}? Their progress is kept if you restore it later.`)) updateEnrollment(product.id, l, { status: "cancelled" }, `Access removed for ${l.name}`); }}
                              style={{ border: 0, background: "none", color: "#c93636", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
