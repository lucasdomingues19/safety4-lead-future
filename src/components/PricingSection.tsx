import { Link } from "react-router-dom";
import { BarChart3, Sparkles, MessageSquare, Award, ShieldCheck, Users, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Custom per-course illustrated header — a mini "product mockup" panel plus
// floating icon chips, themed to what each course is actually about.

const AIFundamentalsIllustration = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    {/* Main mockup panel — AI chat/prompt interface */}
    <div className="relative w-[68%] aspect-[4/3] bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-2 -rotate-2">
      <div className="h-2 w-3/5 bg-slate-200 rounded-full" />
      <div className="h-2 w-2/5 bg-slate-200 rounded-full" />
      <div className="h-2 w-4/5 bg-primary/20 rounded-full mt-1" />
      <div className="flex-1" />
      <div className="flex items-center gap-2 bg-primary/10 rounded-xl p-2">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="h-2 w-3/5 bg-primary/30 rounded-full" />
      </div>
    </div>
    {/* Floating chips */}
    <div className="absolute top-[14%] right-[10%] w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center rotate-6">
      <MessageSquare className="w-6 h-6 text-primary" />
    </div>
    <div className="absolute bottom-[16%] left-[8%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center -rotate-6">
      <Sparkles className="w-5 h-5 text-primary" />
    </div>
  </div>
);

const CertificationIllustration = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    {/* Main mockup panel — certificate / module checklist */}
    <div className="relative w-[68%] aspect-[4/3] bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-2.5 rotate-2">
      <div className="flex items-center justify-between mb-1">
        <div className="h-2.5 w-2/5 bg-slate-300 rounded-full" />
        <Award className="w-5 h-5 text-primary" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className={`h-1.5 rounded-full bg-slate-200 ${i === 1 ? "w-3/5" : "w-4/5"}`} />
        </div>
      ))}
    </div>
    {/* Floating chips */}
    <div className="absolute top-[12%] right-[8%] w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center -rotate-6">
      <ShieldCheck className="w-6 h-6 text-primary" />
    </div>
    <div className="absolute bottom-[14%] left-[10%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center rotate-6">
      <Award className="w-5 h-5 text-primary" />
    </div>
  </div>
);

const CohortIllustration = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    {/* Main mockup panel — live session grid of participants */}
    <div className="relative w-[68%] aspect-[4/3] bg-white rounded-2xl shadow-xl p-4 -rotate-2">
      <div className="grid grid-cols-2 gap-2 h-full">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`rounded-lg flex items-center justify-center ${i === 0 ? "bg-primary" : "bg-primary/10"}`}>
            <div className={`w-5 h-5 rounded-full ${i === 0 ? "bg-white/80" : "bg-primary/30"}`} />
          </div>
        ))}
      </div>
    </div>
    {/* Floating chips */}
    <div className="absolute top-[12%] right-[9%] w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center rotate-6">
      <Users className="w-6 h-6 text-primary" />
    </div>
    <div className="absolute bottom-[15%] left-[9%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center -rotate-6">
      <Calendar className="w-5 h-5 text-primary" />
    </div>
  </div>
);

const courses = [
  {
    name: "AI Fundamentals in EHS",
    href: "/ai-fundamentals",
    description: "A fast-track introduction to AI for EHS professionals.",
    Illustration: AIFundamentalsIllustration,
    level: "Beginner",
    price: "£97",
    period: "",
    popular: false,
  },
  {
    name: "IOSH-approved Safety 4.0",
    href: "/elearning",
    description: "Self-paced online learning — 10 core modules, 60+ video lessons.",
    Illustration: CertificationIllustration,
    level: "All Levels",
    price: "£497",
    originalPrice: "£697",
    period: "",
    popular: true,
  },
  {
    name: "Safety 4.0 Accelerator Cohort",
    href: "/accelerator",
    description: "Live group training with expert guidance and peer interaction.",
    Illustration: CohortIllustration,
    level: "Advanced",
    price: "£1,997",
    originalPrice: "£2,497",
    period: "per person",
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 md:py-32 relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <div>
            <h2 className="mb-4">Our Courses</h2>
            <p className="text-lg text-[#69697b] max-w-xl">
              Choose the right programme for your organization — every course is IOSH-approved and CPD-accredited.
            </p>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/5 transition-colors shrink-0"
          >
            All Courses
          </Link>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {courses.map((course) => {
            const Illustration = course.Illustration;
            return (
              <Link
                key={course.href}
                id={course.href === "/elearning" ? "elearning" : undefined}
                to={course.href}
                className="group relative flex flex-col bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {course.popular && (
                  <div className="absolute top-4 right-4 z-10 bg-white text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm">
                    Most Popular
                  </div>
                )}

                {/* Illustration header */}
                <div className="relative h-48 bg-primary overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-white/10 rounded-full" />
                  <Illustration />
                </div>

                {/* Body */}
                <div className="flex flex-col flex-grow p-6 md:p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                    {course.name}
                  </h3>
                  <p className="text-[#69697b] text-sm leading-relaxed mb-6 flex-grow">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      {course.level}
                    </div>
                    <div className="flex items-baseline gap-2">
                      {course.originalPrice && (
                        <span className="text-slate-400 text-sm line-through">{course.originalPrice}</span>
                      )}
                      <span className="text-lg font-bold text-slate-900">{course.price}</span>
                      {course.period && (
                        <span className="text-slate-400 text-sm">{course.period}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="text-sm md:text-base text-[#69697b] mx-auto text-center leading-relaxed">
          *Get{" "}
          <a href="/contact?request=reimbursement" className="text-primary hover:text-primary/80 underline">reimbursed</a>{" "}
          by your company, request an{" "}
          <a href="/contact?request=discount" className="text-primary hover:text-primary/80 underline">individual</a>{" "}
          discount, or unlock a reduced price for a{" "}
          <a href="/contact?request=group" className="text-primary hover:text-primary/80 underline">group</a> (3+ seats)
        </p>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Not sure which option is right for your team?
            </h3>
            <p className="text-[#69697b] mb-6">
              Schedule a free consultation with our experts to find the perfect training solution for your team needs.
            </p>
            <a href="https://scheduler.zoom.us/lucas-domingues/30-mins-with-lucas-safety-4-0-academy" target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base font-medium uppercase tracking-[0.08em] rounded">
                Schedule Free Consultation
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
