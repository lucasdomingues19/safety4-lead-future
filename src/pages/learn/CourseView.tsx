import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Lock, PlayCircle, ArrowLeft, Clock, Award } from "lucide-react";
import {
  isModuleUnlocked,
  asLessons,
  type Course,
  type Module,
  type Lesson,
  type Enrollment,
} from "@/lib/lms";
import { verifyEnrollmentAccess } from "@/lib/stripe";

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
  const [quizByModule, setQuizByModule] = useState<Map<string, { title: string; passed: boolean }>>(new Map());
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

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
        lessons: asLessons(lessonRows).filter((l) => l.module_id === m.id),
      }));
      setModules(grouped);

      if (moduleIds.length) {
        const { data: quizRows } = await supabase.from("quizzes").select("id, title, module_id").in("module_id", moduleIds);
        const quizIds = (quizRows ?? []).map((q) => q.id);
        const { data: passRows } = quizIds.length
          ? await supabase.from("quiz_attempts").select("quiz_id").eq("user_id", user.id).eq("passed", true).in("quiz_id", quizIds)
          : { data: [] as { quiz_id: string }[] };
        const passed = new Set((passRows ?? []).map((p) => p.quiz_id));
        setQuizByModule(new Map((quizRows ?? []).map((q) => [q.module_id, { title: q.title, passed: passed.has(q.id) }])));
      }

      const { data: cert } = await supabase.from("certificates").select("certificate_number").eq("course_name", courseData.title).eq("recipient_email", (user.email ?? "").toLowerCase()).maybeSingle();
      setCertificateUrl(cert ? `/verify/${cert.certificate_number}` : null);
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

  const unlockedLessons = modules.filter((m) => m.unlocked).flatMap((m) => m.lessons);
  const nextLesson = unlockedLessons.find((l) => !completedIds.has(l.id)) ?? unlockedLessons[0];

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <LearnHeader email={user?.email} />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #3434ff 0%, #2a2ad6 100%)" }} className="px-4 py-10 text-white md:py-12">
        <div className="mx-auto max-w-4xl">
          <Link to="/learn" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to My Learning
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{course.title}</h1>
          {course.description && <p className="mt-3 max-w-2xl text-white/70">{course.description}</p>}

          <div className="mt-8 max-w-md">
            <div className="mb-1.5 flex justify-between text-sm text-white/60">
              <span>{completedCount} of {allLessons.length} lessons complete</span>
              <span className="font-semibold text-white">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5 bg-white/10" />
          </div>

          {certificateUrl && (
            <a href={certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-6 mr-3 inline-flex h-12 items-center gap-2 rounded-md bg-[#a6e21a] px-6 text-base font-semibold text-[#0b0b2c]">
              <Award className="h-5 w-5" /> View certificate
            </a>
          )}
          {nextLesson && (
            <Button
              className="mt-6 h-12 px-6 text-base font-semibold"
              onClick={() => navigate(`/learn/${course.slug}/lesson/${nextLesson.id}`)}
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              {completedCount === 0 ? "Start course" : "Continue learning"}
            </Button>
          )}
        </div>
      </div>

      {/* Curriculum */}
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="space-y-8">
          {modules.length === 0 && (
            <p className="text-[#69697b]">This course has no content yet.</p>
          )}
          {modules.map((module, idx) => (
            <section key={module.id}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0b0b2c]">
                  {idx + 1}. {module.title}
                </h2>
                {!module.unlocked && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-[#69697b]">
                    <Lock className="h-3 w-3" /> Unlocks in {module.drip_days}d
                  </span>
                )}
              </div>
              {module.description && <p className="mb-3 text-sm text-[#69697b]">{module.description}</p>}
              <Card className="divide-y divide-slate-100 overflow-hidden rounded-[16px] border-slate-200 bg-white shadow-sm">
                {module.lessons.length === 0 && (
                  <div className="px-4 py-3 text-sm text-[#94a3b8]">No lessons yet</div>
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
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {locked ? (
                        <Lock className="h-5 w-5 shrink-0 text-[#94a3b8]" />
                      ) : done ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      ) : (
                        <PlayCircle className="h-5 w-5 shrink-0 text-[#69697b]" />
                      )}
                      <span className="flex-1 text-sm font-medium text-[#0b0b2c]">{lesson.title}</span>
                      {lesson.duration_minutes ? (
                        <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
                          <Clock className="h-3 w-3" /> {lesson.duration_minutes}m
                        </span>
                      ) : null}
                    </button>
                  );
                })}
                {quizByModule.get(module.id) && (
                  <div className="flex items-center gap-3 bg-[#f8fafc] px-4 py-3.5">
                    <Award className={`h-5 w-5 shrink-0 ${quizByModule.get(module.id)!.passed ? "text-[#8ab815]" : "text-[#94a3b8]"}`} />
                    <span className="flex-1 text-sm font-medium text-[#0b0b2c]">{quizByModule.get(module.id)!.title}</span>
                    <span className="text-xs font-semibold text-[#69697b]">
                      {quizByModule.get(module.id)!.passed ? "Passed" : module.lessons.every((l) => completedIds.has(l.id)) ? "Ready — open the last lesson" : "Unlocks after all lessons"}
                    </span>
                  </div>
                )}
              </Card>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CourseView;
