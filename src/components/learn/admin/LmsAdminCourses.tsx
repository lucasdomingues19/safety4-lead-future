import { useState } from "react";
import { Plus, Eye, EyeOff, Copy, CheckCircle2, AlertCircle } from "lucide-react";

export function LmsAdminCourses() {
  const [selectedCourse, setSelectedCourse] = useState("Microsoft Copilot for EHS");
  const [newCourseOpen, setNewCourseOpen] = useState(false);
  const [showSyngraphForm, setShowSyngraphForm] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);

  const [settings, setSettings] = useState({
    preventSkip: true,
    autoAdvance: true,
    watchPercentage: "90%",
    unlockSequence: true,
    resumeProgress: false,
    assessmentRequired: true,
    passMark: "70%",
    requirePractical: true,
    allowRetake: true,
    certificateNeedsPass: true,
    recordCPDHours: true,
  });

  const courses = [
    "Microsoft Copilot for EHS",
    "AI Fundamentals for Safety Leaders",
    "Safety 4.0 Accelerator",
  ];

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
  };

  const handleReset = () => {
    // Reset to defaults
  };

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", marginBottom: "200px" }}>
      {/* Course Tabs */}
      <div style={{ marginBottom: "28px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        {courses.map(course => (
          <button
            key={course}
            onClick={() => setSelectedCourse(course)}
            style={{
              border: selectedCourse === course ? "2px solid #3434ff" : "1px solid #e2e8f0",
              background: selectedCourse === course ? "#3434ff" : "#ffffff",
              color: selectedCourse === course ? "#ffffff" : "#0b0b2c",
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
        <button
          onClick={() => setNewCourseOpen(true)}
          style={{
            border: "2px dashed #e2e8f0",
            background: "transparent",
            color: "#0b0b2c",
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: 700,
            borderRadius: "8px",
            padding: "10px 14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3434ff"; e.currentTarget.style.color = "#3434ff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#0b0b2c"; }}
        >
          <Plus size={15} /> New course
        </button>
      </div>

      {/* New Course Modal */}
      {newCourseOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(11,11,44,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", maxWidth: "560px", width: "100%", padding: "32px", boxShadow: "0 30px 60px rgba(11,11,44,0.3)" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815" }}>NEW COURSE</div>
            <h2 style={{ margin: "10px 0 0", fontSize: "26px", fontWeight: 700, color: "#0b0b2c" }}>Choose a course type</h2>
            <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#69697b" }}>This decides how learners enrol and progress. You can't change it after learners join.</p>

            <div style={{ marginTop: "22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <button style={{ textAlign: "left", border: "2px solid #e2e8f0", background: "#ffffff", borderRadius: "16px", padding: "20px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3434ff"; e.currentTarget.style.background = "#f1f4ff"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#ffffff"; }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(52,52,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#3434ff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 16 14"></polyline></svg>
                </div>
                <div style={{ marginTop: "14px", fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Evergreen</div>
                <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.55, color: "#69697b" }}>Self-paced. Learners enrol any time and move at their own speed, gated as you configure.</div>
              </button>
              <button style={{ textAlign: "left", border: "2px solid #e2e8f0", background: "#ffffff", borderRadius: "16px", padding: "20px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8ab815"; e.currentTarget.style.background = "#f4fbe4"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#ffffff"; }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(166,226,26,0.24)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5e7f0f" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9.5" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div style={{ marginTop: "14px", fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Cohort</div>
                <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.55, color: "#69697b" }}>A fixed start date and group of learners move through modules together, with live sessions.</div>
              </button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setNewCourseOpen(false)} style={{ border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#0b0b2c", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, padding: "12px 22px", cursor: "pointer", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>Cancel</button>
              <button style={{ border: "0", borderRadius: "8px", background: "#3434ff", color: "#fff", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, padding: "12px 26px", cursor: "pointer", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2ad6"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#3434ff"; }}>Create course</button>
            </div>
          </div>
        </div>
      )}

      {/* Course Badge */}
      <div style={{ marginBottom: "28px", background: "#f4fbe4", border: "1px solid #d9f09a", borderRadius: "8px", padding: "12px 16px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#8ab815" }}>● Published · 34 learners</div>
      </div>

      {/* Playback & Progression Settings */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", marginBottom: "20px" }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b0b2c" }}>Playback & progression</div>
          <div style={{ marginTop: "5px", fontSize: "14px", color: "#69697b" }}>Controls how freely learners can move through a module.</div>
        </div>

        <div style={{ padding: "22px 28px" }}>
          {[
            { key: "preventSkip", label: "Prevent skipping ahead", desc: "Forward navigation stays locked until the current slide has been watched. Back and replay remain open." },
            { key: "autoAdvance", label: "Auto-advance slides", desc: "Modules play through without the learner clicking. Exercise slides always wait." },
          ].map((setting, idx) => (
            <div key={setting.key} style={{ paddingBottom: "22px", marginBottom: idx < 1 ? "22px" : 0, borderBottom: idx < 1 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>{setting.label}</div>
                <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>{setting.desc}</div>
              </div>
              <div
                style={{
                  width: "46px",
                  height: "26px",
                  borderRadius: "999px",
                  background: settings[setting.key as keyof typeof settings] ? "#3434ff" : "#e2e8f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "3px",
                  transition: "all 0.2s ease",
                  flex: "none",
                  position: "relative",
                }}
                onClick={() => toggleSetting(setting.key)}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    transition: "all 0.2s ease",
                    position: "absolute",
                    top: "3px",
                    left: settings[setting.key as keyof typeof settings] ? "23px" : "3px",
                  }}
                />
              </div>
            </div>
          ))}

          {/* Counts as watched at */}
          <div style={{ paddingTop: "22px", marginTop: "22px", borderTop: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>Counts as watched at</div>
              <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>Share of a slide's narration that must play before it is recorded.</div>
            </div>
            <div style={{ display: "flex", gap: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "4px", flex: "none" }}>
              {["80%", "90%", "100%"].map(percent => (
                <button
                  key={percent}
                  onClick={() => setSettings(prev => ({ ...prev, watchPercentage: percent }))}
                  style={{
                    border: "0",
                    borderRadius: "7px",
                    background: settings.watchPercentage === percent ? "#3434ff" : "transparent",
                    color: settings.watchPercentage === percent ? "#ffffff" : "#0b0b2c",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: 700,
                    padding: "9px 16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {percent}
                </button>
              ))}
            </div>
          </div>

          {/* Unlock modules & Resume toggles */}
          <div style={{ paddingTop: "22px", marginTop: "22px", borderTop: "1px solid #f1f4f8" }}>
            {[
              { key: "unlockSequence", label: "Unlock modules in sequence", desc: "A module stays locked until the previous one is complete." },
              { key: "resumeProgress", label: "Resume where they left off", desc: "Return learners to their last unwatched slide." },
            ].map((setting, idx) => (
              <div key={setting.key} style={{ paddingBottom: "22px", marginBottom: idx < 1 ? "22px" : 0, borderBottom: idx < 1 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>{setting.label}</div>
                  <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>{setting.desc}</div>
                </div>
                <div
                  style={{
                    width: "46px",
                    height: "26px",
                    borderRadius: "999px",
                    background: settings[setting.key as keyof typeof settings] ? "#3434ff" : "#e2e8f0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "3px",
                    transition: "all 0.2s ease",
                    flex: "none",
                    position: "relative",
                  }}
                  onClick={() => toggleSetting(setting.key)}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      transition: "all 0.2s ease",
                      position: "absolute",
                      top: "3px",
                      left: settings[setting.key as keyof typeof settings] ? "23px" : "3px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assessment Settings */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", marginBottom: "20px" }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b0b2c" }}>Assessment</div>
          <div style={{ marginTop: "5px", fontSize: "14px", color: "#69697b" }}>Applies where an assessment is attached to the course.</div>
        </div>

        <div style={{ padding: "22px 28px" }}>
          {[
            { key: "assessmentRequired", label: "Assessment required", desc: "Learners must pass before the course counts as complete." },
            { key: "requirePractical", label: "Require practical submission", desc: "The 90-day implementation plan is reviewed by an instructor." },
            { key: "allowRetake", label: "Allow a second attempt", desc: "A failed attempt can be retaken once after 24 hours." },
          ].map((setting, idx) => (
            <div key={setting.key} style={{ paddingBottom: "22px", marginBottom: idx < 2 ? "22px" : 0, borderBottom: idx < 2 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>{setting.label}</div>
                <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>{setting.desc}</div>
              </div>
              <div
                style={{
                  width: "46px",
                  height: "26px",
                  borderRadius: "999px",
                  background: settings[setting.key as keyof typeof settings] ? "#3434ff" : "#e2e8f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "3px",
                  transition: "all 0.2s ease",
                  flex: "none",
                  position: "relative",
                }}
                onClick={() => toggleSetting(setting.key)}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    transition: "all 0.2s ease",
                    position: "absolute",
                    top: "3px",
                    left: settings[setting.key as keyof typeof settings] ? "23px" : "3px",
                  }}
                />
              </div>
            </div>
          ))}

          {/* Pass Mark */}
          <div style={{ paddingTop: "22px", marginTop: "22px", borderTop: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>Pass mark</div>
              <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>Minimum score on the knowledge check.</div>
            </div>
            <div style={{ display: "flex", gap: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "4px", flex: "none" }}>
              {["60%", "70%", "80%"].map(percent => (
                <button
                  key={percent}
                  onClick={() => setSettings(prev => ({ ...prev, passMark: percent }))}
                  style={{
                    border: "0",
                    borderRadius: "7px",
                    background: settings.passMark === percent ? "#3434ff" : "transparent",
                    color: settings.passMark === percent ? "#ffffff" : "#0b0b2c",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: 700,
                    padding: "9px 16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {percent}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Learners */}
      <div style={{ marginTop: "20px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px 28px", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", marginBottom: "20px" }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b0b2c" }}>Cohort learners</div>
        <div style={{ marginTop: "5px", fontSize: "14px", color: "#69697b" }}>Where learners are dropping off, so you know what to fix.</div>
        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "14px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 18px" }}><div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>ENROLLED</div><div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 800, color: "#0b0b2c" }}>142</div></div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 18px" }}><div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>AVG. PROGRESS</div><div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 800, color: "#0b0b2c" }}>67%</div></div>
          <div style={{ background: "#f4fbe4", border: "1px solid #d9f09a", borderRadius: "12px", padding: "16px 18px" }}><div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#8ab815" }}>CERTIFIED</div><div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 800, color: "#0b0b2c" }}>34</div></div>
          <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "12px", padding: "16px 18px" }}><div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#c93636" }}>AT RISK</div><div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 800, color: "#0b0b2c" }}>12</div></div>
        </div>
        <div style={{ marginTop: "18px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>DROP-OFF BY MODULE</div>
        <div style={{ marginTop: "12px", display: "flex", alignItems: "flex-end", gap: "10px", height: "90px" }}>
          {[60, 45, 38, 28, 15, 8].map((height, idx) => (
            <div key={idx} style={{ flex: 1, background: "#3434ff", borderRadius: "5px 5px 0 0", height: `${height}%` }}></div>
          ))}
        </div>
      </div>

      {/* Certification & CPD */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", marginBottom: "20px" }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b0b2c" }}>Certification & CPD</div>
          <div style={{ marginTop: "5px", fontSize: "14px", color: "#69697b" }}>What a learner has to do before a certificate is issued.</div>
        </div>

        <div style={{ padding: "22px 28px" }}>
          {[
            { key: "certificateNeedsPass", label: "Certificate needs a pass", desc: "Issued only after the assessment is passed. Off means completion alone is enough." },
            { key: "recordCPDHours", label: "Record CPD hours from watch time", desc: "Hours accrue from narration actually played, not slides reached." },
          ].map((setting, idx) => (
            <div key={setting.key} style={{ paddingBottom: "22px", marginBottom: "22px", borderBottom: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>{setting.label}</div>
                <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>{setting.desc}</div>
              </div>
              <div
                style={{
                  width: "46px",
                  height: "26px",
                  borderRadius: "999px",
                  background: settings[setting.key as keyof typeof settings] ? "#3434ff" : "#e2e8f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "3px",
                  transition: "all 0.2s ease",
                  flex: "none",
                  position: "relative",
                }}
                onClick={() => toggleSetting(setting.key)}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    transition: "all 0.2s ease",
                    position: "absolute",
                    top: "3px",
                    left: settings[setting.key as keyof typeof settings] ? "23px" : "3px",
                  }}
                />
              </div>
            </div>
          ))}

          {/* Syngraph AI */}
          <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap", borderBottom: "1px solid #f1f4f8" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#f1f4ff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <CheckCircle2 size={20} color="#3434ff" />
            </div>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>Certificate issuer — Syngraph AI</div>
              <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>Auto-issue certificates instantly when learners finish and meet your conditions.</div>
            </div>
            <button
              onClick={() => setShowSyngraphForm(!showSyngraphForm)}
              style={{
                border: showSyngraphForm ? "none" : "1px solid #e2e8f0",
                borderRadius: "8px",
                background: showSyngraphForm ? "#3434ff" : "#ffffff",
                color: showSyngraphForm ? "#ffffff" : "#0b0b2c",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "11px 18px",
                cursor: "pointer",
                flex: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!showSyngraphForm) {
                  e.currentTarget.style.borderColor = "#3434ff";
                  e.currentTarget.style.color = "#3434ff";
                }
              }}
              onMouseLeave={(e) => {
                if (!showSyngraphForm) {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#0b0b2c";
                }
              }}
            >
              {showSyngraphForm ? "Done" : "Configure"}
            </button>
          </div>

          {showSyngraphForm && (
            <div style={{ padding: "0 28px 24px" }}>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.08em", color: "#94a3b8" }}>API CONNECTION</div>
                <div style={{ marginTop: "14px", fontSize: "12.5px", fontWeight: 700, color: "#69697b" }}>Syngraph AI endpoint URL</div>
                <div style={{ marginTop: "6px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "11px 13px", fontSize: "13.5px", background: "#fff", color: "#69697b" }}>https://api.syngraph.ai/v1/certificates</div>

                <div style={{ marginTop: "14px", fontSize: "12.5px", fontWeight: 700, color: "#69697b" }}>API key</div>
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "8px", padding: "11px 13px", fontSize: "13.5px", background: "#fff", color: "#69697b", fontFamily: "monospace" }}>{keyVisible ? "[Your API key]" : "••••••••••••••••••••••••"}</div>
                  <button
                    onClick={() => setKeyVisible(!keyVisible)}
                    style={{ border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#0b0b2c", fontFamily: "inherit", fontSize: "12px", fontWeight: 700, padding: "11px 14px", cursor: "pointer", flex: "none", transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f4ff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                  >
                    {keyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", lineHeight: 1.6, color: "#94a3b8" }}>Generate this key in Syngraph AI (Settings → API access) and paste it here. It's stored encrypted.</div>

                <div style={{ marginTop: "16px", fontSize: "12.5px", fontWeight: 700, color: "#69697b" }}>Webhook URL</div>
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "8px", padding: "11px 13px", fontSize: "13px", background: "#fff", color: "#69697b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>https://safetytech.academy/api/webhooks/syngraph</div>
                  <button
                    style={{ border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#0b0b2c", fontFamily: "inherit", fontSize: "12px", fontWeight: 700, padding: "11px 14px", cursor: "pointer", flex: "none", transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: "6px" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f4ff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", lineHeight: 1.6, color: "#94a3b8" }}>Add this URL in Syngraph AI's outgoing webhook settings for certificate events.</div>

                <div style={{ marginTop: "18px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    style={{ border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#0b0b2c", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, padding: "11px 18px", cursor: "pointer", transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f4ff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                  >
                    Test connection
                  </button>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#8ab815" }}>✓ Connected</div>
                </div>
              </div>
            </div>
          )}

          {/* Issuance Queue */}
          <div style={{ padding: "0 28px 24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em", color: "#94a3b8", marginTop: "18px" }}>ISSUANCE QUEUE</div>
            <div style={{ marginTop: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
              {[
                { name: "Sarah Chen", course: "Microsoft Copilot for EHS", status: "ISSUED" },
                { name: "Mike Johnson", course: "AI Fundamentals", status: "PENDING" },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: "13px 16px", borderBottom: idx < 1 ? "1px solid #eef1f6" : "none", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "160px" }}><div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0b0b2c" }}>{item.name}</div><div style={{ marginTop: "2px", fontSize: "12px", color: "#94a3b8" }}>{item.course}</div></div>
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: item.status === "ISSUED" ? "#8ab815" : "#3434ff", background: item.status === "ISSUED" ? "#f4fbe4" : "#f1f4ff", borderRadius: "999px", padding: "4px 10px", flex: "none" }}>{item.status}</span>
                  {item.status === "PENDING" && (
                    <button
                      style={{ border: "1px solid #cbd5e1", borderRadius: "7px", background: "#fff", color: "#0b0b2c", fontFamily: "inherit", fontSize: "11.5px", fontWeight: 700, padding: "6px 12px", cursor: "pointer", flex: "none", transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f4ff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "10px", fontSize: "12px", lineHeight: 1.6, color: "#94a3b8" }}>Certificates waiting to be issued to learners by Syngraph AI. Failed attempts can be retried above.</div>
          </div>
        </div>
      </div>

      {/* Save/Reset Footer */}
      <div style={{ marginTop: "24px", background: "#0b0b2c", borderRadius: "20px", padding: "26px 28px", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "space-between", position: "fixed", bottom: 0, left: 0, right: 0, width: "100%", maxWidth: "100%" }}>
        <div style={{ minWidth: "260px", flex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#3434ff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <CheckCircle2 size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>Saved</div>
            <div style={{ marginTop: "6px", fontSize: "14px", color: "rgba(255,255,255,0.55)" }}>Learners already mid-module keep their current rules until they reload.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", flex: "none" }}>
          <button
            onClick={handleReset}
            style={{ border: "1px solid rgba(255,255,255,0.24)", borderRadius: "8px", background: "transparent", color: "#ffffff", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 24px", cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            style={{ border: "0", borderRadius: "8px", background: "#a6e21a", color: "#0b0b2c", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 28px", cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#93cc12"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#a6e21a"; }}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
