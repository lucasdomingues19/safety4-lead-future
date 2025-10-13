import { HeroSection } from "@/components/HeroSection";
import { PricingSection } from "@/components/PricingSection";
import MentorSection from "@/components/MentorSection";
import { UrgentProblemSection } from "@/components/UrgentProblemSection";
import { SolutionSection } from "@/components/SolutionSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { ProgramSection } from "@/components/ProgramSection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { Footer } from "@/components/Footer";
import { AboutAcademySection } from "@/components/AboutAcademySection";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";

const Index = () => {
  return (
    <div className="min-h-screen">
      <LeadCaptureModal />
      <HeroSection />
      <AboutAcademySection />
      <MentorSection />
      <UrgentProblemSection />
      <SolutionSection />
      <PricingSection />
      <SocialProofSection />
      <ProgramSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
