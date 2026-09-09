import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { calculateScore } from "../../utils/quizGenerator";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizPlayerProps {
  title: string;
  description: string;
  questions: Question[];
  passingScore?: number;
  onComplete?: (result: { score: number; percentage: number; passed: boolean }) => void;
  onBack?: () => void;
}

export function LmsQuizPlayer({ title, description, questions, passingScore = 70, onComplete, onBack }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; percentage: number; passed: boolean } | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = (optionIndex: number) => {
    if (!submitted) {
      setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const quizResult = calculateScore(answers, questions);
    setResult(quizResult);
    setSubmitted(true);
    onComplete?.(quizResult);
  };

  const handleReview = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  if (submitted && result) {
    return (
      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 28px 72px", background: "#eef1f6", minHeight: "100vh" }}>
        <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815", marginBottom: "12px" }}>
          QUIZ RESULTS
        </div>
        <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700 }}>
          {result.passed ? "Assessment passed!" : "Try again"}
        </h1>

        <div style={{ marginTop: "32px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "48px", textAlign: "center" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              margin: "0 auto",
              borderRadius: "50%",
              background: result.passed ? "#f4fbe4" : "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
            }}
          >
            {result.passed ? <CheckCircle size={60} color="#8ab815" /> : <XCircle size={60} color="#dc2626" />}
          </div>

          <div style={{ marginTop: "32px", fontSize: "56px", fontWeight: 800, letterSpacing: "-0.01em" }}>
            {result.percentage}%
          </div>

          <div style={{ marginTop: "8px", fontSize: "18px", fontWeight: 600, color: "#69697b" }}>
            {result.score} of {questions.length} correct
          </div>

          <div style={{ marginTop: "4px", fontSize: "14px", color: "#94a3b8" }}>
            Passing score: {passingScore}%
          </div>

          <div style={{ marginTop: "32px", padding: "20px", background: result.passed ? "#f4fbe4" : "#fee2e2", borderRadius: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: result.passed ? "#4a5230" : "#7f1d1d" }}>
              {result.passed ? "Great work! You've demonstrated mastery of the course content." : "Review the material and try again to improve your score."}
            </div>
          </div>

          <div style={{ marginTop: "28px" }}>
            <button
              onClick={() => window.location.href = "/learn"}
              style={{
                border: "0",
                borderRadius: "8px",
                background: "#3434ff",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "14px 30px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2ad6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#3434ff")}
            >
              Back to course
            </button>
          </div>

          <div style={{ marginTop: "24px", borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>Review answers</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))", gap: "8px" }}>
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => handleReview(idx)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    background: answers[q.id] === q.correctAnswer ? "#f4fbe4" : "#fee2e2",
                    color: answers[q.id] === q.correctAnswer ? "#8ab815" : "#dc2626",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 28px 72px", background: "#eef1f6", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0b0b2c" }}>
      <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815", marginBottom: "12px" }}>
        ASSESSMENT
      </div>
      <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em" }}>
        {title}
      </h1>
      <p style={{ margin: "12px 0 0", fontSize: "17px", lineHeight: 1.7, color: "#69697b" }}>
        {description}
      </p>

      <div style={{ marginTop: "32px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", overflow: "hidden" }}>
        {/* Progress bar */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#69697b" }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#69697b" }}>
              {Math.round(progress)}%
            </div>
          </div>
          <div style={{ height: "8px", background: "#eef1f6", borderRadius: "999px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                background: "#3434ff",
                width: `${progress}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1.5, marginBottom: "24px" }}>
            {currentQuestion.question}
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                style={{
                  textAlign: "left",
                  border: answers[currentQuestion.id] === idx ? "2px solid #3434ff" : "2px solid #e2e8f0",
                  background: answers[currentQuestion.id] === idx ? "#f1f4ff" : "#fff",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "15px",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
                onMouseEnter={(e) => {
                  if (answers[currentQuestion.id] !== idx) {
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.background = "#f8fafc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (answers[currentQuestion.id] !== idx) {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#fff";
                  }
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor: answers[currentQuestion.id] === idx ? "#3434ff" : "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {answers[currentQuestion.id] === idx ? "✓" : ""}
                </div>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            style={{
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: currentQuestionIndex === 0 ? "#cbd5e1" : "#0b0b2c",
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 700,
              borderRadius: "8px",
              padding: "12px 18px",
              cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              style={{
                border: "0",
                background: "#3434ff",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "14px",
                fontWeight: 700,
                borderRadius: "8px",
                padding: "12px 18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginLeft: "auto",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2ad6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#3434ff")}
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={{
                border: "0",
                background: "#8ab815",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "14px",
                fontWeight: 700,
                borderRadius: "8px",
                padding: "12px 24px",
                cursor: "pointer",
                marginLeft: "auto",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#7a9d0e")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#8ab815")}
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
