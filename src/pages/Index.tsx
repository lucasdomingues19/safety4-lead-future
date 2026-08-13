import { lazy, Suspense, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
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

        {/* Introduction video — secondary, for individuals exploring */}
        <section className="py-16 md:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-4">
                <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md">
                  Introducing
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] text-center mb-8 md:mb-12">
                <span className="text-primary">SafetyTech Academy</span>
              </h2>
              <p className="text-lg md:text-2xl font-semibold text-slate-900 text-center mb-8 md:mb-12">
                Our mission is to <span className="text-primary">Lead Safety Forward.</span> Discover How.
              </p>
              <div className="relative aspect-video bg-slate-100 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-primary hover:border-secondary transition-all duration-300">
                <LiteYouTube
                  videoId="GUT9G9hnBXI"
                  title="Safety 4.0 Course Introduction"
                  autoPlay
                  params="autoplay=1&mute=1&loop=1&playlist=GUT9G9hnBXI&controls=1&modestbranding=1&rel=0"
                  className="rounded-xl"
                />
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
