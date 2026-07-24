import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import safetyAcademyLogo from "@/assets/safety-academy-logo.png";

const navLinks = [
  {
    label: "About",
    children: [
      { label: "Safety 4.0 Accelerator (Cohort)", href: "/accelerator" },
      { label: "IOSH-approved Safety 4.0", href: "/elearning" },
      { label: "AI Fundamentals in EHS", href: "/ai-fundamentals" },
      { label: "Alumni Stories", href: "/case-studies" },
    ],
  },
  { label: "IOSH & CPD", href: "/certification" },
  { label: "Pricing", href: "/#pricing" },
  {
    label: "Resources",
    children: [
      { label: "Scorecard", href: "/scorecard" },
      { label: "Ebook", href: "/ebook" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

const DesktopDropdown = ({ item }: { item: typeof navLinks[1] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!("children" in item) || !item.children) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-white hover:text-primary transition-colors"
      >
        {item.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 min-w-[16rem] w-max rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-lg py-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-white hover:text-primary hover:bg-muted/50 transition-colors whitespace-nowrap"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const AudienceNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleHashLink = useCallback((e: React.MouseEvent, href: string) => {
    const [path, hash] = href.split("#");
    if (!hash) return;
    e.preventDefault();
    if (location.pathname === path || (path === "/" && location.pathname === "/")) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(path);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [location.pathname, navigate]);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black backdrop-blur-xl border-b border-lime-400">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 flex-shrink-0 overflow-visible">
          <img src={safetyAcademyLogo} alt="SafetyTech Academy" className="h-7 md:h-9 w-auto pr-1" />
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) =>
            "children" in link && link.children ? (
              <DesktopDropdown key={link.label} item={link} />
            ) : (
              <Link
                key={"href" in link ? link.href : link.label}
                to={"href" in link ? link.href : "/"}
                onClick={(e) => {
                  const href = "href" in link ? link.href : "/";
                  if (href.includes("#")) handleHashLink(e, href);
                }}
                className={
                  "emphasis" in link && link.emphasis
                    ? "text-sm font-semibold text-lime-400 hover:text-lime-300 transition-colors"
                    : "text-sm text-white hover:text-primary transition-colors"
                }
              >
                {link.label}
              </Link>
            )
          )}
          <Link
            to="/enrol"
            className="ml-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Enrol Now
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-foreground p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4 space-y-1">
          {navLinks.map((link) =>
            "children" in link && link.children ? (
              <div key={link.label}>
                <span className="block text-sm text-muted-foreground py-2 font-medium">{link.label}</span>
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    to={child.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-white hover:text-primary transition-colors py-2 pl-4"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={"href" in link ? link.href : link.label}
                to={"href" in link ? link.href : "/"}
                onClick={(e) => {
                  setMobileOpen(false);
                  const href = "href" in link ? link.href : "/";
                  if (href.includes("#")) handleHashLink(e, href);
                }}
                className={
                  "emphasis" in link && link.emphasis
                    ? "block text-sm font-semibold text-lime-400 hover:text-lime-300 transition-colors py-2"
                    : "block text-sm text-white hover:text-primary transition-colors py-2"
                }
              >
                {link.label}
              </Link>
            )
          )}
          <Link
            to="/enrol"
            onClick={() => setMobileOpen(false)}
            className="block text-center mt-3 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Enrol Now
          </Link>
        </div>
      )}
    </nav>
    </>
  );
};

export default AudienceNav;
