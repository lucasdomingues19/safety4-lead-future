import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-safety-leader.jpg";
import { ArrowRight, Shield, Zap } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-hero flex items-center py-20 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 font-medium text-sm border border-white/20">
                <Shield className="w-4 h-4" />
                <span>#1 CONVERSION-FOCUSED SAFETY TRAINING</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                The Best Safety Leadership{" "}
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  Training Solution for
                </span>
                <br />
                <span className="text-white">Conversions & Growth</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-white/80 max-w-xl leading-relaxed">
                Get more career opportunities when you master AI, SafetyTech, and digital leadership with IOSH & CPD-approved training built for each career advancement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button variant="hero" size="lg" className="group text-lg px-8 py-4 h-auto">
                Start Your Journey Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-4 h-auto">
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-8 bg-white/20 backdrop-blur-sm rounded flex items-center justify-center border border-white/30">
                  <span className="text-white text-sm font-bold">IOSH</span>
                </div>
                <span className="text-sm text-white/70">Approved</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-12 h-8 bg-primary/80 backdrop-blur-sm rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">CPD</span>
                </div>
                <span className="text-sm text-white/70">Certified</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-white/90">AI-Powered Learning</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-slide-up">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Professional safety leader with AI data visualization" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-card animate-glow-pulse">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">AI Safety Analytics</span>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-secondary text-white rounded-2xl p-4 shadow-card">
              <div className="text-sm">
                <div className="font-bold text-lg">98%</div>
                <div>Career Advancement Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};