import { useState } from "react";
import { Upload, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { LmsQuizPlayer } from "./LmsQuizPlayer";

const SAMPLE_QUIZ = {
  title: "Capstone Assessment",
  description: "Demonstrate your understanding of Copilot for EHS and Sustainability",
  questions: [
    {
      id: "q1",
      question: "What is the primary purpose of Microsoft Copilot in EHS?",
      options: [
        "To replace EHS professionals",
        "To assist in safety analysis and compliance documentation",
        "To automate all safety decisions",
        "To conduct audits independently"
      ],
      correctAnswer: 1,
      explanation: "Copilot assists professionals in analyzing safety data and creating compliance documentation while maintaining human oversight."
    },
    {
      id: "q2",
      question: "How should organizations govern the use of AI in EHS?",
      options: [
        "Let employees decide on their own",
        "Establish clear policies, oversight, and human review processes",
        "Restrict all AI usage",
        "Implement without policies"
      ],
      correctAnswer: 1,
      explanation: "Proper governance requires clear policies, oversight mechanisms, and human review to ensure responsible AI usage."
    },
    {
      id: "q3",
      question: "What is a key consideration when implementing Copilot for safety analysis?",
      options: [
        "Cost alone",
        "Data privacy and accuracy of AI-generated insights",
        "Avoiding employee training",
        "Speed without validation"
      ],
      correctAnswer: 1,
      explanation: "Data privacy, accuracy validation, and ensuring AI insights are reviewed by qualified professionals are critical."
    },
    {
      id: "q4",
      question: "How can Copilot help with workplace risk assessment?",
      options: [
        "It makes final risk decisions",
        "It can analyze data and suggest risk factors for professional review",
        "It replaces hazard analysis",
        "It only creates reports"
      ],
      correctAnswer: 1,
      explanation: "Copilot can assist by analyzing data and identifying potential risk factors that professionals then review and validate."
    },
    {
      id: "q5",
      question: "What should be the role of human professionals when using Copilot?",
      options: [
        "No involvement needed",
        "Review, validate, and make final decisions on AI-generated insights",
        "Only administrative tasks",
        "Passive monitoring"
      ],
      correctAnswer: 1,
      explanation: "Human professionals maintain critical roles in reviewing, validating, and making final decisions on all AI-generated safety insights."
    }
  ],
  passingScore: 70,
  timeLimit: 30
};

export function LmsAssessment({ onStartAssessment }: any) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [assessState, setAssessState] = useState("LOCKED");
  const [assessStateFg, setAssessStateFg] = useState("#cbd5e1");
  const [assessChipBg, setAssessChipBg] = useState("#eef1f6");
  const [assessIcon, setAssessIcon] = useState("🔒");
  const [progressCss, setProgressCss] = useState("0%");
  const [assessBarFill, setAssessBarFill] = useState("#cbd5e1");
  const [assessGate, setAssessGate] = useState("Complete all 12 modules first");
  const [assessLocked, setAssessLocked] = useState("true");
  const [assessBtnBg, setAssessBtnBg] = useState("#f1f4ff");
  const [assessBtnFg, setAssessBtnFg] = useState("#3434ff");
  const [assessBtnBorder, setAssessBtnBorder] = useState("1px solid #3434ff");
  const [assessCursor, setAssessCursor] = useState("not-allowed");
  const [assessBtnLabel, setAssessBtnLabel] = useState("Start Assessment");
  const [attemptsUsed, setAttemptsUsed] = useState(0);

  // Simulate unlocked state for demo
  const handleUnlock = () => {
    setAssessState("READY");
    setAssessStateFg("#8ab815");
    setAssessChipBg("#f4fbe4");
    setAssessIcon("✓");
    setProgressCss("0%");
    setAssessBarFill("#8ab815");
    setAssessGate("You're ready to start the assessment");
    setAssessLocked("false");
    setAssessBtnBg("#3434ff");
    setAssessBtnFg("#fff");
    setAssessBtnBorder("0");
    setAssessCursor("pointer");
  };

  if (quizStarted) {
    return (
      <LmsQuizPlayer
        title={SAMPLE_QUIZ.title}
        description={SAMPLE_QUIZ.description}
        questions={SAMPLE_QUIZ.questions}
        passingScore={SAMPLE_QUIZ.passingScore}
        onComplete={(result) => {
          if (result.passed) {
            setAttemptsUsed(attemptsUsed + 1);
          }
        }}
        onBack={() => setQuizStarted(false)}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", color: "#0b0b2c", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "40px 28px 72px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815", marginBottom: "12px" }}>
          ASSESSMENT
        </div>
        <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em" }}>
          Capstone assessment
        </h1>
        <p style={{ margin: "12px 0 0", maxWidth: "680px", fontSize: "17px", lineHeight: 1.7, color: "#69697b" }}>
          A short assessment confirms you can apply Copilot responsibly in your own EHS work. It unlocks once all 12 modules are complete.
        </p>

        {/* Main Content Grid */}
        <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: "28px", alignItems: "start" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Knowledge Check Card */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: assessChipBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                    fontSize: "24px",
                  }}
                >
                  {assessIcon}
                </div>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>Knowledge check</div>
                  <div style={{ marginTop: "5px", fontSize: "14px", color: "#69697b" }}>
                    20 questions · multiple choice · 70% to pass
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: assessStateFg,
                    flex: "none",
                  }}
                >
                  {assessState}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: "24px", height: "8px", borderRadius: "999px", background: "#eef1f6", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: progressCss,
                    background: assessBarFill,
                    borderRadius: "999px",
                    transition: "all 0.3s ease",
                  }}
                ></div>
              </div>

              {/* Status Message */}
              <div style={{ marginTop: "12px", fontSize: "14px", color: "#69697b" }}>
                {assessGate}
              </div>

              {/* Start Button */}
              <button
                onClick={() => {
                  if (assessLocked === "false") {
                    setQuizStarted(true);
                  } else {
                    handleUnlock();
                  }
                }}
                disabled={assessLocked === "true"}
                style={{
                  marginTop: "24px",
                  border: assessBtnBorder,
                  borderRadius: "8px",
                  background: assessBtnBg,
                  color: assessBtnFg,
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "14px 30px",
                  cursor: assessCursor as any,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (assessLocked === "false") {
                    e.currentTarget.style.background = "#2a2ad6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (assessLocked === "false") {
                    e.currentTarget.style.background = "#3434ff";
                  }
                }}
              >
                {assessBtnLabel}
              </button>
            </div>

            {/* Practical Submission Card */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px" }}>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>Practical submission</div>
              <p style={{ margin: "12px 0 0", fontSize: "15px", lineHeight: 1.7, color: "#69697b" }}>
                Submit your 90-day implementation plan from the workbook. Reviewed by the instructor within five working days.
              </p>

              {/* Upload Area */}
              <div
                style={{
                  marginTop: "20px",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "12px",
                  padding: "26px",
                  textAlign: "center",
                  background: "#f8fafc",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3434ff";
                  e.currentTarget.style.background = "#f1f4ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.background = "#f8fafc";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    margin: "0 auto",
                    borderRadius: "50%",
                    background: "rgba(52,52,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Upload size={21} color="#3434ff" />
                </div>
                <div style={{ marginTop: "14px", fontSize: "15px", fontWeight: 600 }}>
                  Upload your plan
                </div>
                <div style={{ marginTop: "6px", fontSize: "13px", color: "#94a3b8" }}>
                  PDF or Word · up to 10 MB
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Before You Start */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px" }}>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>Before you start</div>
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: assessState === "READY" ? "#8ab815" : "#3434ff",
                      flex: "none",
                      marginTop: "7px",
                    }}
                  ></span>
                  <div style={{ fontSize: "14px", lineHeight: 1.6, color: "#69697b" }}>
                    All 12 modules marked complete
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#3434ff",
                      flex: "none",
                      marginTop: "7px",
                    }}
                  ></span>
                  <div style={{ fontSize: "14px", lineHeight: 1.6, color: "#69697b" }}>
                    Workbook exercises finished
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#3434ff",
                      flex: "none",
                      marginTop: "7px",
                    }}
                  ></span>
                  <div style={{ fontSize: "14px", lineHeight: 1.6, color: "#69697b" }}>
                    Two attempts permitted
                  </div>
                </div>
              </div>
            </div>

            {/* Attempts Counter */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px" }}>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>Attempts</div>
              <div style={{ marginTop: "14px", fontSize: "32px", fontWeight: 800, letterSpacing: "-0.01em" }}>
                {attemptsUsed}
                <span style={{ fontSize: "18px", fontWeight: 600, color: "#94a3b8", marginLeft: "8px" }}>of 2 used</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
