import { Shield, Award } from "lucide-react";
import { useState, useEffect } from "react";
import AudienceNav from "./AudienceNav";

export const HeroSection = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentHeadline((prev) => (prev + 1) % 2);
        setIsTransitioning(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-[90vh] relative overflow-hidden flex items-center">
      {/* Top Banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-lime-500 via-lime-400 to-lime-500 text-black text-center py-2 md:py-2.5 px-3 md:px-4">
        <a href="/cohort" className="font-semibold text-xs md:text-base hover:underline leading-tight">
          🚀 Applications <span className="font-extrabold">OPEN</span> for the April Cohort — <span className="underline underline-offset-2">Enrol Now →</span>
        </a>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <AudienceNav />
        <div className="mb-28 md:mb-32" />

        <div className="text-center max-w-5xl mx-auto">
          {/* Accreditation Badges */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-8 flex-wrap">
            <div className="inline-flex items-center space-x-1 md:space-x-2 text-primary font-medium bg-primary/10 px-3 md:px-6 py-2 md:py-3 rounded-full border border-primary/20 text-sm md:text-base">
              <Award className="w-3 h-3 md:w-4 md:h-4" />
              <span>IOSH Approved</span>
            </div>
            <div className="inline-flex items-center space-x-1 md:space-x-2 text-pink-500 font-medium bg-pink-500/10 px-3 md:px-6 py-2 md:py-3 rounded-full border border-pink-500/20 text-sm md:text-base">
              <Shield className="w-3 h-3 md:w-4 md:h-4" />
              <span>CPD Accredited</span>
            </div>
          </div>

          {/* Headline */}
          <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {currentHeadline === 0 ? (
              <>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-4 md:mb-8">
                  Safety Leadership Without <span className="text-lime-400">Digital Literacy</span> has Become a <span className="text-lime-400">Liability</span>
                </h1>
                <p className="text-base md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 md:mb-12 font-light">
                  The safety industry is rapidly evolving. While others struggle with outdated approaches, <span className="font-bold text-lime-400">forward-thinking safety leaders are mastering digital transformation</span> to stay ahead
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-4 md:mb-8">
                  Build an <span className="text-primary">AI-ready</span> safety team. Upgrade your <span className="text-primary">impact.</span>
                </h1>
                <p className="text-base md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 md:mb-12 font-light">
                  The world's first IOSH-approved and CPD-accredited Safety 4.0 programme. <span className="font-bold text-lime-400">Trusted by Siemens, LEGO, MARSH, and safety teams across 12 countries.</span>
                </p>
              </>
            )}
          </div>

          {/* Video */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:border-primary/50 transition-all duration-300">
              <iframe
                className="w-full aspect-video rounded-xl"
                src="https://www.youtube.com/embed/GUT9G9hnBXI?autoplay=1&mute=1&loop=1&playlist=GUT9G9hnBXI&controls=1&modestbranding=1&rel=0"
                title="Safety 4.0 Course Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          {/* Single CTA */}
          <a
            href="/cohort"
            className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-semibold text-lg rounded-full hover:opacity-90 transition-opacity active:scale-95"
          >
            Enrol Now
          </a>
        </div>
      </div>
    </section>
  );
};
