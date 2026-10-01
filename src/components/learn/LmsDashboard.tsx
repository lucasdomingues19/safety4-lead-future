import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { BookOpen, Trophy, MessageSquare, Loader2 } from "lucide-react";
import { getMyGamification, type MyGamification } from "@/lib/gamification";
import { LevelChip, ProgressCard } from "@/components/learn/Gamification";
import { toast } from "sonner";
import { useTourActive } from "@/lib/tour";
import { ExampleCertificate, ExampleLesson, ExampleTag } from "@/components/learn/tour/TourExamples";

export interface CourseProgress {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cpdHours: number | null;
  coverUrl: string | null;
  status: "in_progress" | "completed" | "not_started";
  progressPercent: number;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  nextModuleTitle: string | null;
}

interface CatalogCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_cents: number | null;
  currency: string;
  cpd_hours: number | null;
  cover_image_url: string | null;
}

interface LeaderRow {
  user_id: string;
  display_name: string;
  points: number;
  lessons: number;
  level_name: string;
  is_me: boolean;
}

interface PostPreview {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px" };
const linkBtn: React.CSSProperties = { fontSize: "14px", fontWeight: 600, color: "#3434ff", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" };

const statusBadges = {
  in_progress: { bg: "#f1f4ff", text: "In progress", fg: "#3434ff" },
  not_started: { bg: "#f8fafc", text: "Not started", fg: "#69697b" },
  completed: { bg: "#f4fbe4", text: "Completed", fg: "#4a5230" },
} as const;

const formatPrice = (cents: number | null, currency: string) =>
  !cents ? "Free" : new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(cents / 100);

export function LmsDashboard({ setCurrentCourse, onNavigate }: { currentCourse?: unknown; setCurrentCourse: (c: CourseProgress | null) => void; onNavigate?: (screen: string) => void }) {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const touring = useTourActive();
  const [userName, setUserName] = useState("there");
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [catalog, setCatalog] = useState<CatalogCourse[]>([]);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [gamification, setGamification] = useState<MyGamification | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      // Profile name first (what Settings edits), then sign-up metadata; never the email address.
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      const meta = (user.user_metadata as { full_name?: string } | undefined)?.full_name;
      const name = [profile?.full_name, meta].find((n) => n && n.trim() && !n.includes("@"));
      setUserName(name ? name.trim().split(/\s+/)[0] : "there");

      const [enrRes, courseRes, progRes, attemptRes, certRes, myPostsRes, lbRes, postsRes] = await Promise.all([
        supabase.from("enrollments").select("course_id, status, expires_at").eq("user_id", user.id),
        supabase.from("courses").select("id, title, slug, description, price_cents, currency, cpd_hours, cover_image_url").eq("published", true),
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
        supabase.from("quiz_attempts").select("score, passed").eq("user_id", user.id),
        supabase.from("certificates").select("id").eq("recipient_email", (user.email ?? "").toLowerCase()),
        supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.rpc("get_leaderboard", { _limit: 5 }),
        supabase.from("community_posts").select("id, author_name, body, created_at").order("created_at", { ascending: false }).limit(3),
      ]);

      const now = Date.now();
      const activeIds = new Set(
        (enrRes.data ?? [])
          .filter((e) => e.status === "active" && (!e.expires_at || new Date(e.expires_at).getTime() > now))
          .map((e) => e.course_id),
      );
      const allCourses = (courseRes.data ?? []) as CatalogCourse[];
      const enrolledCourses = allCourses.filter((c) => activeIds.has(c.id));
      setCatalog(allCourses.filter((c) => !activeIds.has(c.id)));

      const completedIds = new Set((progRes.data ?? []).map((p) => p.lesson_id));

      const list: CourseProgress[] = [];
      for (const c of enrolledCourses) {
        const { data: modules } = await supabase.from("modules").select("id, title").eq("course_id", c.id).order("position");
        const moduleIds = (modules ?? []).map((m) => m.id);
        const titleByModule = new Map((modules ?? []).map((m) => [m.id, m.title]));
        const { data: lessons } = moduleIds.length
          ? await supabase.from("lessons").select("id, title, module_id, position").in("module_id", moduleIds)
          : { data: [] as { id: string; title: string; module_id: string; position: number }[] };

        // order lessons by module order then lesson position
        const moduleOrder = new Map(moduleIds.map((id, i) => [id, i]));
        const ordered = [...(lessons ?? [])].sort(
          (a, b) => (moduleOrder.get(a.module_id) ?? 0) - (moduleOrder.get(b.module_id) ?? 0) || a.position - b.position,
        );
        const done = ordered.filter((l) => completedIds.has(l.id)).length;
        const next = ordered.find((l) => !completedIds.has(l.id)) ?? ordered[0] ?? null;

        list.push({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          cpdHours: c.cpd_hours,
          coverUrl: c.cover_image_url ?? null,
          status: done === 0 ? "not_started" : done >= ordered.length && ordered.length > 0 ? "completed" : "in_progress",
          progressPercent: ordered.length ? Math.round((done / ordered.length) * 100) : 0,
          totalModules: modules?.length ?? 0,
          totalLessons: ordered.length,
          completedLessons: done,
          nextLessonId: next?.id ?? null,
          nextLessonTitle: next?.title ?? null,
          nextModuleTitle: next ? titleByModule.get(next.module_id) ?? null : null,
        });
      }
      setCourses(list);
      setCurrentCourse(list[0] ?? null);

      setLeaders((lbRes.data ?? []) as LeaderRow[]);
      setPosts((postsRes.data ?? []) as PostPreview[]);

      setGamification(await getMyGamification());
    } catch (err) {
      console.error("Error loading dashboard:", err);
      toast.error("Could not load your dashboard");
    } finally {
      setLoading(false);
    }
  }, [user, setCurrentCourse]);

  useEffect(() => {
    load();
  }, [load]);

  const resumeCourse = (course: CourseProgress) => {
    navigate(course.nextLessonId ? `/learn/${course.slug}/lesson/${course.nextLessonId}` : `/learn/${course.slug}`);
  };

  const enrol = async (course: CatalogCourse) => {
    if (!user) return;
    if (course.price_cents && course.price_cents > 0) {
      navigate(`/student/checkout/${course.id}`);
      return;
    }
    setEnrollingId(course.id);
    const { error } = await supabase
      .from("enrollments")
      .upsert({ user_id: user.id, course_id: course.id, status: "active" }, { onConflict: "user_id,course_id" });
    setEnrollingId(null);
    if (error) {
      console.error(error);
      toast.error("Could not enrol you in this course");
      return;
    }
    toast.success(`You're enrolled in ${course.title}`);
    await load();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={30} className="animate-spin" color="#3434ff" />
      </div>
    );
  }

  // While Mia's tour plays, anything she describes that this learner doesn't
  // have yet is shown as a labelled example.
  const realFirst = courses[0];
  const exampleCourse: CourseProgress | null = touring && !realFirst ? {
    id: "example", title: catalog[0]?.title ?? "IOSH-approved Safety 4.0 - Leading Safety in the Digital Age", slug: "", description: null,
    cpdHours: catalog[0]?.cpd_hours ?? null, coverUrl: catalog[0]?.cover_image_url ?? null, status: "in_progress", progressPercent: 35,
    totalModules: 4, totalLessons: 12, completedLessons: 4, nextLessonId: null, nextLessonTitle: "Why AI matters in EHS", nextModuleTitle: "Module 2",
  } : null;
  const first = realFirst ?? exampleCourse;
  const learning = courses.length ? courses : exampleCourse ? [exampleCourse] : [];

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", color: "#0b0b2c", padding: "40px 28px 72px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815" }}>WELCOME BACK</div>
        <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em", color: "#0b0b2c" }}>Hey {userName}</h1>
        <p style={{ margin: "12px 0 0", fontSize: "17px", lineHeight: 1.7, color: "#69697b" }}>
          {realFirst
            ? `You are ${realFirst.progressPercent}% through ${realFirst.title}.`
            : catalog.length
              ? "You're not enrolled in a course yet — pick one below to get started."
              : "No courses are available yet. Check back soon."}
        </p>

        {/* Continue hero */}
        {first && (
          <div data-tour="continue" style={{ marginTop: "32px", background: "radial-gradient(120% 160% at 88% 12%, #17176e 0%, #0a0a38 58%, #05051e 100%)", borderRadius: "20px", padding: "36px", position: "relative", overflow: "hidden", boxShadow: "0 18px 40px rgba(11,11,44,0.16)" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.3 }} />
            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ minWidth: 0, flex: "1 1 420px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#a6e21a", display: "flex", alignItems: "center", gap: 10 }}>
                  {!realFirst && <ExampleTag dark />}
                  {first.completedLessons === 0 ? "START YOUR COURSE" : first.status === "completed" ? "COURSE COMPLETE" : "CONTINUE WHERE YOU LEFT OFF"}
                </div>
                <div style={{ marginTop: "14px", fontSize: "28px", lineHeight: 1.25, fontWeight: 700, color: "#fff" }}>
                  {first.nextLessonTitle ? `${first.nextModuleTitle ? `${first.nextModuleTitle} • ` : ""}${first.nextLessonTitle}` : first.title}
                </div>
                <div style={{ marginTop: "10px", fontSize: "15px", color: "rgba(255,255,255,0.6)" }}>
                  {first.totalLessons > 0 ? `${first.completedLessons} of ${first.totalLessons} lessons complete` : "No lessons published yet"}
                </div>
                <div style={{ marginTop: "22px", height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${first.progressPercent}%`, background: "#a6e21a", borderRadius: "999px" }} />
                </div>
              </div>
              <button
                onClick={() => realFirst && resumeCourse(realFirst)}
                style={{ flex: "none", border: 0, borderRadius: "999px", background: "#3434ff", color: "#fff", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "16px 34px", cursor: "pointer", boxShadow: "0 0 40px rgba(52,52,255,0.4)" }}
              >
                {first.completedLessons === 0 ? "Start course" : first.status === "completed" ? "Review course" : "Resume course"}
              </button>
            </div>
          </div>
        )}

        {touring && first && (
          <div style={{ marginTop: "28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "20px" }}>
            <ExampleLesson course={first.title} />
            <ExampleCertificate name={userName} course={first.title} />
          </div>
        )}

        {gamification && (
          <div data-tour="progress" style={{ marginTop: "28px" }}><ProgressCard g={gamification} /></div>
        )}

        {/* Your learning */}
        {learning.length > 0 && (
          <>
            <div style={{ marginTop: "36px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>Your learning</h2>
            </div>
            <div data-tour="my-courses" style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {learning.map((course) => {
                const badge = statusBadges[course.status];
                return (
                  <div key={course.id} style={{ ...card, padding: "26px", overflow: "hidden" }}>
                    {course.coverUrl && <img src={course.coverUrl} alt="" style={{ display: "block", width: "calc(100% + 52px)", margin: "-26px -26px 20px", aspectRatio: "16/9", objectFit: "cover" }} />}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                      {!course.coverUrl && <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BookOpen size={23} color="#3434ff" />
                      </div>}
                      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>{course.id === "example" && <ExampleTag />}<span style={{ background: badge.bg, borderRadius: "999px", padding: "6px 14px", fontSize: "12px", fontWeight: 700, color: badge.fg }}>{badge.text}</span></span>
                    </div>
                    <div style={{ marginTop: "20px", fontSize: "19px", lineHeight: 1.3, fontWeight: 700 }}>{course.title}</div>
                    <div style={{ marginTop: "8px", fontSize: "14px", color: "#69697b" }}>
                      {course.totalModules} module{course.totalModules === 1 ? "" : "s"} • {course.totalLessons} lesson{course.totalLessons === 1 ? "" : "s"}
                      {course.cpdHours ? ` • ${course.cpdHours} CPD hrs` : ""}
                    </div>
                    <div style={{ marginTop: "20px", height: "6px", borderRadius: "999px", background: "#eef1f6", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${course.progressPercent}%`, background: "#3434ff", borderRadius: "999px" }} />
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "13px", fontWeight: 600, color: "#69697b" }}>{course.progressPercent}% complete</div>
                    <div style={{ marginTop: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button onClick={() => resumeCourse(course)} style={{ border: 0, borderRadius: "8px", background: "#3434ff", color: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, padding: "10px 18px", cursor: "pointer" }}>
                        {course.completedLessons === 0 ? "Start" : "Continue"}
                      </button>
                      <button onClick={() => navigate(`/learn/${course.slug}`)} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#0b0b2c", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, padding: "10px 18px", cursor: "pointer" }}>
                        Curriculum
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Catalog */}
        {catalog.length > 0 && (
          <>
            <h2 style={{ margin: "44px 0 0", fontSize: "22px", fontWeight: 700 }}>Available courses</h2>
            <div data-tour="catalog" style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {catalog.map((c) => (
                <div key={c.id} style={{ ...card, padding: "26px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {c.cover_image_url && <img src={c.cover_image_url} alt="" style={{ display: "block", width: "calc(100% + 52px)", margin: "-26px -26px 20px", aspectRatio: "16/9", objectFit: "cover" }} />}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {c.cover_image_url ? <span /> : <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(166,226,26,0.24)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BookOpen size={23} color="#5e7f0f" />
                    </div>}
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#0b0b2c" }}>{formatPrice(c.price_cents, c.currency)}</span>
                  </div>
                  <div style={{ marginTop: "20px", fontSize: "19px", fontWeight: 700 }}>{c.title}</div>
                  {c.description && <div style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.6, color: "#69697b", flex: 1 }}>{c.description}</div>}
                  <button
                    onClick={() => enrol(c)}
                    disabled={enrollingId === c.id}
                    style={{ marginTop: "18px", border: 0, borderRadius: "8px", background: "#3434ff", color: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "13px 18px", cursor: enrollingId === c.id ? "wait" : "pointer", opacity: enrollingId === c.id ? 0.7 : 1 }}
                  >
                    {enrollingId === c.id ? "Enrolling..." : c.price_cents ? "Buy course" : "Enrol for free"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Community + leaderboard */}
        <div style={{ marginTop: "44px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", alignItems: "start" }}>
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ padding: "22px 26px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MessageSquare size={20} color="#3434ff" />
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700 }}>Community</div>
              </div>
              <button onClick={() => onNavigate?.("community")} style={linkBtn}>View all</button>
            </div>
            {posts.length === 0 ? (
              <div style={{ padding: "22px 26px", fontSize: "14px", color: "#69697b" }}>No discussions yet — be the first to post.</div>
            ) : (
              posts.map((p) => (
                <div key={p.id} style={{ padding: "16px 26px", borderBottom: "1px solid #f1f4f8" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>{p.author_name} <span style={{ fontWeight: 400, color: "#94a3b8" }}>· {new Date(p.created_at).toLocaleDateString()}</span></div>
                  <div style={{ marginTop: "4px", fontSize: "14px", color: "#69697b", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.body}</div>
                </div>
              ))
            )}
            <div style={{ padding: "20px 26px", background: "#f8fafc" }}>
              <button
                onClick={() => onNavigate?.("community")}
                style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#0b0b2c", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "13px 20px", cursor: "pointer" }}
              >
                Start a discussion
              </button>
            </div>
          </div>

          <div data-tour="leaderboard" style={{ ...card, overflow: "hidden" }}>
            <div style={{ padding: "22px 26px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy size={20} color="#3434ff" />
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>Leaderboard</div>
            </div>
            {leaders.length === 0 ? (
              <div style={{ padding: "22px 26px", fontSize: "14px", color: "#69697b" }}>Complete a lesson to get on the board.</div>
            ) : (
              leaders.map((l, i) => (
                <div key={l.user_id} style={{ padding: "14px 26px", borderBottom: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "14px", background: l.is_me ? "#f1f4ff" : "transparent" }}>
                  <div style={{ width: 26, fontSize: "15px", fontWeight: 800, color: "#94a3b8" }}>{i + 1}</div>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700 }}>
                    {l.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, fontSize: "15px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.display_name}{l.is_me ? " (you)" : ""}
                    <div style={{ marginTop: 3 }}><LevelChip name={l.level_name} /></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "15px", fontWeight: 800 }}>{l.points}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>points</div>
                  </div>
                </div>
              ))
            )}
            <div style={{ padding: "18px 26px", background: "#f8fafc", fontSize: "13px", lineHeight: 1.6, color: "#69697b" }}>
              Earn points for lessons, quizzes, courses and helping in the community. You can hide yourself from the board in Settings.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
