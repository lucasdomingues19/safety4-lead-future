import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ChevronRight, CheckCircle2, Play, Download, Award, Lock, Loader2, ExternalLink, Presentation, FileText, Link2 } from "lucide-react";
import { toast } from "sonner";
import { toEmbedUrl, isIframeEmbed, isModuleUnlocked, type Lesson, type Module, type Course } from "@/lib/lms";
import { getSignedLessonMedia, isPdf, isOfficeDoc, type SignedLessonMedia } from "@/lib/lessonMedia";
import { getQuizQuestions, type Quiz, type QuizQuestion } from "@/lib/quiz";
import { QuizDialog } from "@/components/learn/QuizDialog";
import { CourseCelebration, ShareActions } from "@/components/learn/Celebration";
import { verifyEnrollmentAccess } from "@/lib/stripe";
import { courseOrder, lockedLessonIds, isVideoLesson, minWatchPercent, recordWatch, completeLesson, lockMessage } from "@/lib/progress";
import { TrackedVideo, TrackedYouTube, TrackedVimeo, youTubeId, isVimeo, isDirectVideoUrl, type WatchSample } from "@/components/learn/TrackedPlayer";
import { LmsShell, ShellTitle } from "@/components/learn/shell/LmsShell";
import { LessonTutor } from "@/components/learn/LessonTutor";
import { LessonNotes } from "@/components/learn/LessonNotes";
import { ReactionBar, useCommentReactions } from "@/components/learn/CommentReactions";
import { useLmsProfile } from "@/components/learn/shell/useLmsProfile";

/** Text with the searched words highlighted; optionally scrolls the first hit into view. */
function HitText({ text, query, scroll }: { text: string; query: string; scroll?: boolean }) {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length >= 2).slice(0, 6);
  const first = useRef<HTMLElement | null>(null);
  useEffect(() => { if (scroll) first.current?.scrollIntoView({ block: "center", behavior: "smooth" }); }, [scroll, query, text]);
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  let seen = false;
  return <>{text.split(re).map((part, i) => {
    if (i % 2 === 0) return part;
    const ref = !seen ? ((seen = true), first) : undefined;
    return <mark key={i} ref={ref as React.Ref<HTMLElement> | undefined} style={{ background: "#e8ffbd", color: "inherit", borderRadius: 3, padding: "0 1px" }}>{part}</mark>;
  })}</>;
}

const TABS = ["overview", "ask", "transcript", "resources", "comments"] as const;
const TAB_LABEL: Record<string, string> = { overview: "Overview", ask: "Ask Mia ✨", transcript: "Transcript", resources: "Resources", comments: "Comments" };
type Tab = (typeof TABS)[number];

interface LessonComment { id: string; user_id: string; author_name: string; body: string; created_at: string }

