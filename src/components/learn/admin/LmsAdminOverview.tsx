import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CourseStat {
  id: string;
  title: string;
  learners: number;
  certified: number;
  progress: number;
}

interface ActivityEvent {
  text: string;
  time: string;
  type: "complete" | "enroll" | "cert" | "risk";
  at: string;
}

export function LmsAdminOverview() {
  const [loading, setLoading] = useState(true);
  const [totalLearners, setTotalLearners] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalCertified, setTotalCertified] = useState(0);
  const [totalAtRisk, setTotalAtRisk] = useState(0);
  const [courses, setCourses] = useState<CourseStat[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [coursesRes, enrollmentsRes, certificatesRes, lessonsRes, progressRes] = await Promise.all([
        supabase.from("courses").select("id, title, published"),
        supabase.from("enrollments").select("id, user_id, course_id, enrolled_at"),
        supabase.from("certificates").select("id, course_name, issued_at"),
        supabase.from("lessons").select("id, module_id"),
        supabase.from("lesson_progress").select("user_id, lesson_id, completed_at").eq("is_completed", true),
      ]);

      const allCourses = coursesRes.data ?? [];
      const enrollments = enrollmentsRes.data ?? [];
      const certificates = certificatesRes.data ?? [];
      const lessons = lessonsRes.data ?? [];
      const progress = progressRes.data ?? [];

      // Map lesson -> course via module (needs module->course lookup)
      const moduleIds = [...new Set(lessons.map((l) => l.module_id))];
      const { data: modules } = moduleIds.length
        ? await supabase.from("modules").select("id, course_id").in("id", moduleIds)
        : { data: [] as { id: string; course_id: string }[] };
      const courseIdByModule = new Map((modules ?? []).map((m) => [m.id, m.course_id]));
      const lessonsByCourse = new Map<string, string[]>();
      for (const l of lessons) {
        const courseId = courseIdByModule.get(l.module_id);
        if (!courseId) continue;
        if (!lessonsByCourse.has(courseId)) lessonsByCourse.set(courseId, []);
        lessonsByCourse.get(courseId)!.push(l.id);
      }
      const completedLessonIds = new Set(progress.map((p) => p.lesson_id));
      const progressByUser = new Map<string, Set<string>>();
      for (const p of progress) {
        if (!progressByUser.has(p.user_id)) progressByUser.set(p.user_id, new Set());
        progressByUser.get(p.user_id)!.add(p.lesson_id);
      }

      setTotalLearners(new Set(enrollments.map((e) => e.user_id)).size);
      setTotalCourses(allCourses.filter((c) => c.published).length);
      setTotalCertified(certificates.length);

      const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const atRisk = enrollments.filter((e) => {
        const userLessons = progressByUser.get(e.user_id);
        const enrolledLongAgo = new Date(e.enrolled_at).getTime() < fourteenDaysAgo;
        return enrolledLongAgo && (!userLessons || userLessons.size === 0);
      });
      setTotalAtRisk(atRisk.length);

      const courseStats: CourseStat[] = allCourses.map((c) => {
        const courseEnrollments = enrollments.filter((e) => e.course_id === c.id);
        const courseLessons = lessonsByCourse.get(c.id) ?? [];
        const certified = certificates.filter((cert) => cert.course_name === c.title).length;
        let avgProgress = 0;
        if (courseEnrollments.length > 0 && courseLessons.length > 0) {
          const total = courseEnrollments.reduce((sum, e) => {
            const done = courseLessons.filter((lid) => progressByUser.get(e.user_id)?.has(lid)).length;
            return sum + done / courseLessons.length;
          }, 0);
          avgProgress = Math.round((total / courseEnrollments.length) * 100);
        }
        return { id: c.id, title: c.title, learners: courseEnrollments.length, certified, progress: avgProgress };
      });
      setCourses(courseStats);

      const events: ActivityEvent[] = [
        ...enrollments.map((e) => ({
          text: `New enrolment in ${allCourses.find((c) => c.id === e.course_id)?.title ?? "a course"}`,
          at: e.enrolled_at,
          type: "enroll" as const,
        })),
        ...certificates.map((c) => ({
          text: `Certificate issued for ${c.course_name}`,
          at: c.issued_at,
          type: "cert" as const,
        })),
      ]
        .filter((e) => e.at)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 8)
        .map((e) => ({ ...e, time: new Date(e.at).toLocaleDateString() }));
      setActivity(events);
    } catch (err) {
      console.error("Failed to load admin overview:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityDot = (type: string) => {
    switch (type) {
      case "complete": return "#8ab815";
      case "enroll": return "#3434ff";
      case "cert": return "#a6e21a";
      case "risk": return "#dc2626";
      default: return "#94a3b8";
    }
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
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px", marginBottom: "28px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>Total Learners</div>
          <div style={{ marginTop: "12px", fontSize: "32px", fontWeight: 800, color: "#0b0b2c" }}>{totalLearners}</div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#94a3b8" }}>Distinct enrolled users</div>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>Published Courses</div>
          <div style={{ marginTop: "12px", fontSize: "32px", fontWeight: 800, color: "#0b0b2c" }}>{totalCourses}</div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#94a3b8" }}>Across the platform</div>
        </div>
        <div style={{ background: "#f4fbe4", border: "1px solid #d9f09a", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(138,184,21,0.12)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#8ab815", textTransform: "uppercase" }}>Certified</div>
          <div style={{ marginTop: "12px", fontSize: "32px", fontWeight: 800, color: "#0b0b2c" }}>{totalCertified}</div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#8ab815" }}>Certificates issued</div>
        </div>
        <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(220,38,38,0.12)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#c93636", textTransform: "uppercase" }}>At Risk</div>
          <div style={{ marginTop: "12px", fontSize: "32px", fontWeight: 800, color: "#0b0b2c" }}>{totalAtRisk}</div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#c93636" }}>Enrolled 14+ days, 0 lessons done</div>
        </div>
      </div>

      {/* Courses Section */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", marginBottom: "28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Courses at a Glance</div>
        {courses.length === 0 && (
          <div style={{ padding: "28px", fontSize: "13px", color: "#94a3b8" }}>No courses yet.</div>
        )}
        {courses.map((course, idx) => (
          <div key={course.id} style={{ padding: "20px 28px", borderBottom: idx < courses.length - 1 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>{course.title}</div>
              <div style={{ marginTop: "6px", fontSize: "12px", color: "#94a3b8" }}>{course.learners} learners · {course.certified} certified</div>
            </div>
            <div style={{ flex: 1, minWidth: "160px", maxWidth: "280px" }}>
              <div style={{ height: "8px", borderRadius: "999px", background: "#eef1f6", overflow: "hidden", marginBottom: "6px" }}>
                <div style={{ height: "100%", width: `${course.progress}%`, background: "linear-gradient(90deg, #3434ff, #5555ff)", borderRadius: "999px" }}></div>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#69697b" }}>{course.progress}% avg. completion</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Recent Activity</div>
        {activity.length === 0 && (
          <div style={{ padding: "28px", fontSize: "13px", color: "#94a3b8" }}>No activity yet.</div>
        )}
        {activity.map((event, idx) => (
          <div key={idx} style={{ padding: "18px 28px", borderBottom: idx < activity.length - 1 ? "1px solid #f8fafc" : "none", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: getActivityDot(event.type), flex: "none", marginTop: "5px", boxShadow: `0 0 8px ${getActivityDot(event.type)}40` }}></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "14px", color: "#0b0b2c", fontWeight: 500 }}>{event.text}</div>
              <div style={{ marginTop: "4px", fontSize: "12px", color: "#94a3b8" }}>{event.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
