import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";

export const LeadCaptureModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open modal after 5 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-pink-500/20">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold text-center text-white">
            Discover Your Safety 4.0 Readiness Score
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-300 text-center">
            Take our <span className="text-lime-400 font-semibold">FREE 2-minute assessment</span> and discover where you stand in the digital safety transformation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
            <h3 className="text-white font-semibold text-lg">You'll discover:</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-lime-400 font-bold">✓</span>
                <span>Your current digital safety leadership capability level</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lime-400 font-bold">✓</span>
                <span>Critical gaps holding back your career progression</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lime-400 font-bold">✓</span>
                <span>Personalized recommendations to accelerate your transformation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lime-400 font-bold">✓</span>
                <span>Benchmark yourself against industry leaders</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                setIsOpen(false);
                document.getElementById('assessment-trigger')?.click();
              }}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6 text-lg font-semibold"
            >
              Take the FREE Assessment
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-center text-sm text-gray-400">
            No credit card required • Takes only 2 minutes
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
