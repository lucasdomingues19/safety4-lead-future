import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CTAButtonProps {
  className?: string;
}

export const CTAButton = ({ className = "" }: CTAButtonProps) => {
  return (
    <div className={`max-w-4xl mx-auto text-center ${className}`}>
      <Button 
        variant="hero" 
        size="lg" 
        className="bg-primary hover:bg-primary/90 text-black text-2xl font-bold py-6 px-12 h-auto group shadow-glow animate-pulse"
        onClick={() => {
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Join the SafetyTech Academy Now
        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
      </Button>
    </div>
  );
};
