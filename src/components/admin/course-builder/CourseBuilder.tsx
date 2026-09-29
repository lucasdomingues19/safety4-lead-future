import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ChevronDown, ChevronRight, ExternalLink, FileText, Film, GripVertical, HelpCircle,
  Loader2, MoreHorizontal, Plus, Presentation, Sparkles, Text as TextIcon, Trash2, Layers,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { asLessons, type Course, type Lesson, type Module } from "@/lib/lms";
import { deleteLessonFile } from "@/lib/lessonMedia";
import { generateQuiz } from "@/lib/lmsAi";
import { useSaver } from "./useSaver";
import { SaveIndicator } from "./ui";
import { LessonPanel } from "./LessonPanel";
import { ModulePanel } from "./ModulePanel";
import { QuizPanel } from "./QuizPanel";
import { SettingsPanel } from "./SettingsPanel";

export interface QuizSummary {
  id: string;
  module_id: string;
  title: string;
  pass_threshold: number;
  questionCount: number;
}

type Selection = { kind: "lesson" | "module" | "quiz"; id: string } | null;
type Drag = { kind: "lesson" | "module"; id: string } | null;

const parseItem = (raw: string | null): Selection => {
  const [kind, id] = (raw ?? "").split(":");
  return (kind === "lesson" || kind === "module" || kind === "quiz") && id ? { kind, id } : null;
};

export const lessonIcon = (l: Pick<Lesson, "media_kind" | "video_url">) =>
  l.media_kind === "video" || (!l.media_kind && l.video_url) ? Film
    : l.media_kind === "slides" ? Presentation
      : l.media_kind === "document" ? FileText
        : TextIcon;

