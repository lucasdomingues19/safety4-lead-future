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
      <div className="relative w-full max-w-md my-4 sm:my-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-scale-in">
        <button
          onClick={close}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!started ? (
          <>
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white bg-primary inline-block px-2.5 py-1 rounded-md mb-3">
              Free assessment
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight mb-2">
              AI in EHS Governance Readiness
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Ten questions, three minutes. Get a scored position across visibility, literacy, governance, assurance and records — plus the three things
              to fix first.
            </p>
            <ul className="space-y-2 text-sm text-slate-600 mb-5">
              {[
                "Where your function stands against the AI literacy obligation",
                "A domain-by-domain score you can show your board",
                "A prioritised list of the gaps to close first",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="text-primary font-bold">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2.5">
              <Button onClick={() => setStarted(true)} className="w-full py-5 text-sm font-semibold">
                Start the assessment
              </Button>
              <Button
                onClick={close}
                variant="ghost"
                className="w-full text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
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
