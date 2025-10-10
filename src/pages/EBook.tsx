import { ArrowLeft, Download, BookOpen, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import bookCover from "@/assets/book-cover-safety-4-leader.jpg";

const EBook = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating purple elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/30 via-purple-600/25 to-violet-500/20 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/25 via-violet-500/30 to-purple-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/20 via-purple-500/25 to-purple-400/15 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/15 via-violet-500/20 to-purple-600/10 blur-2xl animate-[pulse_15s_ease-in-out_infinite]"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
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
            Free <span className="text-pink-500">Safety 4.0</span> eBook
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Download our comprehensive guide to mastering digital safety leadership
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - eBook Cover and Info */}
            <div className="space-y-8">
              {/* eBook Cover */}
              <div className="relative max-w-md mx-auto lg:mx-0">
                <img 
                  src={bookCover} 
                  alt="Become the Safety 4.0 Leader eBook cover by Lucas Domingues"
                  className="w-full h-auto rounded-2xl shadow-2xl border border-white/20"
                />
              </div>

              {/* eBook Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Become the Safety 4.0 Leader
                  </h2>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    A comprehensive under 30-page guide that unpacks personal stories by Lucas, 
                    case studies and deep research to develop digital safety leadership 
                    in the Industry 4.0 era.
                  </p>
                </div>

                {/* Key Features */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-lime-400" />
                    <span className="text-gray-300">50+ pages of expert insights</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-lime-400" />
                    <span className="text-gray-300">Practical implementation strategies</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-lime-400" />
                    <span className="text-gray-300">Real-world case studies</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-lime-400" />
                    <span className="text-gray-300">Technology integration roadmap</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-lime-400" />
                    <span className="text-gray-300">Career advancement blueprint</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-pink-400 text-pink-400" />
                    ))}
                  </div>
                  <span className="text-white font-semibold">4.9/5</span>
                  <span className="text-gray-400">(2,847 downloads)</span>
                </div>
              </div>
            </div>

            {/* Right Side - Download Form */}
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 h-fit">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Download Your Free Copy
                  </h3>
                  <p className="text-gray-300">
                    Join 2,500+ safety professionals who have already downloaded this guide
                  </p>
                </div>

                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      First Name *
                    </label>
                    <Input 
                      type="text" 
                      placeholder="Enter your first name"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Last Name *
                    </label>
                    <Input 
                      type="text" 
                      placeholder="Enter your last name"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <Input 
                      type="email" 
                      placeholder="Enter your email address"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Job Title
                    </label>
                    <Input 
                      type="text" 
                      placeholder="e.g., Safety Manager, HSE Officer"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6 group">
                    <Download className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
                    Download Free eBook
                  </Button>

                  <p className="text-xs text-gray-400 text-center">
                    By downloading, you agree to receive occasional emails about Safety 4.0 Academy. 
                    You can unsubscribe at any time.
                  </p>
                </form>
              </div>

              {/* Bonus Content */}
              <div className="bg-gradient-to-r from-lime-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Bonus: Exclusive Access
                </h4>
                <p className="text-gray-300 text-sm">
                  Download the eBook and get exclusive access to our monthly webinar series 
                  "Safety Leaders Spotlight" featuring industry experts and case studies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What You'll Learn Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            What You'll Learn
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Digital Safety Fundamentals
                  </h3>
                  <p className="text-gray-300">
                    Understand the core principles of Safety 4.0 and how digital transformation 
                    is reshaping workplace safety.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Technology Integration
                  </h3>
                  <p className="text-gray-300">
                    Learn how to implement IoT sensors, AI analytics, and predictive 
                    safety systems in your organization.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Leadership Strategies
                  </h3>
                  <p className="text-gray-300">
                    Develop the leadership skills needed to guide your team through 
                    digital safety transformation.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Data-Driven Decisions
                  </h3>
                  <p className="text-gray-300">
                    Master the art of using safety data and analytics to make 
                    informed decisions and prevent incidents.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">5</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Career Advancement
                  </h3>
                  <p className="text-gray-300">
                    Discover proven strategies to accelerate your safety career 
                    in the digital age.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">6</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Implementation Roadmap
                  </h3>
                  <p className="text-gray-300">
                    Get a step-by-step guide to implementing Safety 4.0 practices 
                    in your organization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBook;