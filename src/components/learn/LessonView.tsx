import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { toEmbedUrl, type Lesson, type Module, type Quiz, type QuizQuestion } from "@/lib/lms";
import { getQuizQuestions } from "@/lib/quiz";
import { QuizDialog } from "./QuizDialog";
import { sendCompletionEmail } from "@/lib/email";

interface LessonViewProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  userId: string;
  onBack: () => void;
  courseTitle?: string;
}

export function LessonView({
  courseId,
  moduleId,
  lessonId,
  userId,
  onBack,
  courseTitle = "Course",
}: LessonViewProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(0);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);

      // Load lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lessonData) {
        toast.error("Lesson not found");
        return;
      }

      setLesson(lessonData as Lesson);

      // Load module
      const { data: moduleData, error: moduleError } = await supabase
        .from("modules")
        .select("*")
        .eq("id", moduleId)
        .maybeSingle();

      if (moduleError) throw moduleError;
      setModule(moduleData as Module | null);

      // Load quiz for this module (if exists)
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("module_id", moduleId)
        .maybeSingle();

      if (!quizError && quizData) {
        setQuiz(quizData as Quiz);
        // Load quiz questions
        const questions = await getQuizQuestions(quizData.id);
        setQuizQuestions(questions);
      }
    } catch (err) {
      console.error("Error loading lesson:", err);
      toast.error("Failed to load lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async () => {
    try {
      // Mark lesson as completed
      await supabase.from("lesson_progress").insert({
        user_id: userId,
        lesson_id: lessonId,
        watch_duration_seconds: Math.floor(watchedPercentage * (lesson?.video_duration_seconds || 0) / 100),
        is_completed: true,
        completed_at: new Date().toISOString(),
      });

      toast.success("Lesson completed!");

      // If this is the last lesson and there's a quiz, show it
      if (quiz && watchedPercentage >= 80) {
        setQuizDialogOpen(true);
      }
    } catch (err) {
      console.error("Error marking lesson complete:", err);
      toast.error("Failed to mark lesson as complete");
    }
  };

  const handleQuizPassed = async () => {
    try {
      // Send completion email
      await sendCompletionEmail(userId, "Student", courseTitle);

      setQuizDialogOpen(false);
      toast.success("Quiz passed! Certificate will be ready shortly.");
      // Could navigate to next lesson or show certificate here
    } catch (err) {
      console.error("Error after quiz pass:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#3434ff]" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 28px", textAlign: "center" }}>
        <BookOpen size={48} style={{ margin: "0 auto 16px", color: "#cbd5e1" }} />
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0b0b2c" }}>Lesson not found</h2>
        <button
          onClick={onBack}
          style={{
            marginTop: "20px",
            border: "1px solid #3434ff",
            borderRadius: "8px",
            background: "#3434ff",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: "14px",
            fontWeight: 700,
            padding: "12px 24px",
            cursor: "pointer",
          }}
        >
          ← Back to course
        </button>
      </div>
    );
  }

  const embedUrl = lesson.video_url ? toEmbedUrl(lesson.video_url) : null;

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "28px 28px 72px",
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#69697b", marginBottom: "20px" }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#3434ff",
            cursor: "pointer",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <span>{module?.title || "Module"}</span>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <span style={{ fontWeight: 600, color: "#0b0b2c" }}>{lesson.title}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: "28px", alignItems: "start" }}>
        {/* Main Content */}
        <div>
          {/* Video Player */}
          <div
            style={{
              background: "#0b0b2c",
              borderRadius: "20px",
              overflow: "hidden",
              marginBottom: "24px",
              boxShadow: "0 18px 40px rgba(11,11,44,0.18)",
            }}
          >
            {embedUrl ? (
              <iframe
                src={embedUrl}
                style={{
                  width: "100%",
                  height: "500px",
                  border: "none",
                }}
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "500px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "16px",
                }}
              >
                No video available
              </div>
            )}
          </div>

          {/* Lesson Details */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "28px",
              marginBottom: "24px",
            }}
          >
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0b0b2c", margin: 0 }}>
              {lesson.title}
            </h1>

            {lesson.description && (
              <p style={{ marginTop: "16px", fontSize: "16px", lineHeight: 1.6, color: "#69697b" }}>
                {lesson.description}
              </p>
            )}

            {lesson.video_duration_seconds && (
              <div style={{ marginTop: "16px", fontSize: "14px", color: "#94a3b8" }}>
                Duration: {Math.ceil(lesson.video_duration_seconds / 60)} minutes
              </div>
            )}
          </div>

          {/* Lesson Content */}
          {lesson.content && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                padding: "28px",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0b0b2c", marginTop: 0 }}>
                Lesson Content
              </h2>
              <div
                style={{
                  marginTop: "16px",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#69697b",
                  whiteSpace: "pre-wrap",
                }}
              >
                {lesson.content}
              </div>
            </div>
          )}

          {/* Mark Complete Button */}
          {!quizDialogOpen && (
            <button
              onClick={handleLessonComplete}
              style={{
                width: "100%",
                border: "0",
                borderRadius: "8px",
                background: "#3434ff",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "16px",
                fontWeight: 700,
                padding: "16px 24px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2a2ad6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#3434ff";
              }}
            >
              {quiz ? "Complete Lesson & Take Quiz" : "Mark as Complete"}
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "20px",
            position: "sticky",
            top: "20px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
            Lesson Progress
          </div>

          {/* Watch Percentage */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#94a3b8",
                marginBottom: "6px",
              }}
            >
              Watched
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#0b0b2c",
              }}
            >
              {watchedPercentage}%
            </div>
            <div
              style={{
                marginTop: "8px",
                width: "100%",
                height: "6px",
                borderRadius: "999px",
                background: "#e2e8f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${watchedPercentage}%`,
                  background: "#8ab815",
                  borderRadius: "999px",
                }}
              />
            </div>
          </div>

          {/* Quiz Ready */}
          {quiz && watchedPercentage >= 80 && (
            <div
              style={{
                background: "#f4fbe4",
                border: "1px solid #d9f09a",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: 600,
                color: "#5e7f0f",
              }}
            >
              ✓ Quiz is ready!
            </div>
          )}

          {quiz && watchedPercentage < 80 && (
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center",
                fontSize: "12px",
                color: "#92400e",
              }}
            >
              Watch {80 - watchedPercentage}% more to unlock quiz
            </div>
          )}
        </div>
      </div>

      {/* Quiz Dialog */}
      {quiz && quizQuestions.length > 0 && (
        <QuizDialog
          open={quizDialogOpen}
          onOpenChange={setQuizDialogOpen}
          quiz={quiz}
          questions={quizQuestions}
          userId={userId}
          onPassed={handleQuizPassed}
        />
      )}
    </div>
  );
}
