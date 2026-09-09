import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Play, BookOpen, Zap } from "lucide-react";
import { toast } from "sonner";

interface CourseProgress {
  id: string;
  title: string;
  slug: string;
  status: "in_progress" | "completed" | "not_started";
  progressPercent: number;
  totalModules: number;
  completedModules: number;
  totalHours: number;
  enrolledAt: string;
}

export function LmsDashboard({ currentCourse, setCurrentCourse }: any) {
  const { user } = useAuthUser();
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name.split(" ")[0]);
      }

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id);

      if (!enrollments) {
        setLoading(false);
        return;
      }

      const courseProgressList: CourseProgress[] = [];
      for (const enrollment of enrollments) {
        const { data: course } = await supabase
          .from("courses")
          .select("*")
          .eq("id", enrollment.course_id)
          .single();

        if (!course) continue;

        const { data: modules } = await supabase
          .from("modules")
          .select("id")
          .eq("course_id", course.id);

        const totalModules = modules?.length ?? 0;

        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id);

        const completedLessons = progress?.length ?? 0;

        courseProgressList.push({
          id: course.id,
          title: course.title,
          slug: course.slug,
          status: completedLessons === 0 ? "not_started" : completedLessons > totalModules * 0.9 ? "completed" : "in_progress",
          progressPercent: totalModules > 0 ? Math.round((completedLessons / (totalModules * 3)) * 100) : 0,
          totalModules,
          completedModules: Math.floor(completedLessons / 3),
          totalHours: course.description?.includes("8+") ? 8 : 12,
          enrolledAt: enrollment.enrolled_at || new Date().toISOString(),
        });
      }

      setCourses(courseProgressList);
      if (courseProgressList.length > 0 && !currentCourse) {
        setCurrentCourse(courseProgressList[0]);
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      toast.error("Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#eef1f6" }}>
        <div style={{ textAlign: "center", color: "#0b0b2c" }}>
          <div style={{ fontSize: "14px", marginBottom: "12px" }}>Loading your learning hub...</div>
          <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #3434ff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  const firstCourse = courses[0];
  const statusBadges: Record<string, { bg: string; text: string; fg: string }> = {
    in_progress: { bg: "#f1f4ff", text: "In progress", fg: "#3434ff" },
    not_started: { bg: "#f8fafc", text: "Not started", fg: "#69697b" },
    completed: { bg: "#f4fbe4", text: "Completed", fg: "#4a5230" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", color: "#0b0b2c", padding: "40px 28px 72px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "0.12em", color: "#8ab815", marginBottom: "12px" }}>
            WELCOME BACK
          </div>
          <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.01em" }}>
            Hey {userName}
          </h1>
          <p style={{ margin: "12px 0 0", fontSize: "17px", lineHeight: "1.7", color: "#69697b" }}>
            {firstCourse ? `You are ${firstCourse.progressPercent}% through ${firstCourse.title}.` : "No courses enrolled yet"}
          </p>
        </div>

        {/* Hero Section - Continue Where You Left Off */}
        {firstCourse && (
          <div style={{
            marginTop: "32px",
            background: "radial-gradient(120% 160% at 88% 12%, #17176e 0%, #0a0a38 58%, #05051e 100%)",
            borderRadius: "20px",
            padding: "36px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 18px 40px rgba(11,11,44,0.16)",
          }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: "0.3" }}></div>
            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ minWidth: 0, flex: "1 1 420px" }}>
                <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "0.12em", color: "#a6e21a" }}>CONTINUE WHERE YOU LEFT OFF</div>
                <div style={{ marginTop: "14px", fontSize: "28px", lineHeight: "1.25", fontWeight: "700", color: "#fff", textWrap: "pretty" }}>
                  Module 01 • Welcome to the AI-Powered EHS Profession
                </div>
                <div style={{ marginTop: "10px", fontSize: "15px", color: "rgba(255,255,255,0.6)" }}>
                  Slide 6 of 13 • about 20 minutes left
                </div>
                <div style={{ marginTop: "22px", height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "46%", background: "#a6e21a", borderRadius: "999px" }}></div>
                </div>
              </div>
              <button
                onClick={() => setCurrentCourse(firstCourse)}
                style={{
                  flex: "none",
                  border: "0",
                  borderRadius: "999px",
                  background: "#3434ff",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "16px 34px",
                  cursor: "pointer",
                  boxShadow: "0 0 40px rgba(52,52,255,0.4)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2ad6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#3434ff")}
              >
                Resume module
              </button>
            </div>
          </div>
        )}

        {/* Your Learning Section */}
        <div style={{ marginTop: "36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>Your learning</h2>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "15px", fontWeight: "600", color: "#3434ff", textDecoration: "none" }}>
            View full curriculum
          </a>
        </div>

        {/* Course Cards Grid */}
        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {courses.map((course) => {
            const badge = statusBadges[course.status];
            return (
              <div
                key={course.id}
                onClick={() => setCurrentCourse(course)}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "20px",
                  padding: "26px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookOpen size={23} color="#3434ff" />
                  </div>
                  <span style={{ background: badge.bg, border: `1px solid ${badge.bg}`, borderRadius: "999px", padding: "6px 14px", fontSize: "12px", fontWeight: "700", color: badge.fg }}>
                    {badge.text}
                  </span>
                </div>
                <div style={{ marginTop: "20px", fontSize: "19px", lineHeight: "1.3", fontWeight: "700" }}>
                  {course.title}
                </div>
                <div style={{ marginTop: "8px", fontSize: "14px", lineHeight: "1.6", color: "#69697b" }}>
                  {course.totalModules} modules • {course.totalHours}+ CPD hours
                </div>
                <div style={{ marginTop: "20px", height: "6px", borderRadius: "999px", background: "#eef1f6", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(course.progressPercent, 100)}%`, background: "#3434ff", borderRadius: "999px" }}></div>
                </div>
                <div style={{ marginTop: "10px", fontSize: "13px", fontWeight: "600", color: "#69697b" }}>
                  {Math.min(course.progressPercent, 100)}% complete
                </div>
              </div>
            );
          })}
        </div>

        {/* Community and Leaderboard Section */}
        <div style={{ marginTop: "44px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", alignItems: "start" }}>
          {/* Community Card */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "22px 26px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <BookOpen size={20} color="#3434ff" />
                </div>
                <div style={{ fontSize: "18px", fontWeight: "700" }}>Community</div>
              </div>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "14px", fontWeight: "600", color: "#3434ff", textDecoration: "none" }}>
                View all
              </a>
            </div>
            <div style={{ padding: "20px 26px", background: "#f8fafc" }}>
              <button
                style={{
                  width: "100%",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#0b0b2c",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "13px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f4ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                Start a discussion
              </button>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "22px 26px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Zap size={20} color="#3434ff" />
                </div>
                <div style={{ fontSize: "18px", fontWeight: "700" }}>Leaderboard</div>
              </div>
              <div style={{ fontSize: "13px", color: "#94a3b8", flex: "none" }}>This month</div>
            </div>
            <div style={{ padding: "16px 26px", borderBottom: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "30px", flex: "none", fontSize: "15px", fontWeight: "800", color: "#94a3b8" }}>1</div>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", flex: "none" }}>
                JL
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "15px", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Jane Learner</div>
                <div style={{ marginTop: "3px", fontSize: "12px", color: "#94a3b8" }}>SafetyTech</div>
              </div>
              <div style={{ flex: "none", textAlign: "right" }}>
                <div style={{ fontSize: "15px", fontWeight: "800" }}>12</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>CPD hrs</div>
              </div>
            </div>
            <div style={{ padding: "18px 26px", background: "#f8fafc", fontSize: "13px", lineHeight: "1.6", color: "#69697b" }}>
              Ranked on CPD hours recorded from watch time. Opt out in Settings.
            </div>
          </div>
        </div>

        {/* Awards Section */}
        <div style={{ marginTop: "20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(166,226,26,0.24)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Zap size={20} color="#5e7f0f" />
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "700" }}>My awards</div>
                <div style={{ marginTop: "4px", fontSize: "13px", color: "#94a3b8" }}>0 of 6 earned</div>
              </div>
            </div>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "14px", fontWeight: "600", color: "#3434ff", textDecoration: "none", flex: "none" }}>
              How awards work
            </a>
          </div>
          <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: "16px" }}>
            {["First Steps", "Speed Demon", "Perfect Score", "Consistency", "Knowledge Master", "Certification Elite"].map((name, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  borderRadius: "16px",
                  padding: "20px 16px",
                  textAlign: "center",
                }}
              >
                <div style={{ width: "52px", height: "52px", margin: "0 auto", borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", opacity: "0.4" }}>
                  <Zap size={24} color="#3434ff" />
                </div>
                <div style={{ marginTop: "14px", fontSize: "14px", lineHeight: "1.3", fontWeight: "700", color: "#69697b" }}>
                  {name}
                </div>
                <div style={{ marginTop: "6px", fontSize: "12px", lineHeight: "1.4", color: "#94a3b8" }}>Locked</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
