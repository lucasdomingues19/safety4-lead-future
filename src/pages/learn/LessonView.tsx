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
  type Course,
  type Module,
  type Lesson,
  type Enrollment,
  type Quiz,
  type QuizQuestion,
} from "@/lib/lms";

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
      setLessons((lessonRows ?? []) as Lesson[]);

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
        setQuizQuestions(((qs ?? []) as unknown as QuizQuestion[]));
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
    <div className="min-h-screen bg-background">
      <LearnHeader email={user?.email} />
      <main className="container mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="min-w-0">
          <Link
            to={`/learn/${courseSlug}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> {course.title}
          </Link>

          {embed ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl border-2 border-primary bg-black">
              <iframe
                src={embed}
                title={currentLesson.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-white/10 bg-card text-white/40">
              <PlayCircle className="h-10 w-10" />
            </div>
          )}

          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-white">
            {currentLesson.title}
          </h1>

          {currentLesson.body && (
            <div className="prose prose-invert mt-4 max-w-none prose-headings:text-white prose-a:text-primary">
              <ReactMarkdown>{currentLesson.body}</ReactMarkdown>
            </div>
          )}

          {currentLesson.resources?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">
                Resources
              </h3>
              <div className="space-y-2">
                {currentLesson.resources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-card px-3 py-2 text-sm text-white hover:bg-white/5"
                  >
                    <FileDown className="h-4 w-4 text-primary" /> {r.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
            <Button onClick={markComplete} disabled={saving} size="lg">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDone ? "Next" : isLastInModule ? "Complete module" : "Mark complete & continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {isDone && <span className="flex items-center gap-1.5 text-sm text-primary"><CheckCircle2 className="h-4 w-4" /> Completed</span>}
          </div>
        </div>

        {/* Sidebar curriculum */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="border-white/10 bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/60">
              Course content
            </h2>
            <div className="space-y-4">
              {modules.map((m) => {
                const unlocked = isModuleUnlocked(m, enrollment?.enrolled_at);
                const mLessons = lessons
                  .filter((l) => l.module_id === m.id)
                  .sort((a, b) => a.position - b.position);
                return (
                  <div key={m.id}>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-white/40">
                      {m.title}
                    </p>
                    <div className="space-y-0.5">
                      {mLessons.map((l) => {
                        const active = l.id === currentLesson.id;
                        const done = completedIds.has(l.id);
                        return (
                          <button
                            key={l.id}
                            type="button"
                            disabled={!unlocked}
                            onClick={() => navigate(`/learn/${courseSlug}/lesson/${l.id}`)}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors disabled:opacity-50 ${
                              active ? "bg-primary/15 text-white" : "text-white/70 hover:bg-white/5"
                            }`}
                          >
                            {!unlocked ? (
                              <Lock className="h-4 w-4 shrink-0 text-white/40" />
                            ) : done ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <PlayCircle className="h-4 w-4 shrink-0 text-white/50" />
                            )}
                            <span className="truncate">{l.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </aside>
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
