import { Award, CheckCircle2, GraduationCap, Linkedin, Lock, PlayCircle } from "lucide-react";

// Shown on the dashboard only while Mia's tour plays, so every part of the
// LMS she describes is on screen even for a brand-new learner. Always
// labelled as examples; nothing here is clickable.

export const ExampleTag = ({ dark = false }: { dark?: boolean }) => (
  <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em] ${dark ? "bg-white/15 text-white" : "bg-[#f1f5f9] text-[#69697b]"}`}>Example</span>
);

const shell = "rounded-[20px] border border-[#e2e8f0] bg-white p-5 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c]";

export function ExampleLesson({ course }: { course: string }) {
  const lessons = [
    { t: "Welcome to the course", s: "done" },
    { t: "Why AI matters in EHS", s: "done" },
    { t: "Hands-on workshop", s: "current" },
    { t: "Wrap-up and reflection", s: "locked" },
  ] as const;
  return (
    <div data-tour="tour-lesson" className={shell}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#8ab815]">Inside a course</div>
          <div className="mt-1 truncate text-[15px] font-bold">{course}</div>
        </div>
        <ExampleTag />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-[#e2e8f0]">
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#17176e] to-[#05051e]"><PlayCircle size={40} className="text-white/85" /></div>
          <div className="p-3">
            <div className="flex justify-between text-[11px] font-semibold text-[#69697b]"><span>Watched</span><span>92%</span></div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#eef1f6]"><div className="h-full w-[92%] rounded-full bg-[#16a34a]" /></div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#3434ff] px-3 py-2 text-[12px] font-bold text-white shadow-[0_0_0_4px_rgba(158,255,31,.35)]"><CheckCircle2 size={14} /> Mark complete & continue</div>
          </div>
        </div>
        <ul className="space-y-2">
          {lessons.map((l) => (
            <li key={l.t} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] font-semibold ${l.s === "current" ? "border-[#c7cdf9] bg-[#f7f8ff]" : "border-[#eef1f6]"} ${l.s === "locked" ? "text-[#94a3b8]" : ""}`}>
              {l.s === "done" ? <CheckCircle2 size={16} className="shrink-0 text-[#16a34a]" /> : l.s === "current" ? <PlayCircle size={16} className="shrink-0 text-[#3434ff]" /> : <Lock size={15} className="shrink-0" />}
              <span className="truncate">{l.t}</span>
            </li>
          ))}
          <li className="px-1 text-[11.5px] text-[#94a3b8]">Lessons unlock in order as you complete them.</li>
        </ul>
      </div>
    </div>
  );
}

export function ExampleCertificate({ name, course }: { name: string; course: string }) {
  return (
    <div data-tour="tour-certificate" className={shell}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#8ab815]">Quizzes & certificate</div>
        <ExampleTag />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.2fr]">
        <ul className="space-y-2">
          {["Module 1 quiz", "Module 2 quiz", "Final assessment"].map((q) => (
            <li key={q} className="flex items-center gap-2.5 rounded-xl border border-[#eef1f6] px-3 py-2.5 text-[13px] font-semibold">
              <GraduationCap size={16} className="shrink-0 text-[#3434ff]" />
              <span className="flex-1 truncate">{q}</span>
              <span className="rounded-full bg-[#ecffd1] px-2 py-0.5 text-[11px] font-bold text-[#3f6212]">Passed</span>
            </li>
          ))}
        </ul>
        <div className="relative rounded-xl border-[3px] border-[#9eff1f]/70 bg-[#fbfdf7] p-4 text-center">
          <div className="text-[9.5px] font-extrabold uppercase tracking-[0.22em] text-[#3434ff]">Certificate of completion</div>
          <div className="mt-2 truncate text-[16px] font-bold">{name}</div>
          <div className="mt-0.5 line-clamp-2 text-[11.5px] text-[#69697b]">{course}</div>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <span className="rounded-full bg-[#ecffd1] px-2 py-0.5 text-[10.5px] font-bold text-[#3f6212]">✓ Verified</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0a66c2] px-2 py-0.5 text-[10.5px] font-bold text-white"><Linkedin size={10} /> Add to LinkedIn</span>
          </div>
          <div className="absolute -right-2.5 -top-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#3434ff] text-white shadow-lg"><Award size={20} /></div>
        </div>
      </div>
    </div>
  );
}
