import { ArrowLeft, Shield, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import cpdApprovedLogo from "../assets/cpd-approved-logo.png";

const Certification = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#11113a] via-slate-900 to-black text-white">
      <div className="container mx-auto px-4 py-20">
        {/* Back Navigation */}
        <div className="mb-12">
          <Button variant="outline" size="sm" asChild className="border-white/30 text-white hover:bg-white/10">
            <a href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-pink-500">IOSH</span> & <span className="text-lime-400">CPD</span> Certification
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Globally recognized credentials that validate your Safety 4.0 expertise
          </p>
        </div>

        {/* Certification Bodies */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* IOSH Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="w-24 h-18 bg-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white text-2xl font-bold">IOSH</span>
                </div>
                <h2 className="text-3xl font-bold text-pink-500 mb-4">Institution of Occupational Safety and Health</h2>
                <p className="text-gray-300">The world's leading professional body for health and safety professionals</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-400" />
                  <span className="text-gray-300">Chartered membership pathway available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-400" />
                  <span className="text-gray-300">Recognized in 130+ countries worldwide</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-400" />
                  <span className="text-gray-300">Continuous professional development credits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-400" />
                  <span className="text-gray-300">Enhanced career advancement opportunities</span>
                </div>
              </div>
            </div>

            {/* CPD Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 relative">
              <div className="text-center mb-8">
                <div className="w-24 h-18 bg-lime-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white text-2xl font-bold">CPD</span>
                </div>
                <h2 className="text-3xl font-bold text-lime-400 mb-4">Continuing Professional Development</h2>
                <p className="text-gray-300">Structured approach to learning and professional growth</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-lime-400" />
                  <span className="text-gray-300">40 hours of certified CPD credits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-lime-400" />
                  <span className="text-gray-300">Internationally recognized standard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-lime-400" />
                  <span className="text-gray-300">Validates commitment to excellence</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-lime-400" />
                  <span className="text-gray-300">Required by many professional bodies</span>
                </div>
              </div>
              
              {/* CPD Logo in bottom right */}
              <div className="absolute bottom-6 right-6">
                <img 
                  src={cpdApprovedLogo} 
                  alt="CPD Approved Logo" 
                  className="w-32 h-20 object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Certification Process */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Certification Process</h2>
          
          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Complete the Program</h3>
                <p className="text-gray-300">Successfully finish all 12 modules of the Safety 4.0 Academy program with passing grades on all assessments.</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Portfolio Development</h3>
                <p className="text-gray-300">Create a comprehensive portfolio demonstrating your practical application of Safety 4.0 principles in real-world scenarios.</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Final Assessment</h3>
                <p className="text-gray-300">Pass the comprehensive final examination covering all aspects of digital safety leadership and Industry 4.0 applications.</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Certification Award</h3>
                <p className="text-gray-300">Receive your official IOSH and CPD certified Safety 4.0 Leader credentials, recognized globally.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Certification Benefits</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Global Recognition</h3>
              <p className="text-gray-300">Your credentials are recognized and respected by employers worldwide</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-lime-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-lime-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Career Advancement</h3>
              <p className="text-gray-300">98% of certified professionals report career advancement within 12 months</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Industry Authority</h3>
              <p className="text-gray-300">Become a recognized thought leader in the Safety 4.0 movement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certification;