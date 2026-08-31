import { TrendingUp, Zap, Database, Network, Shield, Target } from "lucide-react";

export const SolutionSection = () => {
  const benefits = [
    { Icon: TrendingUp, title: "Measure & Maximize AI ROI", description: "Turn tool investments into measurable safety and productivity gains—move from cost centers to strategic assets." },
    { Icon: Zap, title: "Turn Manual Processes into Automation", description: "Free your team from admin work to focus on prevention, incident reduction, and digital leadership." },
    { Icon: Database, title: "Unlock Data-Driven Safety Insights", description: "Leverage existing data to predict incidents, reduce costs, and improve measurable safety performance." },
    { Icon: Network, title: "Scale Responsible AI Implementation", description: "Deploy AI across your organization with confidence—with governance, best practices, and proven methodology." },
    { Icon: Shield, title: "Ensure EU AI Act Article 4 Compliance", description: "Build organizational AI literacy and governance frameworks that meet EU AI Act requirements for transparency and human oversight." },
    { Icon: Target, title: "Improve Safety Performance & Productivity", description: "Deploy AI-ready capabilities that reduce incidents, prevent hazards, and boost team productivity—delivering measurable outcomes." },
  ];

  return (
    <section className="pt-0 md:pt-0 pb-10 md:pb-14 relative overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-4 md:mb-6 animate-fade-in">
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            A structured program that equips your EHS function to implement, evaluate, and govern AI and SafetyTech responsibly—
            building measurable safety improvements, productivity gains, and regulatory compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 text-slate-900 flex flex-col border-2 border-primary/40 group-hover:border-primary/70 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center mb-6 md:mb-8">
                  <benefit.Icon size={32} className="text-slate-900" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-tight tracking-tight mb-3">
                  {benefit.title}
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-slate-600">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
