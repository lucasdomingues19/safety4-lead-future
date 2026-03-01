import { useState, useEffect } from "react";
import { Safety4AssessmentModal } from "@/components/Safety4AssessmentModal";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";
import { setPageSEO } from "@/utils/seo";

const Scorecard = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    setPageSEO({
      title: "Free Safety 4.0 Readiness Scorecard | Assess Your Digital Safety Skills",
      description: "Take the free Safety 4.0 Readiness Scorecard. Assess your digital safety skills across 5 categories — Awareness, Technology, Risk, Change, and Leadership. Get a personalised PDF report.",
      canonical: "https://safetyacademy.tech/scorecard",
    });
  }, []);

  return (
    <>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#11113a] via-slate-900 to-black">
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="max-w-2xl w-full text-center space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <ClipboardCheck className="w-20 h-20 text-[#D6FF00]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Free Safety 4.0 Readiness Scorecard
              </h1>
              <p className="text-xl text-gray-300">
                Discover where you stand in the digital transformation of workplace safety
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-4">
              <h2 className="text-2xl font-semibold text-white">What You'll Get:</h2>
              <ul className="text-left text-gray-200 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-[#D6FF00] mt-1">✓</span>
                  <span>Personalized assessment of your Safety 4.0 readiness</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D6FF00] mt-1">✓</span>
                  <span>Detailed breakdown across 5 key categories</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D6FF00] mt-1">✓</span>
                  <span>Actionable insights to advance your safety programs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D6FF00] mt-1">✓</span>
                  <span>Takes only 2-3 minutes to complete</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#D6FF00] text-black hover:bg-[#c5ee00] text-lg px-8 py-6 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            >
              Start Your Free Assessment
            </Button>
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
