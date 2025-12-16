import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Play, Menu, X, Award, AlertCircle, TrendingDown, TrendingUp, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { CountdownTimer } from "./CountdownTimer";

import { Safety4AssessmentModal } from "./Safety4AssessmentModal";
import { VideoPreviewModal } from "./VideoPreviewModal";
import johnSmithPhoto from "../assets/testimonial-john-smith.jpg";
import mariaJohnsonPhoto from "../assets/testimonial-maria-johnson.jpg";
import davidWilsonPhoto from "../assets/testimonial-david-wilson.jpg";
import sarahLeePhoto from "../assets/testimonial-sarah-lee.jpg";
import robertTaylorPhoto from "../assets/testimonial-robert-taylor.jpg";
import annaLopezPhoto from "../assets/testimonial-anna-lopez.jpg";
import manalAzziPhoto from "../assets/manal-azzi-photo.jpg";
import rosieRussellPhoto from "../assets/rosie-russell-photo.jpeg";
import julianaBleyPhoto from "../assets/juliana-bley-photo.jpeg";
import jenniferMcnellyPhoto from "../assets/jennifer-mcnelly-photo.jpeg";
import stuartHughesPhoto from "../assets/stuart-hughes-photo.jpg";
import cpdApprovedLogo from "../assets/cpd-approved-logo.png";
import safetyAcademyLogo from "../assets/safety-academy-logo.png";

