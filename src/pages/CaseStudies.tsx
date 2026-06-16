import { useEffect } from "react";
import { Footer } from "@/components/Footer";
import AudienceNav from "@/components/AudienceNav";
import { setPageSEO } from "@/utils/seo";
import stewartDearyPhoto from "@/assets/stewart-deary-photo.jpeg";
import { Quote, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CaseStudies = () => {
  useEffect(() => {
    setPageSEO({
      title: "Case Studies — Safety 4.0 Academy | Real Stories from Alumni",
      description:
        "Read how Safety 4.0 Academy alumni are transforming safety leadership with digital tools, AI, and data-driven strategies.",
      canonical: "https://safetyacademy.tech/case-studies",
    });
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-black -z-10" />
      <AudienceNav />

      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-semibold mb-4 tracking-wide">
            Alumni Stories
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Case Studies
          </h1>
          <p className="text-white text-base md:text-lg max-w-2xl mx-auto">
            Discover how safety leaders around the world are applying what they learned at the Safety&nbsp;4.0 Academy.
          </p>
        </div>
      </section>

      {/* Stewart Deary Case Study */}
      <article className="pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Author card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md">
            <img
              src={stewartDearyPhoto}
              alt="Stewart Deary"
              className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/40"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-foreground">Stewart Deary</h2>
              <p className="text-primary font-medium text-sm">Global HSE Director — CRTS Global</p>
              <p className="text-muted-foreground text-sm mt-1">
                Safety 4.0 Academy Alumni
              </p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-snug">
            Bringing Safety Leadership into the Digital Age
          </h2>
          <p className="text-primary italic mb-10 text-sm font-medium">
            A personal learning journey through the Safety 4.0 Academy IOSH-Approved Programme
          </p>

          {/* Content sections */}
          <div className="prose-custom space-y-10">
            <Section title="Professional Background">
              <p>
                Before enrolling in the "IOSH-approved Safety 4.0 - Leading Safety in the Digital Age"
                programme, I was working as a Safety Compliance Manager for a leading European
                manufacturer of renewable energy equipment.
              </p>
              <p>
                My role focused on defining, maintaining, and improving the organisation's global
                health, safety, and environmental standards — ensuring HSE frameworks aligned with
                corporate policy, regulatory requirements, and operational needs.
              </p>
              <p>
                I was part of a global HSE team supporting projects across Germany, the UK, Canada,
                the Netherlands, and Türkiye. Our digital tools were built around the Microsoft
                ecosystem, but their effectiveness depended heavily on how data was entered and
                managed by the people using them.
              </p>
            </Section>

            <Section title="Recognising the Data Quality Challenge">
              <p>
                Working across multiple countries exposed me to varied approaches to safety reporting.
                Some professionals recognised that accurate, well-structured data is essential for
                identifying trends and root causes. Others treated reporting as an administrative task
                — leading to inconsistent or incomplete data.
              </p>
              <Highlight>
                Even the best systems are only as good as the data entered into them.
              </Highlight>
              <p>
                I began thinking about how to bring everyone onto the same level and provide tools
                that guide teams toward producing high-quality data for meaningful analysis.
              </p>
            </Section>

            <Section title="Discovering the Safety 4.0 Academy">
              <p>
                While researching tools that could be trialled with the global HSE team, I came across
                the Safety 4.0 Academy on LinkedIn, led by Lucas Domingues, MSc, CMIOSH.
              </p>
              <p>
                The Academy's branding was bold, modern, and clearly focused on the future of safety
                leadership. Its aim — preparing HSE professionals for a future shaped by data,
                automation, and intelligent systems — connected directly with the challenges I was
                already seeing.
              </p>
              <p>
                The focus wasn't simply on digitising existing processes. The goal was to help safety
                professionals generate accurate, structured information that leads to better analysis,
                stronger decisions, and continuous improvement.
              </p>
            </Section>

            <Section title="Discovering the Potential of Digital Safety">
              <p>
                Each module built on the previous one, creating a clear picture of how the profession
                is evolving. One session explored digital twins and AI-driven avatars — tools that can
                automate repetitive administrative tasks.
              </p>
              <Highlight>
                Digital tools can reduce the administrative burden, allowing safety professionals to
                spend more time in the field focusing on high-risk activities and developing strong
                safety cultures.
              </Highlight>
              <p>
                The course also highlighted an important mindset shift: safety professionals should
                not see digital technology as something imposed on them, but as an opportunity to
                shape how these tools are designed and used.
              </p>
            </Section>

            <Section title="Turning Insight into Action">
              <p>
                After completing the programme, I started reflecting on challenges I had seen
                throughout my career — problems often accepted as normal, like the ongoing tension
                between safety and operations.
              </p>
              <p>
                The course encouraged me to challenge that thinking and explore digital tools that use
                AI as an enabler — not to replace professionals, but to standardise data quality and
                improve outputs.
              </p>
              <Highlight>
                I often say I'm not a "silver surfer," but I'm proud to describe myself as a
                50-year-old vibe coder. That shift in mindset came directly from the Safety 4.0 Academy.
              </Highlight>
            </Section>

            <Section title="Conclusion">
              <p>
                The IOSH-approved Safety 4.0 programme offered more than new ideas — it provided a
                different way of thinking about how safety can evolve alongside technology.
              </p>
              <p>
                For me, it turned curiosity about digital tools into a practical interest in how
                intelligent systems can support better safety outcomes. As organisations face
                increasingly complex risks, the combination of strong safety leadership and
                well-designed digital tools will be essential.
              </p>
            </Section>
          </div>

          {/* Back link */}
          <div className="mt-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

/* ---------- sub-components ---------- */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3">{title}</h3>
    <div className="space-y-3 text-muted-foreground text-sm md:text-base leading-relaxed">
      {children}
    </div>
  </div>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-primary/5 rounded-r-lg">
    <p className="text-foreground italic font-medium flex items-start gap-2 text-sm md:text-base">
      <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
      <span>{children}</span>
    </p>
  </blockquote>
);

export default CaseStudies;
