import { Linkedin, Youtube, Instagram, CheckCircle } from "lucide-react";
import safetyAcademyLogo from "@/assets/safety-academy-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Logo and Description */}
          <div className="col-span-2 lg:col-span-2">
            <img 
              src={safetyAcademyLogo} 
              alt="Safety 4.0 Academy Logo" 
              className="h-16 md:h-20 w-auto mb-4 md:mb-6"
            />
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-md">
              Transforming traditional safety professionals into future-ready digital leaders 
              through comprehensive Safety 4.0 training and certification programs.
            </p>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold text-base md:text-lg mb-4 md:mb-6">Resources</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a 
                  href="/blog" 
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Blog & Insights
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Support
                </a>
              </li>
              <li>
                <a 
                  href="/privacy-policy" 
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms-conditions" 
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a 
                  href="/cookies-policy" 
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Cookies Policy
                </a>
              </li>
              <li>
                <a 
                  href="/anti-piracy-policy" 
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Anti-Piracy Policy
                </a>
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
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-lime-500/20 hover:text-lime-400 text-gray-300 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@lucasdominguesoficial" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 text-gray-300 transition-all duration-300"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pink-500/20 hover:text-pink-400 text-gray-300 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
            © 2025 Safety 4.0 Academy. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-1 md:space-x-2">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
              <span className="text-gray-400 text-xs md:text-sm">IOSH Approved</span>
            </div>
            <span className="text-gray-400 hidden md:inline">•</span>
            <div className="flex items-center space-x-1 md:space-x-2">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
              <span className="text-gray-400 text-xs md:text-sm">CPD Accredited</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};