export const HeroSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    title: string;
    description: string;
    url?: string;
  } | null>(null);
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

  const videoPreviewData = [
    {
      id: "safety-40",
      title: "What is Safety 4.0?",
      description: "Discover how digital transformation is revolutionizing workplace safety. Learn about IoT sensors, AI-powered risk assessment, and how Safety 4.0 creates proactive, data-driven safety cultures that prevent incidents before they happen.",
      shortDescription: "Understand the fundamentals of digital safety transformation",
      icon: Play,
      gradient: "from-pink-500/20 to-purple-500/20",
    },
    {
      id: "why-matters",
      title: "Why this course matter?",
      description: "In today's rapidly evolving workplace, traditional safety approaches are no longer sufficient. This course positions you at the forefront of safety innovation, making you invaluable to organizations seeking digital transformation leaders.",
      shortDescription: "Discover why Safety 4.0 is essential for your career growth",
      icon: Zap,
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      id: "what-learn",
      title: "What you'll learn",
      description: "Master cutting-edge competencies including AI-powered incident prediction, IoT implementation strategies, digital risk assessment frameworks, and leadership techniques for managing technological change in safety-critical environments.",
      shortDescription: "Key competencies and skills you'll master in this program",
      icon: Shield,
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      id: "iosh-cpd",
      title: "About IOSH & CPD",
      description: "Learn about our prestigious IOSH approval and CPD accreditation. Understand how this certification elevates your professional standing, meets continuing professional development requirements, and opens doors to advanced career opportunities.",
      shortDescription: "Learn about our accreditations and professional recognition",
      icon: Award,
      gradient: "from-yellow-500/20 to-orange-500/20",
    }
  ];

  const handleVideoPreview = (video: typeof videoPreviewData[0]) => {
    let videoUrl: string | undefined;
    
    if (video.id === "safety-40") {
      videoUrl = "https://www.youtube.com/embed/OsKsyXCx8pc?autoplay=1&mute=1&loop=1&playlist=OsKsyXCx8pc";
    } else if (video.id === "iosh-cpd") {
      videoUrl = "https://www.youtube.com/embed/o71mLFPVQzo?autoplay=1&mute=1&loop=1&playlist=o71mLFPVQzo";
    }
    
    setSelectedVideo({
      title: video.title,
      description: video.description,
      url: videoUrl
    });
    setVideoModalOpen(true);
  };
  
  return (
    <section className="min-h-screen bg-background relative overflow-hidden">
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-16 px-2">
            <Button 
              size="lg" 
              className="bg-lime-500 hover:bg-lime-600 text-white text-sm md:text-lg px-6 md:px-12 py-4 md:py-6 font-semibold rounded-xl group shadow-2xl"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              START YOUR TRANSFORMATION
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              className="bg-pink-500 hover:bg-pink-600 text-white text-sm md:text-lg px-6 md:px-12 py-4 md:py-6 font-semibold rounded-xl"
              onClick={() => setAssessmentModalOpen(true)}
            >
              FREE SAFETY 4.0 SCORECARD
            </Button>
          </div>

          {/* Urgent Problem Section - Inline */}
          <div className="text-center max-w-5xl mx-auto mb-12 md:mb-16 animate-fade-in">
            {/* Urgent badge */}
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-4 md:px-6 py-2 mb-6 md:mb-8">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              <span className="text-red-300 font-semibold text-sm md:text-base">The Safety Industry is Transforming NOW</span>
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

          {/* Testimonials Banner */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-8 mb-8 md:mb-16 border border-white/10 overflow-hidden">
            <h3 className="text-center text-white text-lg md:text-xl font-semibold mb-4 md:mb-8">What Global Safety Leaders Are Saying</h3>
            <div className="relative">
              <div className="flex animate-[scroll_20s_linear_infinite] space-x-4 md:space-x-8">
                {/* Testimonial 1 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={manalAzziPhoto} alt="Manal Azzi" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"Digitalization and automation are transforming millions of jobs worldwide, creating powerful opportunities to enhance occupational safety and health."</p>
                  <div className="text-white text-xs font-medium">Manal Azzi, ILO Team Lead</div>
                </div>

                {/* Testimonial 2 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={rosieRussellPhoto} alt="Rosie Russell" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"We need to make AI mainstream in our conversations, but we must also make sure people truly understand it before relying on it."</p>
                  <div className="text-white text-xs font-medium">Rosie Russell, IIRSM President</div>
                </div>

                {/* Testimonial 3 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={julianaBleyPhoto} alt="Juliana Bley" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"The psychology of safety in today's world require new skills to cope with the challenges, pressure and demands of a connected workplace."</p>
                  <div className="text-white text-xs font-medium">Juliana Bley, TEDx Speaker, Psychologist</div>
                </div>

                {/* Testimonial 4 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={jenniferMcnellyPhoto} alt="Jennifer McNelly" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"Most professionals today on the AI maturity curve are in the learning and exploring stage. There are, and will be, as in all industries and professions, leaders, laggards and those in the middle."</p>
                  <div className="text-white text-xs font-medium">Jennifer McNelly, ASSP CEO</div>
                </div>

                {/* Testimonial 5 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={stuartHughesPhoto} alt="Stuart Hughes" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"You can shape the future and create healthy and safe working environments that enable employees to thrive, and drive the sustainability of your organisation forward."</p>
                  <div className="text-white text-xs font-medium">Stuart Hughes, IOSH Past President</div>
                </div>

                {/* Testimonial 6 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={annaLopezPhoto} alt="Anna Lopez" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"From traditional safety to digital leadership in just 12 weeks."</p>
                  <div className="text-white text-xs font-medium">Anna Lopez, Safety Specialist</div>
                </div>

                {/* Duplicate set for seamless loop */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={manalAzziPhoto} alt="Manal Azzi" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"Digitalization and automation are transforming millions of jobs worldwide, creating powerful opportunities to enhance occupational safety and health."</p>
                  <div className="text-white text-xs font-medium">Manal Azzi, ILO Team Lead</div>
                </div>

                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={rosieRussellPhoto} alt="Rosie Russell" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"We need to make AI mainstream in our conversations, but we must also make sure people truly understand it before relying on it."</p>
                  <div className="text-white text-xs font-medium">Rosie Russell, IIRSM President</div>
                </div>

                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={julianaBleyPhoto} alt="Juliana Bley" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"The psychology of safety in today's world require new skills to cope with the challenges, pressure and demands of a connected workplace."</p>
                  <div className="text-white text-xs font-medium">Juliana Bley, TEDx Speaker, Psychologist</div>
                </div>

                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={jenniferMcnellyPhoto} alt="Jennifer McNelly" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"Most professionals today on the AI maturity curve are in the learning and exploring stage. There are, and will be, as in all industries and professions, leaders, laggards and those in the middle."</p>
                  <div className="text-white text-xs font-medium">Jennifer McNelly, ASSP CEO</div>
                </div>

                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={stuartHughesPhoto} alt="Stuart Hughes" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"You can shape the future and create healthy and safe working environments that enable employees to thrive, and drive the sustainability of your organisation forward."</p>
                  <div className="text-white text-xs font-medium">Stuart Hughes, IOSH Past President</div>
                </div>

                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={annaLopezPhoto} alt="Anna Lopez" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"From traditional safety to digital leadership in just 12 weeks."</p>
                  <div className="text-white text-xs font-medium">Anna Lopez, Safety Specialist</div>
                </div>
              </div>
            </div>
          </div>


          {/* Course Preview Section */}
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-white mb-12">
              Course <span className="text-pink-500">Preview</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {videoPreviewData.map((video) => {
                const IconComponent = video.icon;
                return (
                  <div 
                    key={video.id}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-pink-400/50 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl"
                    onClick={() => handleVideoPreview(video)}
                  >
                    {(video.id === "iosh-cpd" || video.id === "safety-40" || video.id === "why-matters" || video.id === "what-learn") ? (
                      <div className="relative aspect-video rounded-xl mb-4 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        <iframe
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          src={`https://www.youtube.com/embed/${video.id === 'iosh-cpd' ? 'o71mLFPVQzo' : video.id === 'safety-40' ? 'OsKsyXCx8pc' : video.id === 'why-matters' ? '0BkOP_bW6lo' : 'YVwZelIBSRc'}?autoplay=1&mute=1&loop=1&playlist=${video.id === 'iosh-cpd' ? 'o71mLFPVQzo' : video.id === 'safety-40' ? 'OsKsyXCx8pc' : video.id === 'why-matters' ? '0BkOP_bW6lo' : 'YVwZelIBSRc'}&controls=0&modestbranding=1&rel=0&playsinline=1`}
                          title={`${video.title} video preview`}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          loading="lazy"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className={`aspect-video bg-gradient-to-br ${video.gradient} rounded-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <div className="relative">
                          <IconComponent className="w-12 h-12 text-white/80" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Play className="w-6 h-6 text-white ml-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <h3 className="text-white font-semibold mb-2 group-hover:text-pink-400 transition-colors duration-300">{video.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{video.shortDescription}</p>
                    
                    <div className="mt-4 text-xs text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                      <Play className="w-3 h-3 mr-1" />
                      Click to preview
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Assessment Modal */}
      <Safety4AssessmentModal 
        isOpen={assessmentModalOpen} 
        onClose={() => setAssessmentModalOpen(false)} 
      />

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoTitle={selectedVideo?.title || ""}
        videoDescription={selectedVideo?.description || ""}
        videoUrl={selectedVideo?.url}
      />
    </section>
  );
};