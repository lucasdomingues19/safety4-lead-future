import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Play, Menu, X, Award } from "lucide-react";
import { useState } from "react";
import { CountdownTimer } from "./CountdownTimer";
import { Safety4AssessmentModal } from "./Safety4AssessmentModal";
import johnSmithPhoto from "../assets/testimonial-john-smith.jpg";
import mariaJohnsonPhoto from "../assets/testimonial-maria-johnson.jpg";
import davidWilsonPhoto from "../assets/testimonial-david-wilson.jpg";
import sarahLeePhoto from "../assets/testimonial-sarah-lee.jpg";
import robertTaylorPhoto from "../assets/testimonial-robert-taylor.jpg";
import annaLopezPhoto from "../assets/testimonial-anna-lopez.jpg";

export const HeroSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  
  return (
    <section className="min-h-screen bg-background relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating purple elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main purple blob - Top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/30 via-purple-600/25 to-violet-500/20 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        
        {/* Purple blob - Top right */}
        <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/25 via-violet-500/30 to-purple-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        
        {/* Purple blob - Bottom center */}
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/20 via-purple-500/25 to-purple-400/15 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        
        {/* Central purple accent */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/15 via-violet-500/20 to-purple-600/10 blur-2xl animate-[pulse_15s_ease-in-out_infinite]"></div>
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
        <div className="flex justify-between items-center mb-16">
          <img 
            src="/lovable-uploads/b2270dc3-9eae-4580-8e94-747f6660bccc.png" 
            alt="Safety 4.0 Academy Logo" 
            className="h-28 w-auto"
          />
          
          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="/about" className="text-white/80 hover:text-white transition-colors text-sm font-medium">About Us</a>
            <a href="/instructor" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Meet Your Instructor</a>
            <a href="/certification" className="text-white/80 hover:text-white transition-colors text-sm font-medium">IOSH and CPD</a>
            <a href="/ebook" className="text-white/80 hover:text-white transition-colors text-sm font-medium">eBook</a>
            <a href="/contact" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Get in Touch</a>
            <a href="/faq" className="text-white/80 hover:text-white transition-colors text-sm font-medium">FAQ</a>
          </nav>
          
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden border-white/30 text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          
          <div className="hidden md:flex lg:hidden items-center space-x-6 text-white/80 text-sm">
            <span>2,500+ Trained</span>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#11113a]/95 backdrop-blur-sm border-t border-white/20 z-50">
            <nav className="container mx-auto px-4 py-6 space-y-4">
              <a 
                href="/about" 
                className="block text-white/80 hover:text-white transition-colors py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </a>
              <a 
                href="/instructor" 
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
          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            <div className="inline-flex items-center space-x-2 text-primary font-medium bg-primary/10 px-6 py-3 rounded-full border border-primary/20">
              <Award className="w-4 h-4" />
              <span>IOSH Approved</span>
            </div>
            <div className="inline-flex items-center space-x-2 text-blue-400 font-medium bg-blue-400/10 px-6 py-3 rounded-full border border-blue-400/20">
              <Shield className="w-4 h-4" />
              <span>CPD Accredited</span>
            </div>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-8">
            Become the <span className="text-pink-500">Safety 4.0</span> Leader<br />
            in the Digital Age
          </h1>
          
          {/* Subheading */}
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12 font-light">
            Future-proof your career with the <span className="font-bold text-lime-400">world's first Safety 4.0 safety program trusted by IOSH</span> and global organisations
          </p>

          {/* Video Presentation Placeholder */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:border-pink-400/50 transition-all duration-300">
              <video 
                className="w-full aspect-video rounded-xl"
                controls
                autoPlay
                muted
                loop
                playsInline
                poster="/videos/course-intro-poster.jpg"
                preload="metadata"
              >
                <source src="/videos/course-intro.mp4" type="video/mp4" />
                <track
                  kind="subtitles"
                  src="/videos/course-intro-subtitles.vtt"
                  srcLang="en"
                  label="English"
                  default
                />
                Your browser does not support the video tag.
              </video>
              
              {/* Course Introduction - Top Right */}
              <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-sm rounded-xl p-4 max-w-sm">
                <h3 className="text-lg font-bold text-white mb-1">Course Introduction</h3>
                <p className="text-white/90 text-sm">Discover how Safety 4.0 will transform your career</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-lime-500 hover:bg-lime-600 text-white text-lg px-12 py-6 font-semibold rounded-xl group shadow-2xl"
            >
              START YOUR TRANSFORMATION
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-12 py-6 font-semibold rounded-xl"
              onClick={() => setAssessmentModalOpen(true)}
            >
              UNLOCK FREE SAFETY 4.0 SCORECARD
            </Button>
          </div>

          {/* Testimonials Banner */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-white/10 overflow-hidden">
            <h3 className="text-center text-white text-xl font-semibold mb-8">What Safety Leaders Are Saying</h3>
            <div className="relative">
              <div className="flex animate-[scroll_20s_linear_infinite] space-x-8">
                {/* Testimonial 1 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={johnSmithPhoto} alt="John Smith" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"This program transformed my understanding of digital safety leadership completely."</p>
                  <div className="text-white text-xs font-medium">John Smith, Safety Manager</div>
                </div>

                {/* Testimonial 2 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={mariaJohnsonPhoto} alt="Maria Johnson" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"The AI analytics module opened up new career opportunities I never imagined."</p>
                  <div className="text-white text-xs font-medium">Maria Johnson, HSE Director</div>
                </div>

                {/* Testimonial 3 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={davidWilsonPhoto} alt="David Wilson" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"Industry 4.0 ready certification that actually delivers on its promise."</p>
                  <div className="text-white text-xs font-medium">David Wilson, Safety Consultant</div>
                </div>

                {/* Testimonial 4 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={sarahLeePhoto} alt="Sarah Lee" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"The best investment I made for my safety career advancement."</p>
                  <div className="text-white text-xs font-medium">Sarah Lee, Safety Engineer</div>
                </div>

                {/* Testimonial 5 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={robertTaylorPhoto} alt="Robert Taylor" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"Global recognition and practical skills that work in real-world scenarios."</p>
                  <div className="text-white text-xs font-medium">Robert Taylor, Chief Safety Officer</div>
                </div>

                {/* Testimonial 6 */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={annaLopezPhoto} alt="Anna Lopez" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"From traditional safety to digital leadership in just 12 weeks."</p>
                  <div className="text-white text-xs font-medium">Anna Lopez, Safety Specialist</div>
                </div>

                {/* Duplicate set for seamless loop */}
                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={johnSmithPhoto} alt="John Smith" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"This program transformed my understanding of digital safety leadership completely."</p>
                  <div className="text-white text-xs font-medium">John Smith, Safety Manager</div>
                </div>

                <div className="flex-shrink-0 text-center space-y-3 w-80">
                  <img src={mariaJohnsonPhoto} alt="Maria Johnson" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  <p className="text-gray-300 text-sm italic">"The AI analytics module opened up new career opportunities I never imagined."</p>
                  <div className="text-white text-xs font-medium">Maria Johnson, HSE Director</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section - Moved Down */}
          <div className="flex items-center justify-center space-x-8 text-white/80 text-lg mb-16 flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl lg:text-3xl font-bold text-pink-500">2,500+</span>
              <span>Professionals Trained</span>
            </div>
            <span className="hidden sm:block">•</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl lg:text-3xl font-bold text-lime-400">98%</span>
              <span>Career Advancement</span>
            </div>
            <span className="hidden sm:block">•</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl lg:text-3xl font-bold text-blue-400">50+</span>
              <span>Countries</span>
            </div>
          </div>

          {/* Course Preview Section */}
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-white mb-12">
              Course <span className="text-pink-500">Preview</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* What is Safety 4.0 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-pink-400/50 transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl mb-4 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white/80" />
                </div>
                <h3 className="text-white font-semibold mb-2">What is Safety 4.0</h3>
                <p className="text-gray-400 text-sm">Understand the fundamentals of digital safety transformation</p>
              </div>

              {/* AI Essentials for the Safety Leader */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-pink-400/50 transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl mb-4 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-white/80" />
                </div>
                <h3 className="text-white font-semibold mb-2">AI Essentials for the Safety Leader</h3>
                <p className="text-gray-400 text-sm">Master AI tools and analytics for predictive safety management</p>
              </div>

              {/* Safety Digital Transformation */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-pink-400/50 transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl mb-4 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-white/80" />
                </div>
                <h3 className="text-white font-semibold mb-2">Safety Digital Transformation</h3>
                <p className="text-gray-400 text-sm">Lead organizational change with digital safety strategies</p>
              </div>
            </div>
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