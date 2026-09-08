import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Play, BookOpen, Award, Zap, Users } from "lucide-react";
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
  CPD?: number;
  enrolledAt: string;
}

interface UserStats {
  totalCPD: number;
  coursesCompleted: number;
  coursesEnrolled: number;
  awardsEarned: number;
  streak: number;
  points: number;
}

export function LmsDashboard({ currentCourse, setCurrentCourse }: any) {
  const { user } = useAuthUser();
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalCPD: 0,
    coursesCompleted: 0,
    coursesEnrolled: 0,
    awardsEarned: 3,
    streak: 5,
    points: 2840,
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    if (user) loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get enrollments
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id);

      if (!enrollments) {
        setLoading(false);
        return;
      }

      // Get courses and progress
      const courseProgressList: CourseProgress[] = [];

      for (const enrollment of enrollments) {
        const { data: course } = await supabase
          .from("courses")
          .select("*")
          .eq("id", enrollment.course_id)
          .single();

        if (!course) continue;

        // Get modules for this course
        const { data: modules } = await supabase
          .from("modules")
          .select("id")
          .eq("course_id", course.id);

        const totalModules = modules?.length ?? 0;

        // Get user's lesson progress
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
      setStats({
        totalCPD: courseProgressList.reduce((acc, c) => acc + (c.completedModules * 2), 0),
        coursesCompleted: courseProgressList.filter((c) => c.status === "completed").length,
        coursesEnrolled: courseProgressList.length,
        awardsEarned: 3,
        streak: 5,
        points: 2840,
      });

      // Set first course as current if not set
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
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 28px", textAlign: "center" }}>
        <div style={{ fontSize: "14px", color: "#69697B" }}>Loading your dashboard...</div>
      </div>
    );
  }

  const firstCourse = courses[0];
  const inProgressCourses = courses.filter((c) => c.status === "in_progress");

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 28px 72px" }}>
      {/* Welcome */}
      <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "0.12em", color: "#8AB815" }}>
        WELCOME BACK
      </div>
      <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em" }}>
        {greeting}!
      </h1>
      <p style={{ margin: "12px 0 0", fontSize: "17px", lineHeight: 1.7, color: "#69697B" }}>
        You are {firstCourse?.progressPercent || 0}% through {firstCourse?.title || "your courses"}.
      </p>

      {/* Resume Module Card */}
      {firstCourse && (
        <div
          style={{
            marginTop: "32px",
            background: "radial-gradient(120% 160% at 88% 12%, #17176e 0%, #0a0a38 58%, #05051e 100%)",
            borderRadius: "20px",
            padding: "36px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 18px 40px rgba(11,11,44,0.16)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              opacity: 0.3,
            }}
          ></div>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              gap: "32px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ minWidth: 0, flex: "1 1 420px" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "0.12em", color: "#A6E21A" }}>
                CONTINUE WHERE YOU LEFT OFF
              </div>
              <div
                style={{
                  marginTop: "14px",
                  fontSize: "28px",
                  lineHeight: 1.25,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {firstCourse.title}
              </div>
              <div style={{ marginTop: "10px", fontSize: "15px", color: "rgba(255,255,255,0.6)" }}>
                Module {firstCourse.completedModules + 1} of {firstCourse.totalModules} • about 20 minutes left
              </div>
              <div style={{ marginTop: "22px", height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(firstCourse.progressPercent, 100)}%`,
                    background: "#A6E21A",
                    borderRadius: "999px",
                  }}
                ></div>
              </div>
            </div>
            <button
              style={{
                flex: "none",
                border: "0",
                borderRadius: "999px",
                background: "#3434FF",
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
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2A2AD6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#3434FF")}
            >
              <Play size={16} style={{ marginRight: "8px", display: "inline" }} />
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div
        style={{
          marginTop: "36px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard icon={<BookOpen size={20} />} label="Courses Enrolled" value={stats.coursesEnrolled} />
        <StatCard icon={<Play size={20} />} label="In Progress" value={inProgressCourses.length} />
        <StatCard icon={<Award size={20} />} label="Completed" value={stats.coursesCompleted} />
        <StatCard icon={<Zap size={20} />} label="CPD Hours" value={stats.totalCPD} />
      </div>

      {/* Your Learning */}
      <div style={{ marginTop: "36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>Your learning</h2>
        <a href="#" style={{ fontSize: "15px", fontWeight: 600, color: "#3434FF", textDecoration: "none" }}>
          View all courses
        </a>
      </div>

      {/* Course Cards */}
      <div
        style={{
          marginTop: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {courses.map((course) => (
          <div
            key={course.id}
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: "20px",
              padding: "26px",
              transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              cursor: "pointer",
            }}
            onClick={() => setCurrentCourse(course)}
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
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(52,52,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={24} color="#3434FF" />
              </div>
              <span
                style={{
                  background:
                    course.status === "completed"
                      ? "#F4FBE4"
                      : course.status === "in_progress"
                        ? "#F1F4FF"
                        : "#F8FAFC",
                  border:
                    course.status === "completed"
                      ? "1px solid #D9F09A"
                      : course.status === "in_progress"
                        ? "1px solid #D5DCFF"
                        : "1px solid #E2E8F0",
                  borderRadius: "999px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color:
                    course.status === "completed"
                      ? "#4A5230"
                      : course.status === "in_progress"
                        ? "#3434FF"
                        : "#69697B",
                }}
              >
                {course.status === "completed" ? "Completed" : course.status === "in_progress" ? "In progress" : "Not started"}
              </span>
            </div>
            <div style={{ marginTop: "20px", fontSize: "19px", lineHeight: 1.3, fontWeight: 700 }}>
              {course.title}
            </div>
            <div style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.6, color: "#69697B" }}>
              {course.totalModules} modules • {course.totalHours}+ CPD hours
            </div>
            <div style={{ marginTop: "20px", height: "6px", borderRadius: "999px", background: "#EEF1F6", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(course.progressPercent, 100)}%`,
                  background: "#3434FF",
                  borderRadius: "999px",
                }}
              ></div>
            </div>
            <div style={{ marginTop: "10px", fontSize: "13px", fontWeight: 600, color: "#69697B" }}>
              {Math.min(course.progressPercent, 100)}% complete
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            padding: "40px",
            background: "#F8FAFC",
            borderRadius: "20px",
            border: "1px solid #E2E8F0",
          }}
        >
          <BookOpen size={48} color="#69697B" style={{ margin: "0 auto 16px", opacity: 0.5 }} />
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0B0B2C" }}>No courses yet</h3>
          <p style={{ color: "#69697B", marginTop: "8px" }}>Enroll in a course to start learning</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#3434FF" }}>
        {icon}
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#69697B" }}>{label}</span>
      </div>
      <div style={{ fontSize: "32px", fontWeight: 800, color: "#0B0B2C" }}>{value}</div>
    </div>
  );
}
