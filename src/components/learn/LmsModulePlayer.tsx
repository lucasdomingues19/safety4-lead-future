import { useState } from "react";
import { Play, Copy, Download, Info, FileText } from "lucide-react";

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
  const [commentCount, setCommentCount] = useState(12);
  const [videoProgress, setVideoProgress] = useState(46);
  const [currentSlide, setCurrentSlide] = useState(6);
  const [totalSlides] = useState(13);

  const loadModules = async () => {
    if (!course) return;
    setLoading(true);
    try {
      // Get modules
      const { data: modulesData } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", course.id)
        .order("position");

      setModules(modulesData || []);

      if (modulesData && modulesData.length > 0) {
        setCurrentModule(modulesData[0]);

        // Get first lesson of first module
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("*")
          .eq("module_id", modulesData[0].id)
          .order("position")
          .limit(1);

        if (lessonsData && lessonsData.length > 0) {
          setCurrentLesson(lessonsData[0]);
          setTranscript(
            "This is a placeholder transcript. In the actual implementation, this would be generated from the video or provided by the instructor. " +
              "The transcript appears here so students can follow along and search for specific topics covered in the module."
          );
        }
      }
    } catch (err) {
      console.error("Error loading modules:", err);
      toast.error("Could not load modules");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 28px", textAlign: "center" }}>
        <div style={{ fontSize: "14px", color: "#69697B" }}>Loading module player...</div>
      </div>
    );
  }

  if (!currentModule || !currentLesson) {
    return (
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 28px", textAlign: "center" }}>
        <div style={{ fontSize: "14px", color: "#69697B" }}>No module selected</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 28px 72px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#69697B", marginBottom: "20px" }}>
        <a href="#" style={{ color: "#3434FF", textDecoration: "none" }}>
          My course
        </a>
        <span style={{ color: "#CBD5E1" }}>/</span>
        <span style={{ fontWeight: 600, color: "#0B0B2C" }}>{currentModule.title}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: "28px", alignItems: "start" }}>
        {/* Main Content */}
        <div>
          {/* Video Player */}
          <div
            style={{
              background: "#0B0B2C",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 18px 40px rgba(11,11,44,0.18)",
            }}
          >
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
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                  opacity: 0.3,
                }}
              ></div>
              <div style={{ position: "relative", textAlign: "center", padding: "32px" }}>
                <div
                  style={{
                    width: "84px",
                    height: "84px",
                    margin: "0 auto",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.28)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Play size={34} color="#fff" fill="#fff" />
                </div>
                <div style={{ marginTop: "22px", fontSize: "20px", fontWeight: 700, color: "#fff" }}>
                  {currentModule.title}
                </div>
                <div style={{ marginTop: "8px", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
                  Video player embedded here
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${slideProgress}%`,
                    background: "#A6E21A",
                    borderRadius: "999px",
                  }}
                ></div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.7)", flex: "none" }}>
                Slide {Math.floor(slideProgress / 10)} / 10
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ marginTop: "24px", display: "flex", gap: "6px", borderBottom: "1px solid #E2E8F0", overflowX: "auto" }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  border: "0",
                  background: "transparent",
                  fontFamily: "inherit",
                  padding: "14px 18px",
                  fontSize: "15px",
                  fontWeight: activeTab === tab ? 700 : 600,
                  color: activeTab === tab ? "#0B0B2C" : "#69697B",
                  borderBottom: activeTab === tab ? "2px solid #3434FF" : "2px solid transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Progress Ring */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: "20px",
              padding: "26px",
              textAlign: "center",
            }}
          >
            <div style={{ position: "relative", width: "132px", height: "132px", margin: "0 auto" }}>
              <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke="#EEF1F6" strokeWidth="9"></circle>
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#3434FF"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${slideProgress * 2.76} ${276 - slideProgress * 2.76}`}
                ></circle>
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.01em" }}>
                  {slideProgress}%
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#69697B" }}>complete</div>
              </div>
            </div>
            <button
              onClick={() => setSlideProgress(Math.min(slideProgress + 10, 100))}
              style={{
                marginTop: "22px",
                width: "100%",
                border: "0",
                borderRadius: "8px",
                background: "#3434FF",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "14px",
                fontWeight: 700,
                padding: "14px 20px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2A2AD6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#3434FF")}
            >
              Mark complete
            </button>
          </div>

          {/* Module List */}
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #E2E8F0", fontSize: "16px", fontWeight: 700 }}>
              Course modules
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {modules.map((mod, i) => (
                <button
                  key={mod.id}
                  onClick={() => setCurrentModule(mod)}
                  style={{
                    width: "100%",
                    border: "0",
                    background: currentModule?.id === mod.id ? "#F1F4FF" : "transparent",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: currentModule?.id === mod.id ? 700 : 600,
                    color: currentModule?.id === mod.id ? "#3434FF" : "#69697B",
                    padding: "12px 20px",
                    textAlign: "left",
                    cursor: "pointer",
                    borderLeft: currentModule?.id === mod.id ? "3px solid #3434FF" : "3px solid transparent",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (currentModule?.id !== mod.id) {
                      e.currentTarget.style.background = "#F8FAFC";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentModule?.id !== mod.id) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {i + 1}. {mod.title}
                </button>
              ))}
            </div>
          </div>

          {/* Bookmarks */}
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "20px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>
              <Bookmark size={18} />
              Your bookmarks
            </div>
            <p style={{ fontSize: "13px", color: "#94A3B8" }}>No bookmarks yet. Click the bookmark icon to save important sections.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color = "#8AB815" }: any) {
  return (
    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px 18px" }}>
      <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: color }}>{label}</div>
      <div style={{ marginTop: "6px", fontSize: "17px", fontWeight: 700, color: "#0B0B2C" }}>{value}</div>
    </div>
  );
}
