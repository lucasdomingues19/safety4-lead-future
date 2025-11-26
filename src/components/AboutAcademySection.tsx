import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Globe, Award, Star } from "lucide-react";
import certificateSample from "../assets/certificate-sample.png";

export const AboutAcademySection = () => {
  return (
    <section id="about-academy" className="py-20 relative overflow-hidden">
      {/* Dark gradient background matching other sections */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating elements - Purple and Lime */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Purple blob - Top left */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-500/20 via-purple-600/15 to-violet-500/10 blur-3xl animate-[float_18s_ease-in-out_infinite]"></div>
        
        {/* Lime blob - Top right */}
        <div className="absolute -top-10 -right-32 w-64 h-64 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_24s_ease-in-out_infinite_reverse]"></div>
        
        {/* Lime blob - Bottom left */}
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-lime-500/15 via-lime-400/20 to-lime-600/10 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        
        {/* Purple blob - Bottom right */}
        <div className="absolute bottom-1/3 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/15 via-purple-500/20 to-purple-600/10 blur-3xl animate-[float_26s_ease-in-out_infinite_reverse]"></div>
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
                  into digital leaders. Trusted by industry giants and approved by{" "}
                  <a 
                    href="https://www.iosh.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline transition-colors"
                  >
                    IOSH
                  </a>.
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
                    <p className="text-white/70">Developed by safety and technology experts</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Global Recognition</h3>
                    <p className="text-white/70">IOSH approved and CPD certified certification program</p>
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
                <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center justify-center mb-3">
                    <Users className="w-10 h-10 text-secondary" />
                  </div>
                  <div className="text-lg font-semibold text-white/90 mb-1">Trusted by</div>
                  <div className="text-xl font-bold text-white">Global EHS Leaders</div>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center justify-center mb-3">
                    <Globe className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-white">World&apos;s First</div>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">99%</div>
                  <div className="text-lg font-semibold text-white/90">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            {/* Right Column - Photo Placeholder */}
            <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="relative">
                {/* Main image container */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:border-primary/50 transition-all duration-300">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl">
                    {/* Certificate sample */}
                    <img 
                      src={certificateSample}
                      alt="Safety 4.0 Academy Certificate Sample - IOSH approved certification"
                      className="w-full h-full object-contain p-4 bg-white/5"
                    />
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