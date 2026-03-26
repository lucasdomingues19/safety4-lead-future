import { Shield, Award, FileDown, ArrowRight } from "lucide-react";
import { useState } from "react";
import BrochureDownloadModal from "./BrochureDownloadModal";
import AudienceNav from "./AudienceNav";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  const [brochureOpen, setBrochureOpen] = useState(false);

  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center">
      <AudienceNav />

      {/* Full background image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-[right_top] md:bg-top"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="mb-16 md:mb-20" />

        <div className="max-w-3xl">
          {/* Accreditation Badges */}
          <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8 flex-wrap">
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
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-4 md:mb-8">
            Safety Leadership Without <span className="text-lime-400">Digital Literacy</span> has Become a Liability
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-gray-300 max-w-2xl leading-relaxed mb-8 md:mb-12 font-light">
            The Safety 4.0 Academy is the world's first <span className="font-bold">IOSH-approved</span> and <span className="font-bold">CPD-accredited</span> programme designed and taught by industry experts for EHS leaders in the digital age.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-lime-500 text-black font-semibold text-lg rounded-full hover:bg-lime-400 transition-colors active:scale-[0.97]"
            >
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-medium text-lg rounded-full border border-white/20 hover:bg-white/20 transition-colors active:scale-[0.97]"
            >
              Talk to Us
            </a>
          </div>

          <BrochureDownloadModal open={brochureOpen} onOpenChange={setBrochureOpen} />
        </div>
      </div>
    </section>
  );
};
