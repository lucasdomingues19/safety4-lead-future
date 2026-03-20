import { AlertCircle, TrendingDown, TrendingUp, Clock } from "lucide-react";

const stats = [
  { icon: AlertCircle, value: "25%", label: "No AI Skills", desc: "of EHS practitioners have no AI skills", color: "text-red-400", border: "border-red-500/30 hover:border-red-500/50", glow: "from-red-500/20 to-orange-500/20" },
  { icon: TrendingDown, value: "61%", label: "AI Beginners", desc: "of EHS pros self-identify as beginners", color: "text-orange-400", border: "border-orange-500/30 hover:border-orange-500/50", glow: "from-orange-500/20 to-red-500/20" },
  { icon: TrendingUp, value: "49%", label: "Investing in AI", desc: "plan to invest in AI within 12 months", color: "text-pink-400", border: "border-pink-500/30 hover:border-pink-500/50", glow: "from-red-500/20 to-pink-500/20" },
  { icon: Clock, value: "77%", label: "AI Priority", desc: "of hiring managers prioritise AI skills", color: "text-purple-400", border: "border-purple-500/30 hover:border-purple-500/50", glow: "from-purple-500/20 to-red-500/20" },
];

export const ProblemStatsSection = () => {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-5xl mx-auto">

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            Why <span className="text-lime-400">Safety 4.0</span>?
          </h2>

          <h3 className="text-lg md:text-2xl font-semibold text-white mb-4">
            Your Career is at an Unprecedented Crossroads
          </h3>

          <p className="text-base md:text-xl text-gray-300 mb-8 md:mb-12 leading-relaxed max-w-3xl mx-auto">
            While AI, safetytech and digital transformation reshape the safety industry at breakneck speed,
            most safety professionals are being left behind—unprepared and unequipped to lead in the digital age.
          </p>
          <p className="text-base md:text-xl text-gray-300 mb-8 md:mb-12 leading-relaxed max-w-3xl mx-auto">
            <span className="font-bold text-white">The hard truth:</span> Traditional safety certifications
            won't protect your career anymore. Companies are actively seeking safety
            leaders who can leverage AI and digital tools.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.glow} rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
                  <div className={`relative text-center space-y-2 md:space-y-4 bg-slate-900/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border ${s.border} transition-all`}>
                    <Icon className={`w-8 h-8 md:w-10 md:h-10 ${s.color} mx-auto`} />
                    <div className={`text-2xl md:text-3xl font-bold ${s.color} tabular-nums`}>{s.value}</div>
                    <h3 className="text-sm md:text-base font-semibold text-white">{s.label}</h3>
                    <p className="text-gray-300 text-xs md:text-sm hidden md:block">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 md:mt-12 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/40 rounded-xl md:rounded-2xl p-4 md:p-6">
            <p className="text-sm md:text-base text-gray-200 leading-relaxed">
              <span className="text-red-400 font-bold">The hard truth:</span> Traditional safety certifications
              won't protect your career anymore. Companies are actively seeking safety
              leaders who can leverage AI and digital tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
