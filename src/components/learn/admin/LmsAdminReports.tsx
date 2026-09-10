import { useState } from "react";
import { FileText } from "lucide-react";

export function LmsAdminReports() {
  const [selectedCourse, setSelectedCourse] = useState("All courses");
  const [selectedMetrics, setSelectedMetrics] = useState({
    progress: true,
    completion: true,
    scores: true,
    time: false,
    revenue: false,
  });

  const recentReports = [
    { name: "All courses — full progress export", date: "1 Sep 2026" },
    { name: "Microsoft Copilot for EHS — completion report", date: "28 Aug 2026" },
  ];

  const toggleMetric = (key: string) => {
    setSelectedMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Build a Report */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", marginBottom: "28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#0b0b2c", marginBottom: "20px" }}>Build a report</div>

        {/* Course Selection */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#69697b", marginBottom: "12px" }}>Course</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All courses", "Microsoft Copilot for EHS", "AI Fundamentals for Safety Leaders", "Safety 4.0 Accelerator"].map(course => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                style={{
                  border: selectedCourse === course ? "2px solid #3434ff" : "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: selectedCourse === course ? "#3434ff" : "#0b0b2c",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: 700,
                  borderRadius: "8px",
                  padding: "10px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { if (selectedCourse !== course) { e.currentTarget.style.borderColor = "#3434ff"; } }}
                onMouseLeave={(e) => { if (selectedCourse !== course) { e.currentTarget.style.borderColor = "#e2e8f0"; } }}
              >
                {course}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Selection */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#69697b", marginBottom: "12px" }}>Include</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { key: "progress", label: "Learner progress %" },
              { key: "completion", label: "Completion & certificate dates" },
              { key: "scores", label: "Assessment scores" },
              { key: "time", label: "Time-on-module / watch time" },
              { key: "revenue", label: "Revenue & refunds" },
            ].map(metric => (
              <label key={metric.key} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedMetrics[metric.key as keyof typeof selectedMetrics]}
                  onChange={() => toggleMetric(metric.key)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", color: "#0b0b2c", fontWeight: 500 }}>{metric.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          style={{
            width: "100%",
            border: "none",
            background: "#3434ff",
            color: "#ffffff",
            fontFamily: "inherit",
            fontSize: "12px",
            fontWeight: 700,
            borderRadius: "8px",
            padding: "12px 16px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2ad6"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#3434ff"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          GENERATE PDF
        </button>
        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "12px" }}>Builds a PDF you can save or print.</div>
      </div>

      {/* Recent Reports */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Recent reports</div>
        </div>
        {recentReports.map((report, idx) => (
          <div
            key={idx}
            style={{
              padding: "20px 28px",
              borderBottom: idx < recentReports.length - 1 ? "1px solid #f1f4f8" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
              <FileText size={18} color="#3434ff" style={{ flex: "none" }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0b0b2c" }}>{report.name}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{report.date}</div>
              </div>
            </div>
            <button
              style={{
                border: "none",
                background: "transparent",
                color: "#3434ff",
                fontFamily: "inherit",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                flex: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#2a2ad6"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#3434ff"; }}
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
