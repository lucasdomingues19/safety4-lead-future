import { useState } from "react";
import { ChevronRight, FileText, Zap } from "lucide-react";

interface Module {
  id: string;
  title: string;
  meta: string;
  state: string;
  stateFg: string;
  chipBg: string;
  chipFg: string;
  chipContent: string;
  titleFg: string;
  hoverBg: string;
  cursor: string;
  chevronShow: string;
  onClick: () => void;
  hint: string;
}

interface CourseMaterial {
  id: string;
  title: string;
  meta: string;
  icon: string;
  href: string;
}

export function LmsCourseView({ course, onModuleClick }: any) {
  const [doneCount, setDoneCount] = useState(3);
  const [progressPct, setProgressPct] = useState(25);
  const [ringOffset, setRingOffset] = useState("207.35"); // (1 - 0.25) * 276.46

  const [modules, setModules] = useState<Module[]>([
    {
      id: "1",
      title: "Module 1: Safety 4.0 Fundamentals",
      meta: "3 lessons • 45 min",
      state: "COMPLETE",
      stateFg: "#8ab815",
      chipBg: "#8ab815",
      chipFg: "#fff",
      chipContent: "✓",
      titleFg: "#0b0b2c",
      hoverBg: "#f8fafc",
      cursor: "pointer",
      chevronShow: "inline",
      hint: "Click to view module",
      onClick: () => onModuleClick?.("1"),
    },
    {
      id: "2",
      title: "Module 2: AI for Workplace Safety",
      meta: "4 lessons • 60 min",
      state: "COMPLETE",
      stateFg: "#8ab815",
      chipBg: "#8ab815",
      chipFg: "#fff",
      chipContent: "✓",
      titleFg: "#0b0b2c",
      hoverBg: "#f8fafc",
      cursor: "pointer",
      chevronShow: "inline",
      hint: "Click to view module",
      onClick: () => onModuleClick?.("2"),
    },
    {
      id: "3",
      title: "Module 3: Copilot for EHS Professionals",
      meta: "5 lessons • 75 min",
      state: "IN PROGRESS",
      stateFg: "#3434ff",
      chipBg: "#f1f4ff",
      chipFg: "#3434ff",
      chipContent: "⏳",
      titleFg: "#0b0b2c",
      hoverBg: "#f8fafc",
      cursor: "pointer",
      chevronShow: "inline",
      hint: "Click to continue",
      onClick: () => onModuleClick?.("3"),
    },
    {
      id: "4",
      title: "Module 4: Governance & Compliance",
      meta: "3 lessons • 50 min",
      state: "LOCKED",
      stateFg: "#cbd5e1",
      chipBg: "#eef1f6",
      chipFg: "#94a3b8",
      chipContent: "4",
      titleFg: "#94a3b8",
      hoverBg: "transparent",
      cursor: "not-allowed",
      chevronShow: "none",
      hint: "Complete previous modules first",
      onClick: () => {},
    },
    {
      id: "5",
      title: "Module 5: Real-World Implementation",
      meta: "6 lessons • 90 min",
      state: "LOCKED",
      stateFg: "#cbd5e1",
      chipBg: "#eef1f6",
      chipFg: "#94a3b8",
      chipContent: "5",
      titleFg: "#94a3b8",
      hoverBg: "transparent",
      cursor: "not-allowed",
      chevronShow: "none",
      hint: "Complete previous modules first",
      onClick: () => {},
    },
    {
      id: "6",
      title: "Module 6: Capstone Project",
      meta: "Self-paced • 2 weeks",
      state: "LOCKED",
      stateFg: "#cbd5e1",
      chipBg: "#eef1f6",
      chipFg: "#94a3b8",
      chipContent: "6",
      titleFg: "#94a3b8",
      hoverBg: "transparent",
      cursor: "not-allowed",
      chevronShow: "none",
      hint: "Complete all modules first",
      onClick: () => {},
    },
  ]);

  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([
    {
      id: "1",
      title: "Course workbook",
      meta: "PDF · 61 pages",
      icon: "📄",
      href: "#",
    },
    {
      id: "2",
      title: "Prompt library",
      meta: "Living document",
      icon: "⚡",
      href: "#",
    },
  ]);

  const goPlayer = () => {
    onModuleClick?.("3");
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 28px 72px", background: "#eef1f6", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0b0b2c" }}>
      <div style={{ fontSize: "14px", color: "#69697b" }}>My course</div>
      <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em", maxWidth: "820px" }}>
        {course?.title || "Microsoft Copilot for EHS & Sustainability Professionals"}
      </h1>

      <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: "28px", alignItems: "start" }}>
        {/* Curriculum List */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ fontSize: "18px", fontWeight: 700 }}>Curriculum</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#69697b" }}>
              {doneCount} of {modules.length} complete
            </div>
          </div>
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={m.onClick}
              title={m.hint}
              style={{
                width: "100%",
                border: "0",
                background: "transparent",
                fontFamily: "inherit",
                textAlign: "left",
                padding: "20px 28px",
                borderBottom: "1px solid #f1f4f8",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                cursor: m.cursor as any,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = m.hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: m.chipBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: m.chipFg,
                }}
              >
                {m.chipContent}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "16px", lineHeight: 1.35, fontWeight: 700, color: m.titleFg }}>
                  {m.title}
                </div>
                <div style={{ marginTop: "5px", fontSize: "13px", color: "#94a3b8" }}>
                  {m.meta}
                </div>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: m.stateFg, flex: "none" }}>
                {m.state}
              </div>
              {m.chevronShow === "inline" && <ChevronRight size={17} color="#cbd5e1" style={{ flex: "none" }} />}
            </button>
          ))}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Progress Ring */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "26px", textAlign: "center" }}>
            <div style={{ position: "relative", width: "132px", height: "132px", margin: "0 auto" }}>
              <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke="#eef1f6" strokeWidth="9"></circle>
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#3434ff"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray="276.46"
                  strokeDashoffset={ringOffset}
                  style={{ transition: "stroke-dashoffset 0.3s ease" }}
                ></circle>
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.01em" }}>
                  {progressPct}%
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#69697b" }}>complete</div>
              </div>
            </div>
            <button
              onClick={goPlayer}
              style={{
                marginTop: "22px",
                width: "100%",
                border: "0",
                borderRadius: "8px",
                background: "#3434ff",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "14px 20px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2ad6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#3434ff")}
            >
              Resume
            </button>
          </div>

          {/* Course Materials */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700 }}>Course materials</div>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {courseMaterials.map((material) => (
                <a
                  key={material.id}
                  href={material.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px",
                    borderRadius: "12px",
                    color: "#0b0b2c",
                    textDecoration: "none",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(52,52,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                    }}
                  >
                    {material.icon === "📄" ? <FileText size={18} color="#3434ff" /> : <Zap size={18} color="#3434ff" />}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{material.title}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{material.meta}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Certification Badges */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                height: "46px",
                background: "rgba(52,52,255,0.1)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              ✓
            </div>
            <div style={{ width: "1px", height: "36px", background: "#e2e8f0" }}></div>
            <div
              style={{
                height: "46px",
                background: "rgba(52,52,255,0.1)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              ✓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
