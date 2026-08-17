import { Link } from "react-router-dom";

export const BrandLogo = ({ className = "" }: { className?: string }) => {
  return (
    <Link to="/" className={`flex items-center gap-2.5 flex-shrink-0 group ${className}`}>
      {/* Favicon mark */}
      <img
        src="/favicon.png"
        alt="SafetyTech Academy"
        className="h-8 md:h-10 w-auto"
      />

      {/* Wordmark */}
      <div className="hidden sm:flex flex-col leading-tight">
        <span className="text-sm font-extrabold text-slate-900 tracking-wide">
          SAFETYTECH
        </span>
        <span className="text-xs font-medium text-primary">
          Academy
        </span>
      </div>
    </Link>
  );
};
