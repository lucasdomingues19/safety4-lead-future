import { Card, CardContent } from "@/components/ui/card";
import shield360Logo from "@/assets/shield360-logo.png";
import zenobeLogo from "@/assets/zenobe-logo.png";
import arrivalLogo from "@/assets/arrival-logo.png";
import seadrillLogo from "@/assets/seadrill-logo.png";

const MentorSection = () => {
  // Companies that move to the right
  const companies = [
    { name: "Shield360", placeholder: "SHIELD", logo: shield360Logo },
    { name: "Zenobē", placeholder: "ZENOBĒ", logo: zenobeLogo },
    { name: "Arrival", placeholder: "ARRIVAL", logo: arrivalLogo },
    { name: "Seadrill", placeholder: "SEADRILL", logo: seadrillLogo },
  ];

  // Institutions that move to the left  
  const institutions = [
    { name: "IOSH Certified", placeholder: "IOSH" },
    { name: "University College", placeholder: "UCL" },
    { name: "Safety Institute", placeholder: "OSHC" },
    { name: "CPD Standards", placeholder: "CPD" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 relative overflow-hidden">
      <div className="container mx-auto px-4">
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
                alt="Lucas Domingues, MSc, IOSH - Safety Leadership Mentor"
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
              <p className="text-xl text-primary font-medium mb-4">MSc, IOSH</p>
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
                    <div className="w-24 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mb-2 mx-auto">
                      <span className="text-secondary font-bold text-sm">{institution.placeholder}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-tight">
                      {institution.name}
                    </p>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {institutions.map((institution, index) => (
                  <div key={`duplicate-${index}`} className="flex-shrink-0 text-center w-32">
                    <div className="w-24 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mb-2 mx-auto">
                      <span className="text-secondary font-bold text-sm">{institution.placeholder}</span>
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