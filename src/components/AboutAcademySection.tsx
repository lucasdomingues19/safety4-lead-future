import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Globe, Award } from "lucide-react";

export const AboutAcademySection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Dark gradient background matching other sections */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating elements with design system colors */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary lime blob - Top left */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-primary/25 via-primary/20 to-primary/15 blur-3xl animate-[float_18s_ease-in-out_infinite]"></div>
        
        {/* Secondary pink blob - Top right */}
        <div className="absolute -top-10 -right-32 w-64 h-64 rounded-full bg-gradient-to-br from-secondary/20 via-secondary/25 to-secondary/15 blur-3xl animate-[float_24s_ease-in-out_infinite_reverse]"></div>
        
        {/* Mixed gradient blob - Bottom center */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-primary/15 via-secondary/20 to-primary/15 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        
        {/* Small accent elements */}
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-secondary/15 blur-2xl animate-[float_26s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-primary/10 blur-2xl animate-[float_22s_ease-in-out_infinite_reverse]"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Content */}
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  About the <span className="text-primary">Safety 4.0 Academy</span>
                </h2>
                
                <p className="text-xl text-white/90 leading-relaxed mb-8">
                  The world's first globally recognized academy dedicated to transforming safety professionals 
                  into digital leaders. Trusted by industry giants and endorsed by IOSH.
                </p>
                
                <p className="text-lg text-white/80 leading-relaxed">
                  We bridge the gap between traditional safety management and the digital future, 
                  empowering professionals with cutting-edge AI, IoT, and data analytics skills 
                  that drive real organizational transformation.
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Industry-Leading Curriculum</h3>
                    <p className="text-white/70">Developed with Fortune 500 companies and safety experts</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Global Recognition</h3>
                    <p className="text-white/70">IOSH approved and CPD accredited certification program</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Practical Implementation</h3>
                    <p className="text-white/70">Real-world case studies and hands-on digital tools</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold text-white">2,500+</div>
                  <div className="text-white/70 text-sm">Professionals Trained</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Globe className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-white/70 text-sm">Countries Reached</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-white/70 text-sm">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right Column - Photo Placeholder */}
            <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="relative">
                {/* Main image container */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-primary/50 transition-all duration-300">
                  <div className="aspect-[4/5] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center overflow-hidden">
                    {/* Photo placeholder */}
                    <div className="text-white/60 text-center space-y-4">
                      <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                        <Users className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-lg font-semibold">Academy Photo</div>
                        <div className="text-sm text-white/50">Modern facilities & expert instructors</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative badge */}
                  <div className="absolute -top-4 -right-4 bg-primary text-background px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Est. 2020
                  </div>
                </div>
                
                {/* Floating accreditation badges */}
                <div className="absolute -bottom-6 -left-6 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2 text-white">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold">IOSH Approved</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};