import { Card, CardContent } from "@/components/ui/card";
import { Linkedin } from "lucide-react";
// Real company logos
import shield360Logo from "@/assets/shield360-logo-real.png";
import zenobeLogo from "@/assets/zenobe-logo-real.png";
import arrivalLogo from "@/assets/arrival-logo-real.png";
import seadrillLogo from "@/assets/seadrill-logo-real.svg";
import sevanDrillingLogo from "@/assets/sevan-drilling-logo-real.png";
import andradeGuiterrezLogo from "@/assets/andrade-gutierrez-logo.jpeg";
// Real university logos
import imperialLogo from "@/assets/imperial-business-logo-real.png";
import kingsLogo from "@/assets/kings-logo-real.png";
import lbsLogo from "@/assets/lbs-logo-real.jpg";
import ufrjLogo from "@/assets/ufrj-logo-real.png";
import uffLogo from "@/assets/uff-logo-real.png";
import founderPhoto from "@/assets/founder-cutout.png";

const MentorSection = () => {
  // ============================================
  // SAVED FOR FUTURE USE - Education & Experience data
  // Uncomment the JSX below to restore the banner
  // ============================================
  // const companies = [
  //   { name: "Shield360", placeholder: "SHIELD", logo: shield360Logo },
  //   { name: "Zenobē", placeholder: "ZENOBĒ", logo: zenobeLogo },
  //   { name: "Arrival", placeholder: "ARRIVAL", logo: arrivalLogo },
  //   { name: "Seadrill", placeholder: "SEADRILL", logo: seadrillLogo },
  //   { name: "Sevan Drilling", placeholder: "SEVAN", logo: sevanDrillingLogo },
  //   { name: "Andrade Gutierrez", placeholder: "AG", logo: andradeGuiterrezLogo },
  // ];
  // const institutions = [
  //   { name: "Imperial Business School", placeholder: "IMPERIAL", logo: imperialLogo },
  //   { name: "King's Business School", placeholder: "KING'S", logo: kingsLogo },
  //   { name: "London Business School", placeholder: "LBS", logo: lbsLogo },
  //   { name: "Federal University of Rio de Janeiro", placeholder: "UFRJ", logo: ufrjLogo },
  //   { name: "Federal Fluminense University", placeholder: "UFF", logo: uffLogo },
  // ];
  // ============================================

  return (
    <section id="instructor" className="py-12 md:py-16 relative overflow-hidden">
      

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-primary mb-5">
            Your Mentor
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight leading-[1.05]">Meet the <span className="text-primary">Founder</span>
          </h2>
          <p className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto">
            Learn from an industry expert with years of experience in safety leadership and digital transformation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Photo */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: "#0a1530" }}>
              {/* Grid lines background (matches hero) */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(20,184,166,0.12) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(20,184,166,0.12) 1px, transparent 1px)
                  `,
                  backgroundSize: "70px 70px",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
                  `,
                  backgroundSize: "280px 280px",
                }}
              />
              <img
                src={founderPhoto}
                alt="Lucas Domingues, MSc, CMIOSH - Safety Leadership Mentor"
                className="absolute inset-0 w-full h-full object-cover object-top" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
          </div>

          {/* Bio */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Lucas Domingues</h3>
              <p className="text-xl text-primary font-medium mb-4">MSc, CMIOSH</p>
            </div>

            <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
              <p>
                Lucas brings over 15 years of experience in occupational health and safety, 
                specializing in digital transformation and modern safety leadership practices.
              </p>
              
              <p>
                With his Master's degree and IOSH certification, Lucas has helped hundreds 
                of safety professionals transition from traditional methods to cutting-edge, 
                data-driven approaches that drive real business value.
              </p>

              <p>
                His expertise spans across multiple industries, from manufacturing to construction, 
                where he's consistently delivered measurable improvements in safety performance 
                and organizational culture.
              </p>
            </div>

            <div className="pt-4">
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Safety Leadership
                </span>
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Digital Transformation
                </span>
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Risk Management
                </span>
                <span className="px-4 py-2 bg-lime-400/10 text-lime-400 rounded-full text-sm font-medium">
                  SafetyTech
                </span>
                <span className="px-4 py-2 bg-lime-400/10 text-lime-400 rounded-full text-sm font-medium">
                  Career Transformation
                </span>
                <span className="px-4 py-2 bg-lime-400/10 text-lime-400 rounded-full text-sm font-medium">
                  AI
                </span>
              </div>

              {/* LinkedIn Button */}
              <a
                href="https://www.linkedin.com/in/lucas-domingues-msc-cmiosh-49b2b820/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-slate-900 rounded-full font-medium transition-colors">
                
                <Linkedin className="w-5 h-5" />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Education & Experience Logos - REMOVED, data saved in component for future restoration */}
      </div>
    </section>);

};

export default MentorSection;
