import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Lock, PlayCircle, ArrowLeft, Clock } from "lucide-react";
import {
  isModuleUnlocked,
  type Course,
  type Module,
  type Lesson,
  type Enrollment,
} from "@/lib/lms";

interface ModuleWithLessons extends Module {
  lessons: Lesson[];
  unlocked: boolean;
}

const CourseView = () => {
  const { courseSlug } = useParams();
  const { user, loading: authLoading } = useAuthUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

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
      const { data: courseData, error: courseErr } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", courseSlug)
        .maybeSingle();
      if (courseErr || !courseData) {
        toast.error("Course not found");
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
        toast.error("Enrol in this course to view it");
        navigate("/learn");
        return;
      }
      setEnrollment(enr as Enrollment);

      const { data: moduleRows } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseData.id)
        .order("position");

      const moduleIds = (moduleRows ?? []).map((m) => m.id);
      const { data: lessonRows } = moduleIds.length
        ? await supabase.from("lessons").select("*").in("module_id", moduleIds).order("position")
        : { data: [] as Lesson[] };

      const { data: progressRows } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id);
      setCompletedIds(new Set((progressRows ?? []).map((p) => p.lesson_id)));

      const grouped: ModuleWithLessons[] = (moduleRows ?? []).map((m) => ({
        ...(m as Module),
        unlocked: isModuleUnlocked(m as Module, enr.enrolled_at),
        lessons: ((lessonRows ?? []) as Lesson[]).filter((l) => l.module_id === m.id),
      }));
      setModules(grouped);
    } catch (err) {
      console.error(err);
      toast.error("Could not load the course");
    } finally {
      setLoading(false);
    }
  };

  const allLessons = modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progressPercent = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  const nextLesson =
    modules.find((m) => m.unlocked)?.lessons.find((l) => !completedIds.has(l.id)) ??
    allLessons.find((l) => !completedIds.has(l.id));

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-background">
      <LearnHeader email={user?.email} />
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <Link to="/learn" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to My Learning
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{course.title}</h1>
        {course.description && <p className="mt-3 max-w-2xl text-white/70">{course.description}</p>}

        <div className="mt-6 max-w-md">
          <div className="mb-1 flex justify-between text-sm text-white/60">
            <span>{completedCount} of {allLessons.length} lessons complete</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
        </div>

        {nextLesson && (
          <Button
            className="mt-6"
            size="lg"
            onClick={() => navigate(`/learn/${course.slug}/lesson/${nextLesson.id}`)}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            {completedCount === 0 ? "Start course" : "Continue learning"}
          </Button>
        )}

        <div className="mt-10 space-y-8">
          {modules.length === 0 && (
            <p className="text-white/60">This course has no content yet.</p>
          )}
          {modules.map((module, idx) => (
            <section key={module.id}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {idx + 1}. {module.title}
                </h2>
                {!module.unlocked && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60">
                    <Lock className="h-3 w-3" /> Unlocks in {module.drip_days}d
                  </span>
                )}
              </div>
              {module.description && <p className="mb-3 text-sm text-white/60">{module.description}</p>}
              <Card className="divide-y divide-white/10 border-white/10 bg-card">
                {module.lessons.length === 0 && (
                  <div className="px-4 py-3 text-sm text-white/50">No lessons yet</div>
                )}
                {module.lessons.map((lesson) => {
                  const done = completedIds.has(lesson.id);
                  const locked = !module.unlocked;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      disabled={locked}
                      onClick={() => navigate(`/learn/${course.slug}/lesson/${lesson.id}`)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {locked ? (
                        <Lock className="h-5 w-5 shrink-0 text-white/40" />
                      ) : done ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      ) : (
                        <PlayCircle className="h-5 w-5 shrink-0 text-white/60" />
                      )}
                      <span className="flex-1 text-sm text-white">{lesson.title}</span>
                      {lesson.duration_minutes ? (
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Clock className="h-3 w-3" /> {lesson.duration_minutes}m
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </Card>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CourseView;
