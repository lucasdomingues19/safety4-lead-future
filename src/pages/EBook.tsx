import { useEffect, useState } from "react";
import { ArrowLeft, Download, BookOpen, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import bookCover from "@/assets/book-cover-safety-4-leader.jpg";
import { trackPageView } from "@/utils/analytics";

const EBook = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
  });

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save lead to database
      const { error } = await supabase.functions.invoke('capture-lead', {
        body: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone || null,
          source: 'ebook_download'
        }
      });

      if (error) throw error;

      // Open ebook download link
      window.open('https://newsletter.getshield360.com/ebook', '_blank');

      toast({
        title: "Success! Your download is starting",
        description: "Check your downloads folder for the Safety 4.0 Leader eBook.",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        jobTitle: "",
      });
    } catch (error: any) {
      console.error("Error downloading ebook:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="min-h-screen relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
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
                    <span className="text-gray-300">30+ pages of expert insights</span>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      First Name *
                    </label>
                    <Input 
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
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
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
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
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Phone Number (optional)
                    </label>
                    <Input 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Job Title
                    </label>
                    <Input 
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Safety Manager, HSE Officer"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6 group"
                  >
                    <Download className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
                    {isSubmitting ? "Processing..." : "Download Free eBook"}
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
                  Download the eBook and get exclusive invite to join our monthly masterclass series "Become the Safety 4.0 Leader" on LinkedIn
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
    <Footer />
    </>
  );
};

export default EBook;