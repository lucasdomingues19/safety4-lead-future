import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courses } from "./CourseIllustrations";

export const PricingSection = () => {
  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <div>
            <h2 className="mb-4">Our Featured Courses</h2>
            <p className="text-lg text-[#69697b] max-w-xl">
              Choose the right programme for your organization.
            </p>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/5 transition-colors shrink-0"
          >
            All Courses
          </Link>
        </div>

        {/* Course Cards + Consultation Button */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch mb-16">
          {courses.map((course) => {
            return (
              <div
                key={course.href}
                id={course.href === "/elearning" ? "elearning" : undefined}
                className="group relative flex flex-col bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {course.popular && (
                  <div className="absolute top-4 right-4 z-10 bg-white text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm">
                    Most Popular
                  </div>
                )}

                <Link to={course.href} className="block">
                  {/* Icon header */}
                  <div className="relative h-52 bg-primary overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-white/10 rounded-full" />
                    <img
                      src={course.iconWhite}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="relative w-32 h-32 md:w-36 md:h-36 object-contain"
                    />
                  </div>
                </Link>

                {/* Body */}
                <div className="flex flex-col flex-grow p-6 md:p-8">
                  <Link to={course.href}>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug hover:text-primary transition-colors">
                      {course.name}
                    </h3>
                  </Link>
                  <p className="text-[#69697b] text-sm leading-relaxed mb-5">
                    {course.description}
                  </p>

                  <ul className="space-y-2 mb-6 flex-grow">
                    {course.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-5 mb-5 border-t border-slate-100">
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

                  <Link
                    to={course.href}
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-primary text-white font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
                  >
                    {course.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Consultation CTA - in blank 4th grid space */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center gap-4 p-8">
            <h3 className="text-lg font-bold text-slate-900">
              Not sure which option is right for your team?
            </h3>
            <p className="text-[#69697b] text-sm leading-relaxed">
              Schedule a free consultation with our experts to find the perfect training solution for your team needs.
            </p>
            <a
              href="https://scheduler.zoom.us/lucas-domingues/30-mins-with-lucas-safety-4-0-academy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors mt-2 w-full"
            >
              Schedule Free Consultation
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <p className="text-sm md:text-base text-[#69697b] mx-auto text-center leading-relaxed">
          *Get{" "}
          <a href="/contact?request=reimbursement" className="text-primary hover:text-primary/80 underline">reimbursed</a>{" "}
          by your company, request an{" "}
          <a href="/contact?request=discount" className="text-primary hover:text-primary/80 underline">individual</a>{" "}
          discount, or unlock a reduced price for a{" "}
          <a href="/contact?request=group" className="text-primary hover:text-primary/80 underline">group</a> (3+ seats)
        </p>
      </div>
    </section>
  );
};
