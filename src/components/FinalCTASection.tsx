import { ArrowRight, Star, Users, Award } from "lucide-react";

export const FinalCTASection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-[hsl(222_60%_7%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_60%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[hsl(var(--primary))] font-semibold mb-6">
            Begin Your Certification
          </div>

          <h2 className="font-serif text-white mb-8 leading-[1.05]">
            Lead safety forward with the
            <br />
            <em className="not-italic text-[hsl(var(--primary))]">Safety 4.0 Academy</em>.
          </h2>

          <p className="text-lg text-white/70 mb-14 leading-relaxed max-w-2xl mx-auto">
            Equip yourself with the digital fluency expected of modern EHS leaders. Join professionals from Siemens, Lego, Fugro, Marsh and beyond.
          </p>

          {/* Stats — restrained corporate row */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 mb-16 border-y border-white/10 py-10">
            <div className="text-center">
              <Users className="w-6 h-6 text-[hsl(var(--primary))] mx-auto mb-3" />
              <div className="font-serif text-3xl md:text-4xl text-white mb-1">1,000+</div>
              <p className="text-white/55 text-xs md:text-sm uppercase tracking-wider">Professionals Trained</p>
            </div>
            <div className="text-center">
              <Star className="w-6 h-6 text-[hsl(var(--primary))] mx-auto mb-3" />
              <div className="font-serif text-3xl md:text-4xl text-white mb-1">4.9/5</div>
              <p className="text-white/55 text-xs md:text-sm uppercase tracking-wider">Average Rating</p>
            </div>
            <div className="text-center">
              <Award className="w-6 h-6 text-[hsl(var(--primary))] mx-auto mb-3" />
              <div className="font-serif text-3xl md:text-4xl text-white mb-1">IOSH</div>
              <p className="text-white/55 text-xs md:text-sm uppercase tracking-wider">Approved & CPD</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <a
              href="/enrol"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-base rounded-sm hover:opacity-90 transition-opacity"
            >
              Enrol Now
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent text-white font-medium text-base rounded-sm border border-white/25 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors"
            >
              Schedule a Consultation
            </a>
          </div>

          <p className="text-white/45 text-xs tracking-wide">
            IOSH & CPD Approved · 90-Day Course Access · 14-Day Money-Back Guarantee
          </p>
        </div>
      </div>
    </section>
  );
};
