import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2 } from "lucide-react";
import { courses } from "@/components/CourseIllustrations";

export const OurTeamTrainingSection = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Get the Copilot course card
  const copilotCourse = courses.find(c => c.href === "/copilot-for-ehs");

  if (!copilotCourse) return null;

  return (
    <>
      {/* Grey Band: Card (left) + Video (right) */}
      <section className="relative bg-[#FAFAFA] py-10 md:py-14">
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
            {/* Left column — full Pricing card */}
            <div className="max-w-[520px] shrink-0">
              <div className="group relative flex flex-col bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Link to={copilotCourse.href} className="block">
                  {/* Icon header */}
                  <div className="relative h-52 bg-primary overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-white/10 rounded-full" />
                    <img
                      src={copilotCourse.iconWhite}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="relative w-32 h-32 md:w-36 md:h-36 object-contain"
                    />
                  </div>
                </Link>

                {/* Body */}
                <div className="flex flex-col flex-grow p-6 md:p-8">
                  <Link to={copilotCourse.href}>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug hover:text-primary transition-colors">
                      {copilotCourse.name}
                    </h3>
                  </Link>
                  <p className="text-[#69697b] text-sm leading-relaxed mb-5">
                    {copilotCourse.description}
                  </p>

                  <ul className="space-y-2 mb-6 flex-grow">
                    {copilotCourse.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-5 mb-5 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      {copilotCourse.level}
                    </div>
                    <div className="flex items-baseline gap-2">
                      {copilotCourse.originalPrice && (
                        <span className="text-slate-400 text-sm line-through">{copilotCourse.originalPrice}</span>
                      )}
                      <span className="text-lg font-bold text-slate-900">{copilotCourse.price}</span>
                      {copilotCourse.period && (
                        <span className="text-slate-400 text-sm">{copilotCourse.period}</span>
                      )}
                    </div>
                  </div>

                  <Link
                    to={copilotCourse.href}
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-primary text-white font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
                  >
                    {copilotCourse.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right column — video */}
            <div className="relative w-full lg:flex-1">
              <div
                className="relative aspect-video rounded-[30px] overflow-hidden shadow-2xl cursor-pointer"
                onClick={() => setVideoPlaying(!videoPlaying)}
              >
                {videoPlaying ? (
                  <video
                    src="/videos/featured-training-teaser.mp4"
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      src="/videos/featured-training-teaser.mp4"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110">
                        <svg className="h-7 w-7 fill-current ml-1" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blue CTA Box for Professionals */}
      <section className="py-14 md:py-20 relative overflow-hidden bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-xl md:rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Discover Our Learning Paths for Professionals
            </h3>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Explore additional training options designed to advance your career in safety and sustainability
            </p>
            <a
              href="/for-professionals"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-white/90 text-primary font-semibold rounded-lg transition-colors"
            >
              Explore Learning Paths
            </a>
          </div>
        </div>
      </section>
    </>
  );
};
