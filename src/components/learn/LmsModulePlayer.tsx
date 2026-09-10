import { useState } from "react";
import { Play, Copy, Download, Info, FileText, MessageCircle, ChevronRight, Bookmark, Check } from "lucide-react";

interface TranscriptItem {
  time: string;
  n: number;
  label: string;
  text: string;
}

interface Resource {
  name: string;
  meta: string;
  kind: string;
  chipBg: string;
  chipFg: string;
}

interface Comment {
  id: string;
  author: string;
  initials: string;
  avBg: string;
  level: string;
  time: string;
  text: string;
  replies: number;
}

interface Note {
  id: string;
  time: string;
  text: string;
}

export function LmsModulePlayer({ course, onBack }: any) {
  const [activeTab, setActiveTab] = useState<"overview" | "transcript" | "resources" | "comments" | "notes">("overview");
  const [currentSlide, setCurrentSlide] = useState(6);
  const [totalSlides] = useState(13);
  const [transcript] = useState("The EHS profession is undergoing rapid transformation with AI adoption. This module explores practical applications, implementation strategies, and governance frameworks for safety leaders implementing AI solutions. We'll examine how AI creates real capacity while maintaining professional responsibility and oversight. This hands-on introduction includes a live Copilot demonstration and your first practical prompt exercise.");
  const [notes, setNotes] = useState("");
  const [commentCount] = useState(4);

  const modules = [
    { id: 1, title: "Title", checked: true },
    { id: 2, title: "Why this matters", checked: true },
    { id: 3, title: "The profession is changing", checked: true },
    { id: 4, title: "Low vs high-value work", checked: true },
    { id: 5, title: "The prompt", checked: true },
    { id: 6, title: "Watch it run", checked: true },
    { id: 7, title: "Your turn", checked: false },
    { id: 8, title: "Exercise: your week", checked: false },
    { id: 9, title: "Opportunity matrix", checked: false },
    { id: 10, title: "The AI-powered professional", checked: false },
    { id: 11, title: "What success looks like", checked: false },
    { id: 12, title: "Reflection", checked: false },
    { id: 13, title: "Up next: Module 02", checked: false },
  ];

  const slideProgress = Math.round((currentSlide / totalSlides) * 100);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 28px 72px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#69697b", marginBottom: "20px" }}>
        <a href="#" onClick={onBack} style={{ color: "#3434ff", textDecoration: "none", cursor: "pointer" }}>
          My course
        </a>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <span style={{ fontWeight: 600, color: "#0b0b2c" }}>Module 01</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: "28px", alignItems: "start" }}>
        {/* Main Content */}
        <div>
          {/* Custom Player */}
          <div style={{ background: "#0b0b2c", borderRadius: "20px", overflow: "hidden", boxShadow: "0 18px 40px rgba(11,11,44,0.18)" }}>
            <div
              style={{
                position: "relative",
                aspectRatio: "16/9",
                background: "radial-gradient(120% 120% at 78% 16%, #17176e 0%, #0a0a38 56%, #05051e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "36px 36px", opacity: 0.3 }}></div>
              <div style={{ position: "relative", textAlign: "center", padding: "32px" }}>
                <div style={{ width: "84px", height: "84px", margin: "0 auto", borderRadius: "50%", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={34} color="#ffffff" fill="#ffffff" />
                </div>
                <div style={{ marginTop: "22px", fontSize: "20px", fontWeight: 700, color: "#ffffff" }}>Module 01 slide deck</div>
                <div style={{ marginTop: "8px", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>The narrated deck is embedded here</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${slideProgress}%`,
                    background: "#a6e21a",
                    borderRadius: "999px",
                  }}
                ></div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.7)", flex: "none" }}>
                Slide {currentSlide} / {totalSlides}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ marginTop: "24px", display: "flex", gap: "6px", borderBottom: "1px solid #e2e8f0", overflowX: "auto" }}>
            {["overview", "transcript", "resources", "comments", "notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  border: "0",
                  background: "transparent",
                  fontFamily: "inherit",
                  padding: "14px 18px",
                  fontSize: "15px",
                  fontWeight: activeTab === tab ? 700 : 600,
                  color: activeTab === tab ? "#0b0b2c" : "#69697b",
                  borderBottom: activeTab === tab ? "2px solid #3434ff" : "2px solid transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === "comments" && `(${commentCount})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: "20px", padding: "28px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
                {currentLesson.title}
              </h2>
              <p style={{ margin: "14px 0 0", fontSize: "16px", lineHeight: 1.7, color: "#69697B" }}>
                {currentLesson.description ||
                  "Explore how AI and digital transformation are reshaping the EHS profession. This module covers practical applications, implementation strategies, and governance frameworks."}
              </p>

              <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                <StatBox label="Duration" value={currentLesson.duration_minutes ? `${currentLesson.duration_minutes} min` : "35 min"} />
                <StatBox label="Format" value="Video + slides" color="#3434FF" />
                <StatBox label="Practical" value="2 exercises" color="#8AB815" />
              </div>
            </div>
          )}

          {activeTab === "transcript" && (
            <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ padding: "22px 28px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 700 }}>Module transcript</div>
                  <div style={{ marginTop: "5px", fontSize: "13px", color: "#94A3B8" }}>
                    Generated from narration • reviewed by instructor
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", flex: "none" }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(transcript);
                      toast.success("Copied to clipboard");
                    }}
                    style={{
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#0B0B2C",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      fontWeight: 700,
                      padding: "11px 18px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <Copy size={14} style={{ marginRight: "6px", display: "inline" }} />
                    Copy
                  </button>
                  <button
                    style={{
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#0B0B2C",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      fontWeight: 700,
                      padding: "11px 18px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <Download size={14} style={{ marginRight: "6px", display: "inline" }} />
                    Download
                  </button>
                </div>
              </div>

              <div style={{ padding: "20px 28px", fontSize: "15px", lineHeight: 1.75, color: "#69697B", maxHeight: "400px", overflowY: "auto" }}>
                {transcript}
              </div>

              <div style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: "14px", background: "#F8FAFC", fontSize: "13px", lineHeight: 1.6, color: "#69697B" }}>
                <MessageCircle size={16} style={{ flex: "none" }} />
                Transcripts are AI-generated and may contain errors. The module itself is authoritative.
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ padding: "22px 28px", borderBottom: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "18px", fontWeight: 700 }}>Downloads</div>
                <div style={{ marginTop: "5px", fontSize: "13px", color: "#94A3B8" }}>
                  Everything referenced in this module
                </div>
              </div>

              {[
                { kind: "PDF", name: "Workbook", meta: "61 pages" },
                { kind: "DOC", name: "Prompt library", meta: "Living document" },
                { kind: "XLS", name: "Assessment template", meta: "1.2 MB" },
              ].map((resource, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    padding: "20px 28px",
                    borderBottom: "1px solid #F1F4F8",
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    color: "#0B0B2C",
                    textDecoration: "none",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "rgba(52,52,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#3434FF",
                    }}
                  >
                    {resource.kind}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>{resource.name}</div>
                    <div style={{ marginTop: "4px", fontSize: "13px", color: "#94A3B8" }}>{resource.meta}</div>
                  </div>
                  <ChevronRight size={20} style={{ flex: "none", color: "#3434FF" }} />
                </a>
              ))}
            </div>
          )}

          {activeTab === "comments" && (
            <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: "20px", padding: "28px", textAlign: "center" }}>
              <MessageCircle size={32} color="#94A3B8" style={{ margin: "0 auto 16px", opacity: 0.5 }} />
              <div style={{ fontSize: "16px", fontWeight: 700 }}>No comments yet</div>
              <p style={{ marginTop: "8px", color: "#94A3B8" }}>Be the first to share your thoughts on this module</p>
            </div>
          )}

          {activeTab === "notes" && (
            <div style={{ marginTop: "24px" }}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your personal notes here..."
                style={{
                  width: "100%",
                  minHeight: "300px",
                  padding: "20px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "20px",
                  fontFamily: "inherit",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "#0B0B2C",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={() => toast.success("Notes saved")}
                style={{
                  marginTop: "16px",
                  border: "0",
                  borderRadius: "8px",
                  background: "#3434FF",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "12px 24px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2A2AD6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#3434FF")}
              >
                Save notes
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 700 }}>
            In this module
          </div>
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {modules.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: "14px 20px",
                  borderBottom: idx < modules.length - 1 ? "1px solid #f1f4f8" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: item.checked ? "#8ab815" : "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  {item.checked && <Check size={14} color="#ffffff" />}
                </div>
                <div style={{ fontSize: "13px", color: item.checked ? "#69697b" : "#0b0b2c", fontWeight: item.checked ? 500 : 600 }}>
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, bgColor = "#f4fbe4", color = "#8ab815" }: any) {
  return (
    <div style={{ background: bgColor, border: `1px solid ${color === "#8ab815" ? "#d9f09a" : "#e2e8f0"}`, borderRadius: "12px", padding: "16px 18px" }}>
      <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color }}>{label}</div>
      <div style={{ marginTop: "6px", fontSize: "17px", fontWeight: 700, color: "#0b0b2c" }}>{value}</div>
    </div>
  );
}
