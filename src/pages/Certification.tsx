// ============= Full file contents =============

import { useEffect } from "react";
import { Shield, Award, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import AudienceNav from "@/components/AudienceNav";
import cpdCertifiedLogo from "../assets/cpd-approved-logo.png";
import ioshApprovedLogo from "../assets/iosh-approved-logo.jpg";
import certificateSample from "@/assets/certificate-sample.png";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";

const Certification = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "IOSH & CPD Certification | SafetyTech Academy Accreditation",
      description: "Earn an IOSH-approved and CPD-certified Safety 4.0 leadership credential. Recognised globally by employers and professional bodies. 8+ CPD hours included.",
      canonical: "https://safetytech.academy/certification",
    });
  }, []);

  return (
    <>
    <div className="min-h-screen bg-white">

      <AudienceNav />
      <div className="container mx-auto px-4 pt-24 pb-20 relative z-10">

        {/* Back Navigation */}
        <div className="mb-12">
          <Button variant="default" size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-[1.05]">
            IOSH & CPD <span className="text-primary">Certification</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Globally recognized credentials that validate your Safety 4.0 expertise
          </p>
        </div>

        {/* Certification Bodies */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* IOSH Section */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
              <div className="text-center mb-8">
                <div className="w-24 h-18 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-primary-foreground text-2xl font-bold">IOSH</span>
                </div>
                <h2 className="text-3xl font-bold text-primary mb-4">Institution of Occupational Safety and Health</h2>
                <p className="text-slate-600">The world's leading professional body for health and safety professionals</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-slate-600">Digital certificate issued by IOSH</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-slate-600">Recognised in 130+ countries worldwide</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-slate-600">Enhanced career advancement opportunities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-slate-600">Strict quality standard met</span>
                </div>
              </div>
              
              {/* IOSH Logo in bottom right */}
              <div className="absolute bottom-6 right-6">
                <img 
                  src={ioshApprovedLogo} 
                  alt="IOSH Approved Training Provider Logo" 
                  className="w-28 h-18 object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            {/* CPD Section */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
              <div className="text-center mb-8">
                <div className="w-24 h-18 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-primary-foreground text-2xl font-bold">CPD</span>
                </div>
                <h2 className="text-3xl font-bold text-primary mb-4">Continuing Professional Development</h2>
                <p className="text-slate-600">Structured approach to learning and professional growth</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-slate-600">8+ hours of certified CPD credits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-slate-600">Internationally recognized standard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-slate-600">Validates commitment to excellence</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-slate-600">Required by many professional bodies</span>
                </div>
              </div>
              
              {/* CPD Logo in bottom right */}
              <div className="absolute bottom-6 right-6">
                <img 
                  src={cpdCertifiedLogo} 
                  alt="CPD Certified - The CPD Certification Service logo" 
                  className="w-24 h-24 object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Certificate & Certification Process - Side by Side */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Certificate */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Your Certificate</h2>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <img
                  src={certificateSample}
                  alt="IOSH Approved Certificate Sample"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Internationally recognized certification</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>8+ hours of CPD credits</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Digital & printable certificate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Certification Process & Benefits */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Certification Process</h2>
              <div className="space-y-8 mb-12">
                <div className="flex items-start space-x-5">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Complete the Program</h3>
                    <p className="text-slate-600 text-sm">Successfully finish all 10 modules with passing grades on all assessments. Attend the live classes where applicable.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-5">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Final Assessment</h3>
                    <p className="text-slate-600 text-sm">Pass the comprehensive final examination covering all aspects of digital safety leadership and Industry 4.0 applications.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-5">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Certification Award</h3>
                    <p className="text-slate-600 text-sm">Receive your official IOSH and CPD certified Safety 4.0 Leader credentials, recognized globally.</p>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-6">Certification Benefits</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Global Recognition</h3>
                    <p className="text-slate-600 text-sm">Your credentials are recognized and respected by employers worldwide</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Career Advancement</h3>
                    <p className="text-slate-600 text-sm">98% of certified professionals report readiness for career advancement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Industry Authority</h3>
                    <p className="text-slate-600 text-sm">Become a recognized thought leader in the Safety 4.0 movement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Certification;
