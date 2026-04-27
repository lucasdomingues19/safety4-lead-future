import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUBSCRIBE_URL = "https://learning.safetyacademy.tech/newsletters/safety-4-0-newsletter/subscribe";

export const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("newsletter_popup_shown");
    if (hasSeenPopup) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem("newsletter_popup_shown", "true");
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-black border border-white/20 rounded-2xl p-8 shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-lime-500 to-lime-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white text-center mb-2">
          Safety Beyond Compliance
        </h3>
        <p className="text-lime-400 font-semibold text-center mb-4">
          Newsletter
        </p>

        {/* Description */}
        <p className="text-gray-300 text-center mb-6 leading-relaxed">
          Join hundreds of safety innovators and changemakers receiving our monthly newsletter.
        </p>

        <Button
          asChild
          className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-semibold py-3"
        >
          <a
            href={SUBSCRIBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
          >
            Subscribe Now
          </a>
        </Button>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};
