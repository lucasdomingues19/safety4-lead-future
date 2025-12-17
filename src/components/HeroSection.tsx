import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Award, AlertCircle, TrendingDown, TrendingUp, Clock, BookOpen, Target, AlertTriangle, Smartphone, Wrench, Database, Sparkles, Crown, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { CountdownTimer } from "./CountdownTimer";
import { Safety4AssessmentModal } from "./Safety4AssessmentModal";
import safetyAcademyLogo from "../assets/safety-academy-logo.png";
import rhodriPhoto from "../assets/rhodri-atkins.jpeg";
import matildePhoto from "../assets/matilde-damelio.png";

export const HeroSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentHeadline((prev) => (prev + 1) % 2);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  
  return (
    <section className="min-h-screen relative overflow-hidden">
      
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

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header with Logo and Navigation */}
        <div className="relative flex justify-between items-center mb-8 md:mb-16">
          <div className="flex flex-col items-start space-y-2">
            <img 
              src={safetyAcademyLogo} 
              alt="Safety 4.0 Academy Logo" 
              className="h-20 md:h-36 w-auto"
            />
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#about-academy" className="text-white/80 hover:text-white transition-colors text-sm font-medium">About Us</a>
            <a href="#instructor" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Meet Your Instructor</a>
            <a href="/certification" className="text-white/80 hover:text-white transition-colors text-sm font-medium">IOSH and CPD</a>
            <a href="/blog" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Blog</a>
            <a href="/ebook" className="text-white/80 hover:text-white transition-colors text-sm font-medium">eBook</a>
            <a href="/contact" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Get in Touch</a>
            <a href="/faq" className="text-white/80 hover:text-white transition-colors text-sm font-medium">FAQ</a>
          </nav>
          
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden border-white/30 text-white hover:bg-white/10 z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          
          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#11113a] backdrop-blur-sm border-b border-white/20 z-40 pt-32">
              <nav className="container mx-auto px-4 py-6 space-y-4">
                <a 
                  href="#about-academy" 
                  className="block text-white/80 hover:text-white transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </a>
                <a 
                  href="#instructor" 
                  className="block text-white/80 hover:text-white transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Meet Your Instructor
                </a>
                <a 
                  href="/certification" 
                  className="block text-white/80 hover:text-white transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  IOSH and CPD
                </a>
                <a 
                  href="/blog" 
                  className="block text-white/80 hover:text-white transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </a>
                <a 
                  href="/ebook" 
                  className="block text-white/80 hover:text-white transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  eBook
                </a>
                <a 
                  href="/contact" 
                  className="block text-white/80 hover:text-white transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get in Touch
                </a>
                <a 
                  href="/faq" 
                  className="block text-white/80 hover:text-white transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
              </nav>
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        <CountdownTimer />

        {/* Main Content - Centered like LeadPages */}
        <div className="text-center max-w-6xl mx-auto">
          {/* Badges */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-8 flex-wrap">
            <div className="inline-flex items-center space-x-1 md:space-x-2 text-primary font-medium bg-primary/10 px-3 md:px-6 py-2 md:py-3 rounded-full border border-primary/20 text-sm md:text-base">
              <Award className="w-3 h-3 md:w-4 md:h-4" />
              <span>IOSH Approved</span>
            </div>
            <div className="inline-flex items-center space-x-1 md:space-x-2 text-blue-400 font-medium bg-blue-400/10 px-3 md:px-6 py-2 md:py-3 rounded-full border border-blue-400/20 text-sm md:text-base">
              <Shield className="w-3 h-3 md:w-4 md:h-4" />
              <span>CPD Accredited</span>
            </div>
          </div>
          
          {/* Main Headline - Alternating with fade animation */}
          <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {currentHeadline === 0 ? (
              <>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-4 md:mb-8 px-2">
                  Safety Leadership Without <span className="text-pink-500">Digital Literacy</span> has Become a <span className="text-pink-500">Liability</span>
                </h1>
                
                {/* Subheading */}
                <p className="text-base md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 md:mb-12 font-light px-2">
                  The safety industry is rapidly evolving. While others struggle with outdated approaches, <span className="font-bold text-lime-400">forward-thinking safety leaders are mastering digital transformation</span> to stay ahead
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-4 md:mb-8 px-2">
                  Are you ready to become the <span className="text-pink-500">Safety 4.0</span> <span className="text-pink-500">Leader</span> in the Digital Age?
                </h1>
                
                {/* Subheading */}
                <p className="text-base md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 md:mb-12 font-light px-2">
                  Future-proof and transform your career with the <span className="font-bold text-lime-400">world's first Safety 4.0 safety program approved by IOSH</span> and global organisations
                </p>
              </>
            )}
          </div>

          {/* Video Presentation Placeholder */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:border-pink-400/50 transition-all duration-300">
              <iframe 
                className="w-full aspect-video rounded-xl"
                src="https://www.youtube.com/embed/GUT9G9hnBXI?autoplay=1&mute=1&loop=1&playlist=GUT9G9hnBXI&controls=1&modestbranding=1&rel=0"
                title="Safety 4.0 Course Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>


          {/* Urgent Problem Section - Inline */}
          <div className="text-center max-w-5xl mx-auto mb-12 md:mb-16 animate-fade-in">
            {/* Urgent badge */}
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-4 md:px-6 py-2 mb-6 md:mb-8">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              <span className="text-red-300 font-semibold text-sm md:text-base">The Safety Profession is Transforming NOW</span>
            </div>

            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 px-2">
              Your Career is at an{" "}
              <span className="text-red-400">Unprecedented Crossroads</span>
            </h2>
            
            <p className="text-base md:text-xl text-gray-300 mb-8 md:mb-12 leading-relaxed px-2">
              While AI and digital transformation reshape the safety industry at breakneck speed, 
              most safety professionals are being left behind—unprepared and unequipped for what's coming.
            </p>

            {/* Urgent statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative text-center space-y-2 md:space-y-4 bg-slate-900/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-red-500/30 hover:border-red-500/50 transition-all">
                  <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-400 mx-auto" />
                  <div className="text-2xl md:text-3xl font-bold text-red-400">25%</div>
                  <h3 className="text-sm md:text-base font-semibold text-white">No AI Skills</h3>
                  <p className="text-gray-300 text-xs md:text-sm hidden md:block">
                    of EHS practitioners have no AI skills
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative text-center space-y-2 md:space-y-4 bg-slate-900/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-orange-500/30 hover:border-orange-500/50 transition-all">
                  <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-orange-400 mx-auto" />
                  <div className="text-2xl md:text-3xl font-bold text-orange-400">61%</div>
                  <h3 className="text-sm md:text-base font-semibold text-white">AI Beginners</h3>
                  <p className="text-gray-300 text-xs md:text-sm hidden md:block">
                    of EHS pros self-identify as beginners
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative text-center space-y-2 md:space-y-4 bg-slate-900/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-pink-500/30 hover:border-pink-500/50 transition-all">
                  <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-pink-400 mx-auto" />
                  <div className="text-2xl md:text-3xl font-bold text-pink-400">49%</div>
                  <h3 className="text-sm md:text-base font-semibold text-white">Investing in AI</h3>
                  <p className="text-gray-300 text-xs md:text-sm hidden md:block">
                    plan to invest in AI within 12 months
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-red-500/20 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative text-center space-y-2 md:space-y-4 bg-slate-900/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all">
                  <Clock className="w-8 h-8 md:w-10 md:h-10 text-purple-400 mx-auto" />
                  <div className="text-2xl md:text-3xl font-bold text-purple-400">77%</div>
                  <h3 className="text-sm md:text-base font-semibold text-white">AI Priority</h3>
                  <p className="text-gray-300 text-xs md:text-sm hidden md:block">
                    of hiring managers prioritise AI skills
                  </p>
                </div>
              </div>
            </div>

            {/* Urgent message */}
            <div className="mt-8 md:mt-12 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/40 rounded-xl md:rounded-2xl p-4 md:p-6">
              <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                <span className="text-red-400 font-bold">The hard truth:</span> Traditional safety certifications 
                won't protect your career anymore. Companies are actively seeking safety 
                leaders who can leverage AI and digital tools.
              </p>
            </div>
          </div>

          {/* Solution Section - Inline */}
          <div className="text-center max-w-6xl mx-auto mb-12 md:mb-16 animate-fade-in">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 px-2">
              The Solution: <span className="text-lime-400">You need new skills!</span>
            </h2>
            
            <p className="text-base md:text-xl text-gray-300 leading-relaxed mb-8 md:mb-12 px-2">
              Our comprehensive program covers everything you need to become a digital safety leader. The world's first globally recognized academy dedicated to transforming safety professionals into digital leaders. Trusted by industry giants and approved by IOSH.
            </p>

            {(() => {
              const modules = [
                { icon: BookOpen, title: "Introduction & Orientation", description: "Course overview, objectives, CPD & IOSH value, learner expectations", color: "from-lime-500 to-lime-400" },
                { icon: Target, title: "What is Safety 4.0?", description: "Definition of Safety 4.0, triangle (People, Processes, Tech), role of data, 4th Industrial Revolution", color: "from-lime-500 to-lime-400" },
                { icon: AlertTriangle, title: "The Safety Status Quo is Broken", description: "Compliance-heavy culture, lagging indicators, reactive safety trap", color: "from-lime-500 to-lime-400" },
                { icon: Award, title: "Skills for the Safety Leader in the Digital Age", description: "Digital literacy, AI/data awareness, adaptive intelligence, communication skills", color: "from-lime-500 to-lime-400" },
                { icon: Smartphone, title: "Safetytech Practical Applications", description: "Wearables, IoT, drones, mobile-first systems, computer vision", color: "from-lime-500 to-lime-400" },
                { icon: Wrench, title: "Building your Digital Safety Toolkit", description: "Practical day-to-day tools: reporting apps, AI writing, automation, QR codes", color: "from-lime-500 to-lime-400" },
                { icon: Database, title: "Data Strategy: From Chaos to Clarity", description: "Data collection, centralisation, cleaning, analysis; pitfalls & benefits", color: "from-lime-500 to-lime-400" },
                { icon: Sparkles, title: "AI Essentials for Safety Leaders", description: "AI history, ML, NLP, LLMs, CV, agentic AI, real-world cases, myths & risks", color: "from-lime-500 to-lime-400" },
                { icon: Shield, title: "Compliance, Risk & Governance Essentials", description: "Digital compliance, regulation, governance frameworks, ethical AI", color: "from-lime-500 to-lime-400" },
                { icon: Rocket, title: "Digital Safety Transformation Framework", description: "ROI, executive influence, linking safety to business performance", color: "from-lime-500 to-lime-400" },
                { icon: Wrench, title: "Hacking Everyday Tools to Escape the Reactive Safety Trap", description: "Rhodri Atkins - CEO Pair Software", color: "from-pink-500 to-pink-400", isBonus: true, photo: rhodriPhoto },
                { icon: Crown, title: "Agentic Revolution", description: "Dr. Matilde D'Amelio - CEO Sophia Training & Consulting", color: "from-pink-500 to-pink-400", isBonus: true, photo: matildePhoto }
              ];
              
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto">
                  {modules.map((module, index) => {
                    const Icon = module.icon;
                    return (
                      <Card 
                        key={index}
                        className="p-3 md:p-4 border-0 bg-white/10 backdrop-blur-sm shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105"
                      >
                        <CardContent className="p-0">
                          <div className="space-y-2 md:space-y-3 relative" style={{ paddingRight: module.photo ? '50px' : '0' }}>
                            {module.photo && (
                              <div className="absolute top-0 right-0 w-10 h-10 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
                                <img src={module.photo} alt="Instructor" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex items-center space-x-2 md:space-x-3">
                              <div className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r ${module.color} rounded-lg flex items-center justify-center shadow-glow flex-shrink-0`}>
                                <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              </div>
                              <h3 className="text-xs md:text-sm font-bold text-white leading-tight">{module.title}</h3>
                            </div>
                            <p className="text-white/80 text-[10px] md:text-xs leading-relaxed">{module.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              );
            })()}
          </div>



        </div>
      </div>

      {/* Assessment Modal */}
      <Safety4AssessmentModal 
        isOpen={assessmentModalOpen} 
        onClose={() => setAssessmentModalOpen(false)} 
      />

    </section>
  );
};