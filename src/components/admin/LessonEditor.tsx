import { useState, useEffect } from "react";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Lesson } from "@/lib/lms";
import { VideoUploadForm } from "@/components/learn/VideoUploadForm";

interface LessonEditorProps {
  courseId: string;
  moduleId: string;
  lessonId?: string;
  onSave?: (lesson: Lesson) => void;
  onCancel?: () => void;
}

export const LessonEditor = ({
  courseId,
  moduleId,
  lessonId,
  onSave,
  onCancel,
}: LessonEditorProps) => {
  const [lesson, setLesson] = useState<Partial<Lesson>>({
    title: "",
    description: "",
    video_url: null,
    content: "",
    position: 1,
    is_locked: false,
  });
  const [loading, setLoading] = useState(!!lessonId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    if (!lessonId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (err) throw err;
      setLesson(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load lesson";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!lesson.title?.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        module_id: moduleId,
        title: lesson.title,
        description: lesson.description || null,
        video_url: lesson.video_url || null,
        video_duration_seconds: lesson.video_duration_seconds || null,
        content: lesson.content || null,
        position: lesson.position || 1,
        is_locked: lesson.is_locked || false,
      };

      if (lessonId) {
        // Update
        const { error: err } = await supabase
          .from("lessons")
          .update(payload)
          .eq("id", lessonId);

        if (err) throw err;
        toast.success("Lesson updated");
      } else {
        // Create
        const { data, error: err } = await supabase
          .from("lessons")
          .insert([payload])
          .select()
          .single();

        if (err) throw err;
        setLesson(data);
        toast.success("Lesson created");
      }

      onSave?.(lesson as Lesson);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save lesson";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-white/60">Loading lesson...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onCancel && (
            <button onClick={onCancel} className="text-white/60 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h2 className="text-2xl font-bold text-white">
            {lessonId ? "Edit Lesson" : "New Lesson"}
          </h2>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-500/50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Lesson Title */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Title *</label>
        <Input
          value={lesson.title || ""}
          onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
          placeholder="e.g., Getting Started with AI"
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* Lesson Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Description</label>
        <textarea
          value={lesson.description || ""}
          onChange={(e) => setLesson({ ...lesson, description: e.target.value })}
          placeholder="Brief overview of this lesson"
          rows={3}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Video Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Video</label>
        {lesson.video_url ? (
          <div className="rounded-lg bg-green-900/20 border border-green-500/50 p-4">
            <p className="text-sm text-green-400 mb-2">✓ Video uploaded</p>
            <p className="text-xs text-white/60 break-all">{lesson.video_url}</p>
            <button
              onClick={() => setLesson({ ...lesson, video_url: null })}
              className="mt-2 text-xs text-red-400 hover:text-red-300"
            >
              Remove video
            </button>
          </div>
        ) : (
          <VideoUploadForm
            courseId={courseId}
            lessonId={lessonId || "new"}
            onUploadComplete={(videoUrl) =>
              setLesson({ ...lesson, video_url: videoUrl })
            }
          />
        )}
      </div>

      {/* Rich Content */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Content (HTML)</label>
        <textarea
          value={lesson.content || ""}
          onChange={(e) => setLesson({ ...lesson, content: e.target.value })}
          placeholder="<h2>Lesson content here</h2><p>Can use HTML or plain text</p>"
          rows={6}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-white/40 font-mono text-xs focus:border-primary focus:outline-none"
        />
      </div>

      {/* Position */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Position</label>
        <Input
          type="number"
          min="1"
          value={lesson.position || 1}
          onChange={(e) => setLesson({ ...lesson, position: parseInt(e.target.value) })}
          className="bg-white/5 border-white/10 text-white w-24"
        />
        <p className="text-xs text-white/40">Order of lesson within module</p>
      </div>

      {/* Locked Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_locked"
          checked={lesson.is_locked || false}
          onChange={(e) => setLesson({ ...lesson, is_locked: e.target.checked })}
          className="rounded border-white/20"
        />
        <label htmlFor="is_locked" className="text-sm text-white cursor-pointer">
          Lock lesson (requires certificate or prerequisite)
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="mr-2 h-5 w-5" />
          {saving ? "Saving..." : "Save Lesson"}
        </Button>
      </div>
    </div>
  );
};
