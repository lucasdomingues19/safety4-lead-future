import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, X } from "lucide-react";
import { Safety4AssessmentModal } from "@/components/Safety4AssessmentModal";

export const LeadCaptureModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

  useEffect(() => {
    // Check if user already completed assessment
    const hasCompletedAssessment = sessionStorage.getItem('assessmentShown');
    if (hasCompletedAssessment) return;

    // Open modal after 45 seconds (reduced from 60 for better conversion)
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem('assessmentShown', 'true');
    }, 45000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-[#D6FF00]/20">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4 text-white" />
            <span className="sr-only">Close</span>
          </button>
          
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#D6FF00] to-[#a8cc00] rounded-full flex items-center justify-center">
              <ClipboardCheck className="w-8 h-8 text-black" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              How Ready Are You for Safety 4.0?
            </DialogTitle>
            <DialogDescription className="text-base text-gray-300 text-center">
              Take our <span className="text-[#D6FF00] font-semibold">FREE 2-minute assessment</span> and discover where you stand in the digital safety transformation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
              <h3 className="text-white font-semibold text-base">You will discover:</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-[#D6FF00] font-bold">✓</span>
                  <span>Your current digital safety leadership capability level</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D6FF00] font-bold">✓</span>
                  <span>Critical gaps holding back your career progression</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D6FF00] font-bold">✓</span>
                  <span>Personalized recommendations to accelerate your transformation</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setShowAssessment(true);
                }}
                className="flex-1 bg-[#D6FF00] hover:bg-[#c5ee00] text-black py-4 text-base font-semibold"
              >
                Start the FREE Assessment
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
              Only 10 quick questions • Takes 2 minutes
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <Safety4AssessmentModal 
        isOpen={showAssessment} 
        onClose={() => setShowAssessment(false)} 
      />
    </>
  );
};
