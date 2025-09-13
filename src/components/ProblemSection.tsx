import { AlertTriangle, Clock, TrendingDown } from "lucide-react";

export const ProblemSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Dark gradient background matching hero section exactly */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating purple elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Purple blob - Top left */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-600/20 to-violet-500/15 blur-3xl animate-[float_18s_ease-in-out_infinite]"></div>
        
        {/* Purple blob - Top right */}
        <div className="absolute -top-10 -right-32 w-64 h-64 rounded-full bg-gradient-to-br from-violet-400/20 via-purple-500/25 to-purple-600/15 blur-3xl animate-[float_24s_ease-in-out_infinite_reverse]"></div>
        
        {/* Purple blob - Bottom center */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-purple-600/15 via-purple-400/20 to-violet-500/15 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        
        {/* Small accent elements */}
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-purple-500/15 blur-2xl animate-[float_26s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-violet-400/10 blur-2xl animate-[float_22s_ease-in-out_infinite_reverse]"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            Safety Leadership Without Digital Literacy{" "}
            <span className="text-pink-400">is a Liability</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            The safety industry is rapidly evolving. While others struggle with outdated approaches, 
            forward-thinking safety leaders are mastering digital transformation to stay relevant and valuable.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center space-y-4 animate-slide-up bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <TrendingDown className="w-12 h-12 text-red-400 mx-auto" />
              <h3 className="text-xl font-semibold text-white">Falling Behind</h3>
              <p className="text-gray-300">
                Traditional safety professionals are being outpaced by tech-savvy leaders
              </p>
            </div>
            
            <div className="text-center space-y-4 animate-slide-up bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10" style={{animationDelay: '0.2s'}}>
              <Clock className="w-12 h-12 text-red-400 mx-auto" />
              <h3 className="text-xl font-semibold text-white">Limited Career Growth</h3>
              <p className="text-gray-300">
                Without digital skills, career advancement opportunities become scarce
              </p>
            </div>
            
            <div className="text-center space-y-4 animate-slide-up bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10" style={{animationDelay: '0.4s'}}>
              <AlertTriangle className="w-12 h-12 text-pink-400 mx-auto" />
              <h3 className="text-xl font-semibold text-white">Obsolete Methods</h3>
              <p className="text-gray-300">
                Old-school safety management can't compete with AI-driven approaches
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};