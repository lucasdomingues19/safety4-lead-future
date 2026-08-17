import { ArrowRight } from "lucide-react";
import AudienceNav from "./AudienceNav";
import heroPhoto from "@/assets/hero-bg.jpg";
import ioshLogo from "@/assets/iosh-approved-logo.jpg";
import cpdLogo from "@/assets/cpd-approved-logo.png";
import { DigitalDotsText } from "./DigitalDotsText";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-20 md:pt-36 md:pb-28">
      <AudienceNav />

      {/* Soft decorative blobs — asymmetric, low-opacity accents */}
      <div className="absolute -top-24 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl -translate-x-1/2 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[28rem] h-[28rem] bg-primary/10 rounded-full blur-3xl translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left column — copy */}
          <div>
            {/* Accreditation badges */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm">
                <img src={ioshLogo} alt="IOSH Approved" className="h-6 w-auto" />
                <span className="text-xs text-slate-600 font-semibold">IOSH Approved</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm">
                <img src={cpdLogo} alt="CPD Accredited" className="h-6 w-auto" />
                <span className="text-xs text-slate-600 font-semibold">CPD Accredited</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-[3.5rem] font-black leading-[1.1] tracking-tight mb-6">
              <span className="text-slate-900">Build a Safety Function Ready</span>
              <br />
              <span className="text-primary">
                for the <DigitalDotsText text="Digital Age" />
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-lg">
              The world's first IOSH-approved, CPD-accredited Safety 4.0 certification for enterprise EHS teams. Equip your safety function with AI, IoT, and digital transformation skills in just 6–12 weeks.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById("pricing");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                    window.history.replaceState(null, "", "/#pricing");
                  }
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-sm uppercase tracking-wide rounded-full hover:bg-primary/90 transition-all active:scale-[0.97] shadow-lg hover:shadow-xl cursor-pointer"
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
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold text-sm uppercase tracking-wide rounded-full hover:bg-primary/5 transition-all cursor-pointer"
              >
                About Us
              </button>
            </div>
          </div>

          {/* Right column — image */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
              <img
                src={heroPhoto}
                alt="Lucas Domingues, founder of SafetyTech Academy"
                width={1400}
                height={583}
                decoding="async"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover object-right"
              />
            </div>

            {/* Floating trust badge */}
            <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                1K+
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-900">HSE Professionals</p>
                <p className="text-xs text-slate-500">trained worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
