import { Brain, Award, Rocket, Users, PlayCircle, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const SolutionSection = () => {
  const benefits = [
    {
      icon: Brain,
      title: "Learn AI, IoT, & SafetyTech",
      subtitle: "without coding",
      description: "Master cutting-edge safety technologies through practical, hands-on training designed for safety professionals.",
      gradient: "from-primary/20 to-secondary/20"
    },
    {
      icon: Award,
      title: "IOSH & CPD Recognized",
      subtitle: "certification",
      description: "Earn globally recognized credentials that demonstrate your expertise in digital safety leadership.",
      gradient: "from-secondary/20 to-primary/20"
    },
    {
      icon: Rocket,
      title: "Future-proof your career",
      subtitle: "in hours",
      description: "Transform your safety career with skills that make you indispensable in the digital age.",
      gradient: "from-primary/20 to-secondary/20"
    },
    {
      icon: Users,
      title: "Global safety leader",
      subtitle: "community",
      description: "Join an exclusive network of forward-thinking safety professionals worldwide.",
      gradient: "from-secondary/20 to-primary/20"
    },
    {
      icon: PlayCircle,
      title: "Masterclass Sessions",
      subtitle: "with experts",
      description: "Learn from industry leaders through exclusive masterclass sessions covering advanced Safety 4.0 strategies.",
      gradient: "from-primary/20 to-secondary/20"
    },
    {
      icon: UserCheck,
      title: "1:1 Mentoring",
      subtitle: "personalized guidance",
      description: "Receive personalized coaching and mentorship to accelerate your digital safety transformation journey.",
      gradient: "from-secondary/20 to-primary/20"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating elements - Purple and Lime */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Purple blob - Top left */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-500/20 via-purple-600/15 to-violet-500/10 blur-3xl animate-[float_18s_ease-in-out_infinite]"></div>
        
        {/* Lime blob - Top right */}
        <div className="absolute -top-10 -right-32 w-64 h-64 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_24s_ease-in-out_infinite_reverse]"></div>
        
        {/* Lime blob - Bottom left */}
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-lime-500/15 via-lime-400/20 to-lime-600/10 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        
        {/* Purple blob - Bottom right */}
        <div className="absolute bottom-1/3 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/15 via-purple-500/20 to-purple-600/10 blur-3xl animate-[float_26s_ease-in-out_infinite_reverse]"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            The Solution: <span className="text-lime-400">Safety 4.0 Academy</span>
          </h2>
          
          <p className="text-xl text-gray-300 leading-relaxed">
            We've created the world's first comprehensive digital safety leadership program 
            that transforms traditional safety professionals into future-ready leaders.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index}
                className="p-8 border border-white/20 bg-white/5 backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <CardContent className="p-0">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-lime-500 to-lime-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-2xl font-bold text-white leading-tight">
                          {benefit.title}
                        </h3>
                        <p className="text-lime-400 font-semibold text-lg">
                          {benefit.subtitle}
                        </p>
                      </div>
                      
                      <p className="text-gray-300 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};