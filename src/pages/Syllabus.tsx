import { useEffect } from "react";
import AudienceNav from "@/components/AudienceNav";
import { SolutionSection } from "@/components/SolutionSection";
import { CurriculumOverview } from "@/components/CurriculumOverview";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";

const Syllabus = () => {
  useEffect(() => {
    setPageSEO({
      title: "Curriculum — Safety 4.0 Academy | IOSH Approved Programme",
      description: "Explore the full Safety 4.0 curriculum: 10 modules covering AI, IoT, SafetyTech, data strategy, and digital leadership. IOSH approved & CPD accredited.",
      canonical: "https://safetyacademy.tech/syllabus",
    });
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black -z-10" />
      <AudienceNav />
      <div className="pt-16">
        <SolutionSection />
        <CurriculumOverview />
      </div>
      <Footer />
    </div>
  );
};

export default Syllabus;
