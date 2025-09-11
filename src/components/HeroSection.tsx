import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-safety-leader.jpg";
import { ArrowRight, Shield, Zap } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-hero flex items-center py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-secondary font-medium">
                <Shield className="w-5 h-5" />
                <span>Future-Ready Safety Leadership</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-secondary leading-tight">
                Become the Safety Leader{" "}
                <span className="text-primary">Every Company Needs</span>{" "}
                in the Digital Age.
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Get IOSH & CPD-approved training to master AI, SafetyTech, and digital leadership.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Start Your Journey Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-8 bg-secondary rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">IOSH</span>
                </div>
                <span className="text-sm text-muted-foreground">Approved</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-12 h-8 bg-primary rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">CPD</span>
                </div>
                <span className="text-sm text-muted-foreground">Certified</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">AI-Powered Learning</span>
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