export const CourseBuilder = ({ courseId }: { courseId: string }) => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const saver = useSaver();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [newLessonId, setNewLessonId] = useState<string | null>(null);

  const tab = params.get("tab") === "settings" ? "settings" : "content";
  const selection = parseItem(params.get("item"));
  const select = useCallback((s: Selection) => {
    setParams((p) => {
      const next = new URLSearchParams(p);
      next.delete("tab");
      if (s) next.set("item", `${s.kind}:${s.id}`); else next.delete("item");
      return next;
    }, { replace: true });
  }, [setParams]);
  const setTab = (t: "content" | "settings") =>
    setParams((p) => { const n = new URLSearchParams(p); if (t === "settings") n.set("tab", "settings"); else n.delete("tab"); return n; }, { replace: true });

  // ---------- loading ----------
  const loadQuizzes = useCallback(async (moduleIds: string[]) => {
    if (!moduleIds.length) { setQuizzes([]); return; }
    const { data: qs } = await supabase.from("quizzes").select("id, module_id, title, pass_threshold").in("module_id", moduleIds);
    const ids = (qs ?? []).map((q) => q.id);
    const { data: questions } = ids.length ? await supabase.from("quiz_questions").select("quiz_id").in("quiz_id", ids) : { data: [] as { quiz_id: string }[] };
    const counts = new Map<string, number>();
    (questions ?? []).forEach((q) => counts.set(q.quiz_id, (counts.get(q.quiz_id) ?? 0) + 1));
    setQuizzes((qs ?? []).map((q) => ({ ...q, questionCount: counts.get(q.id) ?? 0 })));
  }, []);

  const load = useCallback(async () => {
    const { data: c } = await supabase.from("courses").select("*").eq("id", courseId).maybeSingle();
    if (!c) { toast.error("Course not found"); navigate("/admin/courses"); return; }
    const { data: mods } = await supabase.from("modules").select("*").eq("course_id", courseId).order("position");
    const moduleList = (mods ?? []) as Module[];
    const ids = moduleList.map((m) => m.id);
    const { data: les } = ids.length ? await supabase.from("lessons").select("*").in("module_id", ids).order("position") : { data: [] };
    setCourse(c as Course);
    setModules(moduleList);
    setLessons(asLessons(les));
    await loadQuizzes(ids);
    setLoading(false);
  }, [courseId, navigate, loadQuizzes]);
  useEffect(() => { load(); }, [load]);

  const sortedModules = useMemo(() => [...modules].sort((a, b) => a.position - b.position), [modules]);
  const lessonsOf = useCallback(
    (moduleId: string) => lessons.filter((l) => l.module_id === moduleId).sort((a, b) => a.position - b.position),
    [lessons],
  );

  // Default selection: first lesson.
  useEffect(() => {
    if (loading || tab === "settings") return;
    const valid =
      (selection?.kind === "lesson" && lessons.some((l) => l.id === selection.id)) ||
      (selection?.kind === "module" && modules.some((m) => m.id === selection.id)) ||
      (selection?.kind === "quiz" && quizzes.some((q) => q.id === selection.id));
    if (!valid) {
      const first = sortedModules.flatMap((m) => lessonsOf(m.id))[0];
      select(first ? { kind: "lesson", id: first.id } : sortedModules[0] ? { kind: "module", id: sortedModules[0].id } : null);
    }
  }, [loading, tab, selection, lessons, modules, quizzes, sortedModules, lessonsOf, select]);

  // ---------- autosaved edits ----------
  const pendingPatches = useRef(new Map<string, Record<string, unknown>>());
  const patchRow = useCallback((table: "courses" | "modules" | "lessons" | "quizzes", id: string, patch: Record<string, unknown>) => {
    const key = `${table}:${id}`;
    const merged = { ...(pendingPatches.current.get(key) ?? {}), ...patch };
    pendingPatches.current.set(key, merged);
    saver.schedule(key, async () => {
      const body = pendingPatches.current.get(key);
      pendingPatches.current.delete(key);
      if (!body) return;
      const { error } = await supabase.from(table).update(body as never).eq("id", id);
      if (error) {
        if (table === "courses" && error.message.includes("duplicate")) toast.error("That course URL is already used by another course");
        throw error;
      }
    });
  }, [saver]);

  const updateLesson = useCallback((id: string, patch: Partial<Lesson>) => {
    setLessons((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    patchRow("lessons", id, patch as Record<string, unknown>);
  }, [patchRow]);
  const updateModule = useCallback((id: string, patch: Partial<Module>) => {
    setModules((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    patchRow("modules", id, patch as Record<string, unknown>);
  }, [patchRow]);
  const updateCourse = useCallback((patch: Partial<Course>) => {
    setCourse((c) => (c ? { ...c, ...patch } : c));
    patchRow("courses", courseId, patch as Record<string, unknown>);
  }, [patchRow, courseId]);
  const updateQuizSummary = useCallback((id: string, patch: Partial<QuizSummary>) => {
    setQuizzes((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }, []);

  // ---------- structure ----------
  const addModule = async () => {
    const position = sortedModules.length ? Math.max(...sortedModules.map((m) => m.position)) + 1 : 0;
    const { data, error } = await supabase.from("modules").insert({ course_id: courseId, title: `Module ${sortedModules.length + 1}`, position }).select("*").single();
    if (error || !data) { toast.error("Could not add the module"); return; }
    setModules((ms) => [...ms, data as Module]);
    select({ kind: "module", id: data.id });
  };

  const addLesson = async (moduleId?: string) => {
    let target = moduleId ?? (selection?.kind === "lesson" ? lessons.find((l) => l.id === selection.id)?.module_id : selection?.kind === "module" ? selection.id : undefined) ?? sortedModules[sortedModules.length - 1]?.id;
    if (!target) {
      const { data: m } = await supabase.from("modules").insert({ course_id: courseId, title: "Module 1", position: 0 }).select("*").single();
      if (!m) { toast.error("Could not add the lesson"); return; }
      setModules([m as Module]);
      target = m.id;
    }
    const siblings = lessonsOf(target);
    const position = siblings.length ? Math.max(...siblings.map((l) => l.position)) + 1 : 0;
    const { data, error } = await supabase.from("lessons").insert({ module_id: target, title: "New lesson", position }).select("*").single();
    if (error || !data) { toast.error("Could not add the lesson"); return; }
    setLessons((ls) => [...ls, ...asLessons([data])]);
    setCollapsed((c) => { const n = new Set(c); n.delete(target!); return n; });
    setNewLessonId(data.id);
    select({ kind: "lesson", id: data.id });
  };

  const moduleForQuiz = (moduleId?: string) =>
    moduleId ?? (selection?.kind === "lesson" ? lessons.find((l) => l.id === selection.id)?.module_id : selection?.kind === "module" ? selection.id : selection?.kind === "quiz" ? quizzes.find((q) => q.id === selection.id)?.module_id : undefined) ?? sortedModules[sortedModules.length - 1]?.id;

  const addQuiz = async (moduleId?: string) => {
    const target = moduleForQuiz(moduleId);
    if (!target) { toast.error("Add a module first"); return; }
    const existing = quizzes.find((q) => q.module_id === target);
    if (existing) { select({ kind: "quiz", id: existing.id }); return; }
    const mod = modules.find((m) => m.id === target);
    const { data, error } = await supabase.from("quizzes").insert({ module_id: target, title: `${mod?.title ?? "Module"} quiz`, pass_threshold: 70 }).select("id, module_id, title, pass_threshold").single();
    if (error || !data) { toast.error("Could not add the quiz"); return; }
    setQuizzes((qs) => [...qs, { ...data, questionCount: 0 }]);
    select({ kind: "quiz", id: data.id });
  };

  const aiQuiz = async (moduleId?: string, count = 5) => {
    const target = moduleForQuiz(moduleId);
    if (!target) { toast.error("Add a module first"); return; }
    setAiBusy(target);
    const t = toast.loading("Writing quiz questions from the lesson content…");
    try {
      const { quiz_id, added } = await generateQuiz(target, count);
      await loadQuizzes(modules.map((m) => m.id));
      toast.success(`${added} questions added — review them before publishing`, { id: t });
      select({ kind: "quiz", id: quiz_id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Quiz generation failed", { id: t });
    } finally {
      setAiBusy(null);
    }
  };

  const deleteLesson = async (id: string) => {
    const l = lessons.find((x) => x.id === id);
    if (!l || !confirm(`Delete "${l.title}"? This can't be undone.`)) return;
    await saver.flush();
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) { toast.error("Could not delete the lesson"); return; }
    const files = [l.media_path, l.captions_path, ...(l.resources ?? []).map((r) => r.path)].filter(Boolean) as string[];
    files.forEach((p) => deleteLessonFile(p).catch(() => undefined));
    setLessons((ls) => ls.filter((x) => x.id !== id));
    select(null);
    toast.success("Lesson deleted");
  };

  const deleteModule = async (id: string) => {
    const m = modules.find((x) => x.id === id);
    const count = lessonsOf(id).length;
    if (!m || !confirm(`Delete "${m.title}"${count ? ` and its ${count} ${count === 1 ? "lesson" : "lessons"}` : ""}? This can't be undone.`)) return;
    await saver.flush();
    const files = lessonsOf(id).flatMap((l) => [l.media_path, l.captions_path, ...(l.resources ?? []).map((r) => r.path)]).filter(Boolean) as string[];
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) { toast.error("Could not delete the module"); return; }
    files.forEach((p) => deleteLessonFile(p).catch(() => undefined));
    setModules((ms) => ms.filter((x) => x.id !== id));
    setLessons((ls) => ls.filter((l) => l.module_id !== id));
    setQuizzes((qs) => qs.filter((q) => q.module_id !== id));
    select(null);
    toast.success("Module deleted");
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm("Delete this quiz and all its questions?")) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) { toast.error("Could not delete the quiz"); return; }
    const q = quizzes.find((x) => x.id === id);
    setQuizzes((qs) => qs.filter((x) => x.id !== id));
    select(q ? { kind: "module", id: q.module_id } : null);
  };

  // ---------- drag & drop ordering ----------
  const drag = useRef<Drag>(null);
  const [dropHint, setDropHint] = useState<string | null>(null);

  const persistOrder = (table: "lessons" | "modules", rows: { id: string; position: number; module_id?: string }[]) => {
    saver.schedule(`order:${table}:${rows.map((r) => r.id).join(",")}`, async () => {
      const results = await Promise.all(rows.map((r) =>
        supabase.from(table).update(table === "lessons" ? { position: r.position, module_id: r.module_id } : { position: r.position }).eq("id", r.id),
      ));
      const failed = results.find((r) => r.error);
      if (failed?.error) { toast.error("Could not save the new order"); throw failed.error; }
    }, 0);
  };

  const moveLesson = (lessonId: string, toModule: string, beforeLessonId: string | null) => {
    const moving = lessons.find((l) => l.id === lessonId);
    if (!moving || lessonId === beforeLessonId) return;
    const target = lessonsOf(toModule).filter((l) => l.id !== lessonId);
    const idx = beforeLessonId ? target.findIndex((l) => l.id === beforeLessonId) : target.length;
    target.splice(idx < 0 ? target.length : idx, 0, { ...moving, module_id: toModule });
    const changed = new Map<string, { id: string; position: number; module_id: string }>();
    target.forEach((l, i) => changed.set(l.id, { id: l.id, position: i, module_id: toModule }));
    if (moving.module_id !== toModule) {
      lessonsOf(moving.module_id).filter((l) => l.id !== lessonId).forEach((l, i) => changed.set(l.id, { id: l.id, position: i, module_id: moving.module_id }));
    }
    setLessons((ls) => ls.map((l) => (changed.has(l.id) ? { ...l, ...changed.get(l.id)! } : l)));
    persistOrder("lessons", [...changed.values()]);
  };

  const moveModule = (moduleId: string, beforeModuleId: string | null) => {
    if (moduleId === beforeModuleId) return;
    const list = sortedModules.filter((m) => m.id !== moduleId);
    const moving = sortedModules.find((m) => m.id === moduleId);
    if (!moving) return;
    const idx = beforeModuleId ? list.findIndex((m) => m.id === beforeModuleId) : list.length;
    list.splice(idx < 0 ? list.length : idx, 0, moving);
    const rows = list.map((m, i) => ({ id: m.id, position: i }));
    setModules((ms) => ms.map((m) => ({ ...m, position: rows.find((r) => r.id === m.id)?.position ?? m.position })));
    persistOrder("modules", rows);
  };

  const onDragEnd = () => { drag.current = null; setDropHint(null); };

  // ---------- render ----------
  if (loading || !course) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]"><Loader2 className="h-7 w-7 animate-spin text-[#3434ff]" /></div>;
  }

  const selectedLesson = selection?.kind === "lesson" ? lessons.find((l) => l.id === selection.id) : undefined;
  const selectedModule = selection?.kind === "module" ? modules.find((m) => m.id === selection.id) : undefined;
  const selectedQuiz = selection?.kind === "quiz" ? quizzes.find((q) => q.id === selection.id) : undefined;
  const isSelected = (kind: string, id: string) => tab === "content" && selection?.kind === kind && selection.id === id;

  const AddMenuItems = ({ moduleId }: { moduleId?: string }) => (
    <>
      <DropdownMenuItem onSelect={() => addLesson(moduleId)}><Film className="mr-2 h-4 w-4 text-[#3434ff]" /> Lesson</DropdownMenuItem>
      {!moduleId && <DropdownMenuItem onSelect={addModule}><Layers className="mr-2 h-4 w-4 text-[#3434ff]" /> Module</DropdownMenuItem>}
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => addQuiz(moduleId)}><HelpCircle className="mr-2 h-4 w-4 text-[#3434ff]" /> Quiz (write my own)</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => aiQuiz(moduleId)}><Sparkles className="mr-2 h-4 w-4 text-[#8ab815]" /> Quiz — generate with AI</DropdownMenuItem>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7fa] font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6">
          <button onClick={async () => { await saver.flush(); navigate("/admin/courses"); }} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-[#69697b] hover:bg-[#f5f7fa] hover:text-[#0b0b2c]">
            <ArrowLeft className="h-4 w-4" /> Courses
          </button>
          <span className="text-[#cbd5e1]">/</span>
          <h1 className="min-w-0 truncate text-[15px] font-bold">{course.title}</h1>
          <span className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide sm:inline ${course.published ? "bg-[#ecffd1] text-[#3f6212]" : "bg-[#f1f5f9] text-[#69697b]"}`}>{course.published ? "Published" : "Draft"}</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden md:inline"><SaveIndicator status={saver.status} /></span>
            <a href={`/learn/${course.slug}`} target="_blank" rel="noopener noreferrer" onClick={() => saver.flush()} className="hidden items-center gap-1.5 rounded-lg border border-[#e2e8f0] px-3.5 py-2 text-sm font-semibold text-[#0b0b2c] hover:border-[#c7cdf9] sm:inline-flex">
              Preview <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => {
                if (!course.published && lessons.length === 0) { toast.error("Add at least one lesson before publishing"); return; }
                updateCourse({ published: !course.published });
                toast.success(course.published ? "Course unpublished — learners can't find it in the catalogue" : "Course published — it's now in the catalogue");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${course.published ? "border border-[#e2e8f0] bg-white text-[#0b0b2c] hover:border-[#c7cdf9]" : "bg-[#3434ff] text-white hover:bg-[#2a2ad6]"}`}
            >
              {course.published ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>
        <div className="flex gap-1 px-4 md:px-6">
          {(["content", "settings"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`border-b-2 px-3 pb-2.5 pt-1 text-sm font-semibold capitalize transition ${tab === t ? "border-[#3434ff] text-[#3434ff]" : "border-transparent text-[#69697b] hover:text-[#0b0b2c]"}`}>
              {t}
            </button>
          ))}
        </div>
      </header>

      {tab === "settings" ? (
        <SettingsPanel course={course} onChange={updateCourse} onDeleted={() => navigate("/admin/courses")} />
      ) : (
        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Outline */}
          <aside className="border-b border-[#e2e8f0] bg-white lg:sticky lg:top-[105px] lg:h-[calc(100vh-105px)] lg:w-[340px] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#69697b]">Outline</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#3434ff] px-3 py-1.5 text-[13px] font-bold text-white hover:bg-[#2a2ad6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3434ff]/25">
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white font-['Plus_Jakarta_Sans',sans-serif]"><AddMenuItems /></DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="px-2 pb-6" onDragEnd={onDragEnd}>
              {sortedModules.length === 0 && (
                <button onClick={addModule} className="m-2 w-[calc(100%-1rem)] rounded-xl border-2 border-dashed border-[#cfd6e4] p-6 text-sm font-semibold text-[#69697b] hover:border-[#3434ff] hover:text-[#3434ff]">+ Add your first module</button>
              )}
              {sortedModules.map((m, mi) => {
                const ml = lessonsOf(m.id);
                const quiz = quizzes.find((q) => q.module_id === m.id);
                const open = !collapsed.has(m.id);
                return (
                  <div key={m.id} className="mt-1">
                    {dropHint === `module-before:${m.id}` && <div className="mx-2 h-0.5 rounded bg-[#3434ff]" />}
                    <div
                      draggable
                      onDragStart={(e) => { drag.current = { kind: "module", id: m.id }; e.dataTransfer.effectAllowed = "move"; }}
                      onDragOver={(e) => {
                        if (!drag.current) return;
                        e.preventDefault();
                        setDropHint(drag.current.kind === "module" ? `module-before:${m.id}` : `module-into:${m.id}`);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const d = drag.current;
                        if (d?.kind === "module") moveModule(d.id, m.id);
                        if (d?.kind === "lesson") moveLesson(d.id, m.id, null);
                        onDragEnd();
                      }}
                      className={`group flex items-center gap-1 rounded-lg px-1.5 py-2 transition ${isSelected("module", m.id) ? "bg-[#f1f4ff]" : "hover:bg-[#f7f8fc]"} ${dropHint === `module-into:${m.id}` ? "ring-2 ring-[#3434ff]" : ""}`}
                    >
                      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[#cbd5e1] opacity-0 transition group-hover:opacity-100" />
                      <button onClick={() => setCollapsed((c) => { const n = new Set(c); if (n.has(m.id)) n.delete(m.id); else n.add(m.id); return n; })} className="rounded p-0.5 text-[#69697b] hover:bg-[#e8ecf8]" aria-label={open ? "Collapse module" : "Expand module"}>
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      <button onClick={() => select({ kind: "module", id: m.id })} className="min-w-0 flex-1 truncate text-left text-[13.5px] font-bold">
                        <span className="mr-1.5 text-[#94a3b8]">{mi + 1}.</span>{m.title || "Untitled module"}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-md p-1 text-[#69697b] opacity-60 hover:bg-[#e8ecf8] hover:opacity-100" aria-label={`Add to ${m.title}`}>
                            {aiBusy === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white font-['Plus_Jakarta_Sans',sans-serif]"><AddMenuItems moduleId={m.id} /></DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-md p-1 text-[#69697b] opacity-60 hover:bg-[#e8ecf8] hover:opacity-100" aria-label={`${m.title} options`}><MoreHorizontal className="h-4 w-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white font-['Plus_Jakarta_Sans',sans-serif]">
                          <DropdownMenuItem onSelect={() => select({ kind: "module", id: m.id })}>Module settings</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => deleteModule(m.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete module</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {open && (
                      <div className="ml-5 border-l border-[#eef1f6] pl-2">
                        {ml.map((l) => {
                          const Icon = lessonIcon(l);
                          return (
                            <div key={l.id}>
                              {dropHint === `lesson-before:${l.id}` && <div className="h-0.5 rounded bg-[#3434ff]" />}
                              <div
                                draggable
                                onDragStart={(e) => { e.stopPropagation(); drag.current = { kind: "lesson", id: l.id }; e.dataTransfer.effectAllowed = "move"; }}
                                onDragOver={(e) => { if (drag.current?.kind !== "lesson") return; e.preventDefault(); e.stopPropagation(); setDropHint(`lesson-before:${l.id}`); }}
                                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (drag.current?.kind === "lesson") moveLesson(drag.current.id, m.id, l.id); onDragEnd(); }}
                                onClick={() => select({ kind: "lesson", id: l.id })}
                                className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[13.5px] transition ${isSelected("lesson", l.id) ? "bg-[#3434ff] text-white" : "text-[#0b0b2c] hover:bg-[#f7f8fc]"}`}
                              >
                                <GripVertical className={`h-3.5 w-3.5 shrink-0 cursor-grab opacity-0 transition group-hover:opacity-100 ${isSelected("lesson", l.id) ? "text-white/60" : "text-[#cbd5e1]"}`} />
                                <Icon className={`h-4 w-4 shrink-0 ${isSelected("lesson", l.id) ? "text-white" : "text-[#69697b]"}`} />
                                <span className="min-w-0 flex-1 truncate">{l.title || "Untitled lesson"}</span>
                                {l.enforce_progress === false && <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${isSelected("lesson", l.id) ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-[#69697b]"}`}>Optional</span>}
                              </div>
                            </div>
                          );
                        })}
                        {quiz && (
                          <button onClick={() => select({ kind: "quiz", id: quiz.id })} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 pl-[30px] text-left text-[13.5px] transition ${isSelected("quiz", quiz.id) ? "bg-[#3434ff] text-white" : "text-[#0b0b2c] hover:bg-[#f7f8fc]"}`}>
                            <HelpCircle className={`h-4 w-4 shrink-0 ${isSelected("quiz", quiz.id) ? "text-white" : "text-[#8ab815]"}`} />
                            <span className="min-w-0 flex-1 truncate">{quiz.title}</span>
                            <span className={`text-[11px] ${isSelected("quiz", quiz.id) ? "text-white/75" : "text-[#94a3b8]"}`}>{quiz.questionCount} Q</span>
                          </button>
                        )}
                        <button
                          onClick={() => addLesson(m.id)}
                          onDragOver={(e) => { if (drag.current?.kind !== "lesson") return; e.preventDefault(); setDropHint(`module-end:${m.id}`); }}
                          onDrop={(e) => { e.preventDefault(); if (drag.current?.kind === "lesson") moveLesson(drag.current.id, m.id, null); onDragEnd(); }}
                          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 pl-[30px] text-left text-[13px] font-semibold text-[#94a3b8] hover:bg-[#f7f8fc] hover:text-[#3434ff] ${dropHint === `module-end:${m.id}` ? "ring-2 ring-[#3434ff]" : ""}`}
                        >
                          <Plus className="h-3.5 w-3.5" /> Add lesson
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {sortedModules.length > 0 && (
                <div
                  onDragOver={(e) => { if (drag.current?.kind !== "module") return; e.preventDefault(); setDropHint("module-end"); }}
                  onDrop={(e) => { e.preventDefault(); if (drag.current?.kind === "module") moveModule(drag.current.id, null); onDragEnd(); }}
                >
                  {dropHint === "module-end" && <div className="mx-2 h-0.5 rounded bg-[#3434ff]" />}
                  <button onClick={addModule} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[#94a3b8] hover:bg-[#f7f8fc] hover:text-[#3434ff]">
                    <Plus className="h-3.5 w-3.5" /> Add module
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Editor */}
          <main className="min-w-0 flex-1 px-4 py-8 md:px-10">
            <div className="mx-auto max-w-3xl">
              {selectedLesson ? (
                <LessonPanel
                  key={selectedLesson.id}
                  lesson={selectedLesson}
                  course={course}
                  moduleTitle={modules.find((m) => m.id === selectedLesson.module_id)?.title ?? ""}
                  autoFocusTitle={newLessonId === selectedLesson.id}
                  onChange={(patch) => updateLesson(selectedLesson.id, patch)}
                  onDelete={() => deleteLesson(selectedLesson.id)}
                  saver={saver}
                />
              ) : selectedModule ? (
                <ModulePanel
                  key={selectedModule.id}
                  module={selectedModule}
                  lessonCount={lessonsOf(selectedModule.id).length}
                  quiz={quizzes.find((q) => q.module_id === selectedModule.id)}
                  aiBusy={aiBusy === selectedModule.id}
                  onChange={(patch) => updateModule(selectedModule.id, patch)}
                  onAddLesson={() => addLesson(selectedModule.id)}
                  onAddQuiz={() => addQuiz(selectedModule.id)}
                  onAiQuiz={(n) => aiQuiz(selectedModule.id, n)}
                  onOpenQuiz={(id) => select({ kind: "quiz", id })}
                  onDelete={() => deleteModule(selectedModule.id)}
                />
              ) : selectedQuiz ? (
                <QuizPanel
                  key={selectedQuiz.id}
                  quiz={selectedQuiz}
                  moduleTitle={modules.find((m) => m.id === selectedQuiz.module_id)?.title ?? ""}
                  saver={saver}
                  aiBusy={aiBusy === selectedQuiz.module_id}
                  onSummaryChange={(patch) => updateQuizSummary(selectedQuiz.id, patch)}
                  onAiMore={(n) => aiQuiz(selectedQuiz.module_id, n)}
                  onDelete={() => deleteQuiz(selectedQuiz.id)}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-[#cfd6e4] bg-white p-12 text-center text-sm text-[#69697b]">
                  Select a lesson, module or quiz from the outline — or use <strong className="text-[#0b0b2c]">+ Add</strong> to create one.
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};
