import { Brain, BarChart3, Cpu, Crown, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import rhodriPhoto from "@/assets/rhodri-atkins.jpeg";
import matildePhoto from "@/assets/matilde-damelio.png";

export const ProgramSection = () => {
  const modules = [
    {
      icon: Brain,
      title: "Welcome & Introduction",
      description: "Module description - to be updated",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: BarChart3,
      title: "What is Safety 4.0",
      description: "Module description - to be updated",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Cpu,
      title: "The Safety Status Quo is Broken",
      description: "Module description - to be updated",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Crown,
      title: "Skills of Safety Leaders in the Digital Age",
      description: "Module description - to be updated",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Brain,
      title: "SafetyTech Essentials",
      description: "Module description - to be updated",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: BarChart3,
      title: "The Essential Tech Toolkit",
      description: "Module description - to be updated",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Cpu,
      title: "Data Strategy (From chaos to clarity)",
      description: "Module description - to be updated",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Crown,
      title: "The AI Revolution",
      description: "Module description - to be updated",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Brain,
      title: "Compliance, Risk and Governance",
      description: "Module description - to be updated",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: BarChart3,
      title: "Safety Digital Transformation",
      description: "Module description - to be updated",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-lime-500 to-lime-400"
    },
    {
      icon: Wrench,
      title: "Hacking Everyday Tools to Escape the Reactive Safety Trap",
      description: "Rhodri Atkins - CEO Pair Software",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      color: "from-pink-500 to-pink-400",
      isBonus: true,
      photo: rhodriPhoto
    },
    {
      icon: Crown,
      title: "Agentic Revolution",
      description: "Dr. Matilde D'Amelio - CEO Sophia Training & Consulting",
      features: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
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
                  <div className="space-y-3 relative">
                    {module.photo && (
                      <div className="absolute bottom-0 right-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-white/20">
                        <img 
                          src={module.photo} 
                          alt="Instructor" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-2 pr-14">
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
                    
                    <div className="space-y-2">
                      <h4 className="text-primary font-semibold text-xs">Key Topics:</h4>
                      <div className="space-y-1">
                        {module.features.map((feature, featureIndex) => (
                          <div 
                            key={featureIndex}
                            className="flex items-center space-x-1 text-xs text-white/90"
                          >
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            <span className="text-xs">{feature}</span>
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