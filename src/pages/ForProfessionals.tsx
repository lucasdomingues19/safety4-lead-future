import { useEffect } from "react";

const courses = [
  {
    id: "ai-fundamentals",
    title: "AI Fundamentals for Safety Professionals",
    description: "Build your foundational understanding of AI concepts, applications, and implications for the safety and sustainability space.",
    duration: "Self-paced, ~3 weeks",
    level: "Beginner",
  },
  {
    id: "safety-40-accelerator",
    title: "Safety 4.0 Accelerator",
    description: "Master the convergence of IoT, analytics, and AI in modern safety management. Learn how digital transformation reshapes EHS.",
    duration: "Self-paced, ~4 weeks",
    level: "Intermediate",
  },
  {
    id: "elearning-platform",
    title: "Building Your E-Learning Platform",
    description: "Design, develop, and launch effective safety training courses. Learn instructional design, content creation, and platform management.",
    duration: "Self-paced, ~5 weeks",
    level: "Intermediate",
  },
];

export default function ForProfessionals() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              Professional Development Courses
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              Advance your career with comprehensive courses designed for safety and sustainability professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {courses.map((course) => (
              <div key={course.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-primary/40 group-hover:border-primary/70 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2 cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                    {course.title}
                  </h3>

                  <p className="text-slate-600 text-base mb-6">
                    {course.description}
                  </p>

                  <div className="mb-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Duration:</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors">
                    View Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
