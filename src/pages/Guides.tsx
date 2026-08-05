import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { guides } from "@/data/guides";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";

const BASE = "https://safetytech.academy";

const GuidesHub = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Guides — AI, Safety 4.0 and IOSH Training Explained",
      description:
        "In-depth, practitioner-written guides on AI in health and safety, AI risk assessment, Safety 4.0 and IOSH-approved training. Free to read.",
      canonical: `${BASE}/guides`,
    });

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "SafetyTech Academy Guides",
      description:
        "Practitioner guides on AI in health and safety, Safety 4.0 and IOSH-approved training.",
      url: `${BASE}/guides`,
      hasPart: guides.map((g) => ({
        "@type": "Article",
        headline: g.title,
        abstract: g.summary,
        url: `${BASE}/guides/${g.slug}`,
      })),
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AudienceNav />

      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md">
              Guides
            </span>
            <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
              Straight answers on AI, data and modern safety practice
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
              Written by practitioners for practitioners. No vendor pitches, no invented
              statistics — just what the technology does, what it does not, and how to
              apply it responsibly.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                to={`/guides/${guide.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 p-6 md:p-7 hover:border-primary transition-colors"
              >
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {guide.readingTime} min read
                </span>
                <h2 className="mt-3 text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                  {guide.title}
                </h2>
                <p className="mt-3 text-sm md:text-base text-slate-600 flex-1">
                  {guide.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Read the guide
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuidesHub;
