import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, Clock, CheckCircle2, BookOpen } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { getGuide, type Guide } from "@/data/guides";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";

const BASE = "https://safetytech.academy";

/**
 * Injects Article + FAQPage + BreadcrumbList JSON-LD for the guide.
 * AI assistants and Google both extract Q&A pairs preferentially, so the
 * FAQPage block is the highest-value part of this.
 */
const useGuideStructuredData = (guide: Guide | undefined) => {
  useEffect(() => {
    if (!guide) return;
    const url = `${BASE}/guides/${guide.slug}`;

    const blocks: Record<string, unknown>[] = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: guide.title,
        description: guide.metaDescription,
        abstract: guide.summary,
        articleSection: "Occupational Safety and Health",
        inLanguage: "en-GB",
        dateModified: guide.updated,
        datePublished: guide.updated,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: {
          "@type": "Organization",
          name: "SafetyTech Academy",
          url: BASE,
        },
        publisher: {
          "@type": "EducationalOrganization",
          name: "SafetyTech Academy",
          url: BASE,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides` },
          { "@type": "ListItem", position: 3, name: guide.shortLabel, item: url },
        ],
      },
    ];

    const nodes = blocks.map((block) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-guide-schema", "true");
      script.text = JSON.stringify(block);
      document.head.appendChild(script);
      return script;
    });

    return () => nodes.forEach((n) => n.remove());
  }, [guide]);
};

const GuidePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? getGuide(slug) : undefined;

  useGuideStructuredData(guide);

  useEffect(() => {
    if (!guide) return;
    trackPageView(window.location.pathname);
    setPageSEO({
      title: guide.metaTitle,
      description: guide.metaDescription,
      canonical: `${BASE}/guides/${guide.slug}`,
      ogType: "article",
    });
  }, [guide]);

  if (!guide) return <Navigate to="/guides" replace />;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AudienceNav />

      <article className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link to="/guides" className="hover:text-primary">Guides</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-slate-700">{guide.shortLabel}</li>
            </ol>
          </nav>

          <span className="font-mono text-xs uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md">
            Guide
          </span>

          <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05] text-slate-900">
            {guide.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" aria-hidden="true" />
              {guide.readingTime} min read
            </span>
            <span>
              Updated{" "}
              <time dateTime={guide.updated}>
                {new Date(guide.updated).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </span>
          </div>

          {/* Definitional summary — the block AI assistants quote */}
          <p className="mt-8 text-lg md:text-xl leading-relaxed text-slate-900 font-medium border-l-4 border-primary pl-5">
            {guide.summary}
          </p>

          {/* Key takeaways */}
          <section className="mt-10 rounded-2xl bg-slate-50 border border-slate-200 p-6 md:p-8">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 mb-4">
              Key takeaways
            </h2>
            <ul className="space-y-3">
              {guide.keyTakeaways.map((item) => (
                <li key={item} className="flex gap-3 text-sm md:text-base text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Body */}
          {guide.sections.map((section) => (
            <section key={section.heading} className="mt-12">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
                {section.heading}
              </h2>

              {section.body?.map((para) => (
                <p key={para} className="text-base md:text-lg leading-relaxed text-slate-600 mb-4">
                  {para}
                </p>
              ))}

              {section.bullets && (
                <ul className="space-y-3 mt-4">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-base text-slate-600">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-primary text-white">
                      <tr>
                        {section.table.headers.map((h) => (
                          <th key={h} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join("|")} className="border-t border-slate-200 align-top">
                          {row.map((cell, i) => (
                            <td
                              key={cell + i}
                              className={`px-4 py-3 ${i === 0 ? "font-semibold text-slate-900" : "text-slate-600"}`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {/* FAQ — visible, matching the FAQPage schema exactly */}
          <section className="mt-14">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-6">
              Frequently asked questions
            </h2>
            <div className="space-y-5">
              {guide.faqs.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-slate-200 p-5 md:p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-base leading-relaxed text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-14 rounded-2xl bg-primary p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Build the capability, not just the awareness
            </h2>
            <p className="mt-3 text-base md:text-lg text-white/85 max-w-xl mx-auto">
              SafetyTech Academy is an approved training provider by IOSH. Our CPD-accredited
              programmes are built for practising safety professionals.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary hover:bg-white/90 transition-colors"
              >
                Explore programmes
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/governance-readiness"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Free readiness assessment
              </Link>
            </div>
          </section>

          {/* Related */}
          <section className="mt-12">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mb-4">
              Related reading
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {guide.related.map((r) => (
                <li key={r.href}>
                  <Link
                    to={r.href}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {guide.sources && guide.sources.length > 0 && (
            <section className="mt-10 pt-6 border-t border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">
                Sources
              </h2>
              <ul className="space-y-1.5">
                {guide.sources.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline hover:text-primary/80"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default GuidePage;
