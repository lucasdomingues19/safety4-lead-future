import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { QuizDialog } from "@/components/learn/QuizDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  FileDown,
  Award,
  Lock,
} from "lucide-react";
import {
  toEmbedUrl,
  isModuleUnlocked,
  asLessons,
  asQuizQuestions,
  type Course,
  type Module,
  type Lesson,
  type Enrollment,
  type Quiz,
  type QuizQuestion,
} from "@/lib/lms";
import { verifyEnrollmentAccess } from "@/lib/stripe";

const LessonView = () => {
  const { courseSlug, lessonId } = useParams();
  const { user, loading: authLoading } = useAuthUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/learn/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user && courseSlug) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, courseSlug]);

  const load = async () => {
    if (!user || !courseSlug) return;
    setLoading(true);
    try {
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", courseSlug)
        .maybeSingle();
      if (!courseData) {
        navigate("/learn");
        return;
      }
      setCourse(courseData as Course);

      const { data: enr } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseData.id)
        .maybeSingle();
      if (!enr) {
        toast.error("Enrol to view this course");
        navigate("/learn");
        return;
      }

      // Verify enrollment access (checks subscription status for paid courses)
      const hasAccess = await verifyEnrollmentAccess(user.id, courseData.id);
      if (!hasAccess) {
        toast.error("Your enrollment has expired or is not active");
        navigate("/learn");
        return;
      }

      setEnrollment(enr as Enrollment);

      const { data: moduleRows } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseData.id)
        .order("position");
      setModules((moduleRows ?? []) as Module[]);

      const moduleIds = (moduleRows ?? []).map((m) => m.id);
      const { data: lessonRows } = moduleIds.length
        ? await supabase.from("lessons").select("*").in("module_id", moduleIds).order("position")
        : { data: [] as Lesson[] };
      setLessons(asLessons(lessonRows));

      const { data: progressRows } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id);
      setCompletedIds(new Set((progressRows ?? []).map((p) => p.lesson_id)));
    } catch (err) {
      console.error(err);
      toast.error("Could not load the lesson");
    } finally {
      setLoading(false);
    }
  };

  // Ordered lesson list across modules (respecting module + lesson order)
  const orderedLessons = useMemo(() => {
    return modules.flatMap((m) =>
      lessons.filter((l) => l.module_id === m.id).sort((a, b) => a.position - b.position),
    );
  }, [modules, lessons]);

  const currentLesson = orderedLessons.find((l) => l.id === lessonId) ?? null;
  const currentIndex = orderedLessons.findIndex((l) => l.id === lessonId);
  const currentModule = modules.find((m) => m.id === currentLesson?.module_id) ?? null;
  const nextLesson = currentIndex >= 0 ? orderedLessons[currentIndex + 1] : undefined;

  const moduleLessons = currentModule
    ? lessons.filter((l) => l.module_id === currentModule.id)
    : [];
  const isLastInModule =
    !!currentLesson &&
    moduleLessons.length > 0 &&
    moduleLessons[moduleLessons.length - 1].id === currentLesson.id;

  const embed = toEmbedUrl(currentLesson?.video_url);
  const isDone = currentLesson ? completedIds.has(currentLesson.id) : false;

  const fireCourseCompletion = async () => {
    if (!course || !user) return;
    try {
      const { data, error } = await supabase.functions.invoke("complete-course", {
        body: { course_id: course.id },
      });
      if (error) throw error;
      if (data?.completed) {
        toast.success("🎓 Course complete! Your certificate is on its way.");
      }
    } catch (err) {
      console.error("completion error", err);
    }
  };

  const goToNext = async () => {
    if (!currentLesson) return;
    if (isLastInModule && currentModule) {
      // Check for a quiz on this module before advancing.
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("module_id", currentModule.id)
        .maybeSingle();
      if (quizData) {
        const { data: qs } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizData.id)
          .order("position");
        setQuiz(quizData as Quiz);
        setQuizQuestions(asQuizQuestions(qs));
        setQuizOpen(true);
        return;
      }
    }
    advance();
  };

  const advance = () => {
    if (nextLesson) {
      navigate(`/learn/${courseSlug}/lesson/${nextLesson.id}`);
    } else {
      fireCourseCompletion();
      navigate(`/learn/${courseSlug}`);
    }
  };

  const markComplete = async () => {
    if (!currentLesson || !user) return;
    setSaving(true);
    try {
      if (!isDone) {
        const { error } = await supabase.from("lesson_progress").insert({
          user_id: user.id,
          lesson_id: currentLesson.id,
        });
        if (error && !error.message.includes("duplicate")) throw error;
        setCompletedIds((prev) => new Set(prev).add(currentLesson.id));
      }
      await goToNext();
    } catch (err) {
      console.error(err);
      toast.error("Could not save your progress");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-background">
        <LearnHeader email={user?.email} />
        <div className="container mx-auto px-4 py-20 text-center text-white/70">
          Lesson not found.{" "}
          <Link to={`/learn/${courseSlug}`} className="text-primary hover:underline">
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f7fa" }}>
      <LearnHeader email={user?.email} />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: "14px", color: "#69697b", marginBottom: "24px" }}>
          <Link to={`/learn/${courseSlug}`} style={{ color: "#3434ff", textDecoration: "none" }}>My course</Link>
          {currentModule && (
            <> / <span style={{ color: "#0b0b2c" }}>{currentModule.title}</span></>
          )}
        </div>

        {/* Main grid layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "32px" }}>
          {/* Video player and content */}
          <div>
            {/* Video player */}
            <div style={{
              background: "#0b0b2c",
              borderRadius: "24px",
              overflow: "hidden",
              marginBottom: "32px",
              boxShadow: "0 10px 40px rgba(11,11,44,0.1)",
              position: "relative"
            }}>
              {embed ? (
                <div style={{ aspectRatio: "16/9", width: "100%" }}>
                  <iframe
                    src={embed}
                    title={currentLesson.title}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div style={{
                  aspectRatio: "16/9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#1a1a3e",
                  color: "#69697b"
                }}>
                  <PlayCircle size={48} />
                </div>
              )}
              {/* Slide progress */}
              <div style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600"
              }}>
                Slide 6 / 13
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid #e2e8f0", marginBottom: "32px" }}>
              {["Overview", "Transcript", "Resources", "Comments", "My notes"].map((tab) => (
                <button
                  key={tab}
                  style={{
                    background: "none",
                    border: "none",
                    color: tab === "Overview" ? "#3434ff" : "#69697b",
                    fontSize: "14px",
                    fontWeight: tab === "Overview" ? "600" : "500",
                    paddingBottom: "12px",
                    borderBottom: tab === "Overview" ? "2px solid #3434ff" : "none",
                    cursor: "pointer"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0b0b2c", marginBottom: "16px" }}>
                {currentLesson.title}
              </h2>
              <p style={{ fontSize: "14px", color: "#69697b", lineHeight: "1.6", marginBottom: "24px" }}>
                {currentLesson.description || "Explore how the EHS profession is changing, where AI creates real capacity, and what stays firmly the professional's responsibility."}
              </p>

              {/* Meta info */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", padding: "20px", background: "#f8fafc", borderRadius: "12px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px" }}>Duration</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0b2c" }}>35 minutes</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px" }}>Format</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0b2c" }}>Narrated deck</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", color: "#8ab815" }}>Practical</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0b2c" }}>2 exercises</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* In this module */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#0b0b2c", marginBottom: "16px" }}>In this module</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {currentModule && lessons
                  .filter((l) => l.module_id === currentModule.id)
                  .sort((a, b) => a.position - b.position)
                  .map((l) => {
                    const done = completedIds.has(l.id);
                    return (
                      <button
                        key={l.id}
                        onClick={() => navigate(`/learn/${courseSlug}/lesson/${l.id}`)}
                        style={{
                          background: "none",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#0b0b2c",
                          fontSize: "14px",
                          cursor: "pointer",
                          textAlign: "left"
                        }}
                      >
                        {done ? (
                          <CheckCircle2 size={16} style={{ color: "#8ab815" }} />
                        ) : (
                          <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #8ab815" }} />
                        )}
                        <span>{l.title}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Hands-on next */}
            <div style={{ background: "#f0fce4", border: "1px solid #d4e8b8", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "24px", height: "24px", background: "#8ab815", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px" }}>⚡</div>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0b0b2c", margin: 0 }}>Hands-on next</h4>
              </div>
              <p style={{ fontSize: "12px", color: "#69697b", lineHeight: "1.5", margin: 0 }}>Open Copilot and run your first prompt before continuing to Module 02.</p>
            </div>
          </div>
        </div>
      </main>

      {quiz && user && (
        <QuizDialog
          open={quizOpen}
          onOpenChange={setQuizOpen}
          quiz={quiz}
          questions={quizQuestions}
          userId={user.id}
          onPassed={() => {
            setQuizOpen(false);
            advance();
          }}
        />
      )}
    </div>
  );
};

export default LessonView;
