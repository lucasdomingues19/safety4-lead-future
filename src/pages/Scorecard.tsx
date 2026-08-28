import AudienceNav from "@/components/AudienceNav";
import { useEffect } from "react";
import B2BEHSAssessment from "@/components/B2BEHSAssessment";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";

const Scorecard = () => {
  useEffect(() => {
    setPageSEO({
      title: "Free EHS AI Readiness Assessment | Digital Maturity Scorecard",
      description: "Assess your EHS team's readiness for AI and digital transformation. Evaluate organizational maturity across awareness, technology, governance, change management and leadership. Get a detailed PDF report.",
      canonical: "https://safetytech.academy/scorecard",
    });
    trackPageView(window.location.pathname);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AudienceNav />
      <main className="flex-grow pt-20">
        <B2BEHSAssessment />
      </main>
      <Footer />
    </div>
  );
};

export default Scorecard;
