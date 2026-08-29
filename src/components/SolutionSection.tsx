import { Brain, Award, Rocket, Users, PlayCircle, UserCheck } from "lucide-react";

export const SolutionSection = () => {
  const benefits = [
    {
      icon: Brain,
      title: "Measure & Maximize AI ROI",
      description: "Turn tool investments into measurable safety and productivity gains—move from cost centers to strategic assets.",
    },
    {
      icon: Users,
      title: "Build Organizational AI Governance",
      description: "Establish frameworks to scale AI safely across your EHS function without legal, compliance, or adoption risk.",
    },
    {
      icon: Award,
      title: "Transform Manual Processes to Strategy",
      description: "Free your team from admin work to focus on prevention, incident reduction, and digital leadership.",
    },
    {
      icon: PlayCircle,
      title: "Unlock Data-Driven Safety Insights",
      description: "Leverage existing data to predict incidents, reduce costs, and improve measurable safety performance.",
    },
    {
      icon: Rocket,
      title: "Benchmark & Compete",
      description: "Assess your digital maturity against competitors and build a roadmap to competitive advantage in your industry.",
    },
    {
      icon: UserCheck,
      title: "Scale Responsible AI Implementation",
      description: "Deploy AI across your organization with confidence—with governance, best practices, and proven methodology.",
    },
    {
      icon: Brain,
      title: "Ensure EU AI Act Article 4 Compliance",
      description: "Build organizational AI literacy and governance frameworks that meet EU AI Act requirements for transparency and human oversight.",
    },
    {
      icon: Rocket,
      title: "Improve Safety Performance & Productivity",
      description: "Deploy AI-ready capabilities that reduce incidents, prevent hazards, and boost team productivity—delivering measurable outcomes.",
    },
  ];

  return (
    <section className="py-10 md:py-14 relative overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20 animate-fade-in">
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            A structured program that equips your EHS function to implement, evaluate, and govern AI and SafetyTech responsibly—
            building measurable safety improvements, productivity gains, and regulatory compliance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 md:divide-x md:divide-slate-200">
          <div className="space-y-12 md:pr-14">
            {benefits.slice(0, 3).map((benefit) => (
              <BenefitRow key={benefit.title} {...benefit} />
            ))}
          </div>
          <div className="space-y-12 mt-12 md:mt-0 md:pl-14">
            {benefits.slice(3).map((benefit) => (
              <BenefitRow key={benefit.title} {...benefit} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const BenefitRow = ({ icon: Icon, title, description }: { icon: typeof Brain; title: string; description: string }) => (
  <div className="flex items-start gap-5">
    <div className="relative w-16 h-16 shrink-0">
      <div className="absolute inset-0 bg-slate-100 rounded-full blur-[2px]" />
      <div className="relative w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
        <Icon className="w-7 h-7 text-slate-900" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-primary rounded-full" />
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-900 leading-tight tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);
