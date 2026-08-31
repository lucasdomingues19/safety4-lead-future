import { useState } from "react";

export const OurTeamTrainingSection = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <section className="py-14 md:py-20 relative overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Label */}
        <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-primary inline-block px-3 py-1.5 rounded-md mb-8">
          Our Team Training
        </p>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Left: Copilot Course Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-primary/40 group-hover:border-primary/70 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2 cursor-pointer">
              {/* Course Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                <img
                  src="/assets/hero-copilot-course.jpg"
                  alt="Microsoft Copilot for EHS and Sustainability"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Course Content */}
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Microsoft Copilot for EHS and Sustainability
              </h3>
              <p className="text-slate-600 text-base mb-6">
                Master AI-powered productivity tools designed specifically for EHS professionals. Learn to leverage Microsoft Copilot to streamline incident investigations, automate safety reporting, and drive organizational transformation.
              </p>

              {/* Course Details */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">Duration:</span>
                  <span className="text-slate-600">Self-paced, ~4 weeks</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">Format:</span>
                  <span className="text-slate-600">Video lessons + practical exercises</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">Audience:</span>
                  <span className="text-slate-600">EHS Teams & Organizations</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors">
                Explore Course
              </button>
            </div>
          </div>

          {/* Right: Video in #FAFAFA Band */}
          <div className="bg-[#FAFAFA] rounded-xl md:rounded-2xl p-6 md:p-8 flex flex-col justify-center">
            <div
              className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
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

        {/* CTA Box for Professionals */}
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
  );
};
