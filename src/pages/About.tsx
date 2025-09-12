import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
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
            About <span className="text-pink-500">Safety 4.0</span> Academy
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Pioneering the future of safety leadership through cutting-edge digital transformation
          </p>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto space-y-16">
          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-4">
              Safety 4.0 Academy was founded with a singular vision: to transform traditional safety professionals 
              into digital leaders ready for Industry 4.0. We believe that the future of workplace safety lies at 
              the intersection of human expertise and advanced technology.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Our comprehensive programs bridge the gap between conventional safety practices and the demands of 
              modern digital workplaces, ensuring professionals are equipped with both the technical skills and 
              strategic mindset needed to excel in tomorrow's safety landscape.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Why Safety 4.0?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-lime-400 mb-4">Industry Recognition</h3>
                <p className="text-gray-300">
                  The only safety program globally recognized by both IOSH and CPD, ensuring your credentials 
                  are valued worldwide.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-pink-500 mb-4">Proven Results</h3>
                <p className="text-gray-300">
                  98% of our graduates report significant career advancement within 12 months of completing 
                  the program.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-blue-400 mb-4">Global Network</h3>
                <p className="text-gray-300">
                  Join a community of 2,500+ safety leaders across 50+ countries, all transforming their 
                  industries through digital innovation.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-purple-400 mb-4">Future-Ready</h3>
                <p className="text-gray-300">
                  Our curriculum evolves with emerging technologies, ensuring you stay ahead of industry 
                  trends and maintain your competitive edge.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;