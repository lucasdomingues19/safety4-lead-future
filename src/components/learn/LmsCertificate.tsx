import { useState } from "react";
import { Lock, Check, Download, Share2 } from "lucide-react";

export function LmsCertificate({ onBack }: any) {
  const [certState, setCertState] = useState<"locked" | "ready">("ready");
  const [doneCount, setDoneCount] = useState(12);
  const [learnerName, setLearnerName] = useState("Sarah Chen");
  const [certId, setCertId] = useState("SC-2026-03-08-9847");
  const [certDate, setCertDate] = useState("March 8, 2026");

  const step1Bg = doneCount === 12 ? "#8ab815" : "#f1f4f8";
  const step1Icon = doneCount === 12 ? "✓" : "●";

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", color: "#0b0b2c", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {certState === "locked" ? (
        // Locked Certificate
        <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 28px 72px" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815", marginBottom: "12px" }}>
            CERTIFICATION
          </div>
          <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Your certificate
          </h1>

          <div style={{ marginTop: "32px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "56px 44px", textAlign: "center" }}>
            <div
              style={{
                width: "76px",
                height: "76px",
                margin: "0 auto",
                borderRadius: "50%",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={32} color="#94a3b8" />
            </div>

            <div style={{ marginTop: "26px", fontSize: "24px", fontWeight: 700 }}>
              Not available yet
            </div>
            <p style={{ margin: "14px 0 0", maxWidth: "460px", marginLeft: "auto", marginRight: "auto", fontSize: "16px", lineHeight: 1.7, color: "#69697b" }}>
              Your certificate appears here once all 12 modules are complete and you have passed the capstone assessment.
            </p>

            {/* Requirements */}
            <div style={{ marginTop: "34px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto", textAlign: "left", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 18px" }}>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: step1Bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                    color: doneCount === 12 ? "#fff" : "#94a3b8",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  {step1Icon}
                </div>
                <div style={{ flex: 1, fontSize: "15px", fontWeight: 600 }}>
                  Complete 12 modules
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", flex: "none" }}>
                  {doneCount} / 12
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 18px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#f1f4f8", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <span style={{ fontSize: "16px" }}>+</span>
                </div>
                <div style={{ flex: 1, fontSize: "15px", fontWeight: 600, color: "#69697b" }}>
                  Pass the capstone assessment
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#cbd5e1", flex: "none" }}>
                  Locked
                </div>
              </div>
            </div>

            <button
              onClick={onBack}
              style={{
                marginTop: "32px",
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
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2ad6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#3434ff")}
            >
              Back to my course
            </button>
          </div>
        </div>
      ) : (
        // Ready Certificate
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 28px 72px" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815", marginBottom: "12px" }}>
            CERTIFICATION
          </div>
          <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Your certificate
          </h1>
          <p style={{ margin: "12px 0 0", fontSize: "17px", lineHeight: 1.7, color: "#69697b" }}>
            Course complete and assessment passed. Your certificate is ready to download.
          </p>

          {/* Certificate Preview */}
          <div style={{ marginTop: "32px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "30px", padding: "16px", boxShadow: "0 18px 40px rgba(11,11,44,0.1)" }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "20px", padding: "48px 44px", textAlign: "center", background: "linear-gradient(180deg,#fbfcfe,#fff)" }}>
              <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>
                🎓
              </div>

              <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.16em", color: "#8ab815", marginTop: "12px" }}>
                CERTIFICATE OF COMPLETION
              </div>

              <div style={{ marginTop: "24px", fontSize: "34px", fontWeight: 700, letterSpacing: "-0.01em" }}>
                {learnerName}
              </div>

              <div style={{ marginTop: "20px", fontSize: "16px", lineHeight: 1.7, color: "#69697b", maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
                has successfully completed
              </div>

              <div style={{ marginTop: "12px", fontSize: "22px", lineHeight: 1.35, fontWeight: 700, maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
                Microsoft Copilot for EHS & Sustainability Professionals
              </div>

              {/* Badges */}
              <div style={{ marginTop: "34px", display: "flex", alignItems: "center", justifyContent: "center", gap: "22px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#3434ff" }}>✓ IOSH</div>
                <div style={{ width: "1px", height: "40px", background: "#e2e8f0" }}></div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#3434ff" }}>✓ CPD</div>
              </div>

              {/* Details */}
              <div style={{ marginTop: "36px", display: "flex", flexWrap: "wrap", gap: "28px", justifyContent: "center", fontSize: "13px", color: "#94a3b8" }}>
                <div>8+ CPD hours</div>
                <div>Lucas Domingues, MSc, CMIOSH</div>
                <div>ID {certId}</div>
              </div>
            </div>
          </div>

          {/* Download Bar */}
          <div
            style={{
              marginTop: "28px",
              background: "#f4fbe4",
              border: "1px solid #d9f09a",
              borderRadius: "20px",
              padding: "26px",
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#a6e21a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                  color: "#0b0b2c",
                  fontSize: "20px",
                }}
              >
                ✓
              </div>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 700 }}>
                  12 of 12 modules complete · assessment passed
                </div>
                <div style={{ marginTop: "6px", fontSize: "14px", color: "#4a5230" }}>
                  Issued {certDate} · 8+ CPD hours recorded
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", flex: "none" }}>
              <button
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#0b0b2c",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "14px 24px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <Share2 size={14} />
                Share
              </button>
              <button
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
                  padding: "14px 28px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2ad6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#3434ff")}
              >
                <Download size={14} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
