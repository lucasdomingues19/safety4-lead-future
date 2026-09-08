import { useState } from "react";
import { MessageCircle, HelpCircle, Shield } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

export function LmsSupport() {
  const [faqs] = useState<FAQ[]>([
    {
      question: "Do I need a Microsoft 365 Copilot licence?",
      answer: "A licence lets you follow the hands-on exercises in your own tenant. Without one you can still complete the course using the recorded demonstrations."
    },
    {
      question: "How long do I have access?",
      answer: "Twelve months from enrolment, including any content updates released in that period."
    },
    {
      question: "How are my CPD hours recorded?",
      answer: "Hours accrue as you complete modules and appear on your certificate once the assessment is passed."
    }
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", color: "#0b0b2c", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "40px 28px 72px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815", marginBottom: "12px" }}>SUPPORT</div>
        <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em" }}>How can we help?</h1>
        <p style={{ margin: "12px 0 0", maxWidth: "680px", fontSize: "17px", lineHeight: 1.7, color: "#69697b" }}>
          Course questions, technical problems and Copilot licensing queries all go through the same place.
        </p>

        {/* Support Cards */}
        <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px" }}>
          {/* Ask Instructor */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "26px",
              transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 18px 40px rgba(11,11,44,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={23} color="#3434ff" />
            </div>
            <div style={{ marginTop: "20px", fontSize: "19px", fontWeight: 700 }}>Ask the instructor</div>
            <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: 1.65, color: "#69697b" }}>
              Course content and applying Copilot to your own work. Replies within two working days.
            </p>
            <a href="#" style={{ display: "inline-block", marginTop: "16px", fontSize: "14px", fontWeight: 700, color: "#3434ff", textDecoration: "none" }}>
              Start a message →
            </a>
          </div>

          {/* Technical Help */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "26px",
              transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 18px 40px rgba(11,11,44,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HelpCircle size={23} color="#3434ff" />
            </div>
            <div style={{ marginTop: "20px", fontSize: "19px", fontWeight: 700 }}>Technical help</div>
            <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: 1.65, color: "#69697b" }}>
              Playback, downloads, progress not saving, or access problems.
            </p>
            <a href="#" style={{ display: "inline-block", marginTop: "16px", fontSize: "14px", fontWeight: 700, color: "#3434ff", textDecoration: "none" }}>
              Report an issue →
            </a>
          </div>

          {/* Accreditation */}
          <div
            style={{
              background: "#f4fbe4",
              border: "1px solid #d9f09a",
              borderRadius: "20px",
              padding: "26px",
              transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 18px 40px rgba(11,11,44,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#a6e21a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={23} color="#0b0b2c" />
            </div>
            <div style={{ marginTop: "20px", fontSize: "19px", fontWeight: 700 }}>Accreditation queries</div>
            <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: 1.65, color: "#4a5230" }}>
              CPD records, IOSH evidence, or replacement certificates.
            </p>
            <a href="#" style={{ display: "inline-block", marginTop: "16px", fontSize: "14px", fontWeight: 700, color: "#5e7f0f", textDecoration: "none" }}>
              Contact the academy →
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <h2 style={{ margin: "44px 0 0", fontSize: "22px", fontWeight: 700 }}>Common questions</h2>
        <div style={{ marginTop: "20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ padding: "22px 26px", borderBottom: idx < faqs.length - 1 ? "1px solid #f1f4f8" : "none" }}>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>{faq.question}</div>
              <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: 1.7, color: "#69697b" }}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
