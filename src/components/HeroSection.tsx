import { Shield, Award, ArrowRight } from "lucide-react";
import AudienceNav from "./AudienceNav";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center">
      <AudienceNav />

      {/* Full background image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-[right_top] md:bg-top opacity-50"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222_60%_7%)] via-[hsl(222_55%_10%/0.92)] to-[hsl(222_55%_10%/0.55)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.08),transparent_60%)]" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="mb-16 md:mb-20" />

        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-[hsl(var(--primary))] font-semibold mb-6">
            The Safety 4.0 Academy
          </div>

          {/* Accreditation Badges — refined corporate chips */}
          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8 flex-wrap">
            <div className="inline-flex items-center gap-2 text-white/90 bg-white/[0.04] px-3 md:px-4 py-1.5 md:py-2 rounded-sm border border-white/15 text-xs md:text-sm">
              <Award className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              <span className="tracking-wide">IOSH Approved</span>
            </div>
            <div className="inline-flex items-center gap-2 text-white/90 bg-white/[0.04] px-3 md:px-4 py-1.5 md:py-2 rounded-sm border border-white/15 text-xs md:text-sm">
              <Shield className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              <span className="tracking-wide">CPD Accredited</span>
            </div>
          </div>

          {/* Headline — editorial serif */}
          <h1 className="font-serif text-white mb-5 md:mb-8">
            Safety leadership without <em className="not-italic text-[hsl(var(--primary))]">digital fluency</em> is now a liability.
          </h1>
          <p className="text-base md:text-xl text-white/75 max-w-2xl leading-relaxed mb-8 md:mb-12 font-light">
            The world's first <span className="text-white font-medium">IOSH-approved</span> and <span className="text-white font-medium">CPD-accredited</span> programme designed and taught by industry leaders for EHS executives operating in the digital age.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-base rounded-sm hover:opacity-90 transition-opacity active:scale-[0.97]"
            >
              View Programmes
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent text-white font-medium text-base rounded-sm border border-white/25 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors active:scale-[0.97]"
            >
              Speak with Admissions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
