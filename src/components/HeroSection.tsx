import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Play } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-hero flex items-center py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-secondary rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 border border-primary rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-secondary rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/049acaaf-1bd3-4d4f-9946-bdba05a354cf.png" 
              alt="Safety 4.0 Academy Logo" 
              className="h-24 w-auto"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in text-center lg:text-left">
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-secondary font-medium">
                <Shield className="w-5 h-5" />
                <span>Future-Ready Safety Leadership</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Master <span className="text-secondary">AI-Powered Safety</span>{" "}
                <br />
                Lead the <span className="text-primary">Digital Revolution</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mx-auto lg:mx-0">
                IOSH & CPD-approved training for safety professionals ready to embrace AI, SafetyTech, and digital transformation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="group text-lg px-8 py-4">
                Start Your Journey Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground text-lg px-8 py-4">
                Explore Curriculum
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center lg:justify-start space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <div className="w-14 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">IOSH</span>
                </div>
                <span className="text-sm text-muted-foreground">Approved</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-14 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-background text-sm font-bold">CPD</span>
                </div>
                <span className="text-sm text-muted-foreground">Certified</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
            </div>
          </div>

          {/* Right Video Placeholder */}
          <div className="relative animate-slide-up">
            <div className="relative bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/20">
              {/* Video Placeholder */}
              <div className="aspect-video bg-gradient-secondary flex items-center justify-center relative group cursor-pointer hover:bg-gradient-primary transition-all duration-300">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-background ml-1" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Watch Course Introduction</h3>
                  <p className="text-white/80">Discover how Safety 4.0 will transform your career</p>
                </div>
                
                {/* Play Button Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent"></div>
                </div>
              </div>
              
              {/* Video Stats */}
              <div className="p-6 bg-card">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">Duration: 3:42</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Course Preview</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">New</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Achievement Cards */}
            <div className="absolute -top-6 -right-6 bg-card rounded-2xl p-4 shadow-card animate-glow-pulse border border-border/20">
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