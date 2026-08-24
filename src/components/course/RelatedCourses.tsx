import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { courses } from "@/components/CourseIllustrations";

export const RelatedCourses = ({ currentHref }: { currentHref: string }) => {
  const related = courses.filter((c) => c.href !== currentHref);

  return (
    <section className="py-10 md:py-14 border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-10">
          <h2>Related Courses</h2>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            All Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {related.map((course) => {
            return (
              <Link
                key={course.href}
                to={course.href}
                className="group relative flex flex-col bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-40 bg-primary overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-white/10 rounded-full" />
                  <img
                    src={course.iconWhite}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="relative w-24 h-24 object-contain"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-[#69697b] text-sm leading-relaxed mb-4">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wide text-slate-500">{course.level}</span>
                    <span className="text-base font-bold text-slate-900">{course.price}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
