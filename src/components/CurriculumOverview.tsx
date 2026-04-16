import { BookOpen, Target, AlertTriangle, Award, Smartphone, Wrench, Database, Sparkles, Shield, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const modules = [
  { icon: BookOpen, title: "Introduction & Orientation", description: "Course overview, objectives, CPD & IOSH value, learner expectations" },
  { icon: Target, title: "What is Safety 4.0?", description: "Definition of Safety 4.0, triangle (People, Processes, Tech), role of data" },
  { icon: AlertTriangle, title: "The Safety Status Quo is Broken", description: "Compliance-heavy culture, lagging indicators, reactive safety trap" },
  { icon: Award, title: "Skills for the Digital Age", description: "Digital literacy, AI/data awareness, adaptive intelligence, communication skills" },
  { icon: Smartphone, title: "Safetytech Applications", description: "Wearables, IoT, drones, mobile-first systems, computer vision" },
  { icon: Wrench, title: "Digital Safety Toolkit", description: "Reporting apps, AI writing, automation, QR codes" },
  { icon: Database, title: "Data Strategy", description: "Data collection, centralisation, cleaning, analysis; pitfalls & benefits" },
  { icon: Sparkles, title: "AI Essentials for Safety", description: "AI history, ML, NLP, LLMs, computer vision, agentic AI, real-world cases" },
  { icon: Shield, title: "Compliance & Governance", description: "Digital compliance, regulation, governance frameworks, ethical AI" },
  { icon: Rocket, title: "Transformation Framework", description: "ROI, executive influence, linking safety to business performance" },
];

export const CurriculumOverview = () => {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-5xl mx-auto mb-10 md:mb-14">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            The <span className="text-lime-400">Programme</span>
          </h2>
          <p className="text-base md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            10 modules designed to transform safety professionals into digital leaders.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 max-w-6xl mx-auto">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card
                key={index}
                className="p-3 md:p-4 border-0 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <CardContent className="p-0 space-y-2 md:space-y-3">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-lime-500 to-lime-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <h3 className="text-xs md:text-sm font-bold text-white leading-tight">{module.title}</h3>
                  </div>
                  <p className="text-white/80 text-[10px] md:text-xs leading-relaxed">{module.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 md:mt-8 text-center">
          <a
            href="https://learning.safetyacademy.tech/brochure"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm md:text-base transition-colors duration-200 underline underline-offset-4"
          >
            📄 Download Program Brochure
          </a>
        </div>
      </div>
    </section>
  );
};
