import { HeroSection } from "@/components/HeroSection";
import { PricingSection } from "@/components/PricingSection";
import { ProblemSection } from "@/components/ProblemSection";
import MentorSection from "@/components/MentorSection";
import { SolutionSection } from "@/components/SolutionSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { ProgramSection } from "@/components/ProgramSection";
import { UrgencySection } from "@/components/UrgencySection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <MentorSection />
      <ProblemSection />
      <SolutionSection />
      <PricingSection />
      <SocialProofSection />
      <ProgramSection />
      <UrgencySection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
