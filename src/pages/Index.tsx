import { useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import MentorSection from "@/components/MentorSection";
import { CoursePreviewSection } from "@/components/CoursePreviewSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { ProgramSection } from "@/components/ProgramSection";
import { Footer } from "@/components/Footer";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CTAButton } from "@/components/CTAButton";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { SocialProofNotifications } from "@/components/SocialProofNotifications";
import { StickyCTABar } from "@/components/StickyCTABar";
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
      <div className="min-h-screen" role="main">
        <LeadCaptureModal />
        <ExitIntentPopup />
        <SocialProofNotifications />
        <StickyCTABar />
        <HeroSection />
        <section aria-label="Call to action">
          <CTAButton className="py-16" />
        </section>
        <section id="mentor" aria-label="Meet your instructor">
          <MentorSection />
        </section>
        <section aria-label="Course preview">
          <CoursePreviewSection />
        </section>
        <section aria-label="Call to action">
          <CTAButton className="py-16" />
        </section>
        <section id="testimonials" aria-label="Student testimonials">
          <SocialProofSection />
        </section>
        <section id="program" aria-label="Program details">
          <ProgramSection />
        </section>
        <Footer />
      </div>
    </AnalyticsTracker>
  );
};

export default Index;
