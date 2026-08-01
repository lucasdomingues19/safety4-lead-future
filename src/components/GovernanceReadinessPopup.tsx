import { useEffect, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GovernanceReadinessAssessment } from "@/components/GovernanceReadinessAssessment";
import { claimPopupSlot, releasePopupSlot } from "@/lib/popupManager";

export const GovernanceReadinessPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (claimPopupSlot("governance_readiness")) setIsOpen(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setIsOpen(false);
    releasePopupSlot("governance_readiness");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl my-8 rounded-2xl border border-primary/40 bg-background p-6 md:p-8 shadow-2xl animate-scale-in">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!started ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-5">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">
              Free assessment
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight mb-3">
              AI in EHS Governance Readiness
            </h2>
            <p className="text-slate-300 mb-5">
              Eight questions, three minutes. Get a scored position across visibility, literacy, governance, assurance and records — plus the three things
              to fix first.
            </p>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              {[
                "Where your function stands against the AI literacy obligation",
                "A domain-by-domain score you can show your board",
                "A prioritised list of the gaps to close first",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setStarted(true)} className="flex-1 py-6 text-base font-semibold">
                Start the assessment
              </Button>
              <Button onClick={close} variant="outline" className="sm:w-auto border-white/20 text-white hover:bg-white/10">
                Maybe later
              </Button>
            </div>
          </>
        ) : (
          <GovernanceReadinessAssessment compact />
        )}
      </div>
    </div>
  );
};

export default GovernanceReadinessPopup;
