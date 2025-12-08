import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, ArrowRight, X } from 'lucide-react';

const ExitIntentPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasClickedEnroll, setHasClickedEnroll] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

  // Track enroll button clicks
  useEffect(() => {
    const trackEnrollClicks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickedElement = target.closest('a, button');
      
      if (clickedElement) {
        const text = clickedElement.textContent?.toLowerCase() || '';
        const href = clickedElement.getAttribute('href') || '';
        
        // Check if it's an enroll-related click
        if (
          text.includes('enroll') ||
          text.includes('start learning') ||
          text.includes('join the academy') ||
          text.includes('founding member') ||
          href.includes('mykajabi.com')
        ) {
          setHasClickedEnroll(true);
          sessionStorage.setItem('hasClickedEnroll', 'true');
        }
      }
    };

    // Check if already clicked enroll in this session
    if (sessionStorage.getItem('hasClickedEnroll') === 'true') {
      setHasClickedEnroll(true);
    }

    // Check if popup was already shown
    if (sessionStorage.getItem('exitPopupShown') === 'true') {
      setHasShownPopup(true);
    }

    document.addEventListener('click', trackEnrollClicks);
    return () => document.removeEventListener('click', trackEnrollClicks);
  }, []);

  // Detect exit intent
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse leaves through the top of the viewport
    if (e.clientY <= 0 && hasClickedEnroll && !hasShownPopup && !showPopup) {
      setShowPopup(true);
      setHasShownPopup(true);
      sessionStorage.setItem('exitPopupShown', 'true');
    }
  }, [hasClickedEnroll, hasShownPopup, showPopup]);

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseLeave]);

  const handleClaim = () => {
    // Copy coupon code to clipboard
    navigator.clipboard.writeText('ACADEMY10');
    // Redirect to enrollment page
    window.open('https://safetyacademy.mykajabi.com/offers/E2ZXsoXV', '_blank');
    setShowPopup(false);
  };

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-lime-500/30 text-white">
        <button
          onClick={() => setShowPopup(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-lime-500/20 rounded-full flex items-center justify-center">
            <Gift className="h-8 w-8 text-lime-400" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-white">
            Wait! Don't Miss This Exclusive Offer
          </DialogTitle>
          
          <DialogDescription className="text-white/80 text-base">
            We noticed you're interested in transforming your safety career. 
            Here's a special discount just for you!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Discount Badge */}
          <div className="text-center">
            <div className="inline-block bg-lime-500 text-slate-900 px-6 py-3 rounded-lg">
              <span className="text-3xl font-bold">10% OFF</span>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="bg-slate-800/50 border border-lime-500/30 rounded-lg p-4 text-center">
            <p className="text-sm text-white/60 mb-2">Use coupon code at checkout:</p>
            <div className="bg-slate-900 border border-dashed border-lime-500 rounded px-4 py-2 inline-block">
              <span className="text-xl font-mono font-bold text-lime-400 tracking-wider">ACADEMY10</span>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center space-y-2">
            <p className="text-white/90 font-medium">
              🚀 Join 500+ safety leaders already enrolled
            </p>
            <p className="text-white/70 text-sm">
              Don't let this opportunity slip away. Your future self will thank you!
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleClaim}
            className="w-full bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-6 text-lg group"
          >
            Claim My 10% Discount
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Secondary Action */}
          <button
            onClick={() => setShowPopup(false)}
            className="w-full text-white/50 hover:text-white/70 text-sm transition-colors"
          >
            No thanks, I'll pay full price
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
