import { useState } from "react";

export const OurTeamTrainingSection = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <>
      {/* Section: Copilot Course Card */}
      <section className="py-14 md:py-20 relative overflow-hidden bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Section Label */}
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-primary inline-block px-3 py-1.5 rounded-md mb-8">
            Our Team Training
          </p>

          {/* Copilot Course Card - Link to full course */}
          <a href="/copilot-for-ehs" className="block group max-w-md">
            <div className="relative overflow-hidden rounded-xl md:rounded-2xl border border-slate-200 hover:border-primary/50 transition-all hover:shadow-lg group-hover:scale-105 duration-300 bg-white">
              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                  Microsoft Copilot for EHS and Sustainability
                </h3>
                <p className="text-slate-600 text-base mb-6">
                  Master AI-powered productivity tools designed specifically for EHS professionals. Learn to leverage Copilot to streamline incident investigations and automate safety reporting.
                </p>
                <div className="inline-block px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg group-hover:bg-primary/90 transition-colors">
                  Explore Course →
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Full-width grey band: Video Teaser */}
      <section className="relative bg-[#FAFAFA] py-10 md:py-14 overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div
            className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
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
