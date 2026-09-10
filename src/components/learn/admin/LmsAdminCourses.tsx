import { useState } from "react";

export function LmsAdminCourses() {
  const [selectedCourse, setSelectedCourse] = useState("Microsoft Copilot for EHS");
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
  });

  const courses = [
    "Microsoft Copilot for EHS",
    "AI Fundamentals for Safety Leaders",
    "Safety 4.0 Accelerator",
  ];

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
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
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3434ff"; e.currentTarget.style.color = "#3434ff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#0b0b2c"; }}
        >
          + New course
        </button>
      </div>

      {/* Course Badge */}
      <div style={{ marginBottom: "28px", background: "#f4fbe4", border: "1px solid #d9f09a", borderRadius: "8px", padding: "12px 16px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#8ab815" }}>● Published · 34 learners</div>
      </div>

      {/* Playback & Progression Settings */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", marginBottom: "20px" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Playback & progression</div>
          <div style={{ fontSize: "13px", color: "#69697b", marginTop: "4px" }}>Controls how freely learners can move through a module.</div>
        </div>

        <div style={{ padding: "28px" }}>
          {[
            { key: "preventSkip", label: "Prevent skipping ahead", desc: "Forward navigation stays locked until the current slide has been watched. Back and replay remain open." },
            { key: "autoAdvance", label: "Auto-advance slides", desc: "Modules play through without the learner clicking. Exercise slides always wait." },
          ].map((setting, idx) => (
            <div key={setting.key} style={{ paddingBottom: idx < 2 ? "24px" : 0, marginBottom: idx < 2 ? "24px" : 0, borderBottom: idx < 2 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>{setting.label}</div>
                <div style={{ fontSize: "13px", color: "#69697b", marginTop: "4px" }}>{setting.desc}</div>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "28px",
                  borderRadius: "14px",
                  background: settings[setting.key as keyof typeof settings] ? "#3434ff" : "#e2e8f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                  transition: "all 0.2s ease",
                  flex: "none",
                  marginTop: "2px",
                }}
                onClick={() => toggleSetting(setting.key)}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    transition: "all 0.2s ease",
                    marginLeft: settings[setting.key as keyof typeof settings] ? "22px" : "2px",
                  }}
                />
              </div>
            </div>
          ))}

          {/* Counts as watched at */}
          <div style={{ paddingTop: "24px", marginTop: "24px", borderTop: "1px solid #f1f4f8" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c", marginBottom: "12px" }}>Counts as watched at</div>
            <div style={{ fontSize: "13px", color: "#69697b", marginBottom: "12px" }}>Share of a slide's narration that must play before it is recorded.</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {["80%", "90%", "100%"].map(percent => (
                <button
                  key={percent}
                  onClick={() => setSettings(prev => ({ ...prev, watchPercentage: percent }))}
                  style={{
                    border: settings.watchPercentage === percent ? "none" : "1px solid #e2e8f0",
                    background: settings.watchPercentage === percent ? "#3434ff" : "#ffffff",
                    color: settings.watchPercentage === percent ? "#ffffff" : "#0b0b2c",
                    fontFamily: "inherit",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { if (settings.watchPercentage !== percent) { e.currentTarget.style.borderColor = "#3434ff"; } }}
                  onMouseLeave={(e) => { if (settings.watchPercentage !== percent) { e.currentTarget.style.borderColor = "#e2e8f0"; } }}
                >
                  {percent}
                </button>
              ))}
            </div>
          </div>

          {/* Unlock modules & Resume toggles */}
          <div style={{ paddingTop: "24px", marginTop: "24px", borderTop: "1px solid #f1f4f8" }}>
            {[
              { key: "unlockSequence", label: "Unlock modules in sequence", desc: "A module stays locked until the previous one is complete." },
              { key: "resumeProgress", label: "Resume where they left off", desc: "Return learners to their last unwatched slide." },
            ].map((setting, idx) => (
              <div key={setting.key} style={{ paddingBottom: idx < 2 ? "24px" : 0, marginBottom: idx < 2 ? "24px" : 0, borderBottom: idx < 2 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>{setting.label}</div>
                  <div style={{ fontSize: "13px", color: "#69697b", marginTop: "4px" }}>{setting.desc}</div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "28px",
                    borderRadius: "14px",
                    background: settings[setting.key as keyof typeof settings] ? "#3434ff" : "#e2e8f0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "2px",
                    transition: "all 0.2s ease",
                    flex: "none",
                    marginTop: "2px",
                  }}
                  onClick={() => toggleSetting(setting.key)}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      transition: "all 0.2s ease",
                      marginLeft: settings[setting.key as keyof typeof settings] ? "22px" : "2px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assessment Settings */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Assessment</div>
          <div style={{ fontSize: "13px", color: "#69697b", marginTop: "4px" }}>Applies where an assessment is attached to the course.</div>
        </div>

        <div style={{ padding: "28px" }}>
          {[
            { key: "assessmentRequired", label: "Assessment required", desc: "Learners must pass before the course counts as complete." },
            { key: "requirePractical", label: "Require practical submission", desc: "The 90-day implementation plan is reviewed by an instructor." },
            { key: "allowRetake", label: "Allow a second attempt", desc: "A failed attempt can be retaken once after 24 hours." },
          ].map((setting, idx) => (
            <div key={setting.key} style={{ paddingBottom: idx < 3 ? "24px" : 0, marginBottom: idx < 3 ? "24px" : 0, borderBottom: idx < 3 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>{setting.label}</div>
                <div style={{ fontSize: "13px", color: "#69697b", marginTop: "4px" }}>{setting.desc}</div>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "28px",
                  borderRadius: "14px",
                  background: settings[setting.key as keyof typeof settings] ? "#3434ff" : "#e2e8f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                  transition: "all 0.2s ease",
                  flex: "none",
                  marginTop: "2px",
                }}
                onClick={() => toggleSetting(setting.key)}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    transition: "all 0.2s ease",
                    marginLeft: settings[setting.key as keyof typeof settings] ? "22px" : "2px",
                  }}
                />
              </div>
            </div>
          ))}

          {/* Pass Mark */}
          <div style={{ paddingTop: "24px", marginTop: "24px", borderTop: "1px solid #f1f4f8" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c", marginBottom: "12px" }}>Pass mark</div>
            <div style={{ fontSize: "13px", color: "#69697b", marginBottom: "12px" }}>Minimum score on the knowledge check.</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {["60%", "70%", "80%"].map(percent => (
                <button
                  key={percent}
                  onClick={() => setSettings(prev => ({ ...prev, passMark: percent }))}
                  style={{
                    border: settings.passMark === percent ? "none" : "1px solid #e2e8f0",
                    background: settings.passMark === percent ? "#3434ff" : "#ffffff",
                    color: settings.passMark === percent ? "#ffffff" : "#0b0b2c",
                    fontFamily: "inherit",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { if (settings.passMark !== percent) { e.currentTarget.style.borderColor = "#3434ff"; } }}
                  onMouseLeave={(e) => { if (settings.passMark !== percent) { e.currentTarget.style.borderColor = "#e2e8f0"; } }}
                >
                  {percent}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
