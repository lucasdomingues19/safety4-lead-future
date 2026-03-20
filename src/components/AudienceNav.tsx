import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import safetyAcademyLogo from "@/assets/safety-academy-logo.png";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Programme",
    children: [
      { label: "Curriculum", href: "/syllabus" },
      { label: "Preview", href: "/cohort" },
    ],
  },
  { label: "For Companies", href: "/in-company" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Ebook", href: "/ebook" },
  { label: "Scorecard", href: "/scorecard" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
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
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {item.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-40 rounded-lg border border-border bg-background/95 backdrop-blur-xl shadow-lg py-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 flex-shrink-0">
          <img src={safetyAcademyLogo} alt="Safety 4.0 Academy" className="h-8" />
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            "children" in link && link.children ? (
              <DesktopDropdown key={link.label} item={link} />
            ) : (
              <Link
                key={"href" in link ? link.href : link.label}
                to={"href" in link ? link.href : "/"}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4 space-y-1">
          {navLinks.map((link) =>
            "children" in link && link.children ? (
              <div key={link.label}>
                <span className="block text-sm text-muted-foreground py-2 font-medium">{link.label}</span>
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    to={child.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2 pl-4"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={"href" in link ? link.href : link.label}
                to={"href" in link ? link.href : "/"}
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
};

export default AudienceNav;
