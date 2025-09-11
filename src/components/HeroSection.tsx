import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Play } from "lucide-react";

export const HeroSection = () => {
  return (
    <>
      {/* Stats Bar */}
      <section className="bg-card border-b border-border/20 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">2,500+</div>
              <div className="text-sm text-muted-foreground">Safety professionals trained</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-secondary">98%</div>
              <div className="text-sm text-muted-foreground">Career advancement rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Countries represented</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Hero */}
      <section className="min-h-screen bg-gradient-hero flex items-center py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border border-secondary rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 border border-primary rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-secondary rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 border border-primary rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Logo Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/049acaaf-1bd3-4d4f-9946-bdba05a354cf.png" 
                alt="Safety 4.0 Academy Logo" 
                className="h-20 w-auto"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-10 animate-fade-in text-center lg:text-left">
              <div className="space-y-8">
                <div className="inline-flex items-center space-x-2 text-secondary font-medium bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Future-Ready Safety Leadership</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight">
                  Master <span className="text-secondary block lg:inline">AI-Powered Safety,</span>
                  <br className="hidden lg:block" />
                  Lead the <span className="text-primary">Digital Revolution</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed mx-auto lg:mx-0 font-light">
                  The only IOSH & CPD-approved program that transforms safety professionals into digital leaders ready for Industry 4.0.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button variant="hero" size="lg" className="group text-lg px-10 py-6 font-semibold">
                  START YOUR TRANSFORMATION
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button variant="outline" size="lg" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground text-lg px-10 py-6 font-semibold">
                  EXPLORE CURRICULUM
                </Button>
              </div>

              {/* Social Proof */}
              <div className="space-y-4 pt-6">
                <p className="text-sm text-muted-foreground font-medium">TRUSTED BY LEADING ORGANIZATIONS:</p>
                <div className="flex items-center justify-center lg:justify-start space-x-8 opacity-60">
                  <div className="text-xs font-bold tracking-wider">SHELL</div>
                  <div className="text-xs font-bold tracking-wider">BP</div>
                  <div className="text-xs font-bold tracking-wider">SIEMENS</div>
                  <div className="text-xs font-bold tracking-wider">3M</div>
                </div>
              </div>

              {/* Certifications */}
              <div className="flex items-center justify-center lg:justify-start space-x-6 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-12 bg-secondary rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">IOSH</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">IOSH Approved</div>
                    <div className="text-xs text-muted-foreground">Globally Recognized</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-background text-xs font-bold">CPD</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">CPD Certified</div>
                    <div className="text-xs text-muted-foreground">40 Hours Credit</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Video Placeholder */}
            <div className="relative animate-slide-up">
              <div className="relative bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/20 hover:shadow-glow transition-all duration-500">
                {/* Video Placeholder */}
                <div className="aspect-video bg-gradient-secondary flex items-center justify-center relative group cursor-pointer hover:bg-gradient-primary transition-all duration-500">
                  <div className="absolute inset-0 bg-black/30"></div>
                  
                  {/* Video Content */}
                  <div className="relative z-10 text-center p-8">
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto shadow-glow group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                      <Play className="w-10 h-10 text-background ml-1" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Watch Course Preview</h3>
                    <p className="text-white/90 text-lg mb-4">Discover how Safety 4.0 will revolutionize your career</p>
                    <div className="inline-flex items-center space-x-2 text-white/80 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span>New: AI Safety Masterclass</span>
                    </div>
                  </div>
                  
                  {/* Play Button Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-radial from-primary/30 to-transparent"></div>
                  </div>
                </div>
                
                {/* Video Info Bar */}
                <div className="p-6 bg-card border-t border-border/20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="font-medium">Duration: 5:30</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">Course Introduction</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Premium Content</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Achievement Cards */}
              <div className="absolute -top-8 -right-8 bg-card rounded-2xl p-4 shadow-card animate-glow-pulse border border-border/20 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                  <div className="text-sm">
                    <div className="font-semibold">AI Analytics</div>
                    <div className="text-xs text-muted-foreground">Real-time insights</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-8 -left-8 bg-secondary text-white rounded-2xl p-5 shadow-card border border-secondary/20">
                <div className="text-center">
                  <div className="font-bold text-2xl">98%</div>
                  <div className="text-sm opacity-90">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};