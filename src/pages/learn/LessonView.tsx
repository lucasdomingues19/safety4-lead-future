import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ChevronRight, CheckCircle2, Play, Download, Award, Lock, Loader2, ExternalLink, Presentation, FileText, Link2 } from "lucide-react";
import { toast } from "sonner";
import { toEmbedUrl, isIframeEmbed, isModuleUnlocked, type Lesson, type Module, type Course } from "@/lib/lms";
import { getSignedLessonMedia, isPdf, isOfficeDoc, type SignedLessonMedia } from "@/lib/lessonMedia";
import { getQuizQuestions, type Quiz, type QuizQuestion } from "@/lib/quiz";
import { QuizDialog } from "@/components/learn/QuizDialog";
import { verifyEnrollmentAccess } from "@/lib/stripe";
import brandMarkBlue from "@/assets/brand-mark-blue.png";

const TABS = ["overview", "transcript", "resources", "comments"] as const;
type Tab = (typeof TABS)[number];

interface LessonComment { id: string; user_id: string; author_name: string; body: string; created_at: string }

const LessonView = () => {
  const { courseSlug, lessonId } = useParams();
  const { user } = useAuthUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [saving, setSaving] = useState(false);
  const [captions, setCaptions] = useState(false);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  const [signed, setSigned] = useState<SignedLessonMedia | null>(null);
  const [mediaError, setMediaError] = useState(false);

  const [comments, setComments] = useState<LessonComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const lesson = useMemo(() => lessons.find((l) => l.id === lessonId) ?? null, [lessons, lessonId]);

  // Course-ordered lesson list (module order, then lesson position).
  const orderedLessons = useMemo(() => {
    const order = new Map(modules.map((m, i) => [m.id, i]));
    return [...lessons].sort((a, b) => (order.get(a.module_id) ?? 0) - (order.get(b.module_id) ?? 0) || a.position - b.position);
  }, [modules, lessons]);

  const loadCertificate = useCallback(async (courseTitle: string) => {
    const { data } = await supabase.from("certificates").select("certificate_number").eq("course_name", courseTitle).eq("recipient_email", (user?.email ?? "").toLowerCase()).maybeSingle();
    setCertificateUrl(data ? `${window.location.origin}/verify/${data.certificate_number}` : null);
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
      if (!enr || !(await verifyEnrollmentAccess(user.id, c.id))) {
        toast.error("You don't have active access to this course");
        navigate("/learn");
        return;
      }

      const { data: mods } = await supabase.from("modules").select("*").eq("course_id", c.id).order("position");
      const moduleList = (mods ?? []) as Module[];
      const modIds = moduleList.map((m) => m.id);
      const { data: les } = modIds.length ? await supabase.from("lessons").select("*").in("module_id", modIds).order("position") : { data: [] };
      const lessonList = (les ?? []) as unknown as Lesson[];

      const current = lessonList.find((l) => l.id === lessonId);
      if (!current) { toast.error("Lesson not found"); navigate(`/learn/${courseSlug}`); return; }

      const currentModule = moduleList.find((m) => m.id === current.module_id);
      if (currentModule && !isModuleUnlocked(currentModule, enr.enrolled_at)) {
        toast.error(`This module unlocks ${currentModule.drip_days} days after you enrolled`);
        navigate(`/learn/${courseSlug}`);
        return;
      }

      const lessonIds = lessonList.map((l) => l.id);
      const { data: prog } = lessonIds.length
        ? await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).in("lesson_id", lessonIds)
        : { data: [] };

      setCourse(c as unknown as Course);
      setModules(moduleList);
      setLessons(lessonList);
      setCompleted(new Set((prog ?? []).map((p) => p.lesson_id)));

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

  useEffect(() => { setLoading(true); setActiveTab("overview"); load(); }, [load]);

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
    if (data.status === "issued" || data.status === "existing") {
      setCertificateUrl(data.verify_url);
      return data.verify_url as string;
    }
    return null;
  }, [course]);

  const currentIdx = orderedLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = currentIdx >= 0 ? orderedLessons[currentIdx + 1] : undefined;
  const isDone = !!lesson && completed.has(lesson.id);

  const markCompleteAndContinue = async () => {
    if (!lesson || !user) return;
    setSaving(true);
    try {
      if (!isDone) {
        const { error } = await supabase.from("lesson_progress").upsert(
          { user_id: user.id, lesson_id: lesson.id, is_completed: true },
          { onConflict: "user_id,lesson_id" },
        );
        if (error) throw error;
        setCompleted((prev) => new Set(prev).add(lesson.id));
      }

      const allDone = orderedLessons.every((l) => l.id === lesson.id || completed.has(l.id));
      if (nextLesson) {
        toast.success("Lesson complete");
        navigate(`/learn/${courseSlug}/lesson/${nextLesson.id}`);
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

  const handleQuizPassed = async (): Promise<string | null> => {
    setQuizPassed(true);
    return tryIssueCertificate();
  };

  if (loading || !lesson || !course) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7fa" }}>
        <Loader2 size={30} className="animate-spin" color="#3434ff" />
      </div>
    );
  }

  const currentModule = modules.find((m) => m.id === lesson.module_id);
  const moduleLessons = orderedLessons.filter((l) => l.module_id === lesson.module_id);
  const lessonNum = moduleLessons.findIndex((l) => l.id === lesson.id) + 1;
  const moduleFullyDone = moduleLessons.every((l) => completed.has(l.id));
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

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", color: "#0b0b2c", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #3434ff 0%, #2a2ad6 100%)", color: "white", padding: isMobile ? "24px 16px" : "36px 24px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <img src={brandMarkBlue} alt="SafetyTech Academy" style={{ height: "34px", filter: "brightness(0) invert(1)" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", opacity: 0.85, textTransform: "uppercase" }}>SafetyTech Academy</span>
          </div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: isMobile ? "28px" : "38px", fontWeight: 700, lineHeight: 1.2, color: "#fff" }}>{course.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", maxWidth: "420px" }}>
            <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.25)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: `${courseProgress}%`, height: "100%", background: "#a6e21a" }} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700 }}>{courseProgress}%</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "12px 24px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#69697b", flexWrap: "wrap" }}>
          <Link to="/learn" style={{ color: "#3434ff", fontWeight: 500, textDecoration: "none" }}>My Learning</Link>
          <ChevronRight size={16} />
          <Link to={`/learn/${courseSlug}`} style={{ color: "#69697b", textDecoration: "none" }}>{currentModule?.title}</Link>
          <ChevronRight size={16} />
          <span style={{ fontWeight: 600, color: "#0b0b2c" }}>{lesson.title}</span>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "16px" : "32px 24px", display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 320px", gap: "32px" }}>
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
              <video
                key={mediaUrl}
                src={mediaUrl}
                controls
                controlsList="nodownload"
                playsInline
                crossOrigin={signed?.captions_url ? "anonymous" : undefined}
                onError={() => setMediaError(true)}
                onContextMenu={(e) => e.preventDefault()}
                style={{ ...frame, objectFit: "contain" }}
              >
                {signed?.captions_url && <track kind="captions" src={signed.captions_url} srcLang="en" label="English" default={captions} />}
              </video>
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
          ) : lesson.video_url && isIframeEmbed(lesson.video_url) ? (
            <iframe key={lesson.id} src={toEmbedUrl(lesson.video_url, { captions }) ?? undefined} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen style={frame} />
          ) : lesson.video_url ? (
            <video key={lesson.id} src={lesson.video_url} controls playsInline style={frame} />
          ) : (
            <div style={{ ...frame, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", gap: "12px" }}>
              <Play size={56} />
              <span style={{ fontSize: "14px" }}>No video for this lesson — read the overview below</span>
            </div>
          )}

          {/* Complete bar */}
          <div style={{ background: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", color: "#69697b" }}>Lesson {lessonNum} of {moduleLessons.length} · {currentModule?.title}</span>
            <button
              onClick={markCompleteAndContinue}
              disabled={saving}
              style={{ padding: "10px 20px", background: isDone ? "#16a34a" : "#3434ff", color: "white", border: "none", borderRadius: "8px", cursor: saving ? "wait" : "pointer", fontSize: "13px", fontWeight: 700, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : isDone ? (nextLesson ? "✓ Completed — next lesson" : "✓ Completed") : nextLesson ? "Mark complete & continue" : "Mark complete & finish"}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "white", borderRadius: "12px 12px 0 0", overflowX: "auto" }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "12px 16px", border: "none", background: activeTab === tab ? "#f5f7fa" : "transparent", borderBottom: activeTab === tab ? "2px solid #3434ff" : "2px solid transparent", cursor: "pointer", fontSize: "13px", fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? "#3434ff" : "#69697b", flex: 1, textTransform: "capitalize", fontFamily: "inherit" }}>
                {tab}{tab === "comments" && comments.length ? ` (${comments.length})` : ""}
              </button>
            ))}
          </div>

          <div style={{ background: "white", padding: "24px", borderRadius: "0 0 12px 12px", minHeight: "200px" }}>
            {activeTab === "overview" && (lesson.body ? (
              <div style={{ lineHeight: 1.7, color: "#0b0b2c" }} className="prose prose-sm max-w-none"><ReactMarkdown>{lesson.body}</ReactMarkdown></div>
            ) : <p style={{ color: "#69697b" }}>No overview has been added for this lesson yet.</p>)}

            {activeTab === "transcript" && (lesson.transcript ? (
              <p style={{ lineHeight: 1.75, color: "#0b0b2c", whiteSpace: "pre-wrap", margin: 0 }}>{lesson.transcript}</p>
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

          {certificateUrl && (
            <div style={{ marginTop: "16px", background: "#f4fbe4", border: "1px solid #d9f09a", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Award size={26} color="#4a5230" />
                <div><div style={{ fontWeight: 700 }}>Your certificate is ready</div><div style={{ fontSize: 13, color: "#4a5230" }}>Verified and shareable — a copy was emailed to you.</div></div>
              </div>
              <a href={certificateUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 18px", background: "#3434ff", color: "white", borderRadius: "8px", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>View certificate</a>
            </div>
          )}

          {user && quiz && quizQuestions.length > 0 && (
            <QuizDialog open={quizOpen} onOpenChange={setQuizOpen} quiz={quiz} questions={quizQuestions} userId={user.id} onPassed={handleQuizPassed} />
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "space-between" }}>
            <button onClick={() => navigate(`/learn/${courseSlug}`)} style={{ padding: "12px 20px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", color: "#0b0b2c", fontWeight: 600, fontFamily: "inherit" }}>Course curriculum</button>
            {nextLesson && (
              <button onClick={() => navigate(`/learn/${courseSlug}/lesson/${nextLesson.id}`)} style={{ padding: "12px 20px", background: "#3434ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "white", fontWeight: 700, fontFamily: "inherit" }}>Next lesson →</button>
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
                  <div key={l.id} onClick={() => navigate(`/learn/${courseSlug}/lesson/${l.id}`)} style={{ padding: "10px 12px", borderRadius: "6px", background: l.id === lesson.id ? "#f1f4ff" : completed.has(l.id) ? "#f4fbe4" : "#f5f7fa", border: l.id === lesson.id ? "1px solid #3434ff" : "1px solid transparent", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "#0b0b2c" }}>
                    {completed.has(l.id) ? <CheckCircle2 size={15} color="#4a5230" /> : l.media_kind === "slides" ? <Presentation size={15} color="#69697b" /> : l.media_kind === "document" ? <FileText size={15} color="#69697b" /> : <Play size={15} color="#69697b" />}
                    <span>{l.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonView;
