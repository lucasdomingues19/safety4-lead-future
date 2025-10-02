import { BookOpen, Target, AlertTriangle, Award, Smartphone, Wrench, Database, Sparkles, Shield, Rocket, Crown, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import rhodriPhoto from "@/assets/rhodri-atkins.jpeg";
import matildePhoto from "@/assets/matilde-damelio.png";

export const ProgramSection = () => {
  const modules = [
    {
      icon: BookOpen,
      title: "Introduction & Orientation",
      description: "Course overview, objectives, CPD & IOSH value, learner expectations",
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Target,
      title: "What is Safety 4.0?",
      description: "Definition of Safety 4.0, triangle (People, Processes, Tech), role of data, 4th Industrial Revolution",
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: AlertTriangle,
      title: "The Safety Status Quo is Broken",
      description: "Compliance-heavy culture, lagging indicators, reactive safety trap",
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Award,
      title: "Skills for the Safety Leader in the Digital Age",
      description: "Digital literacy, AI/data awareness, adaptive intelligence, communication skills",
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Smartphone,
      title: "Safetytech Practical Applications",
      description: "Wearables, IoT, drones, mobile-first systems, computer vision",
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Wrench,
      title: "Building your Digital Safety Toolkit",
      description: "Practical day-to-day tools: reporting apps, AI writing, automation, QR codes",
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Database,
      title: "Data Strategy: From Chaos to Clarity",
      description: "Data collection, centralisation, cleaning, analysis; pitfalls & benefits",
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Sparkles,
      title: "AI Essentials for Safety Leaders",
      description: "AI history, ML, NLP, LLMs, CV, agentic AI, real-world cases, myths & risks",
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Shield,
      title: "Compliance, Risk & Governance Essentials",
      description: "Digital compliance, regulation, governance frameworks, ethical AI",
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Rocket,
      title: "Digital Safety Transformation Framework",
      description: "ROI, executive influence, linking safety to business performance",
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Wrench,
      title: "Hacking Everyday Tools to Escape the Reactive Safety Trap",
      description: "Rhodri Atkins - CEO Pair Software",
      color: "from-pink-500 to-pink-400",
      isBonus: true,
      photo: rhodriPhoto
    },
    {
      icon: Crown,
      title: "Agentic Revolution",
      description: "Dr. Matilde D'Amelio - CEO Sophia Training & Consulting",
      color: "from-pink-500 to-pink-400",
      isBonus: true,
      photo: matildePhoto
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#11113a] via-slate-900 to-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">
            Complete <span className="text-primary">Safety 4.0</span> Curriculum
          </h2>
          
          <p className="text-xl text-white/90 leading-relaxed">
            Our comprehensive program covers everything you need to become a digital safety leader
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card 
                key={index}
                className="p-4 border-0 bg-white/10 backdrop-blur-sm shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <CardContent className="p-0">
                  <div className="space-y-3 relative" style={{ paddingRight: module.photo ? '72px' : '0' }}>
                    {module.photo && (
                      <div className="absolute top-0 right-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
                        <img 
                          src={module.photo} 
                          alt="Instructor" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${module.color} rounded-lg flex items-center justify-center shadow-glow`}>
                        <Icon className="w-5 h-5 text-white flex-shrink-0" />
                      </div>
                      
                      <h3 className="text-base font-bold text-white leading-tight">
                        {module.title}
                      </h3>
                    </div>
                    
                    <p className="text-white/80 text-xs leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Risk Reversal */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 animate-slide-up">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              IOSH-approved, CPD-certified. Upskill with Zero Risk.
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">100% Money-Back Guarantee</p>
                  <p className="text-sm text-white/70">30-day full refund policy</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">Lifetime Access</p>
                  <p className="text-sm text-white/70">All updates & new content included</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">Career Support</p>
                  <p className="text-sm text-white/70">Job placement assistance included</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};