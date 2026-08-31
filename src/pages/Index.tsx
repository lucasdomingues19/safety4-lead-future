import { lazy, Suspense, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { TrustedByBanner } from "@/components/TrustedByBanner";
import { DeferredSection } from "@/components/DeferredSection";

// Below-the-fold sections are code-split and mounted on scroll so the initial
// homepage payload stays small. Content and behaviour are unchanged.
const ProblemStatsSection = lazy(() => import("@/components/ProblemStatsSection").then(m => ({ default: m.ProblemStatsSection })));
const SolutionSection = lazy(() => import("@/components/SolutionSection").then(m => ({ default: m.SolutionSection })));
const OurTeamTrainingSection = lazy(() => import("@/components/OurTeamTrainingSection").then(m => ({ default: m.OurTeamTrainingSection })));
const SocialProofSection = lazy(() => import("@/components/SocialProofSection").then(m => ({ default: m.SocialProofSection })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const NewsletterPopup = lazy(() => import("@/components/NewsletterPopup").then(m => ({ default: m.NewsletterPopup })));

import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { LiteYouTube } from "@/components/LiteYouTube";
import { BlueBandDecor } from "@/components/BlueBandDecor";

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
        <section className="relative bg-primary py-10 md:py-14">
          <BlueBandDecor />

          <div className="relative z-10 container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
              {/* Left column — copy */}
              <div className="max-w-[520px] shrink-0">
                <span className="text-xs uppercase tracking-[0.2em] text-white/70 font-medium mb-4 block">
                  Introducing
                </span>
                <h2 className="text-white mb-6">SafetyTech Academy</h2>
                <p className="text-white/80 text-lg leading-relaxed mb-10">
                  Our mission is to Lead Safety Forward and enable organizations to govern and harness AI responsibly in their EHS functions. See how we're transforming safety teams into AI-ready, strategic partners for digital transformation.
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
                  Training Programs
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

        {/* Our Team Training */}
        <DeferredSection eager={eager}>
          <OurTeamTrainingSection />
        </DeferredSection>



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
