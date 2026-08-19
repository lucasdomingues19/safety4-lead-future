import { Brain, Award, Rocket, Users, PlayCircle, UserCheck } from "lucide-react";

export const SolutionSection = () => {
  const benefits = [
    {
      icon: Brain,
      title: "Learn AI, IoT, & SafetyTech",
      description: "Master cutting-edge safety technologies through practical, hands-on training designed for safety professionals.",
    },
    {
      icon: Users,
      title: "Global safety leader community",
      description: "Join an exclusive network of forward-thinking safety professionals worldwide.",
    },
    {
      icon: Award,
      title: "IOSH & CPD recognized certification",
      description: "Earn globally recognized credentials that demonstrate your expertise in digital safety leadership.",
    },
    {
      icon: PlayCircle,
      title: "Masterclass sessions with experts",
      description: "Learn from industry leaders through exclusive masterclass sessions covering advanced Safety 4.0 strategies.",
    },
    {
      icon: Rocket,
      title: "Future-proof your career in hours",
      description: "Transform your safety career with skills that make you indispensable in the digital age.",
    },
    {
      icon: UserCheck,
      title: "1:1 personalized mentoring",
      description: "Receive personalized coaching and mentorship to accelerate your digital safety transformation journey.",
    },
  ];

  return (
    <section className="py-32 md:py-40 relative overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-8 tracking-tight leading-[1.05] md:whitespace-nowrap">
            The Solution: <span className="text-primary">You need new skills</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            We've created the world's first comprehensive digital safety leadership program
            that transforms traditional safety professionals into future-ready leaders.
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
