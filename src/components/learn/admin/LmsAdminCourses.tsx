import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Eye, EyeOff, Save, X, Check } from "lucide-react";
import { formatPrice, type Course } from "@/lib/lms";

interface CourseSettings {
  // Playback & progression
  prevent_skip: boolean;
  auto_advance: boolean;
  watch_percentage: "80" | "90" | "100";
  unlock_sequence: boolean;
  resume_progress: boolean;

  // Assessment
  assessment_required: boolean;
  require_practical: boolean;
  allow_retake: boolean;
  pass_mark: "60" | "70" | "80";

  // Certification
  certificate_needed_pass: boolean;
  record_cpd_hours: boolean;
}

const defaultSettings: CourseSettings = {
  prevent_skip: true,
  auto_advance: true,
  watch_percentage: "90",
  unlock_sequence: true,
  resume_progress: false,
  assessment_required: true,
  require_practical: true,
  allow_retake: true,
  pass_mark: "70",
  certificate_needed_pass: true,
  record_cpd_hours: true,
};

export function LmsAdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [settings, setSettings] = useState<CourseSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses((data as Course[]) || []);
      if (data && data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const toggleSetting = (key: keyof CourseSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const updatePercentage = (value: "80" | "90" | "100") => {
    setSettings((prev) => ({ ...prev, watch_percentage: value }));
    setHasChanges(true);
  };

  const updatePassMark = (value: "60" | "70" | "80") => {
    setSettings((prev) => ({ ...prev, pass_mark: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedCourse) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          playback_settings: settings,
        })
        .eq("id", selectedCourse.id);

      if (error) throw error;
      toast.success("Course settings saved");
      setHasChanges(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#3434ff]" />
      </div>
    );
  }

  return (
    <div style={{ marginTop: "28px", marginBottom: "200px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Course Tabs */}
      <div style={{ marginBottom: "28px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => {
              setSelectedCourseId(course.id);
              setSettings(defaultSettings);
              setHasChanges(false);
            }}
            style={{
              border: selectedCourseId === course.id ? "2px solid #3434ff" : "1px solid #e2e8f0",
              background: selectedCourseId === course.id ? "#3434ff" : "#ffffff",
              color: selectedCourseId === course.id ? "#ffffff" : "#0b0b2c",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: "8px",
              padding: "10px 14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (selectedCourseId !== course.id) {
                e.currentTarget.style.borderColor = "#3434ff";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCourseId !== course.id) {
                e.currentTarget.style.borderColor = "#e2e8f0";
              }
            }}
          >
            {course.title}
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
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3434ff";
            e.currentTarget.style.color = "#3434ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.color = "#0b0b2c";
          }}
        >
          <Plus size={15} /> New course
        </button>
      </div>

      {selectedCourse && (
        <>
          {/* Course Badge */}
          <div
            style={{
              marginBottom: "28px",
              background: "#f4fbe4",
              border: "1px solid #d9f09a",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#8ab815" }}>
              ● {selectedCourse.published ? "Published" : "Draft"} · {formatPrice(selectedCourse.price_cents || 0, selectedCourse.currency)}
            </div>
          </div>

          {/* Playback & Progression Settings */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(11,11,44,0.06)",
              marginBottom: "20px",
            }}
          >
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b0b2c" }}>Playback & progression</div>
              <div style={{ marginTop: "5px", fontSize: "14px", color: "#69697b" }}>
                Controls how freely learners can move through a module.
              </div>
            </div>

            <div style={{ padding: "22px 28px" }}>
              {[
                { key: "prevent_skip", label: "Prevent skipping ahead", desc: "Forward navigation stays locked until the current slide has been watched." },
                { key: "auto_advance", label: "Auto-advance slides", desc: "Modules play through without the learner clicking." },
              ].map((setting, idx) => (
                <div
                  key={setting.key}
                  style={{
                    paddingBottom: "22px",
                    marginBottom: idx < 1 ? "22px" : 0,
                    borderBottom: idx < 1 ? "1px solid #f1f4f8" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>{setting.label}</div>
                    <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>{setting.desc}</div>
                  </div>
                  <ToggleSwitch
                    checked={settings[setting.key as keyof CourseSettings] as boolean}
                    onChange={() => toggleSetting(setting.key as keyof CourseSettings)}
                  />
                </div>
              ))}

              {/* Watch Percentage */}
              <div style={{ paddingTop: "22px", marginTop: "22px", borderTop: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>Counts as watched at</div>
                  <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>
                    Share of a slide's narration that must play before it is recorded.
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "4px", flex: "none" }}>
                  {["80", "90", "100"].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => updatePercentage(percent as "80" | "90" | "100")}
                      style={{
                        border: "0",
                        borderRadius: "7px",
                        background: settings.watch_percentage === percent ? "#3434ff" : "transparent",
                        color: settings.watch_percentage === percent ? "#ffffff" : "#0b0b2c",
                        fontFamily: "inherit",
                        fontSize: "14px",
                        fontWeight: 700,
                        padding: "9px 16px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Unlock & Resume */}
              <div style={{ paddingTop: "22px", marginTop: "22px", borderTop: "1px solid #f1f4f8" }}>
                {[
                  { key: "unlock_sequence", label: "Unlock modules in sequence", desc: "A module stays locked until the previous one is complete." },
                  { key: "resume_progress", label: "Resume where they left off", desc: "Return learners to their last unwatched slide." },
                ].map((setting, idx) => (
                  <div
                    key={setting.key}
                    style={{
                      paddingBottom: "22px",
                      marginBottom: idx < 1 ? "22px" : 0,
                      borderBottom: idx < 1 ? "1px solid #f1f4f8" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>{setting.label}</div>
                      <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>{setting.desc}</div>
                    </div>
                    <ToggleSwitch
                      checked={settings[setting.key as keyof CourseSettings] as boolean}
                      onChange={() => toggleSetting(setting.key as keyof CourseSettings)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assessment Settings */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(11,11,44,0.06)",
              marginBottom: "20px",
            }}
          >
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b0b2c" }}>Assessment</div>
              <div style={{ marginTop: "5px", fontSize: "14px", color: "#69697b" }}>
                Applies where an assessment is attached to the course.
              </div>
            </div>

            <div style={{ padding: "22px 28px" }}>
              {[
                { key: "assessment_required", label: "Assessment required", desc: "Learners must pass before the course counts as complete." },
                { key: "require_practical", label: "Require practical submission", desc: "The 90-day implementation plan is reviewed by an instructor." },
                { key: "allow_retake", label: "Allow a second attempt", desc: "A failed attempt can be retaken once after 24 hours." },
              ].map((setting, idx) => (
                <div
                  key={setting.key}
                  style={{
                    paddingBottom: "22px",
                    marginBottom: idx < 2 ? "22px" : 0,
                    borderBottom: idx < 2 ? "1px solid #f1f4f8" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>{setting.label}</div>
                    <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>{setting.desc}</div>
                  </div>
                  <ToggleSwitch
                    checked={settings[setting.key as keyof CourseSettings] as boolean}
                    onChange={() => toggleSetting(setting.key as keyof CourseSettings)}
                  />
                </div>
              ))}

              {/* Pass Mark */}
              <div style={{ paddingTop: "22px", marginTop: "22px", borderTop: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>Pass mark</div>
                  <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>
                    Minimum score on the knowledge check.
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "4px", flex: "none" }}>
                  {["60", "70", "80"].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => updatePassMark(percent as "60" | "70" | "80")}
                      style={{
                        border: "0",
                        borderRadius: "7px",
                        background: settings.pass_mark === percent ? "#3434ff" : "transparent",
                        color: settings.pass_mark === percent ? "#ffffff" : "#0b0b2c",
                        fontFamily: "inherit",
                        fontSize: "14px",
                        fontWeight: 700,
                        padding: "9px 16px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Certification & CPD */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(11,11,44,0.06)",
              marginBottom: "20px",
            }}
          >
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b0b2c" }}>Certification & CPD</div>
              <div style={{ marginTop: "5px", fontSize: "14px", color: "#69697b" }}>
                What a learner has to do before a certificate is issued.
              </div>
            </div>

            <div style={{ padding: "22px 28px" }}>
              {[
                { key: "certificate_needed_pass", label: "Certificate needs a pass", desc: "Issued only after the assessment is passed." },
                { key: "record_cpd_hours", label: "Record CPD hours from watch time", desc: "Hours accrue from narration actually played." },
              ].map((setting, idx) => (
                <div
                  key={setting.key}
                  style={{
                    paddingBottom: "22px",
                    marginBottom: "22px",
                    borderBottom: "1px solid #f1f4f8",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#0b0b2c" }}>{setting.label}</div>
                    <div style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>{setting.desc}</div>
                  </div>
                  <ToggleSwitch
                    checked={settings[setting.key as keyof CourseSettings] as boolean}
                    onChange={() => toggleSetting(setting.key as keyof CourseSettings)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save/Reset Footer */}
          <div
            style={{
              marginTop: "24px",
              background: "#0b0b2c",
              borderRadius: "20px",
              padding: "26px 28px",
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              alignItems: "center",
              justifyContent: "space-between",
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <div style={{ minWidth: "260px", flex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: hasChanges ? "#3434ff" : "#8ab815", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                {hasChanges ? "⚙️" : <Check size={18} color="#ffffff" />}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  {hasChanges ? "Unsaved changes" : "Saved"}
                </div>
                <div style={{ marginTop: "6px", fontSize: "14px", color: "rgba(255,255,255,0.55)" }}>
                  {hasChanges ? "Your changes have not been saved yet." : "All settings are up to date."}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", flex: "none" }}>
              <button
                onClick={() => {
                  setSettings(defaultSettings);
                  setHasChanges(false);
                }}
                style={{
                  border: "1px solid rgba(255,255,255,0.24)",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "#ffffff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "14px 24px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                style={{
                  border: "0",
                  borderRadius: "8px",
                  background: hasChanges ? "#a6e21a" : "#666666",
                  color: "#0b0b2c",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "14px 28px",
                  cursor: hasChanges && !saving ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  opacity: hasChanges ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (hasChanges && !saving) {
                    e.currentTarget.style.background = "#93cc12";
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasChanges && !saving) {
                    e.currentTarget.style.background = "#a6e21a";
                  }
                }}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" style={{ display: "inline" }} />}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: "46px",
        height: "26px",
        borderRadius: "999px",
        background: checked ? "#3434ff" : "#e2e8f0",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: "3px",
        transition: "all 0.2s ease",
        flex: "none",
        position: "relative",
      }}
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
          left: checked ? "23px" : "3px",
        }}
      />
    </div>
  );
}
