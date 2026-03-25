import { useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { TrustedByBanner } from "@/components/TrustedByBanner";
import { ProblemStatsSection } from "@/components/ProblemStatsSection";
import { CurriculumOverview } from "@/components/CurriculumOverview";
import MentorSection from "@/components/MentorSection";

import { SocialProofSection } from "@/components/SocialProofSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";

import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CTAButton } from "@/components/CTAButton";
import { SEOStructuredData } from "@/components/SEOStructuredData";

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
      title: "Safety 4.0 Academy — IOSH Approved Digital Safety Leadership Training | AI & SafetyTech Certification",
      description: "Get IOSH & CPD-approved Safety 4.0 certification. Master AI, SafetyTech, IoT sensors, and digital leadership. Join 1000+ global safety professionals transforming workplace safety.",
      canonical: "https://safetyacademy.tech/",
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
        <div className="fixed inset-0 bg-black -z-10"></div>
        
        <NewsletterPopup />

        <HeroSection />

        <TrustedByBanner />

        {/* Video Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-8 md:mb-12">
                Introducing: <span className="text-primary">Safety 4.0 Academy</span>
              </h2>
              <p className="text-lg md:text-2xl font-semibold text-white text-center mb-8 md:mb-12">
                Our Mission? Lead Safety Forward. Discover how.
              </p>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:border-primary/50 transition-all duration-300">
                <iframe
                  className="w-full aspect-video rounded-xl"
                  src="https://www.youtube.com/embed/GUT9G9hnBXI?autoplay=1&mute=1&loop=1&playlist=GUT9G9hnBXI&controls=1&modestbranding=1&rel=0"
                  title="Safety 4.0 Course Introduction"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <ProblemStatsSection />


        <section aria-label="Pricing options">
          <PricingSection />
        </section>

        <section id="mentor" aria-label="Meet the founder">
          <MentorSection />
        </section>

        <section aria-label="What safety leaders are saying">
          <SocialProofSection />
        </section>


        <Footer />
      </div>
    </AnalyticsTracker>
  );
};

export default Index;
