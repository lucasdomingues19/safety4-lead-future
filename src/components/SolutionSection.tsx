import { Brain, Award, Rocket, Users } from "lucide-react";
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
      subtitle: "in months",
      description: "Transform your safety career with skills that make you indispensable in the digital age.",
      gradient: "from-primary/20 to-secondary/20"
    },
    {
      icon: Users,
      title: "Global safety leader",
      subtitle: "community",
      description: "Join an exclusive network of forward-thinking safety professionals worldwide.",
      gradient: "from-secondary/20 to-primary/20"
    }
  ];

  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary mb-8">
            The Solution: <span className="text-primary">Safety 4.0 Academy</span>
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            We've created the world's first comprehensive digital safety leadership program 
            that transforms traditional safety professionals into future-ready leaders.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index}
                className={`p-8 border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105 animate-slide-up bg-gradient-to-br ${benefit.gradient}`}
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <CardContent className="p-0">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-2xl font-bold text-secondary leading-tight">
                          {benefit.title}
                        </h3>
                        <p className="text-primary font-semibold text-lg">
                          {benefit.subtitle}
                        </p>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed">
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