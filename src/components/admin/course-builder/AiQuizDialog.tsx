import { useState } from "react";
import { CheckCircle2, Circle, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { previewQuiz, type DraftQuestion, type QuizDifficulty, type QuizStyle } from "@/lib/lmsAi";

const COUNTS = [3, 5, 8, 10, 15];
const DIFFICULTIES: { v: QuizDifficulty; label: string; hint: string }[] = [
  { v: "foundation", label: "Foundation", hint: "Checks the main ideas" },
  { v: "intermediate", label: "Intermediate", hint: "Understanding and application" },
  { v: "advanced", label: "Advanced", hint: "Judgement in tricky situations" },
];
const STYLES: { v: QuizStyle; label: string }[] = [
  { v: "mixed", label: "Mixed" },
  { v: "scenario", label: "Workplace scenarios" },
  { v: "knowledge", label: "Key concepts" },
];

/**
 * Generate quiz questions with AI from a module's lessons, review them, then
 * add the ones you want to the module quiz (created if it doesn't exist).
 */
export function AiQuizDialog({ open, onOpenChange, moduleId, moduleTitle, onAdded }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  moduleId: string | null;
  moduleTitle: string;
  onAdded: (quizId: string, added: number) => void;
}) {
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("intermediate");
  const [style, setStyle] = useState<QuizStyle>("mixed");
  const [drafts, setDrafts] = useState<DraftQuestion[] | null>(null);
  const [keep, setKeep] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState<"generating" | "saving" | null>(null);

  const reset = () => { setDrafts(null); setKeep(new Set()); setBusy(null); };

  const generate = async () => {
    if (!moduleId) return;
    setBusy("generating");
    try {
      const { questions } = await previewQuiz(moduleId, { count, difficulty, style });
      setDrafts(questions);
      setKeep(new Set(questions.map((_, i) => i)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate questions");
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (!moduleId || !drafts) return;
    const chosen = drafts.filter((_, i) => keep.has(i));
    if (!chosen.length) return;
    setBusy("saving");
    try {
      let { data: quiz } = await supabase.from("quizzes").select("id").eq("module_id", moduleId).maybeSingle();
      if (!quiz) {
        const { data, error } = await supabase.from("quizzes").insert({ module_id: moduleId, title: `${moduleTitle} quiz`, pass_threshold: 70 }).select("id").single();
        if (error || !data) throw new Error("Could not create the quiz");
        quiz = data;
      }
      const { count: existing } = await supabase.from("quiz_questions").select("id", { count: "exact", head: true }).eq("quiz_id", quiz.id);
      const { error } = await supabase.from("quiz_questions").insert(chosen.map((q, i) => ({
        quiz_id: quiz!.id, prompt: q.prompt, options: q.options, correct_index: q.correct_index, explanation: q.explanation, position: (existing ?? 0) + i,
      })));
      if (error) throw new Error(error.message);
      toast.success(`${chosen.length} question${chosen.length === 1 ? "" : "s"} added`);
      onAdded(quiz.id, chosen.length);
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the questions");
      setBusy(null);
    }
  };

  const toggle = (i: number) => setKeep((k) => { const n = new Set(k); if (n.has(i)) n.delete(i); else n.add(i); return n; });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto border-[#e2e8f0] bg-white text-[#0b0b2c] font-['Plus_Jakarta_Sans',sans-serif]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0b0b2c]"><Sparkles className="h-5 w-5 text-[#8ab815]" /> Generate quiz with AI</DialogTitle>
          <DialogDescription className="text-[#69697b]">
            Questions are written from the transcripts and notes of the lessons in <strong className="text-[#0b0b2c]">{moduleTitle}</strong>, each with an explanation. Review them before they're added.
          </DialogDescription>
        </DialogHeader>

        {!drafts ? (
          <div className="space-y-5 py-2">
            <Field label="Number of questions">
              <div className="flex flex-wrap gap-2">
                {COUNTS.map((n) => <Chip key={n} on={count === n} onClick={() => setCount(n)}>{n}</Chip>)}
              </div>
            </Field>
            <Field label="Difficulty">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {DIFFICULTIES.map((d) => (
                  <button key={d.v} type="button" onClick={() => setDifficulty(d.v)} aria-pressed={difficulty === d.v}
                    className={`rounded-xl border-2 px-3 py-2.5 text-left transition ${difficulty === d.v ? "border-[#3434ff] bg-[#f5f7ff]" : "border-[#e2e8f0] hover:border-[#3434ff]/40"}`}>
                    <span className="block text-sm font-bold">{d.label}</span>
                    <span className="block text-xs text-[#69697b]">{d.hint}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Question style">
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => <Chip key={s.v} on={style === s.v} onClick={() => setStyle(s.v)}>{s.label}</Chip>)}
              </div>
            </Field>
            <div className="flex justify-end gap-2 border-t border-[#eef1f6] pt-4">
              <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#69697b] hover:bg-[#f5f7fa]">Cancel</button>
              <button type="button" onClick={generate} disabled={busy !== null || !moduleId} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6] disabled:opacity-60">
                {busy === "generating" ? <><Loader2 className="h-4 w-4 animate-spin" /> Writing questions… (about 20 seconds)</> : <><Sparkles className="h-4 w-4" /> Generate</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-[#69697b]">Untick any you don't want. You can edit the rest after adding them.</p>
            {drafts.map((q, i) => (
              <label key={i} className={`block cursor-pointer rounded-xl border-2 p-4 transition ${keep.has(i) ? "border-[#3434ff]/40 bg-white" : "border-[#e2e8f0] bg-[#f8fafc] opacity-60"}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={keep.has(i)} onChange={() => toggle(i)} className="mt-1 h-4 w-4 accent-[#3434ff]" aria-label={`Keep question ${i + 1}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug">{i + 1}. {q.prompt}</p>
                    <ul className="mt-2 space-y-1">
                      {q.options.map((o, oi) => (
                        <li key={oi} className={`flex items-start gap-2 text-sm ${oi === q.correct_index ? "font-semibold text-[#15803d]" : "text-[#475569]"}`}>
                          {oi === q.correct_index ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#cbd5e1]" />} {o}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && <p className="mt-2 rounded-md bg-[#f5f7fa] px-3 py-2 text-[13px] text-[#334155]"><span className="font-semibold">Why: </span>{q.explanation}</p>}
                  </div>
                </div>
              </label>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eef1f6] pt-4">
              <button type="button" onClick={generate} disabled={busy !== null} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#69697b] hover:bg-[#f5f7fa] disabled:opacity-60">
                {busy === "generating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Generate a different set
              </button>
              <button type="button" onClick={save} disabled={busy !== null || keep.size === 0} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6] disabled:opacity-60">
                {busy === "saving" && <Loader2 className="h-4 w-4 animate-spin" />} Add {keep.size} question{keep.size === 1 ? "" : "s"} to the quiz
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">{label}</p>
      {children}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition ${on ? "border-[#3434ff] bg-[#3434ff] text-white" : "border-[#e2e8f0] text-[#0b0b2c] hover:border-[#3434ff]/40"}`}>
      {children}
    </button>
  );
}
