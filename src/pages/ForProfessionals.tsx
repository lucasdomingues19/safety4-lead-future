import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2 } from "lucide-react";
import { courses } from "@/components/CourseIllustrations";

export default function ForProfessionals() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get the 3 B2C courses (not Copilot)
  const b2cCourses = courses.filter(c => c.href !== "/copilot-for-ehs");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header Section - matching Courses page style */}
      <section className="bg-white">
        <div className="container mx-auto px-4 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="mb-14 max-w-2xl">
            <h1 className="mb-4">
              Professional Development <span className="text-primary">Courses</span>
            </h1>
            <p className="text-lg text-[#69697b]">
              Advance your career with comprehensive courses designed for safety and sustainability professionals. Choose from expert-led training options that build practical skills and drive measurable results.
            </p>
          </div>
        </div>
      </section>

      {/* Courses Grid - using Pricing card design */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {b2cCourses.map((course) => (
              <div
                key={course.href}
                className="group relative flex flex-col bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
