import { AlertCircle, TrendingDown, Users, Clock } from "lucide-react";

export const UrgentProblemSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-red-950/30 via-slate-900 to-black">
      {/* Urgent red glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          {/* Urgent badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-6 py-2 mb-8">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-semibold">The Safety Industry is Transforming NOW</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Your Safety Career is at a{" "}
            <span className="text-red-400">Critical Crossroads</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            While AI and digital transformation reshape the safety industry at breakneck speed, 
            most safety professionals are being left behind—unprepared and unequipped for what's coming.
          </p>

          {/* Urgent statistics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative text-center space-y-4 bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30 hover:border-red-500/50 transition-all">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <div className="text-4xl font-bold text-red-400">25%</div>
                <h3 className="text-lg font-semibold text-white">No AI Skills</h3>
                <p className="text-gray-300 text-sm">
                  of EHS practitioners have no AI skills or experience
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative text-center space-y-4 bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/30 hover:border-orange-500/50 transition-all">
                <TrendingDown className="w-12 h-12 text-orange-400 mx-auto" />
                <div className="text-4xl font-bold text-orange-400">61%</div>
                <h3 className="text-lg font-semibold text-white">Self-Identify as Beginners</h3>
                <p className="text-gray-300 text-sm">
                  of EHS professionals self-identify as beginners in AI
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative text-center space-y-4 bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/30 hover:border-pink-500/50 transition-all">
                <TrendingDown className="w-12 h-12 text-pink-400 mx-auto" />
                <div className="text-4xl font-bold text-pink-400">49%</div>
                <h3 className="text-lg font-semibold text-white">Investing in AI</h3>
                <p className="text-gray-300 text-sm">
                  of EHS functions plan to invest in AI within the next 12 months
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative text-center space-y-4 bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 hover:border-purple-500/50 transition-all">
                <Clock className="w-12 h-12 text-purple-400 mx-auto" />
                <div className="text-4xl font-bold text-purple-400">77%</div>
                <h3 className="text-lg font-semibold text-white">AI Skills Priority</h3>
                <p className="text-gray-300 text-sm">
                  of hiring managers prioritise AI skills when hiring
                </p>
              </div>
            </div>
          </div>

          {/* Urgent message */}
          <div className="mt-16 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/40 rounded-2xl p-8">
            <p className="text-lg text-gray-200 leading-relaxed">
              <span className="text-red-400 font-bold">The hard truth:</span> Traditional safety certifications 
              and years of experience won't protect your career anymore. Companies are actively seeking safety 
              leaders who can leverage AI, data analytics, and digital tools—or they're not hiring at all.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
