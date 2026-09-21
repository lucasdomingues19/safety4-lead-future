import { useState } from "react";
import { ChevronRight, CheckCircle2, Play, Lightbulb } from "lucide-react";

const LessonViewTest = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [completed, setCompleted] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", color: "#0b0b2c", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#69697b" }}>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>My Learning</span>
          <ChevronRight size={16} />
          <span>AI Fundamentals in EHS</span>
          <ChevronRight size={16} />
          <span style={{ fontWeight: 600, color: "#0b0b2c" }}>Lesson 1: AI Basics</span>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "16px" : "32px 24px", display: isMobile ? "block" : "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: isMobile ? "24px" : "32px" }}>
        <div>
          <div style={{ background: "#0b0b2c", borderRadius: "24px", aspectRatio: "16/9", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "48px", fontWeight: "bold" }}>
            <Play size={64} fill="white" />
          </div>

          <div style={{ background: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#69697b" }}>Slide 1 / 3</span>
            <button onClick={() => setCompleted(!completed)} style={{ padding: "8px 16px", background: completed ? "#16a34a" : "#3434ff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
              {completed ? "✓ Completed" : "Mark Complete"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #e2e8f0", background: "white", borderRadius: "12px 12px 0 0" }}>
            {["overview", "transcript", "resources", "comments", "notes"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "12px 16px", border: "none", background: activeTab === tab ? "#f5f7fa" : "transparent", borderBottom: activeTab === tab ? "2px solid #3434ff" : "none", cursor: "pointer", fontSize: "13px", fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? "#3434ff" : "#69697b", flex: 1, textTransform: "capitalize" }}>
                {tab}
              </button>
            ))}
          </div>

          <div style={{ background: "white", padding: "24px", borderRadius: "0 0 12px 12px", minHeight: "200px" }}>
            <h2>AI Fundamentals for EHS</h2>
            <p>Artificial Intelligence is transforming workplace safety. In this lesson, you'll learn:</p>
            <ul>
              <li>What AI is and how it works</li>
              <li>Applications of AI in EHS</li>
              <li>Benefits and risks</li>
              <li>Getting started with AI tools</li>
            </ul>
            <p><strong>Key Takeaway:</strong> AI can help identify hazards faster and predict incidents before they happen.</p>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "space-between" }}>
            <button style={{ padding: "12px 20px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", color: "#0b0b2c", fontWeight: 600 }}>Back to Course</button>
            <button style={{ padding: "12px 20px", background: "#3434ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "white", fontWeight: 600 }}>Next Lesson</button>
          </div>
        </div>

        {!isMobile && (
          <div>
            <div style={{ background: "white", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px", textTransform: "uppercase", color: "#69697b" }}>In This Module</h3>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: "6px", background: i === 1 ? "#f4fbe4" : "#f5f7fa", marginBottom: "8px", display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", color: i === 1 ? "#4a5230" : "#0b0b2c", cursor: "pointer" }}>
                  {i === 1 ? <CheckCircle2 size={14} /> : <Play size={14} />}
                  <span>Lesson {i}: {i === 1 ? "AI Basics" : i === 2 ? "Machine Learning" : "Applications"}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "linear-gradient(135deg, #3434ff 0%, #2a2ad6 100%)", borderRadius: "12px", padding: "16px", color: "white" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <Lightbulb size={16} />
                <h3 style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>Hands-on Next</h3>
              </div>
              <p style={{ fontSize: "12px", lineHeight: 1.5, margin: 0, opacity: 0.9 }}>Practice identifying AI opportunities in a safety scenario.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonViewTest;
