import { useState } from "react";
import { Link } from "react-router-dom";
import { courses } from "@/components/CourseIllustrations";

export const OurTeamTrainingSection = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Get the Copilot course card
  const copilotCourse = courses.find(c => c.href === "/copilot-for-ehs");

  if (!copilotCourse) return null;

  return (
    <>
      {/* Section: Card + Video Side-by-Side with Label */}
      <section className="py-14 md:py-20 relative overflow-hidden bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Section Label */}
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-primary inline-block px-3 py-1.5 rounded-md mb-8">
            Our Team Training
          </p>

          {/* Two-column: Card (left) + Video in grey band (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
            {/* Left: Copilot Course Card */}
            <Link
              to={copilotCourse.href}
              className="group relative flex flex-col bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-40 bg-primary overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-white/10 rounded-full" />
                <img
                  src={copilotCourse.iconWhite}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="relative w-24 h-24 object-contain"
                />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                  {copilotCourse.name}
                </h3>
                <p className="text-[#69697b] text-sm leading-relaxed mb-4">{copilotCourse.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-slate-500">{copilotCourse.level}</span>
                  <span className="text-base font-bold text-slate-900">{copilotCourse.price}</span>
                </div>
              </div>
            </Link>

            {/* Right: Video in grey band */}
            <div
              className="bg-[#FAFAFA] rounded-[20px] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col justify-center"
              onClick={() => setVideoPlaying(!videoPlaying)}
            >
              <div className="relative aspect-video overflow-hidden">
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
