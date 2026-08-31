import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, Brain, TrendingUp, Rocket, Award, Users, Zap } from "lucide-react";
import { courses } from "@/components/CourseIllustrations";
import { ProfessionalCredentialsSection } from "@/components/ProfessionalCredentialsSection";
import heroWorkerImage from "@/assets/hero-professionals-edited.jpg";

export default function ForProfessionals() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get the 3 B2C courses (not Copilot)
  const b2cCourses = courses.filter(c => c.href !== "/copilot-for-ehs");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section with Image */}
      <section className="bg-white py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
            {/* Left column — text */}
            <div className="max-w-[520px] shrink-0">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-600 font-medium mb-4 block">
                Professional Development
              </span>
              <h1 className="mb-6">
                Advance Your <span className="text-primary">Career</span>
              </h1>
              <p className="text-[#69697b] text-lg leading-relaxed mb-10">
                Comprehensive courses designed for safety and sustainability professionals. Build practical skills and drive measurable results with expert-led training options that transform your career.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
              >
                View All Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right column — image with lime green background */}
            <div className="relative w-full lg:flex-1">
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                .hero-image-float {
                  animation: float 6s ease-in-out infinite;
                }
              `}</style>
              <div className="relative bg-lime-400 rounded-[30px] overflow-hidden shadow-2xl h-80 md:h-96 flex items-center justify-center p-4">
                <img
                  src={heroWorkerImage}
                  alt="Professional safety leader"
                  className="w-full h-full object-cover object-top rounded-[20px] hero-image-float"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section - Why Professional Development Matters */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 max-w-4xl">
            <h2 className="mb-6">The EHS Professional's Challenge</h2>
            <p className="text-lg text-[#69697b] leading-relaxed mb-6">
              Today's EHS professionals face a rapidly evolving landscape. As organizations embrace digital transformation and AI-driven decision-making, the skills gap has widened. Safety leaders are expected to bridge the gap between traditional risk management and emerging technologies—yet many lack the training to do so effectively.
            </p>
            <p className="text-lg text-[#69697b] leading-relaxed">
              The courses below are designed to close that gap. They equip you with practical, immediately applicable skills in AI governance, data analytics, and digital-first safety practices. Whether you're advancing into a leadership role, specializing in new methodologies, or staying competitive in a tech-driven market, professional development is no longer optional—it's essential to your career trajectory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Skills Gap Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 text-slate-900 flex flex-col border-2 border-primary/40 group-hover:border-primary/70 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center mb-6 md:mb-8">
                  <Brain size={32} className="text-slate-900 transition-colors group-hover:text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-tight tracking-tight mb-3 transition-colors group-hover:text-primary">
                  Skills Gap
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-slate-600">
                  Close the distance between traditional EHS competencies and the digital capabilities your organization needs today.
                </p>
              </div>
            </div>

            {/* Professional Relevance Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 text-slate-900 flex flex-col border-2 border-primary/40 group-hover:border-primary/70 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center mb-6 md:mb-8">
                  <TrendingUp size={32} className="text-slate-900 transition-colors group-hover:text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-tight tracking-tight mb-3 transition-colors group-hover:text-primary">
                  Professional Relevance
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-slate-600">
                  Stay current with industry shifts. Master the tools and frameworks that modern safety teams actually use.
                </p>
              </div>
            </div>

            {/* Career Progression Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 text-slate-900 flex flex-col border-2 border-primary/40 group-hover:border-primary/70 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center mb-6 md:mb-8">
                  <Rocket size={32} className="text-slate-900 transition-colors group-hover:text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-tight tracking-tight mb-3 transition-colors group-hover:text-primary">
                  Career Progression
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-slate-600">
                  Build credentials that position you for leadership roles—from EHS coordinator to Chief Safety Officer in a digital-first organization.
                </p>
              </div>
            </div>

            {/* Industry Recognition Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 text-slate-900 flex flex-col border-2 border-primary/40 group-hover:border-primary/70 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center mb-6 md:mb-8">
                  <Award size={32} className="text-slate-900 transition-colors group-hover:text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-tight tracking-tight mb-3 transition-colors group-hover:text-primary">
                  Industry Recognition
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-slate-600">
                  Earn IOSH-approved credentials and CPD hours that validate your expertise and advance your professional standing.
                </p>
              </div>
            </div>

            {/* Peer Community Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 text-slate-900 flex flex-col border-2 border-primary/40 group-hover:border-primary/70 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center mb-6 md:mb-8">
                  <Users size={32} className="text-slate-900 transition-colors group-hover:text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-tight tracking-tight mb-3 transition-colors group-hover:text-primary">
                  Peer Community
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-slate-600">
                  Connect with other EHS leaders navigating digital transformation, share best practices, and build lasting professional networks.
                </p>
              </div>
            </div>

            {/* Hands-On Practice Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 text-slate-900 flex flex-col border-2 border-primary/40 group-hover:border-primary/70 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center mb-6 md:mb-8">
                  <Zap size={32} className="text-slate-900 transition-colors group-hover:text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-tight tracking-tight mb-3 transition-colors group-hover:text-primary">
                  Hands-On Practice
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-slate-600">
                  Apply learning immediately with real-world case studies, practical exercises, and scenarios from modern safety teams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProfessionalCredentialsSection />

      {/* Courses Grid - using Pricing card design */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2>Our Featured Courses</h2>
          </div>
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
