import { useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import MentorSection from "@/components/MentorSection";
import { CoursePreviewSection } from "@/components/CoursePreviewSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { Footer } from "@/components/Footer";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CTAButton } from "@/components/CTAButton";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { SocialProofNotifications } from "@/components/SocialProofNotifications";
import { StickyCTABar } from "@/components/StickyCTABar";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { trackPageView, initScrollTracking, startTimeTracking, updateTimeOnPage } from "@/utils/analytics";

const Index = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    startTimeTracking();
    
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
        <LeadCaptureModal />
        <ExitIntentPopup />
        <SocialProofNotifications />
        <StickyCTABar />
        <NewsletterPopup />
        <HeroSection />
        <section aria-label="Course preview">
          <CoursePreviewSection />
        </section>
        <section id="mentor" aria-label="Meet your instructor">
          <MentorSection />
        </section>
        <section aria-label="Call to action">
          <CTAButton className="py-16" />
        </section>
        <Footer />
      </div>
    </AnalyticsTracker>
  );
};

export default Index;
