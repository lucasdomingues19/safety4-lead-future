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
import { Loader2, Plus, Trash2, Save, ArrowLeft, BookOpen } from "lucide-react";
import type { Course, Module, Lesson, Quiz, QuizQuestion } from "@/lib/lms";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const CourseManager = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!data) {
        toast.error("Admin access required");
        navigate("/");
        return;
      }
      setChecking(false);
      loadCourses();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-white/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to admin
          </button>
          <h1 className="flex items-center gap-2 font-bold text-white">
            <BookOpen className="h-5 w-5 text-primary" /> Course Manager
          </h1>
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
                  selected?.id === c.id ? "bg-primary/15 text-white" : "text-white/70 hover:bg-white/5"
                }`}
              >
                <span className="truncate">{c.title}</span>
                {!c.published && <span className="text-xs text-white/40">draft</span>}
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
            <p className="text-white/60">Select a course or create a new one to start.</p>
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
    await supabase.from("courses").delete().eq("id", course.id);
    toast.success("Course deleted");
    onDeleted();
  };

  const addModule = async () => {
    await supabase.from("modules").insert({
      course_id: course.id,
      title: `Module ${modules.length + 1}`,
      position: modules.length,
    });
    loadModules();
  };

  return (
    <div className="space-y-8">
      <Card className="border-white/10 bg-card">
        <CardHeader>
          <CardTitle className="text-white">Course details</CardTitle>
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
              <Label>Price (in pence, 0 = free)</Label>
              <Input
                type="number"
                value={form.price_cents}
                onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />
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
      <Card className="border-white/10 bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Modules & lessons</CardTitle>
          <Button size="sm" onClick={addModule}>
            <Plus className="mr-2 h-4 w-4" /> Add module
          </Button>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <p className="text-sm text-white/50">No modules yet.</p>
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
    setLessons((data ?? []) as Lesson[]);
  };

  const saveModule = async () => {
    await supabase
      .from("modules")
      .update({
        title: form.title,
        description: form.description,
        drip_days: form.drip_days,
        position: form.position,
      })
      .eq("id", module.id);
    toast.success("Module saved");
    onChange();
  };

  const removeModule = async () => {
    if (!confirm("Delete this module?")) return;
    await supabase.from("modules").delete().eq("id", module.id);
    onChange();
  };

  const addLesson = async () => {
    await supabase.from("lessons").insert({
      module_id: module.id,
      title: `Lesson ${lessons.length + 1}`,
      position: lessons.length,
    });
    loadLessons();
  };

  return (
    <AccordionItem value={module.id} className="rounded-lg border border-white/10 px-3">
      <AccordionTrigger className="text-white hover:no-underline">{form.title}</AccordionTrigger>
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

        <div className="border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-white/70">Lessons</span>
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
const LessonEditor = ({ lesson, onChange }: { lesson: Lesson; onChange: () => void }) => {
  const [form, setForm] = useState(lesson);
  const [resourcesText, setResourcesText] = useState(
    (lesson.resources ?? []).map((r) => `${r.label} | ${r.url}`).join("\n"),
  );

  const save = async () => {
    const resources = resourcesText
      .split("\n")
      .map((line) => line.split("|").map((s) => s.trim()))
      .filter((parts) => parts[0] && parts[1])
      .map(([label, url]) => ({ label, url }));
    await supabase
      .from("lessons")
      .update({
        title: form.title,
        position: form.position,
        video_url: form.video_url,
        body: form.body,
        duration_minutes: form.duration_minutes,
        resources,
      })
      .eq("id", lesson.id);
    toast.success("Lesson saved");
    onChange();
  };

  const remove = async () => {
    if (!confirm("Delete this lesson?")) return;
    await supabase.from("lessons").delete().eq("id", lesson.id);
    onChange();
  };

  return (
    <div className="rounded-lg border border-white/10 bg-background/40 p-3">
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
      <div className="mt-3 space-y-1.5">
        <Label className="text-xs">Video URL (YouTube, Vimeo, Mux, Bunny...)</Label>
        <Input
          value={form.video_url ?? ""}
          onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          placeholder="https://youtu.be/..."
        />
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
        <Label className="text-xs">Resources (one per line: Label | https://url)</Label>
        <Textarea
          rows={2}
          value={resourcesText}
          onChange={(e) => setResourcesText(e.target.value)}
          placeholder="Workbook PDF | https://..."
        />
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={save}><Save className="mr-2 h-4 w-4" /> Save</Button>
        <Button size="sm" variant="ghost" className="text-destructive" onClick={remove}>
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
      const { data: qs } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", q.id)
        .order("position");
      setQuestions(((qs ?? []) as unknown as QuizQuestion[]));
    } else {
      setQuiz(null);
      setQuestions([]);
    }
  };

  const createQuiz = async () => {
    const { data } = await supabase
      .from("quizzes")
      .insert({ module_id: moduleId, title, pass_threshold: threshold })
      .select()
      .single();
    setQuiz(data as Quiz);
    toast.success("Quiz created");
  };

  const saveQuiz = async () => {
    if (!quiz) return;
    await supabase.from("quizzes").update({ title, pass_threshold: threshold }).eq("id", quiz.id);
    toast.success("Quiz saved");
  };

  const deleteQuiz = async () => {
    if (!quiz || !confirm("Delete this quiz?")) return;
    await supabase.from("quizzes").delete().eq("id", quiz.id);
    load();
  };

  const addQuestion = async () => {
    if (!quiz) return;
    await supabase.from("quiz_questions").insert({
      quiz_id: quiz.id,
      prompt: "New question",
      options: ["Option A", "Option B"],
      correct_index: 0,
      position: questions.length,
    });
    load();
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <p className="mb-3 text-sm font-semibold text-white/80">Module quiz (optional)</p>
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
  const [correct, setCorrect] = useState(question.correct_index);

  const save = async () => {
    const options = optionsText.split("\n").map((s) => s.trim()).filter(Boolean);
    await supabase
      .from("quiz_questions")
      .update({ prompt, options, correct_index: Math.min(correct, options.length - 1) })
      .eq("id", question.id);
    toast.success("Question saved");
    onChange();
  };

  const remove = async () => {
    await supabase.from("quiz_questions").delete().eq("id", question.id);
    onChange();
  };

  return (
    <div className="rounded-md border border-white/10 bg-background/40 p-3">
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
