import { useState } from "react";
import { X, Sparkles, Plus } from "lucide-react";
import { generateQuizWithAI } from "../../utils/quizGenerator";

interface QuizGeneratorModalProps {
  onClose: () => void;
  onQuizGenerated?: (quiz: any) => void;
}

export function QuizGeneratorModal({ onClose, onQuizGenerated }: QuizGeneratorModalProps) {
  const [mode, setMode] = useState<"choose" | "ai" | "manual">("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI Generation form
  const [courseTitle, setCourseTitle] = useState("Copilot for EHS");
  const [courseDesc, setCourseDesc] = useState("Learn to use Microsoft Copilot for EHS and Sustainability");
  const [numQuestions, setNumQuestions] = useState(20);

  // Manual quiz form
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState("");

  const handleAIGenerate = async () => {
    if (!courseTitle.trim()) {
      setError("Please enter a course title");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const quiz = await generateQuizWithAI(
        courseTitle,
        courseDesc,
        [
          { title: "Module 1: Safety 4.0 Fundamentals", description: "Core safety concepts" },
          { title: "Module 2: AI for Workplace Safety", description: "AI applications in EHS" },
        ],
        [
          { title: "Lesson 1: Introduction", content: "Introduction to Copilot" },
          { title: "Lesson 2: Practical Applications", content: "Real-world use cases" },
        ],
        numQuestions
      );

      onQuizGenerated?.(quiz);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleManualCreate = () => {
    if (!quizTitle.trim()) {
      setError("Please enter a quiz title");
      return;
    }

    const quiz = {
      title: quizTitle,
      description: quizDesc,
      questions: [],
      passingScore: 70,
    };

    onQuizGenerated?.(quiz);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,11,44,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", maxWidth: "560px", width: "100%", overflow: "hidden", boxShadow: "0 30px 60px rgba(11,11,44,0.3)" }}>
        {/* Header */}
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>Create new quiz</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <X size={24} color="#69697b" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "28px" }}>
          {mode === "choose" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <button
                onClick={() => setMode("ai")}
                style={{
                  border: "2px solid #e2e8f0",
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "24px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3434ff";
                  e.currentTarget.style.background = "#f1f4ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "#fff";
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>✨</div>
                <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>AI Generated</div>
                <div style={{ fontSize: "13px", color: "#94a3b8" }}>Generate questions from course content</div>
              </button>

              <button
                onClick={() => setMode("manual")}
                style={{
                  border: "2px solid #e2e8f0",
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "24px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#8ab815";
                  e.currentTarget.style.background = "#f4fbe4";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "#fff";
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>✎</div>
                <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Manual</div>
                <div style={{ fontSize: "13px", color: "#94a3b8" }}>Create questions yourself</div>
              </button>
            </div>
          )}

          {mode === "ai" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                  Course title
                </label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g., Copilot for EHS"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                  Course description
                </label>
                <textarea
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Brief description of the course content"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    minHeight: "80px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                  Number of questions: {numQuestions}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>

              {error && (
                <div style={{ padding: "12px", background: "#fee2e2", borderRadius: "8px", fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setMode("choose")}
                  style={{
                    flex: 1,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#0b0b2c",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    padding: "12px",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={loading}
                  style={{
                    flex: 1,
                    border: "0",
                    background: loading ? "#e2e8f0" : "#3434ff",
                    color: loading ? "#94a3b8" : "#fff",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    padding: "12px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Sparkles size={16} />
                  {loading ? "Generating..." : "Generate with AI"}
                </button>
              </div>
            </div>
          )}

          {mode === "manual" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                  Quiz title
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g., Module 1 Assessment"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                  Description (optional)
                </label>
                <textarea
                  value={quizDesc}
                  onChange={(e) => setQuizDesc(e.target.value)}
                  placeholder="Brief description of what this quiz covers"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    minHeight: "80px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {error && (
                <div style={{ padding: "12px", background: "#fee2e2", borderRadius: "8px", fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setMode("choose")}
                  style={{
                    flex: 1,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#0b0b2c",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    padding: "12px",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleManualCreate}
                  style={{
                    flex: 1,
                    border: "0",
                    background: "#8ab815",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    padding: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#7a9d0e")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#8ab815")}
                >
                  <Plus size={16} />
                  Create blank quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
