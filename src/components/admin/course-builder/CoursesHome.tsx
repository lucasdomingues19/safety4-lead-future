import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatPrice, type Course } from "@/lib/lms";
import { inputClass } from "./ui";

interface CourseCard extends Course {
  moduleCount: number;
  lessonCount: number;
  learnerCount: number;
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "course";

export const CoursesHome = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseCard[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: cs }, { data: mods }, { data: les }, { data: enr }] = await Promise.all([
        supabase.from("courses").select("*").order("created_at", { ascending: false }),
        supabase.from("modules").select("id, course_id"),
        supabase.from("lessons").select("id, module_id"),
        supabase.from("enrollments").select("course_id").eq("status", "active"),
      ]);
      const courseOfModule = new Map((mods ?? []).map((m) => [m.id, m.course_id]));
      const count = <T,>(rows: T[] | null, key: (r: T) => string | undefined) => {
        const m = new Map<string, number>();
        (rows ?? []).forEach((r) => { const k = key(r); if (k) m.set(k, (m.get(k) ?? 0) + 1); });
        return m;
      };
      const modCounts = count(mods, (m) => m.course_id);
      const lesCounts = count(les, (l) => courseOfModule.get(l.module_id));
      const enrCounts = count(enr, (e) => e.course_id);
      setCourses(((cs ?? []) as Course[]).map((c) => ({
        ...c,
        moduleCount: modCounts.get(c.id) ?? 0,
        lessonCount: lesCounts.get(c.id) ?? 0,
        learnerCount: enrCounts.get(c.id) ?? 0,
      })));
    })();
  }, []);

  const create = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setBusy(true);
    try {
      const base = slugify(title);
      const { data: taken } = await supabase.from("courses").select("slug").like("slug", `${base}%`);
      const used = new Set((taken ?? []).map((t) => t.slug));
      let slug = base;
      for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;

      const { data: course, error } = await supabase.from("courses").insert({ title, slug, published: false }).select("id").single();
      if (error || !course) throw error;
      // Start with one module and one lesson so there's something to edit straight away.
      const { data: mod } = await supabase.from("modules").insert({ course_id: course.id, title: "Module 1", position: 0 }).select("id").single();
      const { data: lesson } = mod
        ? await supabase.from("lessons").insert({ module_id: mod.id, title: "Welcome", position: 0 }).select("id").single()
        : { data: null };
      navigate(`/admin/courses/${course.id}${lesson ? `?item=lesson:${lesson.id}` : ""}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not create the course");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c]">
      <header className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <h1 className="text-xl font-bold">Courses</h1>
          <button
            onClick={() => { setNewTitle(""); setCreating(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2a2ad6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3434ff]/25"
          >
            <Plus className="h-4 w-4" /> New course
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8ab815]">Course builder</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Courses</h1>

        {!courses ? (
          <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-[#3434ff]" /></div>
        ) : courses.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#cfd6e4] bg-white p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-[#3434ff]" />
            <h2 className="mt-4 text-lg font-bold">Create your first course</h2>
            <p className="mt-1 text-sm text-[#69697b]">Give it a name — you can add modules, lessons and quizzes next.</p>
            <button onClick={() => setCreating(true)} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6]"><Plus className="h-4 w-4" /> New course</button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/admin/courses/${c.id}`)}
                className="group overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#c7cdf9] hover:shadow-[0_14px_34px_rgba(11,11,44,0.08)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3434ff]/20"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#3434ff] to-[#202058]">
                  {c.cover_image_url ? (
                    <img src={c.cover_image_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full items-end p-5"><span className="line-clamp-2 text-xl font-bold leading-tight text-white">{c.title}</span></div>
                  )}
                  <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${c.published ? "bg-[#9eff1f] text-[#0b0b2c]" : "bg-white/90 text-[#69697b]"}`}>
                    {c.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="line-clamp-1 text-base font-bold">{c.title}</h2>
                  <p className="mt-1 text-[13px] text-[#69697b]">
                    {c.moduleCount} {c.moduleCount === 1 ? "module" : "modules"} · {c.lessonCount} {c.lessonCount === 1 ? "lesson" : "lessons"}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-[#f1f5f9] pt-3 text-[13px]">
                    <span className="font-semibold">{formatPrice(c.price_cents, c.currency)}</span>
                    <span className="inline-flex items-center gap-1.5 text-[#69697b]"><Users className="h-3.5 w-3.5" /> {c.learnerCount} {c.learnerCount === 1 ? "learner" : "learners"}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <Dialog open={creating} onOpenChange={(o) => !busy && setCreating(o)}>
        <DialogContent className="max-w-md bg-white font-['Plus_Jakarta_Sans',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-[#0b0b2c]">New course</DialogTitle>
            <DialogDescription>It starts as a draft — learners won't see it until you publish.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); create(); }} className="space-y-4">
            <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. AI for EHS Professionals" className={inputClass} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} disabled={busy} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#69697b] hover:bg-[#f5f7fa]">Cancel</button>
              <button type="submit" disabled={busy || !newTitle.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6] disabled:opacity-50">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create course
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
