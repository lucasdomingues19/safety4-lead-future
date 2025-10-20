import { Linkedin, Youtube, Instagram, CheckCircle } from "lucide-react";
import safetyAcademyLogo from "@/assets/safety-academy-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <img 
              src={safetyAcademyLogo} 
              alt="Safety 4.0 Academy Logo" 
              className="h-20 w-auto mb-6"
            />
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Transforming traditional safety professionals into future-ready digital leaders 
              through comprehensive Safety 4.0 training and certification programs.
            </p>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/contact" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Support
                </a>
              </li>
              <li>
                <a 
                  href="/privacy-policy" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms-conditions" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a 
                  href="/cookies-policy" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Cookies Policy
                </a>
              </li>
              <li>
                <a 
                  href="/anti-piracy-policy" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Anti-Piracy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-lime-500/20 hover:text-lime-400 text-gray-300 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@lucasdominguesoficial" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 text-gray-300 transition-all duration-300"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pink-500/20 hover:text-pink-400 text-gray-300 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Safety 4.0 Academy. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-sm">IOSH Approved</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center space-x-2">
              <img 
                src="/src/assets/cpd-approved-logo.png" 
                alt="CPD Approved Member" 
                className="h-6 w-auto"
              />
              <span className="text-gray-400 text-sm">CPD Accredited Member</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};