import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Play, BookOpen, ArrowRight } from "lucide-react";
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

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0B2C" }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "14px", marginBottom: "12px" }}>Loading your learning hub...</div>
          <div style={{ width: "32px", height: "32px", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #3434FF", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B0B2C", color: "#fff", padding: "48px 28px 72px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{ display: "inline-block", background: "#3434FF", borderRadius: "8px", padding: "8px 14px", marginBottom: "20px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em" }}>
            MY LEARNING
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: "48px", fontWeight: 700, lineHeight: 1.1 }}>
            Welcome back
          </h1>
          <p style={{ margin: 0, fontSize: "16px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            {courses.length === 0 ? "No courses enrolled yet" : `You're ${courses[0]?.progressPercent || 0}% through ${courses[0]?.title || "your courses"}.`}
          </p>
        </div>

        {/* Your Courses Section */}
        {courses.length > 0 && (
          <div style={{ marginBottom: "56px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px", fontSize: "16px", fontWeight: 600 }}>
              <BookOpen size={20} color="#3434FF" />
              <span>Your courses</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setCurrentCourse(course)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    padding: "28px",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.borderColor = "rgba(52,52,255,0.4)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <h3 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 700 }}>
                    {course.title}
                  </h3>
                  <p style={{ margin: "0 0 20px", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                    {course.totalModules} modules • {course.totalHours}+ CPD hours
                  </p>

                  {/* Progress */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "13px" }}>
                      <span style={{ color: "rgba(255,255,255,0.6)" }}>
                        {course.completedModules}/{course.totalModules} lessons
                      </span>
                      <span style={{ fontWeight: 700 }}>{Math.min(course.progressPercent, 100)}%</span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(course.progressPercent, 100)}%`,
                          background: "#3434FF",
                          borderRadius: "999px",
                          transition: "width 0.3s ease",
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    style={{
                      width: "100%",
                      background: "#3434FF",
                      border: "0",
                      color: "#fff",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#2A2AD6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#3434FF")}
                  >
                    {course.status === "not_started" ? "Start course" : "Continue"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Catalogue */}
        <div style={{ marginTop: "56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px", fontSize: "16px", fontWeight: 600 }}>
            <BookOpen size={20} color="#3434FF" />
            <span>Course catalogue</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "15px", color: "rgba(255,255,255,0.6)" }}>
              You're enrolled in every available course. 🎉
            </p>
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
