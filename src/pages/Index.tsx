import { useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { PricingSection } from "@/components/PricingSection";
import MentorSection from "@/components/MentorSection";
import { UrgentProblemSection } from "@/components/UrgentProblemSection";
import { SolutionSection } from "@/components/SolutionSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { ProgramSection } from "@/components/ProgramSection";
import { Footer } from "@/components/Footer";
import { AboutAcademySection } from "@/components/AboutAcademySection";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CTAButton } from "@/components/CTAButton";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import ExitIntentPopup from "@/components/ExitIntentPopup";
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
        <HeroSection />
        <section id="about" aria-label="About Safety 4.0 Academy">
          <AboutAcademySection />
        </section>
        <section aria-label="Call to action">
          <CTAButton className="py-16" />
        </section>
        <section id="mentor" aria-label="Meet your instructor">
          <MentorSection />
        </section>
        <section id="problem" aria-label="Industry challenges">
          <UrgentProblemSection />
        </section>
        <section aria-label="Call to action">
          <CTAButton className="py-16" />
        </section>
        <section id="solution" aria-label="Our solution">
          <SolutionSection />
        </section>
        <section id="pricing" aria-label="Course pricing and enrollment">
          <PricingSection />
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
