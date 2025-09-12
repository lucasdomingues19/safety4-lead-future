import { HeroSection } from "@/components/HeroSection";
import { PricingSection } from "@/components/PricingSection";
import { ProblemSection } from "@/components/ProblemSection";
import { SolutionSection } from "@/components/SolutionSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { ProgramSection } from "@/components/ProgramSection";
import { UrgencySection } from "@/components/UrgencySection";
import { FinalCTASection } from "@/components/FinalCTASection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PricingSection />
      <ProblemSection />
      <SolutionSection />
      <SocialProofSection />
      <ProgramSection />
      <UrgencySection />
      <FinalCTASection />
    </div>
  );
};

export default Index;
