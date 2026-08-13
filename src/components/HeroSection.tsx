import { Shield, Award, ArrowRight } from "lucide-react";
import AudienceNav from "./AudienceNav";
import heroWorker from "@/assets/hero-worker.png.asset.json";
import ioshLogo from "@/assets/iosh-approved-logo.jpg";
import cpdLogo from "@/assets/cpd-approved-logo.png";
import { DigitalDotsText } from "./DigitalDotsText";

export const HeroSection = () => {
  return (
    <section
      className="relative overflow-hidden min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center bg-white"
    >
      <AudienceNav />

      {/* Soft background circles - accent shapes instead of grids */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-30 pointer-events-none" />


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

      <div className="relative z-10 container mx-auto px-4 py-32 md:py-40">
        <div className="mb-12 md:mb-16" />

        <div className="max-w-4xl">
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
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.08] tracking-tight mb-6 md:mb-8">
            <span className="text-slate-900">Build a Safety Function</span><br />
            <span className="text-primary">Ready for the Digital Age</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed mb-10 md:mb-12 font-light">
            The world's first IOSH-approved, CPD-accredited Safety 4.0 certification for enterprise EHS teams. Equip your safety function with AI, IoT, and digital transformation skills in just 6–12 weeks.
          </p>




          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <button
              onClick={() => {
                const el = document.getElementById("pricing");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                  window.history.replaceState(null, "", "/#pricing");
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary/90 transition-all active:scale-[0.97] shadow-lg hover:shadow-xl cursor-pointer"
            >
              OUR COURSES
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("instructor");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                  window.history.replaceState(null, "", "/#instructor");
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold text-lg rounded-xl hover:bg-primary/10 transition-all cursor-pointer"
            >
              ABOUT US
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
