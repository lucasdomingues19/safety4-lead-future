import AudienceNav from "@/components/AudienceNav";
import { useEffect } from "react";
import { ArrowLeft, Download, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import bookCover from "@/assets/book-cover-safety-4-leader.png";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";

const EBook = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Free Safety 4.0 eBook | Digital Safety Leadership Guide Download",
      description: "Download the free Safety 4.0 eBook — your guide to leading safety in the digital age. Learn about AI, IoT, and SafetyTech for modern workplace safety management.",
      canonical: "https://safetyacademy.tech/ebook",
    });
  }, []);

  return (
    <>
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-black"></div>
      <AudienceNav />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-600/20 to-violet-500/15 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/15 via-purple-500/20 to-purple-400/10 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-lime-500/15 via-lime-400/20 to-lime-600/10 blur-3xl animate-[float_28s_ease-in-out_infinite_reverse]"></div>
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
            Free <span className="text-primary">Safety 4.0</span> eBook
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Short read for EHS professionals who is starting to navigate the safetytech and AI transition.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center space-y-8">
            {/* eBook Cover */}
            <div className="relative max-w-md">
              <img 
                src={bookCover} 
                alt="Become the Safety 4.0 Leader eBook cover by Lucas Domingues"
                className="w-full h-auto rounded-2xl shadow-2xl border border-white/20"
              />
            </div>

            {/* eBook Details */}
            <div className="space-y-6 text-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Become the Safety 4.0 Leader
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  A comprehensive under 30-page guide that unpacks personal stories by Lucas, 
                  case studies and deep research to develop digital safety leadership 
                  in the Industry 4.0 era.
                </p>
              </div>


              {/* Rating */}
              <div className="flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-pink-400 text-pink-400" />
                  ))}
                </div>
                <span className="text-white font-semibold">4.9/5</span>
                <span className="text-gray-400">(2,847 downloads)</span>
              </div>

              {/* Download Button */}
              <Button 
                asChild
                className="bg-pink-500 hover:bg-pink-600 text-white text-lg py-6 px-10 group"
              >
                <a href="https://learning.safetyacademy.tech/become-the-safety-4-0-leader" target="_blank" rel="noopener noreferrer">
                  <Download className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
                  Download Free eBook
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default EBook;
