import { BookOpen, Zap } from "lucide-react";

export function LmsDashboard({ currentCourse, setCurrentCourse }: any) {
  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", color: "#0b0b2c", padding: "40px 28px 72px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "0.12em", color: "#8ab815", marginBottom: "12px" }}>
            WELCOME BACK
          </div>
          <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.01em" }}>
            Hey there
          </h1>
          <p style={{ margin: "12px 0 0", fontSize: "17px", lineHeight: "1.7", color: "#69697b" }}>
            Dashboard is loading...
          </p>
        </div>

        {/* Simple test message */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "16px", color: "#0b0b2c", marginBottom: "10px" }}>✅ Dashboard component loaded successfully!</div>
          <div style={{ fontSize: "14px", color: "#69697b" }}>The page is rendering without errors. Data loading is disabled for debugging.</div>
        </div>
      </div>
    </div>
  );
}
