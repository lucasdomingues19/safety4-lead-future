import { Shield, Award, ArrowRight } from "lucide-react";
import AudienceNav from "./AudienceNav";
import heroWorker from "@/assets/hero-worker.png.asset.json";
import ioshLogo from "@/assets/iosh-approved-logo.jpg";
import cpdLogo from "@/assets/cpd-approved-logo.png";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center">
      <AudienceNav />

      {/* Grid lines background */}
      <div className="absolute inset-0" style={{ backgroundColor: "#0a1530" }} />
      <div
        className="absolute inset-0 animate-grid-pan"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20,184,166,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20,184,166,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />
      {/* Brighter accent grid for depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "280px 280px",
        }}
      />
      {/* Moving glow that sweeps across the grid */}
      <div className="absolute inset-0 animate-grid-glow pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1530]/95 via-[#0a1530]/70 to-transparent" />


      {/* Worker photo — right side */}
      <img
        src={heroWorker.url}
        alt=""
        className="hidden lg:block absolute right-0 top-0 h-full w-auto object-cover opacity-80 pointer-events-none"
        style={{
          maskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25%)",
          WebkitMaskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="mb-16 md:mb-20" />

        <div className="max-w-3xl">
          {/* Accreditation Badges */}
          <div className="flex items-center gap-3 md:gap-5 mb-6 md:mb-8 flex-wrap">
            <img
              src={ioshLogo}
              alt="IOSH Approved"
              className="h-8 md:h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
              title="IOSH Approved"
            />
            <img
              src={cpdLogo}
              alt="CPD Accredited"
              className="h-8 md:h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
              title="CPD Accredited"
            />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white mb-4 md:mb-8">
            Build a Safety Function Ready for the <span style={{ color: "#c4ff00" }}>Digital Age</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-gray-300 max-w-2xl leading-relaxed mb-6 md:mb-8 font-light">
            Upskill your EHS team with the world's first IOSH-approved and CPD-accredited Safety 4.0 programme.
          </p>




          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-lime-500 text-white font-semibold text-lg rounded-full hover:bg-lime-400 transition-colors active:scale-[0.97]"
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
