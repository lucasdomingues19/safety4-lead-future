import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Check, AlertCircle } from "lucide-react";
import { formatPrice, type Course } from "@/lib/lms";

interface CourseSettings {
  prevent_skip: boolean;
  auto_advance: boolean;
  watch_percentage: "80" | "90" | "100";
  unlock_sequence: boolean;
  resume_progress: boolean;
  assessment_required: boolean;
  require_practical: boolean;
  allow_retake: boolean;
  pass_mark: "60" | "70" | "80";
  certificate_needed_pass: boolean;
  record_cpd_hours: boolean;
}

interface CourseFormData {
  title: string;
  description: string;
  price_cents: number;
  currency: "gbp" | "usd" | "eur";
  cpd_hours: number;
  cover_image_url: string;
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

const defaultFormData: CourseFormData = {
  title: "",
  description: "",
  price_cents: 0,
  currency: "gbp",
  cpd_hours: 0,
  cover_image_url: "",
};

export function LmsAdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [settings, setSettings] = useState<CourseSettings>(defaultSettings);
  const [formData, setFormData] = useState<CourseFormData>(defaultFormData);
  const [hasChanges, setHasChanges] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      const coursesData = (data as Course[]) || [];
      setCourses(coursesData);
      if (coursesData.length > 0 && !selectedCourseId) {
        selectCourse(coursesData[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const selectCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setSelectedCourseId(courseId);
      setSettings((course as any).playback_settings || defaultSettings);
      setHasChanges(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // ===== CREATE/EDIT COURSE =====
  const handleCreateCourse = async () => {
    if (!formData.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .insert([
          {
            ...formData,
            slug: formData.title.toLowerCase().replace(/\s+/g, "-"),
            playback_settings: defaultSettings,
            published: false,
          },
        ])
        .select();

      if (error) throw error;
      if (data) {
        setCourses([data[0] as Course, ...courses]);
        selectCourse(data[0].id);
        setFormData(defaultFormData);
        setCreateModalOpen(false);
        toast.success("Course created successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create course");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCourse = async () => {
    if (!selectedCourse || !formData.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update(formData)
        .eq("id", selectedCourse.id);

      if (error) throw error;
      setCourses(
        courses.map((c) =>
          c.id === selectedCourse.id ? { ...c, ...formData } : c,
        ),
      );
      setEditingId(null);
      toast.success("Course updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    if (!confirm("Are you sure you want to delete this course? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase.from("courses").delete().eq("id", selectedCourse.id);

      if (error) throw error;
      setCourses(courses.filter((c) => c.id !== selectedCourse.id));
      if (courses.length > 1) {
        selectCourse(courses[0].id === selectedCourse.id ? courses[1].id : courses[0].id);
      } else {
        setSelectedCourseId(null);
      }
      toast.success("Course deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete course");
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!selectedCourse) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({ published: !selectedCourse.published })
        .eq("id", selectedCourse.id);

      if (error) throw error;
      const updated = { ...selectedCourse, published: !selectedCourse.published };
      setCourses(courses.map((c) => (c.id === selectedCourse.id ? updated : c)));
      setSelectedCourseId(updated.id);
      toast.success(updated.published ? "Course published!" : "Course unpublished!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  // ===== SETTINGS =====
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

  const handleSaveSettings = async () => {
    if (!selectedCourse) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({ playback_settings: settings })
        .eq("id", selectedCourse.id);

      if (error) throw error;
      setCourses(
        courses.map((c) =>
          c.id === selectedCourse.id ? { ...c, playback_settings: settings } : c,
        ),
      );
      setHasChanges(false);
      toast.success("Settings saved!");
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
            onClick={() => selectCourse(course.id)}
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
          onClick={() => {
            setFormData(defaultFormData);
            setCreateModalOpen(true);
          }}
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

      {/* Create/Edit Course Modal */}
      {(createModalOpen || editingId) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(11,11,44,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", maxWidth: "560px", width: "100%", padding: "32px", boxShadow: "0 30px 60px rgba(11,11,44,0.3)" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815" }}>
              {editingId ? "EDIT COURSE" : "NEW COURSE"}
            </div>
            <h2 style={{ margin: "10px 0 0", fontSize: "26px", fontWeight: 700, color: "#0b0b2c" }}>
              {editingId ? "Edit course details" : "Create a new course"}
            </h2>

            <div style={{ marginTop: "22px", display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0b0b2c", marginBottom: "6px" }}>
                  Course title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Safety Fundamentals"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "11px 13px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0b0b2c", marginBottom: "6px" }}>
                  Description
                </label>
                <textarea
                  placeholder="Course overview..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "11px 13px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0b0b2c", marginBottom: "6px" }}>
                    Price (£)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.price_cents / 100}
                    onChange={(e) => setFormData({ ...formData, price_cents: Math.round(parseFloat(e.target.value) * 100) })}
                    style={{
                      width: "100%",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "11px 13px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0b0b2c", marginBottom: "6px" }}>
                    CPD Hours
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.cpd_hours}
                    onChange={(e) => setFormData({ ...formData, cpd_hours: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: "100%",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "11px 13px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0b0b2c", marginBottom: "6px" }}>
                  Cover image URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "11px 13px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditingId(null);
                }}
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#0b0b2c",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "12px 22px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                }}
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleEditCourse : handleCreateCourse}
                disabled={saving}
                style={{
                  border: "0",
                  borderRadius: "8px",
                  background: "#3434ff",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "12px 26px",
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: saving ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.background = "#2a2ad6";
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.currentTarget.style.background = "#3434ff";
                }}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" style={{ display: "inline" }} />}
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCourse && (
        <>
          {/* Course Badge & Actions */}
          <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div
              style={{
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

            <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
              <button
                onClick={handleTogglePublish}
                disabled={saving}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#0b0b2c",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "10px 16px",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {selectedCourse.published ? <Eye size={14} /> : <EyeOff size={14} />}
                {selectedCourse.published ? "Published" : "Draft"}
              </button>

              <button
                onClick={() => {
                  setFormData({
                    title: selectedCourse.title,
                    description: selectedCourse.description || "",
                    price_cents: selectedCourse.price_cents || 0,
                    currency: (selectedCourse.currency || "gbp") as "gbp" | "usd" | "eur",
                    cpd_hours: selectedCourse.cpd_hours || 0,
                    cover_image_url: selectedCourse.cover_image_url || "",
                  });
                  setEditingId(selectedCourse.id);
                }}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#0b0b2c",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "10px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Edit2 size={14} /> Edit
              </button>

              <button
                onClick={handleDeleteCourse}
                disabled={deleting}
                style={{
                  border: "1px solid #fcd4d4",
                  borderRadius: "8px",
                  background: "#fff5f5",
                  color: "#c93636",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "10px 16px",
                  cursor: deleting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
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
                  {hasChanges ? "Unsaved changes" : "All settings saved"}
                </div>
                <div style={{ marginTop: "6px", fontSize: "14px", color: "rgba(255,255,255,0.55)" }}>
                  {hasChanges ? "Your changes to playback, assessment, and certification settings have not been saved yet." : "All your course settings are up to date."}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", flex: "none" }}>
              <button
                onClick={() => {
                  setSettings(defaultSettings);
                  setHasChanges(false);
                }}
                disabled={!hasChanges}
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
                  cursor: !hasChanges ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: !hasChanges ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (hasChanges) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  if (hasChanges) e.currentTarget.style.background = "transparent";
                }}
              >
                Reset
              </button>
              <button
                onClick={handleSaveSettings}
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
