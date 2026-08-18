import { lazy, Suspense, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { TrustedByBanner } from "@/components/TrustedByBanner";
import { ProblemStatsSection } from "@/components/ProblemStatsSection";
import { SolutionSection } from "@/components/SolutionSection";
import MentorSection from "@/components/MentorSection";
import { DeferredSection } from "@/components/DeferredSection";

// Below-the-fold sections are code-split and mounted on scroll so the initial
// homepage payload stays small. Content and behaviour are unchanged.
const ProblemStatsSection = lazy(() => import("@/components/ProblemStatsSection").then(m => ({ default: m.ProblemStatsSection })));
const SolutionSection = lazy(() => import("@/components/SolutionSection").then(m => ({ default: m.SolutionSection })));
const MentorSection = lazy(() => import("@/components/MentorSection"));
const SocialProofSection = lazy(() => import("@/components/SocialProofSection").then(m => ({ default: m.SocialProofSection })));
const PricingSection = lazy(() => import("@/components/PricingSection").then(m => ({ default: m.PricingSection })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const NewsletterPopup = lazy(() => import("@/components/NewsletterPopup").then(m => ({ default: m.NewsletterPopup })));

import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { LiteYouTube } from "@/components/LiteYouTube";

import { trackPageView, initScrollTracking, startTimeTracking, updateTimeOnPage } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";


const Index = () => {
  useEffect(() => {
    // Handle hash scrolling on mount
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  useEffect(() => {
    trackPageView(window.location.pathname);
    startTimeTracking();
    setPageSEO({
      title: "SafetyTech Academy — IOSH Approved AI & SafetyTech Training",
      description: "IOSH & CPD-approved Safety 4.0 certification. Master AI, SafetyTech and IoT for modern workplace safety. Join 1000+ HSE professionals.",
      canonical: "https://safetytech.academy/",
    });
    
    const cleanupScroll = initScrollTracking();
    
    const handleBeforeUnload = () => {
      updateTimeOnPage();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      cleanupScroll();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateTimeOnPage();
    };
  }, []);

  const eager = typeof window !== "undefined" && !!window.location.hash;

  return (
    <AnalyticsTracker>
      <SEOStructuredData type="course" />
      <div className="min-h-screen relative bg-white text-slate-900" role="main">

        <Suspense fallback={null}>
          <NewsletterPopup />
        </Suspense>

        <HeroSection />

        <TrustedByBanner />

        {/* Introduction video — full-bleed brand band, matches the reference's testimonial section */}
        <section className="relative overflow-hidden bg-primary py-20 md:py-28">
          {/* Soft circle decorations, lighter tint of the same blue for depth */}
          <div className="absolute -top-32 -left-24 w-96 h-96 bg-white/[0.06] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-64 h-64 bg-white/[0.05] rounded-full pointer-events-none" />
          <div className="absolute -bottom-40 right-0 w-[30rem] h-[30rem] bg-white/[0.07] rounded-full translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
              {/* Left column — copy */}
              <div className="max-w-[520px] shrink-0">
                <span className="text-xs uppercase tracking-[0.2em] text-white/70 font-medium mb-4 block">
                  Introducing
                </span>
                <h2 className="text-white mb-6">SafetyTech Academy</h2>
                <p className="text-white/80 text-lg leading-relaxed mb-10">
                  Our mission is to lead safety forward. Watch how we're equipping EHS teams with the AI literacy and digital skills to lead in the Safety 4.0 era.
                </p>
                <button
                  onClick={() => {
                    const el = document.getElementById("pricing");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                      window.history.replaceState(null, "", "/#pricing");
                    }
                  }}
                  className="inline-flex items-center gap-2 px-8 py-[22px] bg-white text-primary font-medium text-base uppercase tracking-[0.08em] rounded hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Our Courses
                </button>
              </div>

              {/* Right column — video */}
              <div className="relative w-full lg:flex-1">
                <div className="relative aspect-video rounded-[30px] overflow-hidden shadow-2xl border-4 border-lime-400">
                  <LiteYouTube
                    videoId="GUT9G9hnBXI"
                    title="Safety 4.0 Course Introduction"
                    autoPlay
                    params="autoplay=1&mute=1&loop=1&playlist=GUT9G9hnBXI&controls=1&modestbranding=1&rel=0"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The organisational problem */}
        <DeferredSection eager={eager}>
          <ProblemStatsSection />
        </DeferredSection>

        {/* What a team rollout delivers */}
        <DeferredSection eager={eager}>
          <SolutionSection />
        </DeferredSection>

        {/* Pricing — teams first, individuals second */}
        <section aria-label="Pricing options">
          <DeferredSection eager={eager} minHeight={800}>
            <PricingSection />
          </DeferredSection>
          <div className="container mx-auto px-4 pb-12 md:pb-16">
            <p className="text-center text-base text-slate-600">
              Full course details:{" "}
              <a href="/elearning" className="text-primary underline hover:text-primary/80">IOSH-approved Safety 4.0</a>{" "}
              ·{" "}
              <a href="/ai-fundamentals" className="text-primary underline hover:text-primary/80">AI Fundamentals in EHS</a>{" "}
              ·{" "}
              <a href="/accelerator" className="text-primary underline hover:text-primary/80">Safety 4.0 Accelerator</a>{" "}
              ·{" "}
              <a href="/pricing" className="text-primary underline hover:text-primary/80">Compare all plans</a>
            </p>
          </div>
        </section>


        {/* Founder credibility */}
        <section id="mentor" aria-label="Meet the founder">
          <DeferredSection eager={eager} minHeight={600}>
            <MentorSection />
          </DeferredSection>
        </section>

        {/* Proof from safety leaders */}
        <section aria-label="What safety leaders are saying">
          <DeferredSection eager={eager} minHeight={600}>
            <SocialProofSection />
          </DeferredSection>
        </section>

        <DeferredSection eager={eager} minHeight={500}>
          <Footer />
        </DeferredSection>
      </div>
    </AnalyticsTracker>
  );
};


export default Index;
