import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, ArrowLeft, BookOpen, Sun, Moon, Wand2, Film, Presentation, FileText, Captions, Paperclip, Upload, Link as LinkIcon } from "lucide-react";
import { asLessons, asQuizQuestions, type Course, type Module, type Lesson, type LessonMediaKind, type LessonResource, type Quiz, type QuizQuestion } from "@/lib/lms";
import { uploadLessonFile, deleteLessonFile, getMediaStorageStatus, formatBytes } from "@/lib/lessonMedia";
import type { Json } from "@/integrations/supabase/types";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAdminTheme } from "@/hooks/useAdminTheme";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const CourseManager = () => {
  const navigate = useNavigate();
  const { checking, isAdmin } = useAdminGuard();
  const { theme, toggleTheme } = useAdminTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);

  useEffect(() => {
    if (isAdmin) loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at");
    setCourses((data ?? []) as Course[]);
  };

  const createCourse = async () => {
    const title = "Untitled course";
    const { data, error } = await supabase
      .from("courses")
      .insert({ title, slug: `course-${Date.now()}` })
      .select()
      .single();
    if (error) {
      toast.error("Could not create course");
      return;
    }
    await loadCourses();
    setSelected(data as Course);
  };

  if (checking) {
    return (
      <div className={`${theme === "light" ? "admin-light-theme" : "dark"} flex min-h-screen items-center justify-center bg-white dark:bg-slate-900`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`${theme === "light" ? "admin-light-theme" : "dark"} min-h-screen bg-white dark:bg-slate-900`}>
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back to admin
          </button>
          <div className="flex items-center gap-3">
            <h1 className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
              <BookOpen className="h-5 w-5 text-primary" /> Course Manager
            </h1>
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="icon"
              className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-label="Toggle light/dark appearance"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[280px_1fr]">
        {/* Course list */}
        <aside>
          <Button className="mb-4 w-full" onClick={createCourse}>
            <Plus className="mr-2 h-4 w-4" /> New course
          </Button>
          <div className="space-y-1">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                  selected?.id === c.id ? "bg-primary/15 text-slate-900 dark:text-slate-50" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate">{c.title}</span>
                {!c.published && <span className="text-xs text-slate-400 dark:text-slate-500">draft</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* Editor */}
        <main>
          {selected ? (
            <CourseEditor
              key={selected.id}
              course={selected}
              onChange={loadCourses}
              onDeleted={() => {
                setSelected(null);
                loadCourses();
              }}
            />
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Select a course or create a new one to start.</p>
          )}
        </main>
      </div>
    </div>
  );
};

// ---------- Course editor ----------
const CourseEditor = ({
  course,
  onChange,
  onDeleted,
}: {
  course: Course;
  onChange: () => void;
  onDeleted: () => void;
}) => {
  const [form, setForm] = useState(course);
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    loadModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);

  const loadModules = async () => {
    const { data } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", course.id)
      .order("position");
    setModules((data ?? []) as Module[]);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("courses")
      .update({
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description,
        cover_image_url: form.cover_image_url,
        price_cents: form.price_cents,
        currency: form.currency,
        cpd_hours: form.cpd_hours,
        published: form.published,
      })
      .eq("id", course.id);
    setSaving(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Slug already in use" : "Save failed");
      return;
    }
    toast.success("Course saved");
    onChange();
  };

  const remove = async () => {
    if (!confirm("Delete this course and all its content?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", course.id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Course deleted");
    onDeleted();
  };

  const addModule = async () => {
    const { error } = await supabase.from("modules").insert({
      course_id: course.id,
      title: `Module ${modules.length + 1}`,
      position: modules.length,
    });
    if (error) {
      toast.error("Add module failed");
      return;
    }
    loadModules();
  };

  return (
    <div className="space-y-8">
      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">Course details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                onBlur={() => !form.slug && setForm((f) => ({ ...f, slug: slugify(f.title) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (URL)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cover image URL</Label>
            <Input
              value={form.cover_image_url ?? ""}
              onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Price (0 = free)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.price_cents ? form.price_cents / 100 : 0}
                onChange={(e) => setForm({ ...form, price_cents: Math.max(0, Math.round(Number(e.target.value || 0) * 100)) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <select
                value={(form.currency || "GBP").toUpperCase()}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>CPD hours</Label>
              <Input
                type="number"
                value={form.cpd_hours ?? ""}
                onChange={(e) =>
                  setForm({ ...form, cpd_hours: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.published}
              onCheckedChange={(v) => setForm({ ...form, published: v })}
            />
            <Label>Published (visible in catalogue)</Label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
            <Button variant="destructive" onClick={remove}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900 dark:text-slate-50">Modules & lessons</CardTitle>
          <Button size="sm" onClick={addModule}>
            <Plus className="mr-2 h-4 w-4" /> Add module
          </Button>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No modules yet.</p>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {modules.map((m) => (
                <ModuleEditor key={m.id} module={m} onChange={loadModules} />
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Module editor ----------
const ModuleEditor = ({ module, onChange }: { module: Module; onChange: () => void }) => {
  const [form, setForm] = useState(module);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    loadLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.id]);

  const loadLessons = async () => {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("module_id", module.id)
      .order("position");
    setLessons(asLessons(data));
  };

  const saveModule = async () => {
    const { error } = await supabase
      .from("modules")
      .update({
        title: form.title,
        description: form.description,
        drip_days: form.drip_days,
        position: form.position,
      })
      .eq("id", module.id);
    if (error) {
      toast.error("Save failed");
      return;
    }
    toast.success("Module saved");
    onChange();
  };

  const removeModule = async () => {
    if (!confirm("Delete this module?")) return;
    const { error } = await supabase.from("modules").delete().eq("id", module.id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    onChange();
  };

  const addLesson = async () => {
    const { error } = await supabase.from("lessons").insert({
      module_id: module.id,
      title: `Lesson ${lessons.length + 1}`,
      position: lessons.length,
    });
    if (error) {
      toast.error("Add lesson failed");
      return;
    }
    loadLessons();
  };

  return (
    <AccordionItem value={module.id} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3">
      <AccordionTrigger className="text-slate-900 dark:text-slate-50 hover:no-underline">{form.title}</AccordionTrigger>
      <AccordionContent className="space-y-4 pb-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Module title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Input
                type="number"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Drip (days)</Label>
              <Input
                type="number"
                value={form.drip_days}
                onChange={(e) => setForm({ ...form, drip_days: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            rows={2}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={saveModule}><Save className="mr-2 h-4 w-4" /> Save module</Button>
          <Button size="sm" variant="destructive" onClick={removeModule}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Lessons</span>
            <Button size="sm" variant="outline" onClick={addLesson}>
              <Plus className="mr-2 h-4 w-4" /> Add lesson
            </Button>
          </div>
          <div className="space-y-3">
            {lessons.map((l) => (
              <LessonEditor key={l.id} lesson={l} onChange={loadLessons} />
            ))}
          </div>
        </div>

        <QuizEditor moduleId={module.id} />
      </AccordionContent>
    </AccordionItem>
  );
};

// ---------- Lesson editor ----------
let storageStatusPromise: ReturnType<typeof getMediaStorageStatus> | null = null;
const useStorageStatus = () => {
  const [s3Configured, setS3Configured] = useState<boolean | null>(null);
  useEffect(() => {
    storageStatusPromise ??= getMediaStorageStatus();
    storageStatusPromise.then((s) => setS3Configured(s.s3_configured)).catch(() => setS3Configured(false));
  }, []);
  return s3Configured;
};

const MAIN_ACCEPT = {
  video: "video/mp4,video/webm,video/quicktime,.mp4,.m4v,.webm,.mov",
  slides: ".pdf,.ppt,.pptx,application/pdf",
  document: ".pdf,.doc,.docx,.xls,.xlsx,application/pdf",
};

const UploadProgress = ({ label, percent }: { label: string; percent: number }) => (
  <div className="mt-2 space-y-1">
    <div className="flex justify-between text-xs text-slate-500"><span>{label}</span><span>{percent}%</span></div>
    <div className="h-1.5 overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
      <div className="h-full bg-[#3434ff] transition-all" style={{ width: `${percent}%` }} />
    </div>
  </div>
);

const LessonEditor = ({ lesson, onChange }: { lesson: Lesson; onChange: () => void }) => {
  const [form, setForm] = useState(lesson);
  const [resources, setResources] = useState<LessonResource[]>(lesson.resources ?? []);
  const [generatingTranscript, setGeneratingTranscript] = useState(false);
  const [uploading, setUploading] = useState<{ label: string; percent: number } | null>(null);
  const s3Configured = useStorageStatus();

  /** Persist media columns straight away so an upload is never lost to a forgotten Save. */
  type MediaPatch = Partial<Pick<Lesson, "media_kind" | "media_path" | "media_name" | "media_mime" | "media_size" | "captions_path">>;
  const patchLesson = async (patch: MediaPatch) => {
    const { error } = await supabase.from("lessons").update(patch).eq("id", lesson.id);
    if (error) throw error;
    setForm((f) => ({ ...f, ...patch }));
  };

  const pickFile = (accept: string, handler: (file: File) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => { const f = input.files?.[0]; if (f) handler(f); };
    input.click();
  };

  const uploadMain = (kind: LessonMediaKind) =>
    pickFile(MAIN_ACCEPT[kind], async (file) => {
      setUploading({ label: `Uploading ${file.name}`, percent: 0 });
      try {
        const res = await uploadLessonFile(lesson.id, file, "media", (percent) => setUploading({ label: `Uploading ${file.name}`, percent }));
        const oldPaths = [form.media_path, kind !== "video" ? form.captions_path : null].filter(Boolean) as string[];
        await patchLesson({
          media_kind: kind, media_path: res.path, media_name: res.name, media_mime: res.mime, media_size: res.size,
          ...(kind !== "video" ? { captions_path: null } : {}),
        });
        await Promise.all(oldPaths.map((p) => deleteLessonFile(p).catch(() => undefined)));
        toast.success(`${kind === "video" ? "Video" : kind === "slides" ? "Slides" : "Document"} uploaded`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(null);
      }
    });

  const removeMain = async () => {
    if (!form.media_path || !confirm(`Remove ${form.media_name ?? "this file"} from the lesson?`)) return;
    const old = [form.media_path, form.captions_path].filter(Boolean) as string[];
    try {
      await patchLesson({ media_kind: null, media_path: null, media_name: null, media_mime: null, media_size: null, captions_path: null });
      await Promise.all(old.map((p) => deleteLessonFile(p).catch(() => undefined)));
      toast.success("File removed");
    } catch {
      toast.error("Could not remove the file");
    }
  };

  const uploadCaptions = () =>
    pickFile(".vtt,.srt,text/vtt", async (file) => {
      setUploading({ label: `Uploading ${file.name}`, percent: 0 });
      try {
        const res = await uploadLessonFile(lesson.id, file, "captions", (percent) => setUploading({ label: `Uploading ${file.name}`, percent }));
        const old = form.captions_path;
        await patchLesson({ captions_path: res.path });
        if (old) await deleteLessonFile(old).catch(() => undefined);
        toast.success("Captions uploaded");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(null);
      }
    });

  const removeCaptions = async () => {
    if (!form.captions_path) return;
    const old = form.captions_path;
    try {
      await patchLesson({ captions_path: null });
      await deleteLessonFile(old).catch(() => undefined);
    } catch {
      toast.error("Could not remove captions");
    }
  };

  const saveResources = async (next: LessonResource[]) => {
    const { error } = await supabase.from("lessons").update({ resources: next as unknown as Json }).eq("id", lesson.id);
    if (error) throw error;
    setResources(next);
  };

  const uploadResource = () =>
    pickFile("*/*", async (file) => {
      setUploading({ label: `Uploading ${file.name}`, percent: 0 });
      try {
        const res = await uploadLessonFile(lesson.id, file, "resource", (percent) => setUploading({ label: `Uploading ${file.name}`, percent }));
        await saveResources([...resources, { label: file.name.replace(/\.[^.]+$/, ""), path: res.path, name: res.name }]);
        toast.success("Resource added");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(null);
      }
    });

  const removeResource = async (i: number) => {
    const r = resources[i];
    try {
      await saveResources(resources.filter((_, j) => j !== i));
      if (r.path) await deleteLessonFile(r.path).catch(() => undefined);
    } catch {
      toast.error("Could not remove resource");
    }
  };

  const generateTranscript = async () => {
    if (!form.video_url) {
      toast.error("Add a video URL first");
      return;
    }
    setGeneratingTranscript(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-transcript", {
        body: { videoUrl: form.video_url },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForm((f) => ({ ...f, transcript: data.transcript }));
      const { error: saveErr } = await supabase
        .from("lessons")
        .update({ transcript: data.transcript })
        .eq("id", lesson.id);
      if (saveErr) throw saveErr;
      toast.success(`Transcript generated (${data.source === "youtube_captions" ? "YouTube captions" : "Whisper"})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transcript generation failed");
    } finally {
      setGeneratingTranscript(false);
    }
  };

  const save = async () => {
    const cleaned = resources
      .map((r) => ({ ...r, label: r.label.trim(), url: r.url?.trim() }))
      .filter((r) => r.label && (r.path || r.url))
      .map((r) => (r.path ? { label: r.label, path: r.path, name: r.name } : { label: r.label, url: r.url }));
    const { error } = await supabase
      .from("lessons")
      .update({
        title: form.title,
        position: form.position,
        video_url: form.video_url?.trim() || null,
        body: form.body,
        transcript: form.transcript,
        duration_minutes: form.duration_minutes,
        media_kind: form.media_kind,
        resources: cleaned as unknown as Json,
      })
      .eq("id", lesson.id);
    if (error) {
      toast.error("Save failed");
      return;
    }
    toast.success("Lesson saved");
    onChange();
  };

  const remove = async () => {
    if (!confirm("Delete this lesson?")) return;
    const files = [form.media_path, form.captions_path, ...resources.map((r) => r.path)].filter(Boolean) as string[];
    const { error } = await supabase.from("lessons").delete().eq("id", lesson.id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    await Promise.all(files.map((p) => deleteLessonFile(p).catch(() => undefined)));
    onChange();
  };

  const busy = !!uploading;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
      <div className="grid gap-3 md:grid-cols-[1fr_100px_100px]">
        <div className="space-y-1.5">
          <Label className="text-xs">Lesson title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Position</Label>
          <Input
            type="number"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Mins</Label>
          <Input
            type="number"
            value={form.duration_minutes ?? ""}
            onChange={(e) =>
              setForm({ ...form, duration_minutes: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>
      </div>

      {/* Main content */}
      <div className="mt-3 space-y-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
        <Label className="text-xs">Lesson content</Label>
        {form.media_path ? (
          <div className="flex flex-wrap items-center gap-3 rounded-md bg-slate-50 dark:bg-slate-800 p-2.5">
            {form.media_kind === "video" ? <Film className="h-5 w-5 text-[#3434ff]" /> : form.media_kind === "slides" ? <Presentation className="h-5 w-5 text-[#3434ff]" /> : <FileText className="h-5 w-5 text-[#3434ff]" />}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{form.media_name}</div>
              <div className="text-xs text-slate-500">{formatBytes(form.media_size)} · {form.media_path.startsWith("s3:") ? "AWS S3" : "Supabase Storage"}</div>
            </div>
            {form.media_kind !== "video" && (
              <select
                value={form.media_kind ?? "slides"}
                onChange={(e) => setForm({ ...form, media_kind: e.target.value as LessonMediaKind })}
                className="h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs"
                title="How learners see this file (saved with the lesson)"
              >
                <option value="slides">Show as slides</option>
                <option value="document">Show as document</option>
              </select>
            )}
            <Button size="sm" variant="outline" disabled={busy} onClick={() => uploadMain(form.media_kind ?? "video")}>Replace</Button>
            <Button size="sm" variant="ghost" className="text-destructive" disabled={busy} onClick={removeMain}>Remove</Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => uploadMain("video")}><Film className="mr-2 h-4 w-4" /> Upload video</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => uploadMain("slides")}><Presentation className="mr-2 h-4 w-4" /> Upload slides (PDF / PPTX)</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => uploadMain("document")}><FileText className="mr-2 h-4 w-4" /> Upload document</Button>
          </div>
        )}
        {s3Configured === false && !form.media_path && (
          <p className="text-xs text-amber-600">Video storage (AWS S3) isn't connected yet — uploads are limited to 50 MB until it is. Slides and documents work normally.</p>
        )}
        {form.media_kind === "video" && form.media_path && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Captions className="h-4 w-4" />
            {form.captions_path ? <span>Captions attached</span> : <span>No captions file</span>}
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={busy} onClick={uploadCaptions}>{form.captions_path ? "Replace" : "Upload .vtt / .srt"}</Button>
            {form.captions_path && <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive" disabled={busy} onClick={removeCaptions}>Remove</Button>}
          </div>
        )}
        {uploading && <UploadProgress label={uploading.label} percent={uploading.percent} />}
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs text-slate-500">{form.media_path ? "Embed link (not shown while a file is uploaded)" : "…or embed a link: YouTube, Vimeo, Loom, Google Slides, Canva"}</Label>
          <Input
            value={form.video_url ?? ""}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            placeholder="https://youtu.be/... or https://docs.google.com/presentation/d/..."
          />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <Label className="text-xs">Lesson body (Markdown)</Label>
        <Textarea
          rows={4}
          value={form.body ?? ""}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Transcript</Label>
          <Button size="sm" variant="outline" onClick={generateTranscript} disabled={generatingTranscript || !form.video_url}>
            {generatingTranscript ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-3.5 w-3.5" />
            )}
            Generate from YouTube
          </Button>
        </div>
        <Textarea
          rows={4}
          value={form.transcript ?? ""}
          onChange={(e) => setForm({ ...form, transcript: e.target.value })}
          placeholder="Paste the transcript for this lesson"
        />
      </div>

      {/* Resources */}
      <div className="mt-3 space-y-1.5">
        <Label className="text-xs">Resources</Label>
        <div className="space-y-2">
          {resources.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                className="h-8 text-sm md:max-w-[240px]"
                value={r.label}
                placeholder="Label"
                onChange={(e) => setResources(resources.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              />
              {r.path ? (
                <div className="flex h-8 min-w-0 flex-1 items-center gap-1.5 truncate text-xs text-slate-500"><Paperclip className="h-3.5 w-3.5 shrink-0" />{r.name}</div>
              ) : (
                <Input
                  className="h-8 flex-1 text-sm"
                  value={r.url ?? ""}
                  placeholder="https://..."
                  onChange={(e) => setResources(resources.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                />
              )}
              <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive" disabled={busy} onClick={() => removeResource(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={uploadResource}><Upload className="mr-2 h-3.5 w-3.5" /> Upload file</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => setResources([...resources, { label: "", url: "" }])}><LinkIcon className="mr-2 h-3.5 w-3.5" /> Add link</Button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={save} disabled={busy}><Save className="mr-2 h-4 w-4" /> Save</Button>
        <Button size="sm" variant="ghost" className="text-destructive" onClick={remove} disabled={busy}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
};

// ---------- Quiz editor ----------
const QuizEditor = ({ moduleId }: { moduleId: string }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [title, setTitle] = useState("Module quiz");
  const [threshold, setThreshold] = useState(70);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const load = async () => {
    const { data: q } = await supabase
      .from("quizzes")
      .select("*")
      .eq("module_id", moduleId)
      .maybeSingle();
    if (q) {
      setQuiz(q as Quiz);
      setTitle(q.title);
      setThreshold(q.pass_threshold);
      const { data: qs } = await supabase.rpc("admin_get_quiz_questions", { _quiz_id: q.id });
      setQuestions(asQuizQuestions(qs));
    } else {
      setQuiz(null);
      setQuestions([]);
    }
  };

  const createQuiz = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .insert({ module_id: moduleId, title, pass_threshold: threshold })
      .select()
      .single();
    if (error) {
      toast.error("Create quiz failed");
      return;
    }
    setQuiz(data as Quiz);
    toast.success("Quiz created");
  };

  const saveQuiz = async () => {
    if (!quiz) return;
    const { error } = await supabase.from("quizzes").update({ title, pass_threshold: threshold }).eq("id", quiz.id);
    if (error) {
      toast.error("Save failed");
      return;
    }
    toast.success("Quiz saved");
  };

  const deleteQuiz = async () => {
    if (!quiz || !confirm("Delete this quiz?")) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", quiz.id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    load();
  };

  const addQuestion = async () => {
    if (!quiz) return;
    const { error } = await supabase.from("quiz_questions").insert({
      quiz_id: quiz.id,
      prompt: "New question",
      options: ["Option A", "Option B"],
      correct_index: 0,
      position: questions.length,
    });
    if (error) {
      toast.error("Add question failed");
      return;
    }
    load();
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <p className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Module quiz (optional)</p>
      {!quiz ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Quiz title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="w-48" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Pass %</Label>
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <Button size="sm" onClick={createQuiz}>
            <Plus className="mr-2 h-4 w-4" /> Create quiz
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Quiz title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="w-48" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pass %</Label>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <Button size="sm" onClick={saveQuiz}><Save className="mr-2 h-4 w-4" /> Save</Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={deleteQuiz}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {questions.map((q) => (
              <QuestionEditor key={q.id} question={q} onChange={load} />
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" /> Add question
          </Button>
        </div>
      )}
    </div>
  );
};

// ---------- Question editor ----------
const QuestionEditor = ({ question, onChange }: { question: QuizQuestion; onChange: () => void }) => {
  const [prompt, setPrompt] = useState(question.prompt);
  const [optionsText, setOptionsText] = useState((question.options ?? []).join("\n"));
  const [correct, setCorrect] = useState(question.correct_index ?? 0);

  const save = async () => {
    const options = optionsText.split("\n").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase
      .from("quiz_questions")
      .update({ prompt, options, correct_index: Math.min(correct, options.length - 1) })
      .eq("id", question.id);
    if (error) {
      toast.error("Save failed");
      return;
    }
    toast.success("Question saved");
    onChange();
  };

  const remove = async () => {
    const { error } = await supabase.from("quiz_questions").delete().eq("id", question.id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    onChange();
  };

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Question</Label>
        <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </div>
      <div className="mt-2 space-y-1.5">
        <Label className="text-xs">Options (one per line)</Label>
        <Textarea rows={3} value={optionsText} onChange={(e) => setOptionsText(e.target.value)} />
      </div>
      <div className="mt-2 space-y-1.5">
        <Label className="text-xs">Correct option number (1 = first line)</Label>
        <Input
          type="number"
          min={1}
          value={correct + 1}
          onChange={(e) => setCorrect(Math.max(0, Number(e.target.value) - 1))}
          className="w-28"
        />
      </div>
      <div className="mt-2 flex gap-2">
        <Button size="sm" onClick={save}><Save className="mr-2 h-4 w-4" /> Save</Button>
        <Button size="sm" variant="ghost" className="text-destructive" onClick={remove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CourseManager;
