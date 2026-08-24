import { Linkedin, Youtube, Instagram, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import brandMarkWhite from "@/assets/brand-mark-white.png";
import ioshApprovedLogo from "@/assets/iosh-approved-provider.png";
import cpdMemberLogo from "@/assets/cpd-member-logo.jpg";

export const Footer = () => {
  return (
    <footer className="bg-primary border-t border-white/10 py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Logo and Description */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4 md:mb-6">
              <img
                src={brandMarkWhite}
                alt="SafetyTech Academy"
                loading="lazy"
                decoding="async"
                className="h-8 md:h-10 w-auto"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm md:text-base font-extrabold text-white tracking-wide">
                  SAFETYTECH
                </span>
                <span className="text-xs md:text-sm italic text-white/80">
                  Academy
                </span>
              </div>
            </div>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed max-w-md">
              Transforming traditional safety professionals into future-ready digital leaders 
              through comprehensive Safety 4.0 training and certification programs.
            </p>
          </div>

          {/* Programme Links */}
          <div>
            <h4 className="text-white font-semibold text-base md:text-lg mb-4 md:mb-6">Programmes</h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                { to: "/elearning", label: "IOSH-approved Safety 4.0" },
                { to: "/ai-fundamentals", label: "AI Fundamentals in EHS" },
                { to: "/accelerator", label: "Safety 4.0 Accelerator" },
                { to: "/pricing", label: "Pricing & Plans" },
                { to: "/elearning#accreditation", label: "IOSH & CPD Certification" },
                { to: "/case-studies", label: "Case Studies" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-white/70 hover:text-white transition-colors text-xs md:text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold text-base md:text-lg mb-4 md:mb-6">Resources</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link
                  to="/guides"
                  className="text-white/70 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-white/70 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Blog & Insights
                </Link>
              </li>

              <li>
                <Link 
                  to="/contact" 
                  className="text-white/70 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="text-white/70 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-conditions" 
                  className="text-white/70 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link 
                  to="/cookies-policy" 
                  className="text-white/70 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/anti-piracy-policy" 
                  className="text-white/70 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Anti-Piracy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-white font-semibold text-base md:text-lg mb-4 md:mb-6">Follow Us</h4>
            <div className="flex space-x-3 md:space-x-4">
              <a 
                href="https://www.linkedin.com/company/safety-40-academy" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-lime-500/20 hover:text-lime-400 text-white/70 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@lucasdominguesoficial" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 text-white/70 transition-all duration-300"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a 
                href="https://www.instagram.com/iamlucasdomingues/" target="_blank" rel="noopener noreferrer" 
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pink-500/20 hover:text-pink-400 text-white/70 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>

            {/* Accreditations */}
            <div className="mt-6 md:mt-8">
              <h4 className="text-white font-semibold text-base md:text-lg mb-3 md:mb-4">Accreditations</h4>
              <div className="bg-white rounded-lg p-3 inline-flex flex-wrap items-center gap-3 md:gap-4">
                <img
                  src={ioshApprovedLogo}
                  alt="IOSH Approved Training Provider 5522"
                  loading="lazy"
                  decoding="async"
                  className="h-9 md:h-10 w-auto"
                />
                <img
                  src={cpdMemberLogo}
                  alt="CPD Member - The CPD Certification Service"
                  loading="lazy"
                  decoding="async"
                  className="h-9 md:h-10 w-auto"
                />
              </div>
            </div>
          </div>
        </div>




        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-xs md:text-sm text-center md:text-left">
            © 2026 SafetyTech Academy. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-1 md:space-x-2">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
              <span className="text-white/60 text-xs md:text-sm">IOSH Approved</span>
            </div>
            <span className="text-white/60 hidden md:inline">•</span>
            <div className="flex items-center space-x-1 md:space-x-2">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
              <span className="text-white/60 text-xs md:text-sm">CPD Accredited</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};