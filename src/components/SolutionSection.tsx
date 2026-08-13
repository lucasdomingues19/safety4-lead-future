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
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-white"></div>


      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.05] md:whitespace-nowrap">
            The Solution: <span className="text-primary">You need new skills</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            We've created the world's first comprehensive digital safety leadership program 
            that transforms traditional safety professionals into future-ready leaders.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="p-8 border border-slate-200 bg-white hover:border-primary/50 transition-all duration-300 animate-slide-up h-full group"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardContent className="p-0 h-full">
                  <div className="flex flex-col h-full">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Title & Subtitle */}
                    <div className="mb-3">
                      <h3 className="text-xl font-extrabold text-slate-900 leading-tight tracking-tight">
                        {benefit.title}
                      </h3>
                      <p className="text-primary font-semibold text-base">
                        {benefit.subtitle}
                      </p>
                    </div>
                    
                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed flex-grow">
                      {benefit.description}
                    </p>
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