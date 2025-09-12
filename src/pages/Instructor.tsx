import { ArrowLeft, Award, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import instructorPhoto from "../assets/instructor-photo.jpg";

const Instructor = () => {
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
            Meet Your <span className="text-pink-500">Instructor</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Learn from industry pioneers who are shaping the future of safety
          </p>
        </div>

        {/* Main Instructor Profile */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Instructor Photo */}
            <div className="relative">
              <div className="w-full aspect-square bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl overflow-hidden border border-white/20">
                <img 
                  src={instructorPhoto} 
                  alt="Dr. [Name] - Safety 4.0 Instructor" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Instructor Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">Dr. [Name]</h2>
                <p className="text-xl text-pink-500 mb-6">Lead Instructor & Safety 4.0 Pioneer</p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  With over 20 years of experience in safety management and digital transformation, 
                  Dr. [Name] has been instrumental in developing the Safety 4.0 methodology that 
                  bridges traditional safety practices with cutting-edge technology.
                </p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-lime-500/20 rounded-full mb-3 mx-auto">
                    <Award className="w-8 h-8 text-lime-400" />
                  </div>
                  <div className="text-2xl font-bold text-lime-400">25+</div>
                  <div className="text-sm text-gray-400">Awards</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-pink-500/20 rounded-full mb-3 mx-auto">
                    <Users className="w-8 h-8 text-pink-400" />
                  </div>
                  <div className="text-2xl font-bold text-pink-400">2500+</div>
                  <div className="text-sm text-gray-400">Students</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-3 mx-auto">
                    <Globe className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">50+</div>
                  <div className="text-sm text-gray-400">Countries</div>
                </div>
              </div>
            </div>
          </div>

          {/* Credentials & Achievements */}
          <div className="space-y-12">
            <section>
              <h3 className="text-3xl font-bold text-white mb-8">Credentials & Achievements</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h4 className="text-xl font-semibold text-lime-400 mb-4">Education</h4>
                  <ul className="text-gray-300 space-y-2">
                    <li>• PhD in Industrial Safety Engineering</li>
                    <li>• Master's in Digital Transformation</li>
                    <li>• NEBOSH International Diploma</li>
                    <li>• Certified Safety Professional (CSP)</li>
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h4 className="text-xl font-semibold text-pink-500 mb-4">Industry Recognition</h4>
                  <ul className="text-gray-300 space-y-2">
                    <li>• IOSH Outstanding Contribution Award</li>
                    <li>• Top 50 Safety Influencers Globally</li>
                    <li>• Author of "Safety 4.0: The Digital Revolution"</li>
                    <li>• Keynote Speaker at 100+ Conferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-3xl font-bold text-white mb-8">Teaching Philosophy</h3>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-white/20">
                <p className="text-lg text-gray-300 leading-relaxed italic">
                  "The future of safety isn't just about preventing accidents—it's about creating intelligent, 
                  predictive systems that transform how we think about workplace protection. My mission is to 
                  equip safety professionals with the digital fluency and strategic mindset needed to lead 
                  this transformation."
                </p>
                <div className="mt-6 text-right">
                  <span className="text-pink-400 font-semibold">— Dr. [Name]</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructor;