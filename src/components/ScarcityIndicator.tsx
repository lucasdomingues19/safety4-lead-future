import { Users, Clock } from "lucide-react";

interface ScarcityIndicatorProps {
  variant?: "hero" | "pricing";
  spotsLeft?: number;
}

export const ScarcityIndicator = ({ 
  variant = "hero", 
  spotsLeft = 12 
}: ScarcityIndicatorProps) => {
  if (variant === "hero") {
    return (
      <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 rounded-full px-4 py-2 animate-pulse">
        <Users className="w-4 h-4 text-pink-400" />
        <span className="text-pink-300 text-sm font-medium">
          Only <span className="text-white font-bold">{spotsLeft} spots left</span> at this price
        </span>
      </div>
    );
  }

  // Pricing section variant - more prominent
  return (
    <div className="bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
          <span className="text-white font-semibold">
            Only {spotsLeft} founding member spots remaining
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <Clock className="w-4 h-4" />
          <span>Price increases when spots are filled</span>
        </div>
      </div>
    </div>
  );
};
