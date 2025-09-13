import { Brain, BarChart3, Cpu, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const ProgramSection = () => {
  const modules = [
    {
      icon: Brain,
      title: "AI for Safety Leaders",
      description: "Master artificial intelligence applications in safety management, predictive analytics, and automated risk assessment.",
      features: ["Predictive Safety Analytics", "AI Risk Assessment", "Machine Learning Basics", "Automated Reporting"],
      color: "from-primary to-primary/70"
    },
    {
      icon: BarChart3,
      title: "Data-Driven Safety",
      description: "Learn to transform safety data into actionable insights using advanced analytics and visualization tools.",
      features: ["Safety KPI Dashboards", "Trend Analysis", "Performance Metrics", "Data Visualization"],
      color: "from-secondary to-secondary/70"
    },
    {
      icon: Cpu,
      title: "SafetyTech Mastery",
      description: "Explore IoT sensors, wearable tech, and digital safety solutions transforming workplace safety.",
      features: ["IoT Safety Sensors", "Wearable Technology", "Digital Safety Systems", "Tech Integration"],
      color: "from-primary to-secondary"
    },
    {
      icon: Crown,
      title: "Digital Leadership",
      description: "Develop leadership skills for the digital age, managing remote teams and digital transformation initiatives.",
      features: ["Change Management", "Digital Strategy", "Remote Team Leadership", "Innovation Management"],
      color: "from-secondary to-primary"
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

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card 
                key={index}
                className="p-8 border-0 bg-white/10 backdrop-blur-sm shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <CardContent className="p-0">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${module.color} rounded-2xl flex items-center justify-center shadow-glow`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white">
                        {module.title}
                      </h3>
                    </div>
                    
                    <p className="text-white/80 leading-relaxed">
                      {module.description}
                    </p>
                    
                    <div className="space-y-3">
                      <h4 className="text-primary font-semibold">Key Topics:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {module.features.map((feature, featureIndex) => (
                          <div 
                            key={featureIndex}
                            className="flex items-center space-x-2 text-sm text-white/90"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-16 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Program Duration</h3>
            <p className="text-white/90 text-lg">
              <span className="text-primary font-bold">12 weeks</span> of intensive training
              <br />
              <span className="text-sm">Flexible schedule • Online & Live sessions • Lifetime access</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};