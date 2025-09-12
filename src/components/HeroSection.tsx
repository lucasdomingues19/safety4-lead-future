import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Play } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen bg-background relative overflow-hidden">
      {/* Dark gradient background similar to LeadPages */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header with Logo */}
        <div className="flex justify-between items-center mb-16">
          <img 
            src="/lovable-uploads/b2270dc3-9eae-4580-8e94-747f6660bccc.png" 
            alt="Safety 4.0 Academy Logo" 
            className="h-20 w-auto"
          />
          <div className="hidden md:flex items-center space-x-6 text-white/80 text-sm">
            <span>2,500+ Professionals Trained</span>
            <span>•</span>
            <span>98% Career Advancement</span>
            <span>•</span>
            <span>50+ Countries</span>
          </div>
        </div>

        {/* Main Content - Centered like LeadPages */}
        <div className="text-center max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 text-pink-400 font-medium bg-pink-400/10 px-6 py-3 rounded-full border border-pink-400/20 mb-8">
            <Shield className="w-4 h-4" />
            <span>IOSH & CPD Approved Program</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-8">
            Become the <span className="text-pink-500">Safety 4.0</span> Leader<br />
            in the Digital Age
          </h1>
          
          {/* Subheading */}
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12 font-light">
            Transform from traditional safety professional to digital leader with the only Industry 4.0 safety program trusted by global organizations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-lime-500 hover:bg-lime-600 text-white text-lg px-12 py-6 font-semibold rounded-xl group shadow-2xl"
            >
              START YOUR TRANSFORMATION
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-12 py-6 font-semibold rounded-xl"
            >
              EXPLORE CURRICULUM
            </Button>
          </div>

          {/* Showcase Section - Similar to LeadPages gallery */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Course Preview Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-pink-400/50 transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl mb-4 flex items-center justify-center">
                <Play className="w-12 h-12 text-white/80" />
              </div>
              <h3 className="text-white font-semibold mb-2">AI Safety Analytics</h3>
              <p className="text-gray-400 text-sm">Learn predictive safety modeling with AI</p>
            </div>

            {/* Digital Leadership Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-pink-400/50 transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl mb-4 flex items-center justify-center">
                <Zap className="w-12 h-12 text-white/80" />
              </div>
              <h3 className="text-white font-semibold mb-2">Digital Leadership</h3>
              <p className="text-gray-400 text-sm">Master Industry 4.0 safety technologies</p>
            </div>

            {/* Certification Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-pink-400/50 transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl mb-4 flex items-center justify-center">
                <Shield className="w-12 h-12 text-white/80" />
              </div>
              <h3 className="text-white font-semibold mb-2">Global Certification</h3>
              <p className="text-gray-400 text-sm">IOSH recognized worldwide credential</p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-gray-400 text-sm mb-6">TRUSTED BY GLOBAL LEADERS</p>
            <div className="flex items-center justify-center space-x-12 opacity-60">
              <div className="text-white font-bold tracking-wider">SHELL</div>
              <div className="text-white font-bold tracking-wider">BP</div>
              <div className="text-white font-bold tracking-wider">SIEMENS</div>
              <div className="text-white font-bold tracking-wider">3M</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};