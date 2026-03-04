import { useLocation, useNavigate } from "react-router-dom";
import safetyAcademyLogo from "@/assets/safety-academy-logo.png";

const AudienceNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isBusinessActive = location.pathname === "/in-company";
  const isProfessionalActive = location.pathname === "/cohort" || location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <img src={safetyAcademyLogo} alt="Safety 4.0 Academy" className="h-8" />
        </a>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-sm mr-2 hidden sm:inline">I'm a</span>
          <div className="flex rounded-full border border-border bg-card/60 p-1">
            <button
              onClick={() => navigate("/cohort")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                isProfessionalActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Professional
            </button>
            <button
              onClick={() => navigate("/in-company")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                isBusinessActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Business
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AudienceNav;
