import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import safetyAcademyLogo from "@/assets/safety-academy-logo.png";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Ebook", href: "/ebook" },
  { label: "Blog", href: "/blog" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Scorecard", href: "/scorecard" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const AudienceToggle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isBusinessActive = location.pathname === "/in-company";
  const isProfessionalActive = location.pathname === "/cohort" || location.pathname === "/";

  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground text-sm mr-2 hidden sm:inline">I'm a</span>
      <div className="flex rounded-full border border-border bg-card/60 p-1">
        <button
          onClick={() => navigate("/cohort")}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${
            isProfessionalActive
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Professional
        </button>
        <button
          onClick={() => navigate("/in-company")}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${
            isBusinessActive
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Business
        </button>
      </div>
    </div>
  );
};

const AudienceNav = ({ inline = false }: { inline?: boolean }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (inline) return <AudienceToggle />;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 flex-shrink-0">
          <img src={safetyAcademyLogo} alt="Safety 4.0 Academy" className="h-8" />
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Enrol CTA */}
        {/* CTA removed */}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default AudienceNav;
