import { ArrowRight } from "lucide-react";
import AudienceNav from "./AudienceNav";
import heroPhoto from "@/assets/hero-safety-leader.jpg";
import ioshLogo from "@/assets/iosh-approved-logo.jpg";
import cpdLogo from "@/assets/cpd-approved-logo.png";
import { DigitalDotsText } from "./DigitalDotsText";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-24 md:pt-40 md:pb-32">
      <AudienceNav />

      {/* Soft decorative blobs — asymmetric, low-opacity accents with gentle ambient drift */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-blob-drift" />
      <div
        className="absolute -bottom-24 right-0 w-[32rem] h-[32rem] bg-primary/[0.06] rounded-full blur-3xl translate-x-1/4 pointer-events-none animate-blob-drift"
        style={{ animationDelay: "-4.5s" }}
      />

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-10">
          {/* Left column — copy, fixed max-width like the reference (not a 50/50 grid) */}
          <div className="max-w-[640px] shrink-0">
            {/* Accreditation badges */}
            <div
              className="flex items-center gap-3 mb-7 flex-wrap animate-hero-fade-up"
              style={{ animationDelay: "0.05s" }}
            >
              <div className="flex items-center gap-2 px-3 py-1 rounded border border-slate-200">
                <img src={ioshLogo} alt="IOSH Approved" className="h-5 w-auto" />
                <span className="text-xs text-slate-500 font-medium">IOSH Approved</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded border border-slate-200">
                <img src={cpdLogo} alt="CPD Accredited" className="h-5 w-auto" />
                <span className="text-xs text-slate-500 font-medium">CPD Accredited</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="mb-6 animate-hero-fade-up" style={{ animationDelay: "0.15s" }}>
              Build a Safety Function
              <br />
              <span className="text-primary">
                Ready for the <DigitalDotsText text="Digital Age" />
              </span>
              <span className="text-primary">.</span>
            </h1>

            <p
              className="text-lg text-[#69697b] leading-relaxed mb-10 max-w-[520px] animate-hero-fade-up"
              style={{ animationDelay: "0.25s" }}
            >
              The world's first IOSH-approved, CPD-accredited Safety 4.0 certification for enterprise EHS teams. Equip your safety function with AI, IoT, and digital transformation skills in just 6–12 weeks.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap items-center gap-4 animate-hero-fade-up"
              style={{ animationDelay: "0.35s" }}
            >
              <button
                onClick={() => {
                  const el = document.getElementById("pricing");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                    window.history.replaceState(null, "", "/#pricing");
                  }
                }}
                className="inline-flex items-center gap-2 px-8 py-[22px] bg-primary text-white font-medium text-base uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Our Courses
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("instructor");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                    window.history.replaceState(null, "", "/#instructor");
                  }
                }}
                className="inline-flex items-center gap-2 px-8 py-[22px] border border-primary text-primary font-medium text-base uppercase tracking-[0.08em] rounded hover:bg-primary/5 transition-colors cursor-pointer"
              >
                About Us
              </button>
            </div>
          </div>

          {/* Right column — image, reference-matched radius and portrait ratio */}
          <div
            className="relative w-full lg:flex-1 max-w-[480px] mx-auto lg:mx-0 animate-hero-zoom"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative aspect-[3/4] rounded-[30px] overflow-hidden">
              <img
                src={heroPhoto}
                alt="Safety leader working with AI and digital tools"
                width={1280}
                height={720}
                decoding="async"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
