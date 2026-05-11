import { AlertCircle, TrendingDown, TrendingUp, Clock } from "lucide-react";

const stats = [
  { icon: AlertCircle, value: "25%", label: "No AI Skills", desc: "of EHS practitioners have no AI skills", color: "text-red-400", border: "border-red-500/30 hover:border-red-500/50", glow: "from-red-500/20 to-orange-500/20" },
  { icon: TrendingDown, value: "61%", label: "AI Beginners", desc: "of EHS pros self-identify as beginners", color: "text-orange-400", border: "border-orange-500/30 hover:border-orange-500/50", glow: "from-orange-500/20 to-red-500/20" },
  { icon: TrendingUp, value: "49%", label: "Investing in AI", desc: "Companies plan to invest in AI within 12 months", color: "text-pink-400", border: "border-pink-500/30 hover:border-pink-500/50", glow: "from-red-500/20 to-pink-500/20" },
  { icon: Clock, value: "77%", label: "AI Priority", desc: "of hiring managers prioritise AI skills", color: "text-purple-400", border: "border-purple-500/30 hover:border-purple-500/50", glow: "from-purple-500/20 to-red-500/20" },
];

export const ProblemStatsSection = () => {
  return (
    <section className="py-20 md:py-28 relative border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-5xl mx-auto">

          <div className="text-[11px] uppercase tracking-[0.28em] text-[hsl(var(--primary))] font-semibold mb-5">
            Industry Outlook
          </div>

          <h2 className="text-white mb-5">
            Why <em className="not-italic text-[hsl(var(--primary))]">Safety 4.0</em>?
          </h2>

          <h3 className="font-sans text-base md:text-xl font-medium text-white/75 mb-10 max-w-2xl mx-auto">
            Your career stands at an unprecedented crossroads.
          </h3>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-10">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.glow} rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
                  <div className={`relative text-center space-y-2 md:space-y-4 bg-card/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border ${s.border} transition-all`}>
                    <Icon className={`w-8 h-8 md:w-10 md:h-10 ${s.color} mx-auto`} />
                    <div className={`text-2xl md:text-3xl font-bold ${s.color} tabular-nums`}>{s.value}</div>
                    <h3 className="text-sm md:text-base font-semibold text-white">{s.label}</h3>
                    <p className="text-gray-300 text-xs md:text-sm hidden md:block">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed max-w-3xl mx-auto">
            <span className="font-bold text-white">The hard truth:</span> traditional safety certifications
            won't protect your career anymore. Compliance-based credentials no longer signal readiness.
            Organisations are actively seeking safety leaders who can leverage AI and digital tools
            — and most professionals aren't there yet.
          </p>

          <p className="text-base md:text-lg text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
            While AI, safetytech and digital transformation reshape the safety industry at breakneck speed,
            most safety professionals are being left behind — unprepared and unequipped to lead in the digital age.
          </p>

          {/* Mission block */}
          <div className="max-w-3xl mx-auto text-left space-y-6">
            <h3 className="text-xl md:text-2xl font-bold text-lime-400 text-center">
              The Safety 4.0 Academy exists to change that
            </h3>

            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              We equip safety professionals with the AI literacy, digital fluency, and strategic mindset
              needed to lead — not just survive — in the evolving world of work. Our programme is built
              at the intersection of deep EHS expertise and real-world technology, designed for
              practitioners by practitioners.
            </p>

            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              We are proud to offer the world's first{" "}
              <span className="font-bold text-white">IOSH-approved</span> and{" "}
              <span className="font-bold text-white">CPD-accredited</span>{" "}
              Safety 4.0 programme — a benchmark of credibility in a space crowded with hype.
            </p>

            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
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
