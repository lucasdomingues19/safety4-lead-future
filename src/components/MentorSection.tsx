import { Card, CardContent } from "@/components/ui/card";
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

const MentorSection = () => {
  // Companies that move to the right
  const companies = [
    { name: "Shield360", placeholder: "SHIELD", logo: shield360Logo },
    { name: "Zenobē", placeholder: "ZENOBĒ", logo: zenobeLogo },
    { name: "Arrival", placeholder: "ARRIVAL", logo: arrivalLogo },
    { name: "Seadrill", placeholder: "SEADRILL", logo: seadrillLogo },
    { name: "Sevan Drilling", placeholder: "SEVAN", logo: sevanDrillingLogo },
    { name: "Andrade Gutierrez", placeholder: "AG", logo: andradeGuiterrezLogo },
  ];

  // Institutions that move to the left  
  const institutions = [
    { name: "Imperial Business School", placeholder: "IMPERIAL", logo: imperialLogo },
    { name: "King's Business School", placeholder: "KING'S", logo: kingsLogo },
    { name: "London Business School", placeholder: "LBS", logo: lbsLogo },
    { name: "Federal University of Rio de Janeiro", placeholder: "UFRJ", logo: ufrjLogo },
    { name: "Federal Fluminense University", placeholder: "UFF", logo: uffLogo },
  ];

  return (
    <section id="instructor" className="pt-12 pb-20 relative overflow-hidden">
      
      {/* Floating elements - Purple and Lime */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Purple blob - Top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-600/20 to-violet-500/15 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        
        {/* Lime blob - Top right */}
        <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        
        {/* Purple blob - Bottom left */}
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/15 via-purple-500/20 to-purple-400/10 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        
        {/* Lime blob - Bottom right */}
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-lime-500/15 via-lime-400/20 to-lime-600/10 blur-3xl animate-[float_28s_ease-in-out_infinite_reverse]"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Meet Your <span className="text-primary">Mentor</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Learn from an industry expert with years of experience in safety leadership and digital transformation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Photo */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden">
              <img 
                src="/lucas-domingues.jpeg" 
                alt="Lucas Domingues, MSc, CMIOSH - Safety Leadership Mentor"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
          </div>

          {/* Bio */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Lucas Domingues</h3>
              <p className="text-xl text-primary font-medium mb-4">MSc, CMIOSH</p>
            </div>

            <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
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
            </div>
          </div>
        </div>

        {/* Education & Experience Logos */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 animate-fade-in">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Education & Experience
          </h3>
          
          {/* Companies - Moving Right */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-300 mb-4">Industry Experience</h4>
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll space-x-8">
                {companies.map((company, index) => (
                  <div key={index} className="flex-shrink-0 text-center w-32">
                    <div className="w-24 h-16 bg-white rounded-lg flex items-center justify-center mb-2 mx-auto p-2">
                      <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className="text-xs text-gray-400 leading-tight">
                      {company.name}
                    </p>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {companies.map((company, index) => (
                  <div key={`duplicate-${index}`} className="flex-shrink-0 text-center w-32">
                    <div className="w-24 h-16 bg-white rounded-lg flex items-center justify-center mb-2 mx-auto p-2">
                      <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className="text-xs text-gray-400 leading-tight">
                      {company.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Institutions - Moving Left */}
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-4">Education & Certifications</h4>
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll-reverse space-x-8">
                {institutions.map((institution, index) => (
                  <div key={index} className="flex-shrink-0 text-center w-32">
                    <div className="w-24 h-16 bg-white rounded-lg flex items-center justify-center mb-2 mx-auto p-2">
                      <img src={institution.logo} alt={institution.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className="text-xs text-gray-400 leading-tight">
                      {institution.name}
                    </p>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {institutions.map((institution, index) => (
                  <div key={`duplicate-${index}`} className="flex-shrink-0 text-center w-32">
                    <div className="w-24 h-16 bg-white rounded-lg flex items-center justify-center mb-2 mx-auto p-2">
                      <img src={institution.logo} alt={institution.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className="text-xs text-gray-400 leading-tight">
                      {institution.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorSection;