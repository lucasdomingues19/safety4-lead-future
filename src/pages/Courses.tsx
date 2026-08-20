import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2 } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import { courses } from "@/components/CourseIllustrations";

const Courses = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Our Courses — IOSH & CPD Approved Safety 4.0 Training",
      description: "Browse every SafetyTech Academy course: AI Fundamentals in EHS, IOSH-approved Safety 4.0, and the Safety 4.0 Accelerator Cohort.",
      canonical: "https://safetytech.academy/courses",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <div className="container mx-auto px-4 pt-28 pb-24 md:pt-32">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <h1 className="mb-4">
            Our <span className="text-primary">Courses</span>
          </h1>
          <p className="text-lg text-[#69697b]">
            Every SafetyTech Academy course is IOSH-approved and CPD-accredited — choose the format that fits how your team learns.
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {courses.map((course) => {
            return (
              <div
                key={course.href}
                className="group relative flex flex-col bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {course.popular && (
                  <div className="absolute top-4 right-4 z-10 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm">
                    Most Popular
                  </div>
                )}

                <Link to={course.href} className="block">
                  <div className="relative h-52 bg-white border-2 border-primary overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/5 rounded-full" />
                    <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-primary/5 rounded-full" />
                    <img src={course.icon} alt="" className="relative w-32 h-32 md:w-36 md:h-36 object-contain" />
                  </div>
                </Link>

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
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Not sure which option is right for your team?
            </h3>
            <p className="text-[#69697b] mb-6">
              Schedule a free consultation with our experts to find the perfect training solution for your team needs.
            </p>
            <a href="https://scheduler.zoom.us/lucas-domingues/30-mins-with-lucas-safety-4-0-academy" target="_blank" rel="noopener noreferrer">
              <button className="bg-primary hover:bg-primary/90 text-white px-8 py-[22px] text-base font-medium uppercase tracking-[0.08em] rounded transition-colors">
                Schedule Free Consultation
              </button>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Courses;
