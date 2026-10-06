import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { LmsShell, ShellTitle } from "@/components/learn/shell/LmsShell";
import { useLmsProfile } from "@/components/learn/shell/useLmsProfile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Lock, PlayCircle, ArrowLeft, Clock, Award, ClipboardCheck } from "lucide-react";
import {
  isModuleUnlocked,
  asLessons,
  type Course,
  type Module,
  type Lesson,
  type Enrollment,
} from "@/lib/lms";
import { verifyEnrollmentAccess } from "@/lib/stripe";
import { courseOrder, lockedLessonIds } from "@/lib/progress";
import { getFinalAssessmentStatus, attemptsLeftLabel, type FinalAssessmentStatus } from "@/lib/finalAssessment";

interface ModuleWithLessons extends Module {
  lessons: Lesson[];
  unlocked: boolean;
}

const CourseView = () => {
  const { courseSlug } = useParams();
  const { user, loading: authLoading } = useAuthUser();
  const { profile } = useLmsProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  // Lessons watched part-way: lesson id -> { watched share 0-1, last watched time }
  const [partial, setPartial] = useState<Map<string, { frac: number; at: string }>>(new Map());
  const [quizByModule, setQuizByModule] = useState<Map<string, { title: string; passed: boolean }>>(new Map());
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [finalStatus, setFinalStatus] = useState<FinalAssessmentStatus | null>(null);

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

      // Admins can preview any course without enrolling.
      const hasAccess = !!enr && (await verifyEnrollmentAccess(user.id, courseData.id));
      let isPreview = false;
      if (!hasAccess) {
        const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
        if (!role) {
          toast.error(enr ? "Your enrollment has expired or is not active" : "Enrol in this course to view it");
          navigate("/learn");
          return;
        }
        isPreview = true;
      }
      setPreview(isPreview);
      if ((courseData as Course).final_assessment_ref) {
        getFinalAssessmentStatus(courseData.id).then(setFinalStatus).catch(() => setFinalStatus(null));
      }
      setEnrollment((enr ?? null) as Enrollment | null);

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
        .eq("user_id", user.id)
        .eq("is_completed", true);
      setCompletedIds(new Set((progressRows ?? []).map((p) => p.lesson_id)));

      const { data: watchRows } = await supabase.from("lesson_watch").select("lesson_id, watched_seconds, duration_seconds, last_heartbeat_at").eq("user_id", user.id);
      setPartial(new Map((watchRows ?? []).filter((w) => Number(w.watched_seconds) > 5).map((w) => [w.lesson_id, {
        frac: Number(w.duration_seconds) > 0 ? Math.min(1, Number(w.watched_seconds) / Number(w.duration_seconds)) : 0,
        at: w.last_heartbeat_at ?? "",
      }])));

      const grouped: ModuleWithLessons[] = (moduleRows ?? []).map((m) => ({
        ...(m as Module),
        unlocked: isPreview || isModuleUnlocked(m as Module, enr?.enrolled_at),
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

      const { data: cert } = await supabase.from("certificates").select("certificate_number, external_url").eq("course_name", courseData.title).eq("recipient_email", (user.email ?? "").toLowerCase()).order("issued_at", { ascending: false }).limit(1).maybeSingle();
      setCertificateUrl(cert ? cert.external_url ?? `/verify/${cert.certificate_number}` : null);
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

  // Lessons unlock in order (per-lesson "must complete" rule, enforced server-side).
  const ordered = courseOrder(modules, allLessons);
  const sequenceLocked = preview ? new Set<string>() : lockedLessonIds(ordered, completedIds);
  const moduleUnlocked = new Map(modules.map((m) => [m.id, m.unlocked]));
  const openLessons = ordered.filter((l) => moduleUnlocked.get(l.module_id) && !sequenceLocked.has(l.id));
  // Resume where they stopped: the most recently watched unfinished lesson, else the first unfinished one.
  const resumeLesson = openLessons.filter((l) => !completedIds.has(l.id) && partial.has(l.id)).sort((a, b) => (partial.get(b.id)!.at).localeCompare(partial.get(a.id)!.at))[0];
  const nextLesson = resumeLesson ?? openLessons.find((l) => !completedIds.has(l.id)) ?? openLessons[0];
  const started = completedCount > 0 || partial.size > 0;

  if (authLoading || loading) {
    return (
      <LmsShell profile={profile} active="learning" header={<ShellTitle label="COURSE" title="Loading…" />}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LmsShell>
    );
  }

  if (!course) return null;

  const header = (
    <>
      <ShellTitle label="COURSE" title={course.title} />
      <div className="hidden flex-none items-center gap-3 sm:flex">
        <div style={{ width: 120, height: 6, borderRadius: 999, background: "#eef1f6", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPercent}%`, background: "#3434ff", borderRadius: 999 }} />
        </div>
        <div className="text-[13px] font-bold text-[#69697b]">{progressPercent}%</div>
      </div>
    </>
  );

  return (
    <LmsShell profile={profile} active="learning" header={header}>
      {/* Course heading */}
      <div className="mx-auto max-w-4xl px-4 pt-8 md:px-7 md:pt-10">
        <Link to="/learn?view=learning" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#69697b] hover:text-[#0b0b2c]">
          <ArrowLeft className="h-4 w-4" /> My learning
        </Link>
        <div className="rounded-[20px] border border-[#e2e8f0] bg-white p-6 md:p-8">
          {preview && (
            <div className="mb-4 inline-block rounded-md bg-[#fff7e6] px-3 py-1 text-xs font-semibold text-[#8a5a00]">Admin preview — not enrolled, progress isn't recorded</div>
          )}
          <div className="text-[13px] font-extrabold tracking-[0.12em] text-[#8ab815]">COURSE</div>
          <h1 className="mt-2 text-[28px] font-bold leading-tight text-[#0b0b2c] md:text-[34px]" style={{ textWrap: "balance" } as React.CSSProperties}>{course.title}</h1>
          {course.description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#69697b]">{course.description}</p>}

          <div className="mt-6 max-w-md">
            <div className="mb-1.5 flex justify-between text-sm text-[#69697b]">
              <span>{completedCount} of {allLessons.length} lessons complete</span>
              <span className="font-bold text-[#0b0b2c]">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5 bg-[#eef1f6]" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {nextLesson && (
              <Button className="h-12 px-6 text-base font-semibold" onClick={() => navigate(`/learn/${course.slug}/lesson/${nextLesson.id}`)}>
                <PlayCircle className="mr-2 h-5 w-5" />
                {!started ? "Start course" : "Resume course"}
              </Button>
            )}
            {certificateUrl && (
              <a href={certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-md bg-[#a6e21a] px-6 text-base font-semibold text-[#0b0b2c]">
                <Award className="h-5 w-5" /> View certificate
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-7">
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
                  const locked = !module.unlocked || sequenceLocked.has(lesson.id);
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
                      {!done && partial.has(lesson.id) && Math.round(partial.get(lesson.id)!.frac * 100) >= 3 && (
                        <span className="rounded-full bg-[#f5f7ff] px-2 py-0.5 text-[11px] font-bold text-[#2c23d2]">{lesson.id === nextLesson?.id ? "Resume · " : "In progress · "}{Math.round(partial.get(lesson.id)!.frac * 100)}%</span>
                      )}
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
                      {quizByModule.get(module.id)!.passed ? "Passed" : module.lessons.every((l) => l.enforce_progress === false || completedIds.has(l.id)) ? "Ready — open the last lesson" : "Unlocks after all lessons"}
                    </span>
                  </div>
                )}
              </Card>
            </section>
          ))}
          {finalStatus?.configured && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-[#0b0b2c]">Final assessment</h2>
              <Card className="flex flex-wrap items-center gap-4 rounded-[16px] border-slate-200 bg-white p-5 shadow-sm">
                {finalStatus.passed ? <Award className="h-7 w-7 shrink-0 text-[#8ab815]" /> : finalStatus.eligible ? <ClipboardCheck className="h-7 w-7 shrink-0 text-primary" /> : <Lock className="h-6 w-6 shrink-0 text-[#94a3b8]" />}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#0b0b2c]">
                    {finalStatus.passed ? `Passed · ${Math.round(Number(finalStatus.passed.score ?? 0))}%` : finalStatus.can_attempt === false ? "No attempts left — contact hello@safetytech.academy" : finalStatus.eligible ? "Unlocked — earn your verified certificate" : "Unlocks when you finish every lesson and module quiz"}
                  </div>
                  <div className="text-xs text-[#69697b]">Graded and certified securely by Syngraph AI{!finalStatus.passed && finalStatus.can_attempt !== false && attemptsLeftLabel(finalStatus) ? ` · ${attemptsLeftLabel(finalStatus)}` : ""}</div>
                </div>
                {finalStatus.passed?.credential_url ? (
                  <a href={finalStatus.passed.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#a6e21a] px-4 text-sm font-semibold text-[#0b0b2c]"><Award className="h-4 w-4" /> View certificate</a>
                ) : finalStatus.eligible && finalStatus.can_attempt !== false ? (
                  <Button onClick={() => navigate(`/learn/${course.slug}/final-assessment`)} className="h-10 px-4 font-semibold">
                    {finalStatus.latest?.status === "failed" ? "Try again" : "Start final assessment"}
                  </Button>
                ) : null}
              </Card>
            </section>
          )}
        </div>
      </main>
    </LmsShell>
  );
};

export default CourseView;
