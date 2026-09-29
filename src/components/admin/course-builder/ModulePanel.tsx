import { HelpCircle, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import type { Module } from "@/lib/lms";
import type { QuizSummary } from "./CourseBuilder";
import { Section, inputClass } from "./ui";

export const ModulePanel = ({
  module,
  lessonCount,
  quiz,
  aiBusy,
  onChange,
  onAddLesson,
  onAddQuiz,
  onAiQuiz,
  onOpenQuiz,
  onDelete,
}: {
  module: Module;
  lessonCount: number;
  quiz?: QuizSummary;
  aiBusy: boolean;
  onChange: (patch: Partial<Module>) => void;
  onAddLesson: () => void;
  onAddQuiz: () => void;
  onAiQuiz: (count: number) => void;
  onOpenQuiz: (id: string) => void;
  onDelete: () => void;
}) => {
  const drip = module.drip_days ?? 0;
  return (
    <div className="space-y-5 pb-24">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Module · {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}</p>
        <input
          value={module.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Module title"
          className="mt-1 w-full bg-transparent py-1 text-[28px] font-bold leading-tight tracking-tight outline-none placeholder:text-[#cbd5e1]"
        />
      </div>

      <Section title="About this module" description="Optional — shown above the module's lessons on the course page.">
        <textarea rows={3} value={module.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} placeholder="What does this module cover?" className={`${inputClass} resize-y`} />
      </Section>

      <Section title="Release" description="Choose when learners can open this module.">
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { value: false, label: "Immediately", text: "Available as soon as they enrol" },
            { value: true, label: "On a schedule", text: "Unlocks a set number of days after enrolling" },
          ].map((o) => {
            const active = (drip > 0) === o.value;
            return (
              <button key={o.label} onClick={() => onChange({ drip_days: o.value ? Math.max(drip, 7) : 0 })} className={`rounded-xl border p-3.5 text-left transition ${active ? "border-[#3434ff] bg-[#f5f7ff] ring-4 ring-[#3434ff]/10" : "border-[#e2e8f0] hover:border-[#c7cdf9]"}`}>
                <span className="block text-sm font-semibold">{o.label}</span>
                <span className="text-[13px] text-[#69697b]">{o.text}</span>
              </button>
            );
          })}
        </div>
        {drip > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            Unlock
            <input type="number" min={1} value={drip} onChange={(e) => onChange({ drip_days: Math.max(1, Number(e.target.value) || 1) })} className={`${inputClass} w-20 text-center`} />
            days after enrolling
          </div>
        )}
      </Section>

      <Section title="Module quiz" description="Learners take it after finishing the module's lessons. Passing every quiz is required for the certificate.">
        {quiz ? (
          <button onClick={() => onOpenQuiz(quiz.id)} className="flex w-full items-center gap-3 rounded-xl bg-[#f5f7ff] p-3.5 text-left hover:bg-[#eef1ff]">
            <HelpCircle className="h-5 w-5 text-[#8ab815]" />
            <span className="flex-1">
              <span className="block text-sm font-semibold">{quiz.title}</span>
              <span className="text-[13px] text-[#69697b]">{quiz.questionCount} questions · pass mark {quiz.pass_threshold}%</span>
            </span>
            <span className="text-[13px] font-semibold text-[#3434ff]">Edit quiz →</span>
          </button>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <button onClick={() => onAiQuiz(5)} disabled={aiBusy || lessonCount === 0} className="flex items-start gap-3 rounded-xl border border-[#e2e8f0] p-3.5 text-left transition hover:border-[#3434ff] disabled:opacity-50">
              {aiBusy ? <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-[#8ab815]" /> : <Sparkles className="mt-0.5 h-5 w-5 text-[#8ab815]" />}
              <span>
                <span className="block text-sm font-semibold">Generate with AI</span>
                <span className="text-[13px] text-[#69697b]">5 questions written from this module's transcripts and descriptions</span>
              </span>
            </button>
            <button onClick={onAddQuiz} className="flex items-start gap-3 rounded-xl border border-[#e2e8f0] p-3.5 text-left transition hover:border-[#3434ff]">
              <Plus className="mt-0.5 h-5 w-5 text-[#3434ff]" />
              <span>
                <span className="block text-sm font-semibold">Write my own</span>
                <span className="text-[13px] text-[#69697b]">Start with an empty quiz</span>
              </span>
            </button>
          </div>
        )}
      </Section>

      <div className="flex justify-between pt-2">
        <button onClick={onAddLesson} className="inline-flex items-center gap-1.5 rounded-lg bg-[#3434ff] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6]"><Plus className="h-4 w-4" /> Add a lesson to this module</button>
        <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete module</button>
      </div>
    </div>
  );
};

