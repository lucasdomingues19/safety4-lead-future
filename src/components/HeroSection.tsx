import { Shield, Award, ArrowRight } from "lucide-react";
import AudienceNav from "./AudienceNav";
import heroWorker from "@/assets/hero-worker.png.asset.json";
import ioshLogo from "@/assets/iosh-approved-logo.jpg";
import cpdLogo from "@/assets/cpd-approved-logo.png";

export const HeroSection = () => {
  return (
    <section
      className="relative overflow-hidden min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center bg-background"
    >
      <AudienceNav />

      {/* Grid lines background - subtle brand-aligned design */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(29,95,214,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(29,95,214,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Larger accent grid for depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(166,226,26,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(166,226,26,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "240px 240px",
        }}
      />
      {/* Moving glow that sweeps across the grid */}
      <div className="absolute inset-0 animate-grid-glow pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1530]/95 via-[#0a1530]/70 to-transparent" />


      {/* Worker photo — right side */}
      <img
        src={heroWorker.url}
        alt=""
        width={1200}
        height={1200}
        decoding="async"
        fetchPriority="high"
        className="hidden lg:block absolute right-0 top-0 h-full w-auto object-cover opacity-80 pointer-events-none"

        style={{
          maskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25%)",
          WebkitMaskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="mb-16 md:mb-20" />

        <div className="max-w-3xl">
          {/* Accreditation Badges - Professional presentation */}
          <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200">
              <img
                src={ioshLogo}
                alt="IOSH Approved"
                className="h-8 md:h-9 w-auto"
                title="IOSH Approved"
              />
              <span className="text-xs md:text-sm text-gray-300 font-medium">IOSH Approved</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200">
              <img
                src={cpdLogo}
                alt="CPD Accredited"
                className="h-8 md:h-9 w-auto"
                title="CPD Accredited"
              />
              <span className="text-xs md:text-sm text-gray-300 font-medium">CPD Accredited</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white mb-4 md:mb-8">
            Build a Safety Function Ready for the <span className="text-accent">Digital Age</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-gray-200 max-w-2xl leading-relaxed mb-6 md:mb-8 font-light">
            AI workplace safety certification for EHS teams — the world's first IOSH-approved,
            CPD-accredited Safety 4.0 programme. Build a safety function ready for AI, IoT and
            SafetyTech.
          </p>




          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="/#pricing"
              onClick={(e) => {
                const el = document.getElementById("pricing");
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth" });
                  window.history.replaceState(null, "", "/#pricing");
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold text-lg rounded-full hover:bg-primary/90 transition-all active:scale-[0.97] shadow-md hover:shadow-lg"
            >
              Upskill My Team
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
