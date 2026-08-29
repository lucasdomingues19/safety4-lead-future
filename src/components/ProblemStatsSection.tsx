import IconAICapability from "../assets/icon-ai-capability.svg";
import IconTimeWasted from "../assets/icon-time-wasted.svg";
import IconAbandoned from "../assets/icon-abandoned.svg";
import IconSafetyImprovements from "../assets/icon-safety-improvements.svg";
import IconGovernance from "../assets/icon-governance.svg";

const stats = [
  { icon: IconAICapability, value: "75%", label: "Lack AI Capability", desc: "Most EHS teams have no AI or digital readiness", color: "text-primary", border: "border-primary/30 hover:border-primary/50", glow: "from-primary/20 to-primary/10" },
  { icon: IconTimeWasted, value: "70%", label: "Time Wasted on Admin", desc: "Most EHS teams spend 70% of their time on admin instead of prevention", color: "text-primary", border: "border-primary/30 hover:border-primary/50", glow: "from-primary/20 to-primary/10" },
  { icon: IconAbandoned, value: "42%", label: "AI Initiatives Abandoned", desc: "Most organizations abandon AI initiatives in first year—can't measure ROI", color: "text-primary", border: "border-primary/30 hover:border-primary/50", glow: "from-primary/20 to-primary/10" },
  { icon: IconSafetyImprovements, value: "25%", label: "Missed Safety Improvements", desc: "Organizations using data analytics prevent 25% more incidents", color: "text-primary", border: "border-primary/30 hover:border-primary/50", glow: "from-primary/20 to-primary/10" },
  { icon: IconGovernance, value: "31%", label: "Lack Governance", desc: "Most organizations lack governance frameworks to scale AI safely", color: "text-primary", border: "border-primary/30 hover:border-primary/50", glow: "from-primary/20 to-primary/10" },
];

export const ProblemStatsSection = () => {
  return (
    <section className="py-10 md:py-14 relative ">
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
                <div className={`relative text-center space-y-2 md:space-y-4 bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border ${s.border} transition-all`}>
                  <img src={s.icon} alt={s.label} className="w-12 h-12 md:w-14 md:h-14 mx-auto" />
                  <div className={`text-2xl md:text-3xl font-bold ${s.color} tabular-nums`}>{s.value}</div>
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">{s.label}</h3>
                  <p className="text-slate-600 text-xs md:text-sm hidden md:block">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Blue Band */}
          <div className="bg-primary text-white rounded-lg md:rounded-xl p-8 md:p-10 mb-10 md:mb-14">
            <p className="text-base md:text-lg mb-5 leading-relaxed">
              Most EHS functions aren't ready to implement, evaluate and govern AI and SafetyTech investments without building team capability first. Generic AI training won't prepare your team for the risks and opportunities of the digital age or help you comply with emerging regulations including the EU AI Act Article 4 on AI Literacy.
            </p>

            <p className="text-base md:text-lg leading-relaxed">
              While AI, safetytech and digital transformation reshape the safety industry at breakneck speed, most safety functions are being left behind, unprepared and unequipped to lead in the digital age.
            </p>
          </div>

          {/* Mission block */}
          <div className="text-left space-y-6">
            <h3 className="text-xl md:text-2xl font-bold text-primary">
              The SafetyTech Academy exists to change that
            </h3>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed">
              We equip safety professionals with the AI literacy, digital fluency, and strategic mindset
              needed to lead — not just survive — in the evolving world of work. Our programme is built
              at the intersection of deep EHS expertise and real-world technology, designed for
              practitioners by practitioners.
            </p>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed">
              We are proud to offer the world's first{" "}
              <span className="font-bold text-slate-900">IOSH-approved</span> and{" "}
              <span className="font-bold text-slate-900">CPD-accredited</span>{" "}
              Safety 4.0 programme — a benchmark of credibility in a space crowded with hype.
            </p>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed">
              Whether you're a seasoned EHS Leader willing to upskill yourself and your teams,
              SafetyTech Academy gives you the tools, the language, and the confidence to shape
              what comes next.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
