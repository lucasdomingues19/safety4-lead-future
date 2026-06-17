import { Shield, Award, ArrowRight } from "lucide-react";
import AudienceNav from "./AudienceNav";
import bgWorker from "@/assets/certificate-bg-worker.png";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center">
      <AudienceNav />

      {/* Grid lines background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#0a1530",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1530]/95 via-[#0a1530]/70 to-transparent" />

      {/* Polygon worker figure — right side, deep in background */}
      <img
        src={bgWorker}
        alt=""
        className="absolute right-0 top-0 h-full w-auto object-cover opacity-20 pointer-events-none translate-x-8"
        style={{
          maskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%)",
          WebkitMaskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%)",
        }}
      />

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
            Build a Safety Function Ready for the <span className="text-lime-400">Digital Age</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-gray-300 max-w-2xl leading-relaxed mb-6 md:mb-8 font-light">
            Upskill your entire EHS team with the world's first <span className="font-bold">IOSH-approved</span> and <span className="font-bold">CPD-accredited</span> Safety 4.0 programme — built to turn AI, SafetyTech and data into measurable risk reduction across your organisation.
          </p>

          {/* Skill Boxes */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-12">
            {["Artificial Intelligence", "Digital Transformation", "SafetyTech", "Data & Analytics", "Safety 4.0", "Risk & Governance"].map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-lg text-xs md:text-sm text-gray-300 font-medium backdrop-blur-sm hover:bg-white/10 hover:border-primary/30 hover:text-primary transition-all duration-300 cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="/in-company"
              className="inline-flex items-center gap-2 px-8 py-4 bg-lime-500 text-black font-semibold text-lg rounded-full hover:bg-lime-400 transition-colors active:scale-[0.97]"
            >
              Upskill My Team
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-medium text-lg rounded-full border border-white/20 hover:bg-white/20 transition-colors active:scale-[0.97]"
            >
              For Individuals
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
