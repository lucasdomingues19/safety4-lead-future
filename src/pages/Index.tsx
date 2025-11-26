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
      <div className="min-h-screen">
        <LeadCaptureModal />
        <HeroSection />
        <AboutAcademySection />
        <CTAButton className="py-16" />
        <MentorSection />
        <UrgentProblemSection />
        <CTAButton className="py-16" />
        <SolutionSection />
        <CTAButton className="py-16" />
        <PricingSection />
        <SocialProofSection />
        <ProgramSection />
        <Footer />
      </div>
    </AnalyticsTracker>
  );
};

export default Index;
