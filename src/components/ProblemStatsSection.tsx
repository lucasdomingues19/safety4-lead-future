import { Brain, Clock, AlertTriangle, TrendingUp, Shield } from "lucide-react";
import { CountingNumber } from "./CountingNumber";

const stats = [
  { Icon: Brain, value: 75, suffix: "%", label: "Lack AI Capability", desc: "Most EHS teams have no AI or digital readiness", color: "text-slate-900", border: "border-primary/40 hover:border-primary/70", glow: "from-primary/20 to-primary/10" },
  { Icon: Clock, value: 70, suffix: "%", label: "Time Wasted on Admin", desc: "Most EHS teams spend 70% of their time on admin instead of prevention", color: "text-slate-900", border: "border-primary/40 hover:border-primary/70", glow: "from-primary/20 to-primary/10" },
  { Icon: AlertTriangle, value: 42, suffix: "%", label: "AI Initiatives Abandoned", desc: "Most organizations abandon AI initiatives in first year—can't measure ROI", color: "text-slate-900", border: "border-primary/40 hover:border-primary/70", glow: "from-primary/20 to-primary/10" },
  { Icon: TrendingUp, value: 25, suffix: "%", label: "Missed Safety Improvements", desc: "Organizations using data analytics prevent 25% more incidents", color: "text-slate-900", border: "border-primary/40 hover:border-primary/70", glow: "from-primary/20 to-primary/10" },
  { Icon: Shield, value: 31, suffix: "%", label: "Lack Governance", desc: "Most organizations lack governance frameworks to scale AI safely", color: "text-slate-900", border: "border-primary/40 hover:border-primary/70", glow: "from-primary/20 to-primary/10" },
];

export const ProblemStatsSection = () => {
  return (
    <section className="py-10 md:py-14 pb-0 md:pb-0 relative ">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full">

          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-5">
            THE CHALLENGE
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4 md:mb-6 tracking-tight leading-[1.05]">
            <span className="text-primary">AI & Digital Transformation</span>: The EHS Function Gap
          </h2>

          <h3 className="text-lg md:text-2xl font-semibold text-slate-900 mb-6">
            Most EHS Functions Aren't Ready for AI & SafetyTech
          </h3>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-10">
            {stats.map((s) => (
              <div key={s.label} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.glow} rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
                <div className={`relative text-center space-y-2 md:space-y-4 bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-2 ${s.border} transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2 cursor-pointer`}>
                  <s.Icon size={28} className="text-slate-900 mx-auto" strokeWidth={1.5} />
                  <div className={`text-2xl md:text-3xl font-bold ${s.color} tabular-nums`}>
                    <CountingNumber target={s.value} suffix={s.suffix} duration={2000} />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">{s.label}</h3>
                  <p className="text-slate-600 text-xs md:text-sm hidden md:block">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Blue Band with Animation */}
          <div className="bg-primary text-white rounded-lg md:rounded-xl p-8 md:p-10 mb-10 md:mb-14 overflow-hidden min-h-[200px] flex items-center justify-center relative">
            <style>{`
              @keyframes fadeInOut {
                0%, 60% { opacity: 1; }
                70%, 100% { opacity: 0; }
              }
              @keyframes fadeOutIn {
                0%, 65% { opacity: 0; }
                75%, 100% { opacity: 1; }
              }
              .text-content-anim { animation: fadeInOut 10s infinite; }
              .question-anim { animation: fadeOutIn 10s infinite; }
            `}</style>

            {/* Original text */}
            <div className="text-content-anim absolute inset-0 flex flex-col items-center justify-center p-8 md:p-10">
              <p className="text-base md:text-lg mb-5 leading-relaxed">
                Most EHS functions aren't ready to implement, evaluate and govern AI and SafetyTech investments without building team capability first. Generic AI training won't prepare your team for the risks and opportunities of the digital age or help you comply with emerging regulations including the EU AI Act Article 4 on AI Literacy.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                While AI, safetytech and digital transformation reshape the safety industry at breakneck speed, most safety functions are being left behind, unprepared and unequipped to lead in the digital age.
              </p>
            </div>

            {/* Animated overlay */}
            <div className="question-anim absolute inset-0 flex items-center justify-center p-8">
              <h3 className="text-4xl md:text-5xl font-bold text-center text-white">
                Is Your Team Ready?
              </h3>
            </div>
          </div>

          {/* The Opportunity Section */}
          <div className="text-center w-full mb-10 md:mb-14">
            <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-5">
              THE OPPORTUNITY
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4 md:mb-6 tracking-tight leading-[1.05]">
              Transform Your EHS Function: Build the Capability to Govern AI
            </h2>
          </div>

        </div>
      </div>
    </section>
  );
};
