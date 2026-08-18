import { Link } from "react-router-dom";
import { BarChart3, Building, Tablet, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const courses = [
  {
    name: "AI Fundamentals in EHS",
    href: "/ai-fundamentals",
    description: "A fast-track introduction to AI for EHS professionals.",
    icon: Building,
    level: "Beginner",
    price: "£97",
    period: "",
    popular: false,
  },
  {
    name: "IOSH-approved Safety 4.0",
    href: "/elearning",
    description: "Self-paced online learning — 10 core modules, 60+ video lessons.",
    icon: Tablet,
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
    icon: Users,
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
            const Icon = course.icon;
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
                <div className="relative h-48 bg-primary flex items-center justify-center overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-white/10 rounded-full" />
                  <div className="relative w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
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