const LessonView = () => {
  const { courseSlug, lessonId } = useParams();
  const { user } = useAuthUser();
  const { profile } = useLmsProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1180);
  const [saving, setSaving] = useState(false);
  const [captions, setCaptions] = useState(false);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const quizOpenRef = useRef(false);
  quizOpenRef.current = quizOpen;
  // Where to go when the quiz that opened after the module's last lesson is closed.
  const afterQuiz = useRef<string | null>(null);
  // Course-complete moment: opens once, right after the certificate is first issued.
  const [celebrate, setCelebrate] = useState<{ url: string; number?: string } | null>(null);
  const pendingCelebrate = useRef<{ url: string; number?: string } | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  // Admins without an enrolment can open any lesson in preview mode (nothing is recorded).
  const [preview, setPreview] = useState(false);
  // Enrolled admins test with everything open (no order, drip or watch minimum); progress is recorded.
  const [adminOpen, setAdminOpen] = useState(false);
  // Where the video resumes (seconds): taken from what they already watched.
  const [resumeAt, setResumeAt] = useState(0);
  // Watch tracking: server-confirmed seconds + what the player has measured since.
  const [watched, setWatched] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  // Seconds measured for the lesson in `lessonId`; `sent`/`at` = last heartbeat.
  const tracker = useRef({ lessonId: "", value: 0, sent: 0, at: 0, duration: 0 });

  const [signed, setSigned] = useState<SignedLessonMedia | null>(null);
  const [mediaError, setMediaError] = useState(false);

  const [comments, setComments] = useState<LessonComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const reactions = useCommentReactions(comments.map((c) => c.id), user?.id);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1180);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const lesson = useMemo(() => lessons.find((l) => l.id === lessonId) ?? null, [lessons, lessonId]);

  // Course-ordered lesson list (module order, then lesson position) — same order the server enforces.
  const orderedLessons = useMemo(() => courseOrder(modules, lessons), [modules, lessons]);
  const locked = useMemo(() => (preview || adminOpen ? new Set<string>() : lockedLessonIds(orderedLessons, completed)), [preview, adminOpen, orderedLessons, completed]);

  const loadCertificate = useCallback(async (courseTitle: string) => {
    const { data } = await supabase.from("certificates").select("certificate_number, external_url").eq("course_name", courseTitle).eq("recipient_email", (user?.email ?? "").toLowerCase()).order("issued_at", { ascending: false }).limit(1).maybeSingle();
    setCertificateUrl(data ? data.external_url ?? `${window.location.origin}/verify/${data.certificate_number}` : null);
  }, [user?.email]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("captions_default").eq("id", user.id).maybeSingle()
      .then(({ data }) => setCaptions(!!data?.captions_default));
  }, [user]);

  const load = useCallback(async () => {
    if (!user || !courseSlug || !lessonId) return;
    try {
      const { data: c } = await supabase.from("courses").select("*").eq("slug", courseSlug).maybeSingle();
      if (!c) { toast.error("Course not found"); navigate("/learn"); return; }

      const { data: enr } = await supabase.from("enrollments").select("enrolled_at").eq("user_id", user.id).eq("course_id", c.id).maybeSingle();
      let isPreview = false;
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      const hasAccess = !!enr && (await verifyEnrollmentAccess(user.id, c.id));
      const isAdminOpen = hasAccess && !!role;
      setAdminOpen(isAdminOpen);
      if (!hasAccess) {
        if (!role) {
          toast.error("You don't have active access to this course");
          navigate("/learn");
          return;
        }
        isPreview = true;
      }
      setPreview(isPreview);

      const { data: mods } = await supabase.from("modules").select("*").eq("course_id", c.id).order("position");
      const moduleList = (mods ?? []) as Module[];
      const modIds = moduleList.map((m) => m.id);
      const { data: les } = modIds.length ? await supabase.from("lessons").select("*").in("module_id", modIds).order("position") : { data: [] };
      const lessonList = (les ?? []) as unknown as Lesson[];

      const current = lessonList.find((l) => l.id === lessonId);
      if (!current) { toast.error("Lesson not found"); navigate(`/learn/${courseSlug}`); return; }

      const currentModule = moduleList.find((m) => m.id === current.module_id);
      if (!isPreview && !isAdminOpen && currentModule && !isModuleUnlocked(currentModule, enr!.enrolled_at)) {
        toast.error(`This module unlocks ${currentModule.drip_days} days after you enrolled`);
        navigate(`/learn/${courseSlug}`);
        return;
      }

      const lessonIds = lessonList.map((l) => l.id);
      const { data: prog } = lessonIds.length
        ? await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("is_completed", true).in("lesson_id", lessonIds)
        : { data: [] };
      const done = new Set((prog ?? []).map((p) => p.lesson_id));

      // Lessons unlock in order: bounce to the lesson that is blocking this one.
      if (!isPreview && !isAdminOpen) {
        const ordered = courseOrder(moduleList, lessonList);
        if (lockedLessonIds(ordered, done).has(current.id)) {
          const blocker = ordered.find((l) => l.enforce_progress !== false && !done.has(l.id));
          toast.error(blocker ? `Finish "${blocker.title}" first` : "Finish the previous lessons first");
          navigate(blocker ? `/learn/${courseSlug}/lesson/${blocker.id}` : `/learn/${courseSlug}`, { replace: true });
          return;
        }
      }

      const { data: watchRow } = isPreview
        ? { data: null }
        : await supabase.from("lesson_watch").select("watched_seconds, duration_seconds").eq("user_id", user.id).eq("lesson_id", current.id).maybeSingle();
      const serverWatched = Number(watchRow?.watched_seconds ?? 0);
      // Send any unsent time for the lesson we're leaving before switching trackers.
      const prev = tracker.current;
      if (prev.lessonId && prev.lessonId !== current.id && prev.value > prev.sent + 0.5) {
        recordWatch(prev.lessonId, prev.value, prev.duration);
      }
      tracker.current = { lessonId: current.id, value: serverWatched, sent: serverWatched, at: Date.now(), duration: Number(watchRow?.duration_seconds ?? 0) };
      setWatched(serverWatched);
      // Prefer the exact position saved on this device; otherwise how much they've watched.
      let stored = 0;
      try { stored = Number(localStorage.getItem(`lms-pos:${current.id}`)) || 0; } catch { /* private mode */ }
      setResumeAt(done.has(current.id) ? 0 : stored > 0 && (!watchRow?.duration_seconds || stored < Number(watchRow.duration_seconds)) ? stored : serverWatched);
      setPlayerDuration(Number(watchRow?.duration_seconds ?? 0));

      setCourse(c as unknown as Course);
      setModules(moduleList);
      setLessons(lessonList);
      setCompleted(done);

      const { data: quizRow } = await supabase.from("quizzes").select("*").eq("module_id", current.module_id).maybeSingle();
      if (quizRow) {
        setQuiz(quizRow as Quiz);
        setQuizQuestions(await getQuizQuestions(quizRow.id));
        const { data: pass } = await supabase.from("quiz_attempts").select("id").eq("user_id", user.id).eq("quiz_id", quizRow.id).eq("passed", true).limit(1);
        setQuizPassed(!!pass?.length);
      } else {
        setQuiz(null);
        setQuizQuestions([]);
        setQuizPassed(false);
      }

      await loadCertificate(c.title);
    } catch (err) {
      console.error(err);
      toast.error("Could not load this lesson");
    } finally {
      setLoading(false);
    }
  }, [user, courseSlug, lessonId, navigate, loadCertificate]);

  // Arriving from search (?tab=transcript&q=term): open that tab and highlight the term.
  const [hitQuery, setHitQuery] = useState("");
  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("tab");
    setActiveTab((TABS as readonly string[]).includes(t ?? "") ? (t as Tab) : "overview");
    setHitQuery(sp.get("q") ?? "");
    load();
  }, [load]);

  // Uploaded files are private: fetch short-lived signed URLs for this lesson.
  const needsSigning = !!lesson && (!!lesson.media_path || (lesson.resources ?? []).some((r) => r.path));
  const loadSignedMedia = useCallback(async () => {
    if (!lesson || !needsSigning) { setSigned(null); return; }
    setMediaError(false);
    try {
      setSigned(await getSignedLessonMedia(lesson.id));
    } catch (err) {
      console.error("lesson media", err);
      setMediaError(true);
    }
  }, [lesson, needsSigning]);
  useEffect(() => { setSigned(null); loadSignedMedia(); }, [loadSignedMedia]);

  const loadComments = useCallback(async () => {
    if (!lessonId) return;
    const { data } = await supabase.from("lesson_comments").select("id, user_id, author_name, body, created_at").eq("lesson_id", lessonId).order("created_at");
    setComments((data ?? []) as LessonComment[]);
  }, [lessonId]);
  useEffect(() => { loadComments(); }, [loadComments]);

  const displayName = () => {
    const meta = (user?.user_metadata as { full_name?: string } | undefined)?.full_name;
    return (meta && meta.trim()) || "Learner";
  };

  const postComment = async () => {
    if (!user || !lessonId || !newComment.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("lesson_comments").insert({ lesson_id: lessonId, user_id: user.id, author_name: displayName(), body: newComment.trim() });
    setPosting(false);
    if (error) { toast.error("Could not post your comment"); return; }
    setNewComment("");
    loadComments();
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("lesson_comments").delete().eq("id", id);
    if (error) { toast.error("Could not delete comment"); return; }
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  /** Ask the server to issue the course certificate if (and only if) the course is fully complete. */
  const tryIssueCertificate = useCallback(async (): Promise<string | null> => {
    if (!course) return null;
    const { data, error } = await supabase.functions.invoke("issue-self-certificate", { body: { course_id: course.id } });
    if (error || !data || data.error) { console.error("certificate error", error ?? data?.error); return null; }
    if (data.status === "final_assessment_required") return null;
    if (data.status === "issued" || data.status === "existing") {
      setCertificateUrl(data.verify_url);
      if (data.status === "issued") {
        // Show the celebration once the quiz window (if any) has closed.
        const c = { url: data.verify_url as string, number: data.certificate_number as string | undefined };
        if (quizOpenRef.current) pendingCelebrate.current = c; else setCelebrate(c);
      }
      return data.verify_url as string;
    }
    return null;
  }, [course]);

  const currentIdx = orderedLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = currentIdx >= 0 ? orderedLessons[currentIdx + 1] : undefined;
  const isDone = !!lesson && completed.has(lesson.id);

  // ---------- Watch tracking ----------
  const tracking = !!lesson && !preview && !isDone;
  const flushWatch = useCallback(async (force = false) => {
    const t = tracker.current;
    if (preview || !t.lessonId || t.value <= t.sent + 0.5) return;
    if (!force && Date.now() - t.at < 10000) return;
    const { lessonId: id, value } = t;
    t.sent = value;
    t.at = Date.now();
    const confirmed = await recordWatch(id, value, t.duration);
    if (confirmed !== null && tracker.current.lessonId === id) setWatched(confirmed);
  }, [preview]);

  const onWatchSample = useCallback((sample: WatchSample) => {
    const t = tracker.current;
    if (sample.duration > 0 && Math.abs(sample.duration - t.duration) > 1) {
      t.duration = sample.duration;
      setPlayerDuration(sample.duration);
    }
    // Remember exactly where they are (this device), so coming back resumes on the same second.
    if (t.lessonId && sample.position > 5 && (sample.duration <= 0 || sample.position < sample.duration - 5)) {
      try { localStorage.setItem(`lms-pos:${t.lessonId}`, String(Math.floor(sample.position))); } catch { /* private mode */ }
    }
    if (!tracking) return;
    if (sample.delta > 0) {
      t.value += sample.delta;
      setWatched((w) => Math.max(w, t.value));
    }
    flushWatch(!sample.playing);
  }, [tracking, flushWatch]);

  // Send what's left when the learner leaves the page.
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") flushWatch(true); };
    document.addEventListener("visibilitychange", onHide);
    return () => { document.removeEventListener("visibilitychange", onHide); flushWatch(true); };
  }, [flushWatch]);

  const pct = minWatchPercent(course);
  const requiresWatch = !!lesson && !preview && !adminOpen && lesson.enforce_progress !== false && isVideoLesson(lesson) && pct > 0;
  const neededSeconds = lesson ? (Number(lesson.video_duration_seconds) || playerDuration || (lesson.duration_minutes ?? 0) * 60) : 0;
  const watchedPct = neededSeconds > 0 ? Math.min(100, Math.floor((watched / neededSeconds) * 100)) : 0;
  const canComplete = isDone || !requiresWatch || (neededSeconds > 0 && watchedPct >= pct);

  const markCompleteAndContinue = async () => {
    if (!lesson || !user) return;
    if (preview) {
      if (nextLesson) navigate(`/learn/${courseSlug}/lesson/${nextLesson.id}`);
      return;
    }
    setSaving(true);
    try {
      if (!isDone) {
        await flushWatch(true);
        const result = await completeLesson(lesson.id);
        if (!result.ok) {
          if (result.reason === "watch") {
            setWatched(Number(result.watched));
            toast.error(`Watch at least ${pct}% of the video to complete this lesson`);
          } else {
            toast.error(lockMessage(result.reason ?? ""));
          }
          return;
        }
        setCompleted((prev) => new Set(prev).add(lesson.id));
      }

      // Last lesson of a module that has a quiz: offer the quiz before moving on.
      const lastInModule = orderedLessons.filter((l) => l.module_id === lesson.module_id).every((l) => l.id === lesson.id || l.enforce_progress === false || completed.has(l.id));
      if (quiz && quizQuestions.length > 0 && !quizPassed && lastInModule) {
        afterQuiz.current = nextLesson ? `/learn/${courseSlug}/lesson/${nextLesson.id}` : `/learn/${courseSlug}`;
        setQuizOpen(true);
        toast.success("Lesson complete · now take the module quiz");
        return;
      }

      const allDone = orderedLessons.every((l) => l.id === lesson.id || l.enforce_progress === false || completed.has(l.id));
      if (nextLesson) {
        toast.success(isDone ? "Next lesson" : "Lesson complete · +10 points");
        navigate(`/learn/${courseSlug}/lesson/${nextLesson.id}`);
      } else if (allDone && course?.final_assessment_ref) {
        toast.success("All lessons complete — your final assessment is next");
        navigate(`/learn/${courseSlug}/final-assessment`);
      } else if (allDone) {
        const url = await tryIssueCertificate();
        toast.success(url ? "Course complete — your certificate is ready!" : "Course complete!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not save your progress. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Deep link (?quiz=1): open this module's quiz once every lesson in the module is done.
  const deepQuiz = searchParams.get("quiz") === "1";
  useEffect(() => {
    if (!deepQuiz || !lesson || !quiz || quizQuestions.length === 0 || quizPassed) return;
    const inModule = orderedLessons.filter((l) => l.module_id === lesson.module_id);
    if (inModule.every((l) => l.enforce_progress === false || completed.has(l.id))) {
      setQuizOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [deepQuiz, lesson, quiz, quizQuestions.length, quizPassed, orderedLessons, completed, setSearchParams]);

  const handleQuizPassed = async (): Promise<string | null> => {
    setQuizPassed(true);
    return tryIssueCertificate();
  };

  if (loading || !lesson || !course) {
    return (
      <LmsShell profile={profile} active="learning" header={<ShellTitle label="LESSON" title="Loading…" />}>
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={30} className="animate-spin" color="#3434ff" />
        </div>
      </LmsShell>
    );
  }

  const currentModule = modules.find((m) => m.id === lesson.module_id);
  const moduleLessons = orderedLessons.filter((l) => l.module_id === lesson.module_id);
  const lessonNum = moduleLessons.findIndex((l) => l.id === lesson.id) + 1;
  const moduleFullyDone = moduleLessons.every((l) => l.enforce_progress === false || completed.has(l.id));
  const resources: { label: string; url: string; is_file: boolean }[] = signed
    ? signed.resources
    : (Array.isArray(lesson.resources) ? lesson.resources : []).filter((r) => r.url).map((r) => ({ label: r.label, url: r.url!, is_file: false }));
  const frame: React.CSSProperties = { width: "100%", border: "none", background: "#0b0b2c", borderRadius: "20px", aspectRatio: "16/9", marginBottom: "20px", display: "block" };
  const mediaUrl = signed?.media_url ?? null;
  const fileViewerSrc = mediaUrl && lesson.media_kind !== "video"
    ? (isPdf(lesson.media_mime) || isPdf(lesson.media_name) ? `${mediaUrl}#view=FitH`
      : isOfficeDoc(lesson.media_name) ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(mediaUrl)}` : null)
    : null;
  const courseProgress = orderedLessons.length ? Math.round((orderedLessons.filter((l) => completed.has(l.id)).length / orderedLessons.length) * 100) : 0;

  const header = (
    <>
      <ShellTitle label={(currentModule?.title ?? "LESSON").toUpperCase()} title={lesson.title} />
      <div className="hidden flex-none items-center gap-3 md:flex" title={`${courseProgress}% of ${course.title}`}>
        <div style={{ width: 120, height: 6, borderRadius: 999, background: "#eef1f6", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${courseProgress}%`, background: "#3434ff", borderRadius: 999 }} />
        </div>
        <div className="text-[13px] font-bold text-[#69697b]">{courseProgress}%</div>
      </div>
    </>
  );

  return (
    <LmsShell profile={profile} active="learning" header={header}>
    <div style={{ color: "#0b0b2c" }}>
      {/* Breadcrumb */}
      <div style={{ padding: isMobile ? "14px 16px 0" : "22px 24px 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#69697b", flexWrap: "wrap" }}>
          <Link to="/learn?view=learning" style={{ color: "#3434ff", fontWeight: 600, textDecoration: "none" }}>My learning</Link>
          <ChevronRight size={16} />
          <Link to={`/learn/${courseSlug}`} style={{ color: "#69697b", textDecoration: "none" }}>{course.title}</Link>
          <ChevronRight size={16} />
          <Link to={`/learn/${courseSlug}`} style={{ color: "#69697b", textDecoration: "none" }}>{currentModule?.title}</Link>
          <ChevronRight size={16} />
          <span style={{ fontWeight: 600, color: "#0b0b2c" }}>{lesson.title}</span>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "14px 16px 32px" : "18px 24px 48px", display: isMobile ? "block" : "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: "32px" }}>
        <div>
          {/* Main content: uploaded file first, then embed link, else placeholder */}
          {lesson.media_path ? (
            !mediaUrl ? (
              <div style={{ ...frame, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "rgba(255,255,255,0.6)" }}>
                {mediaError ? (
                  <>
                    <span style={{ fontSize: "14px" }}>This lesson's content couldn't be loaded.</span>
                    <button onClick={loadSignedMedia} style={{ padding: "8px 16px", background: "#3434ff", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Try again</button>
                  </>
                ) : <Loader2 size={30} className="animate-spin" />}
              </div>
            ) : lesson.media_kind === "video" ? (
              <TrackedVideo
                key={mediaUrl}
                src={mediaUrl}
                captionsUrl={signed?.captions_url}
                captionsOn={captions}
                lockSeekAhead={requiresWatch && !isDone}
                resumeFrom={resumeAt}
                onSample={onWatchSample}
                onError={() => setMediaError(true)}
              />
            ) : (
              <div style={{ marginBottom: "20px" }}>
                {fileViewerSrc ? (
                  <iframe key={fileViewerSrc} src={fileViewerSrc} title={lesson.title} allowFullScreen style={{ ...frame, marginBottom: "10px", background: "#fff", border: "1px solid #e2e8f0", aspectRatio: lesson.media_kind === "slides" ? "16/10" : "4/5", maxHeight: lesson.media_kind === "slides" ? undefined : "85vh" }} />
                ) : (
                  <div style={{ ...frame, marginBottom: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", color: "rgba(255,255,255,0.75)" }}>
                    <FileText size={44} />
                    <span style={{ fontSize: "14px" }}>{lesson.media_name}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", fontSize: "13px", color: "#69697b" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>{lesson.media_kind === "slides" ? <Presentation size={15} /> : <FileText size={15} />}{lesson.media_name}</span>
                  <a href={mediaUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#3434ff", fontWeight: 700, textDecoration: "none" }}>Open full screen <ExternalLink size={14} /></a>
                </div>
              </div>
            )
          ) : lesson.video_url && youTubeId(lesson.video_url) ? (
            <TrackedYouTube key={lesson.id} videoId={youTubeId(lesson.video_url)!} captionsOn={captions} onSample={onWatchSample} />
          ) : lesson.video_url && isVimeo(lesson.video_url) ? (
            <TrackedVimeo key={lesson.id} src={toEmbedUrl(lesson.video_url, { captions }) ?? lesson.video_url} onSample={onWatchSample} />
          ) : lesson.video_url && isIframeEmbed(lesson.video_url) ? (
            <iframe key={lesson.id} src={toEmbedUrl(lesson.video_url, { captions }) ?? undefined} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen style={frame} />
          ) : lesson.video_url && isDirectVideoUrl(lesson.video_url) ? (
            <TrackedVideo key={lesson.id} src={lesson.video_url} captionsOn={captions} lockSeekAhead={requiresWatch && !isDone} resumeFrom={resumeAt} onSample={onWatchSample} />
          ) : lesson.video_url ? (
            <video key={lesson.id} src={lesson.video_url} controls playsInline style={frame} />
          ) : (
            <div style={{ ...frame, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", gap: "12px" }}>
              <Play size={56} />
              <span style={{ fontSize: "14px" }}>No video for this lesson — read the overview below</span>
            </div>
          )}

          {preview && (
            <div style={{ background: "#fff7e6", border: "1px solid #f5d9a8", color: "#7a4b00", padding: "10px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", fontWeight: 600 }}>
              Admin preview — you're not enrolled, so progress isn't recorded and all lessons are unlocked.
            </div>
          )}

          {/* Complete bar */}
          <div style={{ background: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "14px", color: "#69697b" }}>Lesson {lessonNum} of {moduleLessons.length} · {currentModule?.title}</div>
              {requiresWatch && !isDone && (
                <div style={{ marginTop: "8px", maxWidth: "320px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#69697b", marginBottom: "4px" }}>
                    <span>{canComplete ? "Video watched — you can complete this lesson" : `Watch ${pct}% of the video to complete`}</span>
                    <span style={{ fontWeight: 700, color: canComplete ? "#16a34a" : "#0b0b2c" }}>{watchedPct}%</span>
                  </div>
                  <div style={{ height: "5px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${watchedPct}%`, height: "100%", background: canComplete ? "#16a34a" : "#3434ff", transition: "width 0.4s" }} />
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={markCompleteAndContinue}
              disabled={saving || !canComplete}
              title={!canComplete ? `Watch ${pct}% of the video first` : undefined}
              style={{ padding: "10px 20px", background: isDone ? "#16a34a" : "#3434ff", color: "white", border: "none", borderRadius: "8px", cursor: saving ? "wait" : !canComplete ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 700, opacity: saving || !canComplete ? 0.5 : 1, display: "flex", alignItems: "center", gap: "6px" }}
            >
              {!canComplete && <Lock size={14} />}
              {preview ? (nextLesson ? "Next lesson (preview)" : "End of course") : saving ? "Saving..." : isDone ? (nextLesson ? "✓ Completed — next lesson" : "✓ Completed") : nextLesson ? "Mark complete & continue" : "Mark complete & finish"}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "white", borderRadius: "12px 12px 0 0", overflowX: "auto", position: "relative" }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "12px 16px", border: "none", background: activeTab === tab ? "#f5f7fa" : "transparent", borderBottom: activeTab === tab ? "2px solid #3434ff" : "2px solid transparent", cursor: "pointer", fontSize: "13px", fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? "#3434ff" : "#69697b", flex: 1, textTransform: "capitalize", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {TAB_LABEL[tab]}{tab === "comments" && comments.length ? ` (${comments.length})` : ""}
              </button>
            ))}
          </div>

          <div style={{ background: "white", padding: "24px", borderRadius: "0 0 12px 12px", minHeight: "200px" }}>
            {activeTab === "overview" && (
              <>
                {lesson.body ? (
                  <div style={{ lineHeight: 1.7, color: "#0b0b2c" }} className="prose prose-sm max-w-none"><ReactMarkdown>{lesson.body}</ReactMarkdown></div>
                ) : <p style={{ color: "#69697b" }}>No overview has been added for this lesson yet.</p>}
                {user && <LessonNotes key={lesson.id} lessonId={lesson.id} userId={user.id} reflection={/reflection/i.test(lesson.title)} preview={preview} />}
              </>
            )}

            {activeTab === "ask" && <LessonTutor key={lesson.id} lessonId={lesson.id} preview={preview} />}

            {activeTab === "transcript" && (lesson.transcript ? (
              <p style={{ lineHeight: 1.75, color: "#0b0b2c", whiteSpace: "pre-wrap", margin: 0 }}><HitText text={lesson.transcript} query={hitQuery} scroll /></p>
            ) : <p style={{ color: "#69697b" }}>No transcript has been added for this lesson yet.</p>)}

            {activeTab === "resources" && (resources.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "#f5f7fa", borderRadius: "8px", color: "#0b0b2c", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
                    {r.is_file ? <Download size={16} color="#3434ff" /> : <Link2 size={16} color="#3434ff" />} {r.label}
                  </a>
                ))}
              </div>
            ) : <p style={{ color: "#69697b" }}>No resources have been added for this lesson.</p>)}

            {activeTab === "comments" && (
              <div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} maxLength={2000} placeholder="Ask a question or share a thought about this lesson..." rows={2} style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontFamily: "inherit", fontSize: "13px", resize: "vertical", color: "#0b0b2c" }} />
                  <button onClick={postComment} disabled={posting || !newComment.trim()} style={{ padding: "0 18px", background: "#3434ff", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: posting || !newComment.trim() ? "not-allowed" : "pointer", opacity: posting || !newComment.trim() ? 0.55 : 1 }}>Post</button>
                </div>
                {comments.length === 0 ? <p style={{ color: "#69697b" }}>No comments yet. Be the first to ask a question.</p> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {comments.map((c) => (
                      <div key={c.id} style={{ display: "flex", gap: "10px" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#3434ff", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.author_name.slice(0, 1).toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{c.author_name}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                            {c.user_id === user?.id && <button onClick={() => deleteComment(c.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#94a3b8", fontSize: 11, cursor: "pointer" }}>Delete</button>}
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{c.body}</p>
                          <ReactionBar commentId={c.id} rows={reactions.rows} userId={user?.id} onToggle={reactions.toggle} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Module quiz */}
          {quiz && quizQuestions.length > 0 && (
            <div style={{ marginTop: "24px", background: quizPassed ? "#f4fbe4" : moduleFullyDone ? "linear-gradient(135deg, #3434ff 0%, #2a2ad6 100%)" : "#fff", border: moduleFullyDone ? "none" : "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", color: quizPassed || !moduleFullyDone ? "#0b0b2c" : "white", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {moduleFullyDone ? <Award size={28} color={quizPassed ? "#4a5230" : "white"} /> : <Lock size={26} color="#94a3b8" />}
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>{quiz.title}</div>
                  <div style={{ fontSize: "13px", opacity: 0.85 }}>
                    {quizPassed ? "Passed" : moduleFullyDone ? `Pass mark ${quiz.pass_threshold}% · ${quizQuestions.length} questions` : "Complete every lesson in this module to unlock the quiz"}
                  </div>
                </div>
              </div>
              {moduleFullyDone && !quizPassed && (
                <button onClick={() => setQuizOpen(true)} style={{ padding: "10px 20px", background: "white", color: "#3434ff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Take quiz</button>
              )}
            </div>
          )}

          {course.final_assessment_ref && !certificateUrl && orderedLessons.every((l) => l.enforce_progress === false || completed.has(l.id)) && (
            <div style={{ marginTop: "16px", background: "linear-gradient(135deg, #3434ff 0%, #2a2ad6 100%)", borderRadius: "16px", padding: "20px", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Award size={26} />
                <div><div style={{ fontWeight: 700 }}>Final assessment</div><div style={{ fontSize: 13, opacity: 0.85 }}>Pass it to earn your verified certificate.</div></div>
              </div>
              <button onClick={() => navigate(`/learn/${courseSlug}/final-assessment`)} style={{ padding: "10px 18px", background: "white", color: "#3434ff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Go to final assessment</button>
            </div>
          )}

          {certificateUrl && (
            <div style={{ marginTop: "16px", background: "#f4fbe4", border: "1px solid #d9f09a", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Award size={26} color="#4a5230" />
                <div><div style={{ fontWeight: 700 }}>Your certificate is ready</div><div style={{ fontSize: 13, color: "#4a5230" }}>Verified and shareable — a copy was emailed to you.</div></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}><ShareActions courseTitle={course.title} slug={course.slug} verifyUrl={certificateUrl} compact />
              <a href={certificateUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 18px", background: "#3434ff", color: "white", borderRadius: "8px", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>View certificate</a></div>
            </div>
          )}

          {celebrate && <CourseCelebration open onClose={() => setCelebrate(null)} courseTitle={course.title} slug={course.slug} verifyUrl={celebrate.url} certNumber={celebrate.number} />}

          {user && quiz && quizQuestions.length > 0 && (
            <QuizDialog open={quizOpen} onOpenChange={(o) => {
              setQuizOpen(o);
              if (o) return;
              if (pendingCelebrate.current) { setCelebrate(pendingCelebrate.current); pendingCelebrate.current = null; afterQuiz.current = null; return; }
              if (afterQuiz.current) { const to = afterQuiz.current; afterQuiz.current = null; navigate(to); }
            }}
            nextLabel={nextLesson ? "Continue to the next lesson" : undefined}
            onNext={nextLesson ? () => { afterQuiz.current = null; setQuizOpen(false); if (pendingCelebrate.current) { setCelebrate(pendingCelebrate.current); pendingCelebrate.current = null; } else navigate(`/learn/${courseSlug}/lesson/${nextLesson.id}`); } : undefined} quiz={quiz} questions={quizQuestions} userId={user.id} onPassed={handleQuizPassed} />
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "space-between" }}>
            <button onClick={() => navigate(`/learn/${courseSlug}`)} style={{ padding: "12px 20px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", color: "#0b0b2c", fontWeight: 600, fontFamily: "inherit" }}>Course curriculum</button>
            {nextLesson && (
              locked.has(nextLesson.id) ? (
                <button disabled title="Complete this lesson to unlock the next one" style={{ padding: "12px 20px", background: "#e2e8f0", border: "none", borderRadius: "8px", cursor: "not-allowed", color: "#69697b", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}><Lock size={14} /> Next lesson</button>
              ) : (
                <button onClick={() => navigate(`/learn/${courseSlug}/lesson/${nextLesson.id}`)} style={{ padding: "12px 20px", background: "#3434ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "white", fontWeight: 700, fontFamily: "inherit" }}>Next lesson →</button>
              )
            )}
          </div>
        </div>

        {/* Sidebar */}
        {!isMobile && (
          <div>
            <div style={{ background: "white", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase", color: "#69697b", letterSpacing: "0.06em" }}>{currentModule?.title}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {moduleLessons.map((l) => (
                  <div key={l.id} onClick={() => (locked.has(l.id) ? toast.error("Finish the previous lessons first") : navigate(`/learn/${courseSlug}/lesson/${l.id}`))} style={{ padding: "10px 12px", borderRadius: "6px", background: l.id === lesson.id ? "#f1f4ff" : completed.has(l.id) ? "#f4fbe4" : "#f5f7fa", border: l.id === lesson.id ? "1px solid #3434ff" : "1px solid transparent", cursor: locked.has(l.id) ? "not-allowed" : "pointer", opacity: locked.has(l.id) ? 0.55 : 1, display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "#0b0b2c" }}>
                    {locked.has(l.id) ? <Lock size={15} color="#94a3b8" /> : completed.has(l.id) ? <CheckCircle2 size={15} color="#4a5230" /> : l.media_kind === "slides" ? <Presentation size={15} color="#69697b" /> : l.media_kind === "document" ? <FileText size={15} color="#69697b" /> : <Play size={15} color="#69697b" />}
                    <span>{l.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </LmsShell>
  );
};

export default LessonView;
