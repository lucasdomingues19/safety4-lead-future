import { AlertCircle, TrendingDown, TrendingUp, Clock } from "lucide-react";

const stats = [
  { icon: AlertCircle, value: "25%", label: "No AI Skills", desc: "of EHS practitioners have no AI skills", color: "text-primary", border: "border-primary/30 hover:border-primary/50", glow: "from-primary/20 to-primary/10" },
  { icon: TrendingDown, value: "61%", label: "AI Beginners", desc: "of EHS pros self-identify as beginners", color: "text-primary", border: "border-primary/30 hover:border-primary/50", glow: "from-primary/20 to-primary/10" },
  { icon: TrendingUp, value: "49%", label: "Investing in AI", desc: "Companies plan to invest in AI within 12 months", color: "text-primary", border: "border-primary/30 hover:border-primary/50", glow: "from-primary/20 to-primary/10" },
  { icon: Clock, value: "77%", label: "AI Priority", desc: "of hiring managers prioritise AI skills", color: "text-primary", border: "border-primary/30 hover:border-primary/50", glow: "from-primary/20 to-primary/10" },
];

export const ProblemStatsSection = () => {
  return (
    <section className="py-12 md:py-16 relative ">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-5xl mx-auto">

          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-5">
            THE PROBLEM
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 md:mb-6 tracking-tight leading-[1.05]">
            <span className="text-primary">Digital Skills Gap</span>: The Exposed Risk in EHS
          </h2>

          <h3 className="text-lg md:text-2xl font-semibold text-slate-900 mb-6">
            Your Career is at an Unprecedented Crossroads
          </h3>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-10">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.glow} rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
                  <div className={`relative text-center space-y-2 md:space-y-4 bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border ${s.border} transition-all`}>
                    <Icon className={`w-8 h-8 md:w-10 md:h-10 ${s.color} mx-auto`} />
                    <div className={`text-2xl md:text-3xl font-bold ${s.color} tabular-nums`}>{s.value}</div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900">{s.label}</h3>
                    <p className="text-slate-600 text-xs md:text-sm hidden md:block">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed text-left">
            <span className="font-bold text-slate-900">The hard truth:</span> traditional safety certifications
            won't protect your career anymore. Compliance-based credentials no longer signal readiness.
            Organisations are actively seeking safety leaders who can leverage AI and digital tools
            — and most professionals aren't there yet.
          </p>

          <p className="text-base md:text-lg text-slate-600 mb-10 leading-relaxed text-left">
            While AI, safetytech and digital transformation reshape the safety industry at breakneck speed,
            most safety professionals are being left behind — unprepared and unequipped to lead in the digital age.
          </p>

          {/* Mission block */}
          <div className="text-left space-y-6">
            <h3 className="text-xl md:text-2xl font-bold text-primary">
              The Safety 4.0 Academy exists to change that
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
              Safety 4.0 Academy gives you the tools, the language, and the confidence to shape
              what comes next.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
