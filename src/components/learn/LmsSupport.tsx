import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Shield, Sparkles } from "lucide-react";

const SUPPORT_EMAIL = "hello@safetytech.academy";
const mailto = (subject: string) => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

const CHANNELS = [
  { icon: MessageCircle, title: "Ask about your course", text: "Questions on course content or applying it to your own work.", subject: "Question about my course", cta: "Email us" },
  { icon: HelpCircle, title: "Technical help", text: "Video not playing, progress not saving, sign-in or access problems.", subject: "Technical issue", cta: "Report an issue" },
  { icon: Shield, title: "Certificates & CPD", text: "CPD records, IOSH evidence, name corrections or a replacement certificate.", subject: "Certificate or CPD query", cta: "Contact the academy", highlight: true },
];

// Answers describe how the platform actually works — keep them in step with it.
const FAQS = [
  { q: "Why can't I open the next lesson?", a: "Most lessons must be completed in order. Finish the current lesson — for videos that means watching most of it (skipping ahead doesn't count) — then press “Mark complete & continue”. Optional lessons never block you." },
  { q: "My video progress isn't going up", a: "Progress only counts while the video is actually playing, so keep the lesson tab open while you watch. If it still seems stuck, refresh the page — the time you've already watched is saved." },
  { q: "How do I get my certificate?", a: "Complete every required lesson and pass each module quiz. Some courses also end with a final assessment; passing it issues a verified digital certificate you can share on LinkedIn. You'll get an email with the link, and it's always available from the course page." },
  { q: "How long do I have access to a course?", a: "Check Settings → My courses & access: it shows every course on your account and the date your access ends, if there is one." },
  { q: "Where are my receipts?", a: "Settings → Purchase history lists your payments with a link to each Stripe receipt." },
  { q: "How do points, levels and badges work?", a: "You earn points for completing lessons, passing quizzes and courses, and helping in the community. Open “How points work” on your dashboard for the full list. You can hide yourself from the leaderboard in Settings." },
  { q: "What's the difference between the two communities?", a: "SafetyTech Academy is free for every learner. SafetyTech Global Network is our paid members' community — email us to ask about membership." },
  { q: "How do I change my password or photo?", a: "Go to Settings. You can upload a profile photo, update your name (it's printed on certificates) and change your password there." },
];

export function LmsSupport({ onStartTour }: { onStartTour?: () => void } = {}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#eef1f6] px-4 pb-20 pt-10 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c] md:px-7">
      <div className="mx-auto max-w-[1100px]">
        <p className="text-[13px] font-extrabold tracking-[0.12em] text-[#8ab815]">SUPPORT</p>
        <h1 className="mt-3 text-[38px] font-bold leading-tight">How can we help?</h1>
        <p className="mt-3 max-w-[680px] text-[17px] leading-relaxed text-[#69697b]">
          Check the common questions below, or email us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#3434ff] hover:underline">{SUPPORT_EMAIL}</a>.
        </p>

        {onStartTour && (
          <button onClick={onStartTour} className="mt-6 flex w-full items-center gap-4 rounded-[20px] bg-gradient-to-r from-[#11114a] to-[#0b0b2c] p-5 text-left text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3434ff]/30">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#9eff1f] to-[#3434ff]"><Sparkles size={22} className="text-[#0b0b2c]" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[17px] font-bold">Take the 2-minute tour with Mia</span><span className="block text-sm text-white/70">Mia walks you through your dashboard, courses, community and settings.</span></span>
            <span className="hidden rounded-lg bg-[#9eff1f] px-4 py-2 text-sm font-extrabold text-[#0b0b2c] sm:inline">Start</span>
          </button>
        )}

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, title, text, subject, cta, highlight }) => (
            <a
              key={title}
              href={mailto(subject)}
              className={`group block rounded-[20px] border p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(11,11,44,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3434ff]/20 ${highlight ? "border-[#d9f09a] bg-[#f4fbe4]" : "border-[#e2e8f0] bg-white"}`}
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-full ${highlight ? "bg-[#a6e21a]" : "bg-[#3434ff]/10"}`}>
                <Icon size={23} className={highlight ? "text-[#0b0b2c]" : "text-[#3434ff]"} />
              </span>
              <span className="mt-5 block text-[19px] font-bold">{title}</span>
              <span className={`mt-2 block text-sm leading-relaxed ${highlight ? "text-[#4a5230]" : "text-[#69697b]"}`}>{text}</span>
              <span className={`mt-4 inline-block text-sm font-bold ${highlight ? "text-[#5e7f0f]" : "text-[#3434ff]"}`}>{cta} <span className="inline-block transition group-hover:translate-x-1">→</span></span>
            </a>
          ))}
        </div>

        <h2 className="mt-11 text-[22px] font-bold">Common questions</h2>
        <div className="mt-5 overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white">
          {FAQS.map((f, i) => (
            <div key={f.q} className="border-b border-[#f1f4f8] last:border-0">
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center gap-4 px-6 py-5 text-left hover:bg-[#fafbff]">
                <span className="flex-1 text-base font-bold">{f.q}</span>
                <ChevronDown size={18} className={`shrink-0 text-[#94a3b8] transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="-mt-1 px-6 pb-5 text-sm leading-relaxed text-[#69697b]">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
