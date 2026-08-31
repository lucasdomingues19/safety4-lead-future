import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CTAButtonProps {
  className?: string;
}

export const CTAButton = ({ className = "" }: CTAButtonProps) => {
  return (
    <div className={`max-w-4xl mx-auto text-center ${className}`}>
      <Link
        to="/enrol"
        className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-black text-2xl font-bold py-6 px-12 h-auto group shadow-glow animate-pulse rounded transition-colors"
      >
        Join the SafetyTech Academy Now
        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
      </Link>
    </div>
  );
};
