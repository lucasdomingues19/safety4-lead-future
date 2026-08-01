import { useEffect } from "react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { GovernanceReadinessAssessment } from "@/components/GovernanceReadinessAssessment";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";

const GovernanceReadiness = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "AI in EHS Governance Readiness Review | SafetyTech Academy",
      description:
        "Free 3-minute AI governance readiness review for EHS leaders. Score your position across visibility, literacy, governance, assurance and records.",
      canonical: "https://safetytech.academy/governance-readiness",
    });
  }, []);

  return (
    <AnalyticsTracker>
      <div className="min-h-screen bg-background text-white">
        <AudienceNav />
        <main className="container mx-auto px-4 pt-28 pb-16 md:pt-32 md:pb-24">
          <div className="max-w-2xl mx-auto">
            <div className="border-b border-white/15 pb-5 mb-7">
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">
                Free assessment
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                AI in EHS Governance Readiness
              </h1>
              <p className="text-slate-300 mt-4 max-w-[52ch]">
                Eight questions, three minutes. You get a scored position across five domains — visibility, literacy, governance, assurance and records —
                and the three things to fix first.
              </p>
            </div>
            <GovernanceReadinessAssessment />
          </div>
        </main>
        <Footer />
      </div>
    </AnalyticsTracker>
  );
};

export default GovernanceReadiness;
