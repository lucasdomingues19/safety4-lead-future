import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { claimPopupSlot, releasePopupSlot } from "@/lib/popupManager";
import { trackEvent } from "@/utils/analytics";

// The site's one pop-up. It opens after 8 seconds, or earlier on desktop when the
// pointer leaves through the top of the window (heading for the tab bar or close
// button), whichever comes first. popupManager keeps it to once per visit.
const DELAY_MS = 8000;
const MIN_MS_BEFORE_EXIT = 3000;

export const GovernanceReadinessPopup = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const show = (trigger: "timer" | "exit") => {
      if (!claimPopupSlot("governance_readiness")) return;
      setIsOpen(true);
      trackEvent("governance_popup_shown", { trigger });
    };
    const timer = setTimeout(() => show("timer"), DELAY_MS);

    const since = Date.now();
    const desktop = window.matchMedia("(pointer: fine) and (min-width: 768px)").matches;
    const onOut = (e: MouseEvent) => {
      if (e.relatedTarget || e.clientY > 8 || Date.now() - since < MIN_MS_BEFORE_EXIT) return;
      show("exit");
    };
    if (desktop) document.addEventListener("mouseout", onOut);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    releasePopupSlot("governance_readiness");
  };

  const start = () => {
    close();
    navigate("/governance-readiness");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="relative w-full max-w-md my-4 sm:my-6 rounded-2xl border border-white/20 bg-background p-5 sm:p-6 shadow-2xl animate-scale-in">
        <button
          onClick={close}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white bg-primary inline-block px-2.5 py-1 rounded-md mb-3">
          Free assessment
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white leading-tight mb-2">
          AI in EHS Governance Readiness
        </h2>
        <p className="text-sm text-gray-300 mb-4">
          Ten questions, three minutes. Get a scored position across visibility, literacy, governance, assurance and records — plus the three things
          to fix first.
        </p>
        <ul className="space-y-2 text-sm text-gray-300 mb-5">
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
          <Button onClick={start} className="w-full py-5 text-sm font-semibold">
            Start the assessment
          </Button>
          <Button
            onClick={close}
            className="w-full py-5 text-sm font-semibold bg-black text-white hover:bg-black/80 border border-white/10"
          >
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GovernanceReadinessPopup;
