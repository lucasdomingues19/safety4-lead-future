// ============= Full file contents =============

import AudienceNav from "@/components/AudienceNav";
import { useState, useEffect } from "react";
import { Safety4AssessmentModal } from "@/components/Safety4AssessmentModal";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";

const Scorecard = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    setPageSEO({
      title: "Free Digital Maturity Scorecard | Assess Your Readiness",
      description: "Take the free Digital Maturity Scorecard. Assess your personal readiness and your organisation's digital maturity across key categories. Get a personalised PDF report.",
      canonical: "https://safetytech.academy/scorecard",
    });
    trackPageView(window.location.pathname);
  }, []);

  return (
    <>

      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        <AudienceNav />
        <main className="container mx-auto px-4 pt-24 pb-12 md:pt-32 md:pb-24 flex-grow">
          <div className="max-w-2xl mx-auto">
            <div className="border-b border-slate-200 pb-5 mb-7 text-center">
              <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">
                Free assessment
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05] text-slate-900">
                Digital Maturity Scorecard
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-4 max-w-[52ch] mx-auto">
                Fifteen statements, three minutes. Get a scored position across five categories — awareness, technology, risk &amp; compliance, change management and leadership — plus a personalised PDF report.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 mb-8">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-4">What you'll get</h2>
              <ul className="text-left text-slate-700 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Personalised assessment of your Safety 4.0 readiness</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Detailed breakdown across 5 key categories</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Actionable insights to advance your safety programs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Takes only 2-3 minutes to complete</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white hover:bg-primary/90 text-base px-8 py-6 rounded-lg font-extrabold transition-colors"
              >
                Start Your Free Assessment
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <Safety4AssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Scorecard;
