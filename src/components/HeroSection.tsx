import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AudienceNav from "./AudienceNav";
import heroPhoto from "@/assets/hero-ai-safety-worker.jpg";
import ioshLogo from "@/assets/iosh-approved-badge.png";
import cpdLogo from "@/assets/cpd-certified-badge.png";
import { DigitalDotsText } from "./DigitalDotsText";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-24 md:pt-40 md:pb-32">
      <AudienceNav />

      {/* Single grid, its lines genuinely rippling via an SVG fluid-turbulence filter
          (not an overlay band — the grid geometry itself distorts like liquid). */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="hero-grid-fluid">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.015"
            numOctaves="2"
            seed="7"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.008 0.015;0.012 0.009;0.008 0.015"
              dur="30s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(52,52,255,0.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,52,255,0.09) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          filter: "url(#hero-grid-fluid)",
        }}
      />
      {/* Fade the grid out toward the bottom so it doesn't fight the content below */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-10">
          {/* Left column — copy, fixed max-width like the reference (not a 50/50 grid) */}
          <div className="max-w-[640px] shrink-0">
            {/* Accreditation badges */}
            <div
              className="flex items-center gap-3 mb-7 flex-wrap animate-hero-fade-up"
              style={{ animationDelay: "0.05s" }}
            >
              <div className="flex items-center px-3 py-2.5 rounded border border-slate-200 bg-white shadow-sm">
                <img src={ioshLogo} alt="IOSH Approved Training Provider" className="h-11 w-auto" />
              </div>
              <div className="flex items-center px-3 py-2.5 rounded border border-slate-200 bg-white shadow-sm">
                <img src={cpdLogo} alt="CPD Certified" className="h-11 w-auto" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="mb-6 animate-hero-fade-up" style={{ animationDelay: "0.15s" }}>
              Build an EHS Function
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
              The capability-building partner for organisations navigating AI and digital transformation in EHS & Sustainability.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap items-center gap-4 animate-hero-fade-up"
              style={{ animationDelay: "0.35s" }}
            >
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-[22px] bg-primary text-white font-medium text-base uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
              >
                Discuss Team Training
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/assess-readiness"
                className="inline-flex items-center gap-2 px-8 py-[22px] border border-primary text-primary font-medium text-base uppercase tracking-[0.08em] rounded hover:bg-primary/5 transition-colors"
              >
                Assess Your EHS Team AI Readiness
              </Link>
            </div>
          </div>

          {/* Right column — image, reference-matched radius and portrait ratio */}
          <div
            className="relative w-full lg:flex-1 max-w-[480px] mx-auto lg:mx-0 animate-hero-zoom"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative animate-hero-float">
              {/* Lime accent frame — brand accent, kept off any white background by sitting behind the photo */}
              <div className="absolute -inset-3 rounded-[34px] bg-lime-400 -z-10 rotate-2" />
              <div className="relative aspect-square rounded-[30px] overflow-hidden">
                <img
                  src={heroPhoto}
                  alt="Safety professional wearing an AI-enabled smart hard hat"
                  width={960}
                  height={960}
                  decoding="async"
                  fetchpriority="high"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
