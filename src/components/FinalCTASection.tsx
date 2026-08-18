import { ArrowRight, Star, Users, Award } from "lucide-react";

export const FinalCTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Floating elements - Lime accent */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-primary/15 via-primary/20 to-primary/10 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-primary/10 via-primary/15 to-primary/5 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8 tracking-tight leading-[1.05]">
            Join the Safety 4.0 
            <br />
            <span className="text-primary">Academy Now</span>
          </h2>
          
          <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
            Transform your safety career with the skills that matter most in the digital age. 
            Join thousands of professionals who've already made the leap.
          </p>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center animate-slide-up">
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">5,000+</div>
              <p className="text-white/80">Professionals Trained</p>
            </div>
            
            <div className="text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="flex justify-center mb-4">
                <Star className="w-12 h-12 text-primary" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
              <p className="text-white/80">Average Rating</p>
            </div>
            
            <div className="text-center animate-slide-up" style={{animationDelay: '0.4s'}}>
              <div className="flex justify-center mb-4">
                <Award className="w-12 h-12 text-primary" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">98%</div>
              <p className="text-white/80">Career Advancement</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="/enrol"
              className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-full hover:opacity-90 transition-opacity active:scale-[0.97]"
            >
              Enrol Now
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-medium text-lg rounded-full border border-white/20 hover:bg-white/20 transition-colors"
            >
              Schedule Free Consultation
            </a>
          </div>

          {/* Info */}
          <div className="text-white/70 space-y-2">
            <p className="text-sm">
              IOSH & CPD Approved • 90-Day Course Access • 14-Day Money Back Guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
