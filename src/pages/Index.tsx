import { useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ProblemStatsSection } from "@/components/ProblemStatsSection";
import { SolutionSection } from "@/components/SolutionSection";
import { CurriculumOverview } from "@/components/CurriculumOverview";
import MentorSection from "@/components/MentorSection";

import { SocialProofSection } from "@/components/SocialProofSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";

import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CTAButton } from "@/components/CTAButton";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { LiteYouTube } from "@/components/LiteYouTube";

import { StickyCTABar } from "@/components/StickyCTABar";
import { NewsletterPopup } from "@/components/NewsletterPopup";

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
      title: "Safety 4.0 Academy — IOSH Approved AI & SafetyTech Training",
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

  return (
    <AnalyticsTracker>
      <SEOStructuredData type="course" />
      <div className="min-h-screen relative" role="main">
        <div className="fixed inset-0 bg-white -z-10"></div>
        
        <NewsletterPopup />

        <HeroSection />

        {/* Introduction video — secondary, for individuals exploring */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-4">
                <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md">
                  Introducing
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] text-center mb-8 md:mb-12">
                <span className="text-primary">Safety 4.0 Academy</span>
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
        <ProblemStatsSection />

        {/* What a team rollout delivers */}
        <SolutionSection />

        {/* Pricing — teams first, individuals second */}
        <section aria-label="Pricing options">
          <PricingSection />
        </section>

        {/* Founder credibility */}
        <section id="mentor" aria-label="Meet the founder">
          <MentorSection />
        </section>

        {/* Proof from safety leaders */}
        <section aria-label="What safety leaders are saying">
          <SocialProofSection />
        </section>



        <Footer />
      </div>
    </AnalyticsTracker>
  );
};

export default Index;
