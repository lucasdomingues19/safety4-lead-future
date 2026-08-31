import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Courses",
    children: [
      { label: "All Courses", href: "/courses", category: "main" },
      { label: "FOR COMPANIES", category: "header", divider: true },
      { label: "Microsoft Copilot for EHS & Sustainability", href: "/copilot-for-ehs" },
      { label: "FOR PROFESSIONALS", category: "header", divider: true },
      { label: "Safety 4.0 Accelerator (Cohort)", href: "/accelerator" },
      { label: "IOSH-approved Safety 4.0", href: "/elearning" },
      { label: "AI Fundamentals in EHS", href: "/ai-fundamentals" },
      { label: "Alumni Stories", href: "/case-studies" },
    ],
  },
  { label: "About", href: "/about-us" },
  {
    label: "Resources",
    children: [
      { label: "Guides", href: "/guides" },
      { label: "AI in EHS Governance Readiness", href: "/governance-readiness" },
      { label: "Digital Maturity Scorecard", href: "/scorecard" },
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
  const location = useLocation();
  const isActive = "children" in item && item.children?.some((c) => c.href && location.pathname === c.href);

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
        className={`flex items-center gap-1.5 text-base font-medium transition-colors ${
          isActive ? "text-primary" : "text-slate-900 hover:text-primary"
        }`}
      >
        {item.label}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-3 min-w-[16rem] w-max rounded-lg border border-slate-200 bg-white shadow-lg py-1">
          {item.children.map((child, idx) => {
            if (child.category === "header") {
              return (
                <div key={idx} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary ${child.divider ? "border-t border-slate-100 mt-1 pt-3" : ""}`}>
                  {child.label}
                </div>
              );
            }
            return (
              <Link
                key={child.href || idx}
                to={child.href || "#"}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                {child.label}
              </Link>
            );
          })}
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <BrandLogo />

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-10">
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
                className={`text-base font-medium transition-colors ${
                  "href" in link && location.pathname === link.href
                    ? "text-primary"
                    : "text-slate-900 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
          <Link
            to="/enrol"
            className="ml-2 px-6 py-2.5 rounded bg-primary text-white text-sm font-medium uppercase tracking-[0.08em] hover:bg-primary/90 transition-colors"
          >
            Enrol Now
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-slate-900 p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pb-4 space-y-1">
          {navLinks.map((link) =>
            "children" in link && link.children ? (
              <div key={link.label}>
                <span className="block text-sm text-slate-600 py-2 font-medium">{link.label}</span>
                {link.children.map((child, idx) => {
                  if (child.category === "header") {
                    return (
                      <div key={idx} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary mt-2">
                        {child.label}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={child.href || idx}
                      to={child.href || "#"}
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm text-slate-700 hover:text-primary transition-colors py-2 pl-4"
                    >
                      {child.label}
                    </Link>
                  );
                })}
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
                    ? "block text-sm font-semibold text-primary hover:text-primary/80 transition-colors py-2"
                    : "block text-sm text-slate-700 hover:text-primary transition-colors py-2"
                }
              >
                {link.label}
              </Link>
            )
          )}
          <Link
            to="/enrol"
            onClick={() => setMobileOpen(false)}
            className="block text-center mt-3 px-5 py-2.5 rounded bg-primary text-white text-sm font-medium uppercase tracking-[0.08em] hover:bg-primary/90 transition-colors"
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
