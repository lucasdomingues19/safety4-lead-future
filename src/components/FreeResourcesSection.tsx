import { Link } from "react-router-dom";
import { ArrowRight, Gauge } from "lucide-react";
import bookCover from "@/assets/book-cover-safety-4-leader.png";
import { trackClick } from "@/utils/analytics";

// Low-commitment first step for visitors who are not ready to talk yet.
export const FreeResourcesSection = () => (
  <section className="py-10 md:py-14 bg-white" aria-labelledby="free-start-heading">
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3 block">Free · no call needed</span>
        <h2 id="free-start-heading" className="mb-3">Not ready to talk yet? Start here.</h2>
        <p className="text-lg text-[#69697b]">Two free ways to see where your EHS team stands on AI, in minutes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          to="/scorecard"
          onClick={() => trackClick("home_free_scorecard")}
          className="group flex gap-4 sm:gap-6 rounded-[20px] border border-slate-200 bg-[#FAFAFA] p-6 md:p-8 hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="flex h-16 w-16 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl bg-primary">
            <Gauge className="h-8 w-8 sm:h-12 sm:w-12 text-white" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2">EHS AI Readiness Scorecard</h3>
            <p className="text-sm text-[#69697b] leading-relaxed mb-5">
              Answer 15 quick questions (about 3 minutes) and get your team's AI readiness score, with a breakdown by area and a personalised report.
            </p>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-primary">
              Get my score <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        <Link
          to="/ebook"
          onClick={() => trackClick("home_free_ebook")}
          className="group flex gap-4 sm:gap-6 rounded-[20px] border border-slate-200 bg-[#FAFAFA] p-6 md:p-8 hover:border-primary hover:shadow-lg transition-all"
        >
          <img
            src={bookCover}
            alt="Become the Safety 4.0 Leader guide cover"
            loading="lazy"
            decoding="async"
            className="h-[88px] w-16 sm:h-32 sm:w-24 shrink-0 rounded-lg object-cover shadow-md"
          />
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Free guide: Become the Safety 4.0 Leader</h3>
            <p className="text-sm text-[#69697b] leading-relaxed mb-5">
              A short read (under 30 pages) by Lucas Domingues with stories, case studies and research on leading safety with AI and digital tools.
            </p>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-primary">
              Get the free guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  </section>
);
