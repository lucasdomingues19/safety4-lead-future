import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Award } from "lucide-react";

export const FinalCTASection = () => {
  return (
    <section className="py-20 bg-gradient-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 border border-white/20 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
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

          {/* Main CTA */}
          <div className="space-y-8">
            <Button 
              variant="hero" 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white text-2xl font-bold py-6 px-12 h-auto group shadow-glow"
            >
              Join the Safety 4.0 Academy Now
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            <div className="text-white/80 space-y-2">
              <p className="text-lg">
                <span className="font-semibold">Early Bird Special:</span> Save 30% if you enroll today
              </p>
              <p className="text-sm">
                IOSH & CPD Approved • Lifetime Access • 30-Day Money Back Guarantee
              </p>
            </div>
          </div>

          {/* Urgency Indicator */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-glow-pulse">
            <p className="text-white font-semibold text-lg mb-2">
              🔥 Limited Time: Next Cohort Starts in 14 Days
            </p>
            <p className="text-white/80 text-sm">
              Only 47 spots remaining • Don't wait, prices increase after this week
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};