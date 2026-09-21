import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ChevronRight, CheckCircle2, Play, BookOpen, MessageSquare, FileText, Lightbulb } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user && courseSlug && lessonId) loadLesson();
  }, [user, courseSlug, lessonId]);

  const loadLesson = async () => {
    if (!user) return;
    try {
      const { data: c } = await supabase.from("courses").select("*").eq("slug", courseSlug).single();
      if (!c) { navigate("/learn"); return; }
      setCourse(c);

      const { data: mods } = await supabase.from("modules").select("*").eq("course_id", c.id).order("order_num");
      setModules(mods || []);

      const modIds = (mods || []).map((m: any) => m.id);
      const { data: les } = modIds.length ? await supabase.from("lessons").select("*").in("module_id", modIds).order("order_num") : { data: [] };
      setLessons(les || []);

      const { data: l } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
      setLesson(l);

      const { data: prog } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id);
      setCompleted(new Set((prog || []).map((p: any) => p.lesson_id)));
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
        await supabase.from("lesson_progress").insert({ user_id: user.id, lesson_id: lesson.id });
        setCompleted(new Set([...completed, lesson.id]));
        toast.success("Lesson marked complete!");
      }
    } catch (err) {
      console.error(err);
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
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#69697b" }}>
          <span onClick={() => navigate("/learn")} style={{ cursor: "pointer", textDecoration: "underline" }}>My Learning</span>
          <ChevronRight size={16} />
          <span>{course?.title}</span>
          <ChevronRight size={16} />
          <span style={{ fontWeight: 600, color: "#0b0b2c" }}>{lesson.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "16px" : "32px 24px", display: isMobile ? "block" : "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: isMobile ? "24px" : "32px" }}>
        {/* Video & Tabs */}
        <div>
          {/* Video Player */}
          <div style={{ background: "#0b0b2c", borderRadius: "24px", aspectRatio: "16/9", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "48px" }}>
            <Play size={64} />
          </div>

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
            {activeTab === "overview" && <div dangerouslySetInnerHTML={{ __html: lesson.content || "<p>No content yet</p>" }} style={{ lineHeight: 1.6, color: "#0b0b2c" }} />}
            {activeTab === "transcript" && <p style={{ color: "#69697b" }}>Transcript coming soon...</p>}
            {activeTab === "resources" && <p style={{ color: "#69697b" }}>Resources coming soon...</p>}
            {activeTab === "comments" && <p style={{ color: "#69697b" }}>Comments coming soon...</p>}
            {activeTab === "notes" && <p style={{ color: "#69697b" }}>Your notes here...</p>}
          </div>

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
                <h3 style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>Hands-on Next</h3>
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
