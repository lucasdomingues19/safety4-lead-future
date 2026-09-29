import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { asQuizQuestions, type QuizQuestion } from "@/lib/lms";
import type { QuizSummary } from "./CourseBuilder";
import type { Saver } from "./useSaver";
import { Section, inputClass } from "./ui";

export const QuizPanel = ({
  quiz,
  moduleTitle,
  saver,
  aiBusy,
  onSummaryChange,
  onAiMore,
  onDelete,
}: {
  quiz: QuizSummary;
  moduleTitle: string;
  saver: Saver;
  aiBusy: boolean;
  onSummaryChange: (patch: Partial<QuizSummary>) => void;
  onAiMore: (count: number) => void;
  onDelete: () => void;
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.rpc("admin_get_quiz_questions", { _quiz_id: quiz.id });
    setQuestions(asQuizQuestions(data).sort((a, b) => a.position - b.position));
  }, [quiz.id]);
  // Reload when the question count changes from outside (AI generation).
  useEffect(() => { load(); }, [load, quiz.questionCount]);

  const saveQuiz = (patch: { title?: string; pass_threshold?: number }) => {
    onSummaryChange(patch);
    saver.schedule(`quizzes:${quiz.id}`, async () => {
      const { error } = await supabase.from("quizzes").update(patch).eq("id", quiz.id);
      if (error) throw error;
    });
  };

  const updateQuestion = (id: string, patch: Partial<QuizQuestion>) => {
    setQuestions((qs) => {
      const next = (qs ?? []).map((q) => (q.id === id ? { ...q, ...patch } : q));
      const q = next.find((x) => x.id === id)!;
      saver.schedule(`quiz_questions:${id}`, async () => {
        const options = (q.options ?? []).map((o) => o.trim());
        const { error } = await supabase
          .from("quiz_questions")
          .update({ prompt: q.prompt, options, correct_index: Math.min(q.correct_index ?? 0, Math.max(options.length - 1, 0)) })
          .eq("id", id);
        if (error) throw error;
      });
      return next;
    });
  };

  const addQuestion = async () => {
    const { data, error } = await supabase
      .from("quiz_questions")
      .insert({ quiz_id: quiz.id, prompt: "", options: ["", "", "", ""], correct_index: 0, position: questions?.length ?? 0 })
      .select("id, quiz_id, prompt, options, correct_index, position")
      .single();
    if (error || !data) { toast.error("Could not add a question"); return; }
    setQuestions((qs) => [...(qs ?? []), ...asQuizQuestions([data])]);
    onSummaryChange({ questionCount: (questions?.length ?? 0) + 1 });
  };

  const removeQuestion = async (id: string) => {
    const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
    if (error) { toast.error("Could not delete the question"); return; }
    setQuestions((qs) => (qs ?? []).filter((q) => q.id !== id));
    onSummaryChange({ questionCount: Math.max(0, (questions?.length ?? 1) - 1) });
  };

  const incomplete = (questions ?? []).filter((q) => !q.prompt.trim() || (q.options ?? []).filter((o) => o.trim()).length < 2).length;

  return (
    <div className="space-y-5 pb-24">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#94a3b8]">{moduleTitle} · Quiz</p>
        <input value={quiz.title} onChange={(e) => saveQuiz({ title: e.target.value })} placeholder="Quiz title" className="mt-1 w-full bg-transparent py-1 text-[28px] font-bold leading-tight tracking-tight outline-none placeholder:text-[#cbd5e1]" />
      </div>

      <Section title="Pass mark" description="Learners can retake the quiz until they pass. Correct answers are never shown to them.">
        <div className="flex items-center gap-4">
          <input type="range" min={50} max={100} step={5} value={quiz.pass_threshold} onChange={(e) => saveQuiz({ pass_threshold: Number(e.target.value) })} className="flex-1 accent-[#3434ff]" aria-label="Pass mark" />
          <span className="w-14 text-right text-lg font-bold tabular-nums">{quiz.pass_threshold}%</span>
        </div>
      </Section>

      <Section
        title={`Questions${questions ? ` (${questions.length})` : ""}`}
        description="Click the circle next to the correct answer."
        action={
          <button onClick={() => onAiMore(3)} disabled={aiBusy} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-[13px] font-semibold hover:border-[#c7cdf9] disabled:opacity-50">
            {aiBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-[#8ab815]" />} Add 3 with AI
          </button>
        }
      >
        {!questions ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#3434ff]" /></div>
        ) : (
          <div className="space-y-4">
            {incomplete > 0 && <p className="rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-800">{incomplete} {incomplete === 1 ? "question needs" : "questions need"} a question and at least two answers.</p>}
            {questions.map((q, qi) => (
              <div key={q.id} className="rounded-xl border border-[#e2e8f0] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-2.5 text-sm font-bold text-[#94a3b8]">{qi + 1}</span>
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <textarea rows={2} value={q.prompt} onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })} placeholder="Type the question" className={`${inputClass} resize-y font-semibold`} />
                    {(q.options ?? []).map((opt, oi) => {
                      const correct = (q.correct_index ?? 0) === oi;
                      return (
                        <div key={oi} className="flex items-center gap-2">
                          <button onClick={() => updateQuestion(q.id, { correct_index: oi })} aria-label={`Mark answer ${oi + 1} correct`} className="shrink-0 rounded-full">
                            {correct ? <CheckCircle2 className="h-5 w-5 text-[#16a34a]" /> : <Circle className="h-5 w-5 text-[#cbd5e1] hover:text-[#16a34a]" />}
                          </button>
                          <input
                            value={opt}
                            onChange={(e) => updateQuestion(q.id, { options: (q.options ?? []).map((o, j) => (j === oi ? e.target.value : o)) })}
                            placeholder={`Answer ${oi + 1}`}
                            className={`${inputClass} py-2 ${correct ? "border-[#bbf7d0] bg-[#f0fdf4]" : ""}`}
                          />
                          {(q.options ?? []).length > 2 && (
                            <button
                              onClick={() => {
                                const options = (q.options ?? []).filter((_, j) => j !== oi);
                                const ci = q.correct_index ?? 0;
                                updateQuestion(q.id, { options, correct_index: ci === oi ? 0 : ci > oi ? ci - 1 : ci });
                              }}
                              className="rounded p-1 text-[#cbd5e1] hover:text-red-600"
                              aria-label="Remove answer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div className="flex justify-between">
                      {(q.options ?? []).length < 6 ? (
                        <button onClick={() => updateQuestion(q.id, { options: [...(q.options ?? []), ""] })} className="text-[13px] font-semibold text-[#3434ff] hover:underline">+ Add answer</button>
                      ) : <span />}
                      <button onClick={() => removeQuestion(q.id)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#94a3b8] hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete question</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addQuestion} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#cfd6e4] py-3.5 text-sm font-semibold text-[#69697b] hover:border-[#3434ff] hover:text-[#3434ff]">
              <Plus className="h-4 w-4" /> Add question
            </button>
          </div>
        )}
      </Section>

      <div className="flex justify-end pt-2">
        <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete quiz</button>
      </div>
    </div>
  );
};

