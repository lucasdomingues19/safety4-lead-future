import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ChevronRight, CheckCircle2, Play, BookOpen, MessageSquare, FileText, Lightbulb, Download, Award } from "lucide-react";
import { toast } from "sonner";
import { toEmbedUrl } from "@/lib/lms";
import ReactMarkdown from "react-markdown";
import { QuizDialog } from "@/components/learn/QuizDialog";
import type { Quiz, QuizQuestion } from "@/lib/quiz";
import { getQuizQuestions } from "@/lib/quiz";
import brandMarkBlue from "@/assets/brand-mark-blue.png";
import { verifyEnrollmentAccess } from "@/lib/stripe";

const isEmbeddableVideo = (url: string) => /youtube\.com|youtu\.be|vimeo\.com/.test(url);

const LessonView = () => {
  const { courseSlug, lessonId } = useParams();
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [comments, setComments] = useState<{ id: string; user_id: string; author_name: string; body: string; created_at: string }[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user && courseSlug && lessonId) loadLesson();
  }, [user, courseSlug, lessonId]);

  useEffect(() => {
    if (lessonId) loadComments();
  }, [lessonId]);

  const loadComments = async () => {
    const { data } = await supabase
      .from("lesson_comments")
      .select("id, user_id, author_name, body, created_at")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true });
    setComments(data ?? []);
  };

  const postComment = async () => {
    if (!user || !lessonId || !newComment.trim()) return;
    setPostingComment(true);
    try {
      const metaName = (user.user_metadata as { full_name?: string } | undefined)?.full_name;
      const authorName = (metaName && metaName.trim()) || user.email?.split("@")[0] || "Learner";
      const { error } = await supabase.from("lesson_comments").insert({
        lesson_id: lessonId,
        user_id: user.id,
        author_name: authorName,
        body: newComment.trim(),
      });
      if (error) throw error;
      setNewComment("");
      await loadComments();
    } catch (err) {
      console.error(err);
      toast.error("Could not post your comment. Please try again.");
    } finally {
      setPostingComment(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from("lesson_comments").delete().eq("id", commentId);
    if (error) {
      toast.error("Could not delete comment");
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const loadLesson = async () => {
    if (!user) return;
    try {
      const { data: c } = await supabase.from("courses").select("*").eq("slug", courseSlug).single();
      if (!c) { navigate("/learn"); return; }

      const { data: enr } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", c.id)
        .maybeSingle();
      if (!enr) {
        toast.error("Enrol in this course to view it");
        navigate("/learn");
        return;
      }
      const hasAccess = await verifyEnrollmentAccess(user.id, c.id);
      if (!hasAccess) {
        toast.error("Your enrollment has expired or is not active");
        navigate("/learn");
        return;
      }

      setCourse(c);

      const { data: mods } = await supabase.from("modules").select("*").eq("course_id", c.id).order("position");
      setModules(mods || []);

      const modIds = (mods || []).map((m: any) => m.id);
      const { data: les } = modIds.length ? await supabase.from("lessons").select("*").in("module_id", modIds).order("position") : { data: [] };
      setLessons(les || []);

      const { data: l } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
      setLesson(l);

      const { data: prog } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id);
      setCompleted(new Set((prog || []).map((p: any) => p.lesson_id)));

      if (l?.module_id) {
        const { data: quizData } = await supabase
          .from("quizzes")
          .select("*")
          .eq("module_id", l.module_id)
          .maybeSingle();
        if (quizData) {
          setQuiz(quizData as Quiz);
          setQuizQuestions(await getQuizQuestions(quizData.id));
        } else {
          setQuiz(null);
          setQuizQuestions([]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load lesson");
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    if (!lesson || !user) return;
    try {
      if (!completed.has(lesson.id)) {
        const { error } = await supabase.from("lesson_progress").insert({ user_id: user.id, lesson_id: lesson.id });
        if (error) throw error;
        setCompleted(new Set([...completed, lesson.id]));
        toast.success("Lesson marked complete!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not save your progress. Please try again.");
    }
  };

  const handleQuizPassed = async () => {
    if (!quiz) return;
    try {
      const { data, error } = await supabase.functions.invoke("issue-self-certificate", {
        body: { quiz_id: quiz.id },
      });
      if (error) throw error;
      setQuizDialogOpen(false);
      setCertificateUrl(data.verify_url);
      toast.success("Quiz passed! Your certificate has been emailed to you.");
    } catch (err) {
      console.error("Error issuing certificate:", err);
      setQuizDialogOpen(false);
      toast.error("Quiz passed, but we couldn't issue your certificate. Contact support.");
    }
  };

  const goNext = () => {
    const allLessons = modules.flatMap((m: any) => lessons.filter((l: any) => l.module_id === m.id));
    const idx = allLessons.findIndex((l: any) => l.id === lessonId);
    if (idx >= 0 && idx < allLessons.length - 1) {
      navigate(`/learn/${courseSlug}/lesson/${allLessons[idx + 1].id}`);
    } else {
      navigate(`/learn/${courseSlug}`);
    }
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7fa" }}><div>Loading...</div></div>;
  if (!lesson) return null;

  const currentModule = modules.find((m: any) => m.id === lesson.module_id);
  const moduleLessons = lessons.filter((l: any) => l.module_id === lesson.module_id);
  const lessonNum = moduleLessons.findIndex((l: any) => l.id === lessonId) + 1;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", color: "#0b0b2c", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero Section */}
      <div style={{ background: "linear-gradient(135deg, #3434ff 0%, #2a2ad6 100%)", color: "white", padding: "40px 24px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <img src={brandMarkBlue} alt="SafetyTech" style={{ height: "40px", filter: "brightness(0) invert(1)" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", opacity: 0.8, textTransform: "uppercase" }}>SafetyTech Academy</span>
          </div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "42px", fontWeight: 700, lineHeight: 1.2, color: "#fff" }}>{course?.title}</h1>
          <p style={{ margin: "0", fontSize: "16px", opacity: 0.9, maxWidth: "600px" }}>{course?.description}</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "12px 24px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#69697b" }}>
          <span onClick={() => navigate("/learn")} style={{ cursor: "pointer", color: "#3434ff", fontWeight: 500 }}>My Learning</span>
          <ChevronRight size={16} />
          <span>{currentModule?.title}</span>
          <ChevronRight size={16} />
          <span style={{ fontWeight: 600, color: "#0b0b2c" }}>{lesson.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "16px" : "32px 24px", display: isMobile ? "block" : "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: isMobile ? "24px" : "32px" }}>
        {/* Video & Tabs */}
        <div>
          {/* Video Player */}
          {lesson.video_url && isEmbeddableVideo(lesson.video_url) ? (
            <iframe
              key={lesson.id}
              src={toEmbedUrl(lesson.video_url) ?? undefined}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: "100%", border: "none", background: "#0b0b2c", borderRadius: "24px", aspectRatio: "16/9", marginBottom: "24px" }}
            />
          ) : lesson.video_url ? (
            <video
              key={lesson.id}
              src={lesson.video_url}
              controls
              style={{ width: "100%", background: "#0b0b2c", borderRadius: "24px", aspectRatio: "16/9", marginBottom: "24px" }}
            />
          ) : (
            <div style={{ background: "#0b0b2c", borderRadius: "24px", aspectRatio: "16/9", marginBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", gap: "12px" }}>
              <Play size={64} />
              <span style={{ fontSize: "14px" }}>No video uploaded for this lesson yet</span>
            </div>
          )}

          {/* Progress */}
          <div style={{ background: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#69697b" }}>Slide {lessonNum} / {moduleLessons.length}</span>
            <button onClick={markComplete} style={{ padding: "8px 16px", background: completed.has(lesson.id) ? "#16a34a" : "#3434ff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
              {completed.has(lesson.id) ? "✓ Completed" : "Mark Complete"}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #e2e8f0", background: "white", borderRadius: "12px 12px 0 0" }}>
            {["overview", "transcript", "resources", "comments", "notes"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "12px 16px", border: "none", background: activeTab === tab ? "#f5f7fa" : "transparent", borderBottom: activeTab === tab ? "2px solid #3434ff" : "none", cursor: "pointer", fontSize: "13px", fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? "#3434ff" : "#69697b", flex: 1, textTransform: "capitalize" }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ background: "white", padding: "24px", borderRadius: "0 0 12px 12px", minHeight: "200px" }}>
            {activeTab === "overview" && (
              lesson.body ? (
                <div style={{ lineHeight: 1.6, color: "#0b0b2c" }} className="prose prose-sm max-w-none">
                  <ReactMarkdown>{lesson.body}</ReactMarkdown>
                </div>
              ) : (
                <p style={{ color: "#69697b" }}>No overview added for this lesson yet.</p>
              )
            )}
            {activeTab === "transcript" && (
              lesson.transcript ? (
                <p style={{ lineHeight: 1.7, color: "#0b0b2c", whiteSpace: "pre-wrap" }}>{lesson.transcript}</p>
              ) : (
                <p style={{ color: "#69697b" }}>No transcript added for this lesson yet.</p>
              )
            )}
            {activeTab === "resources" && (
              Array.isArray(lesson.resources) && lesson.resources.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {lesson.resources.map((r: { label: string; url: string }, i: number) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "#f5f7fa", borderRadius: "8px", color: "#0b0b2c", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
                      <Download size={16} color="#3434ff" />
                      {r.label}
                    </a>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#69697b" }}>No resources added for this lesson yet.</p>
              )
            )}
            {activeTab === "comments" && (
              <div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask a question or share a thought about this lesson..."
                    rows={2}
                    style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontFamily: "inherit", fontSize: "13px", resize: "vertical", color: "#0b0b2c" }}
                  />
                  <button
                    onClick={postComment}
                    disabled={postingComment || !newComment.trim()}
                    style={{ padding: "0 18px", background: "#3434ff", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: postingComment || !newComment.trim() ? "not-allowed" : "pointer", opacity: postingComment || !newComment.trim() ? 0.6 : 1 }}
                  >
                    Post
                  </button>
                </div>
                {comments.length === 0 ? (
                  <p style={{ color: "#69697b" }}>No comments yet. Be the first to ask a question.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {comments.map((c) => (
                      <div key={c.id} style={{ display: "flex", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#3434ff", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                          {c.author_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0b0b2c" }}>{c.author_name}</span>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                            {c.user_id === user?.id && (
                              <button onClick={() => deleteComment(c.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#94a3b8", fontSize: "11px", cursor: "pointer" }}>
                                Delete
                              </button>
                            )}
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0b0b2c", lineHeight: 1.5 }}>{c.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "notes" && <p style={{ color: "#69697b" }}>Your notes here...</p>}
          </div>

          {/* Module Quiz */}
          {quiz && moduleLessons.every((l: any) => completed.has(l.id)) && (
            <div style={{ marginTop: "24px", background: certificateUrl ? "#f4fbe4" : "linear-gradient(135deg, #3434ff 0%, #2a2ad6 100%)", borderRadius: "16px", padding: "24px", color: certificateUrl ? "#0b0b2c" : "white", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <Award size={28} color={certificateUrl ? "#4a5230" : "white"} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>{quiz.title}</div>
                  <div style={{ fontSize: "13px", opacity: 0.85 }}>
                    {certificateUrl
                      ? "Passed — your certificate has been emailed to you."
                      : `You've completed this module. Pass mark: ${quiz.pass_threshold}%`}
                  </div>
                </div>
              </div>
              {certificateUrl ? (
                <a href={certificateUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 18px", background: "#3434ff", color: "white", borderRadius: "8px", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
                  View Certificate
                </a>
              ) : (
                <button onClick={() => setQuizDialogOpen(true)} style={{ padding: "10px 18px", background: "white", color: "#3434ff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                  Take Module Quiz
                </button>
              )}
            </div>
          )}

          {quiz && quizQuestions.length > 0 && user && (
            <QuizDialog
              open={quizDialogOpen}
              onOpenChange={setQuizDialogOpen}
              quiz={quiz}
              questions={quizQuestions}
              userId={user.id}
              onPassed={handleQuizPassed}
            />
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "space-between" }}>
            <button onClick={() => navigate(`/learn/${courseSlug}`)} style={{ padding: "12px 20px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", color: "#0b0b2c", fontWeight: 600 }}>Back to Course</button>
            <button onClick={goNext} style={{ padding: "12px 20px", background: "#3434ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "white", fontWeight: 600 }}>Next Lesson</button>
          </div>
        </div>

        {/* Sidebar */}
        {!isMobile && (
          <div>
            {/* In This Module */}
            <div style={{ background: "white", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px", textTransform: "uppercase", color: "#69697b" }}>In This Module</h3>
              <div style={{ space: "8px" }}>
                {moduleLessons.map((l: any) => (
                  <div key={l.id} onClick={() => navigate(`/learn/${courseSlug}/lesson/${l.id}`)} style={{ padding: "10px 12px", borderRadius: "6px", background: completed.has(l.id) ? "#f4fbe4" : "#f5f7fa", cursor: "pointer", marginBottom: "8px", display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", color: completed.has(l.id) ? "#4a5230" : "#0b0b2c" }}>
                    {completed.has(l.id) ? <CheckCircle2 size={14} /> : <Play size={14} />}
                    <span>{l.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hands-on Next */}
            <div style={{ background: "linear-gradient(135deg, #3434ff 0%, #2a2ad6 100%)", borderRadius: "12px", padding: "16px", color: "white" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <Lightbulb size={16} />
                <h3 style={{ fontSize: "13px", fontWeight: 600, margin: 0, color: "#fff" }}>Hands-on Next</h3>
              </div>
              <p style={{ fontSize: "12px", lineHeight: 1.5, margin: 0, opacity: 0.9 }}>Try what you learned in a practical exercise to reinforce your knowledge.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonView;
