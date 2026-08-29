import { Brain, Award, Rocket, Users, PlayCircle, UserCheck } from "lucide-react";

export const SolutionSection = () => {
  const benefits = [
    {
      icon: Brain,
      title: "Build AI Literacy Across Your Team",
      description: "Equip your EHS function with practical AI and SafetyTech knowledge tailored to your industry and workflow.",
    },
    {
      icon: Users,
      title: "Enable Cross-Functional Collaboration",
      description: "Give your EHS leaders the language and confidence to partner with IT, Operations, and executive teams on digital initiatives.",
    },
    {
      icon: Award,
      title: "IOSH-Approved, Recognized Capability",
      description: "Build verifiable organizational capability through IOSH-approved, CPD-recognized training your teams can reference.",
    },
    {
      icon: PlayCircle,
      title: "Learn from SafetyTech Leaders",
      description: "Access expert-led sessions and case studies showing how other organizations have successfully transformed their EHS functions.",
    },
    {
      icon: Rocket,
      title: "Accelerate Digital Transformation",
      description: "Move from defensive compliance to strategic AI governance—measurable progress in weeks, not years.",
    },
    {
      icon: UserCheck,
      title: "Flexible Delivery for Your Organization",
      description: "Executive briefings, team workshops, or in-depth programs—tailored to your timeline and organizational structure.",
    },
  ];

  return (
    <section className="py-10 md:py-14 relative overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-8 tracking-tight leading-[1.05]">
            Transform Your EHS Function: <span className="text-primary">Build Team Capability for AI</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            A structured program that takes your EHS team from reactive to AI-enabled—building organizational capability
            for governance, evaluation, and responsible adoption of emerging safety technologies.
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
