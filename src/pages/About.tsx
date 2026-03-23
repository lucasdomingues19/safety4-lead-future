import AudienceNav from "@/components/AudienceNav";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";

const About = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "About Safety 4.0 Academy | World's First IOSH-Approved Safety 4.0 Program",
      description: "Learn about Safety 4.0 Academy — the world's first IOSH and CPD-approved certification program for digital safety leadership. Discover our mission to transform workplace safety through AI, IoT, and SafetyTech.",
      canonical: "https://safetyacademy.tech/about",
    });
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-black"></div>
      <AudienceNav />
      
      {/* Floating elements - Purple and Lime */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Purple blob - Top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-600/20 to-violet-500/15 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        
        {/* Lime blob - Top right */}
        <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        
        {/* Purple blob - Bottom left */}
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/15 via-purple-500/20 to-purple-400/10 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        
        {/* Lime blob - Bottom right */}
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-lime-500/15 via-lime-400/20 to-lime-600/10 blur-3xl animate-[float_28s_ease-in-out_infinite_reverse]"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Back Navigation */}
        <div className="mb-12">
          <Button variant="outline" size="sm" asChild className="border-white/30 text-white hover:bg-white/10">
            <a href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            About <span className="text-pink-500">Safety 4.0</span> Academy
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Pioneering the future of safety leadership through cutting-edge digital transformation
          </p>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto space-y-16">
          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-4">
              Safety 4.0 Academy was founded with a singular vision: to transform traditional safety professionals 
              into digital leaders ready for Industry 4.0. We believe that the future of workplace safety lies at 
              the intersection of human expertise and advanced technology.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Our comprehensive programs bridge the gap between conventional safety practices and the demands of 
              modern digital workplaces, ensuring professionals are equipped with both the technical skills and 
              strategic mindset needed to excel in tomorrow's safety landscape.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Why Safety 4.0?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-lime-400 mb-4">Industry Recognition</h3>
                <p className="text-gray-300">
                  The only safety program globally recognized by both IOSH and CPD, ensuring your credentials 
                  are valued worldwide.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-pink-500 mb-4">Proven Results</h3>
                <p className="text-gray-300">
                  98% of our graduates report significant career impact and advancement.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-lime-400 mb-4">Global Network</h3>
                <p className="text-gray-300">
                   Join a global community of safety leaders, innovators and changemakers ready to transform their career.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-purple-400 mb-4">Future-Ready</h3>
                <p className="text-gray-300">
                  Our curriculum evolves with emerging technologies, ensuring you stay ahead of industry 
                  trends and maintain your competitive edge.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;