import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";

export const StickyCTABar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return;
      
      // Show after scrolling past hero section (approximately 600px)
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
      <div className="bg-black border-t border-white/20 shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Message */}
            <div className="hidden sm:flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
                <span className="text-white/80 text-sm">
                  <span className="font-semibold text-lime-400">Only 12 spots left</span> at founding member price
                </span>
              </div>
            </div>

            {/* Mobile message */}
            <div className="sm:hidden flex items-center gap-2 flex-1">
              <span className="text-lime-400 font-semibold text-sm">Save £200</span>
              <span className="text-white/60 text-sm">• Limited spots</span>
            </div>

            {/* CTA Button */}
            <Button
              onClick={scrollToPricing}
              className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-2 text-sm group whitespace-nowrap"
            >
              Enroll Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="text-white/60 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
