import { Link } from "react-router-dom";
import brandLogo from "@/assets/brand-logo.png";
import brandMarkBlue from "@/assets/brand-mark-blue.png";

export const BrandLogo = ({ className = "" }: { className?: string }) => {
  return (
    <Link to="/" className={`flex items-center flex-shrink-0 group ${className}`}>
      {/* Full wordmark on larger screens */}
      <img
        src={brandLogo}
        alt="SafetyTech Academy"
        className="hidden sm:block h-8 md:h-9 w-auto"
      />
      {/* Mark only on very small screens */}
      <img
        src={brandMarkBlue}
        alt="SafetyTech Academy"
        className="sm:hidden h-8 w-auto"
      />
    </Link>
  );
};
