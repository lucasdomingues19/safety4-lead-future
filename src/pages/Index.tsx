import { useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import MentorSection from "@/components/MentorSection";
import { CoursePreviewSection } from "@/components/CoursePreviewSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";

import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CTAButton } from "@/components/CTAButton";
import { SEOStructuredData } from "@/components/SEOStructuredData";

import { SocialProofNotifications } from "@/components/SocialProofNotifications";
import { StickyCTABar } from "@/components/StickyCTABar";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import EbookPopup from "@/components/EbookPopup";
import { trackPageView, initScrollTracking, startTimeTracking, updateTimeOnPage } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";

const Index = () => {
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
        {/* Global background for entire site */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black -z-10"></div>
        
        
        <SocialProofNotifications />
        
        <NewsletterPopup />
        <EbookPopup />
        {/* Hero → Problem → Solution */}
        <HeroSection />
        {/* Course Preview */}
        <section aria-label="Course preview">
          <CoursePreviewSection />
        </section>
        {/* Testimonials */}
        <section aria-label="What safety leaders are saying">
          <SocialProofSection />
        </section>
        {/* Mentor */}
        <section id="mentor" aria-label="Meet your instructor">
          <MentorSection />
        </section>
        {/* Pricing */}
        <section aria-label="Pricing options">
          <PricingSection />
        </section>
        {/* Final CTA */}
        <section aria-label="Call to action">
          <CTAButton className="py-16" />
        </section>
        <Footer />
      </div>
    </AnalyticsTracker>
  );
};

export default Index;
