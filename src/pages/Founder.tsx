import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Linkedin, Award, Briefcase } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import founderPhoto from "@/assets/founder-cutout.png";

const tags = [
  "Safety Leadership",
  "Digital Transformation",
  "Risk Management",
  "SafetyTech",
  "Career Transformation",
  "AI",
];

const Founder = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Lucas Domingues, MSc, CMIOSH — Founder | SafetyTech Academy",
      description: "Meet Lucas Domingues, founder of SafetyTech Academy. 15+ years in occupational health and safety, specializing in digital transformation and Safety 4.0 leadership.",
      canonical: "https://safetytech.academy/teacher/lucas-domingues",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <div className="container mx-auto px-4 pt-28 pb-24 md:pt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          {/* Photo */}
          <div className="relative lg:sticky lg:top-32">
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative aspect-[3/4] rounded-[30px] overflow-hidden bg-slate-100">
              <img
                src={founderPhoto}
                alt="Lucas Domingues, MSc, CMIOSH"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <h1 className="mb-2">Lucas Domingues</h1>
            <p className="text-primary font-medium text-lg mb-8">MSc, CMIOSH — Founder, SafetyTech Academy</p>

            <div className="space-y-5 text-[#69697b] leading-relaxed mb-8">
              <p>
                Lucas brings over 15 years of experience in occupational health and safety, specializing in digital transformation and modern safety leadership practices.
              </p>
              <p>
                With his Master's degree and IOSH certification, Lucas has helped hundreds of safety professionals transition from traditional methods to cutting-edge, data-driven approaches that drive real business value.
              </p>
              <p>
                His expertise spans across multiple industries, from manufacturing to construction, where he's consistently delivered measurable improvements in safety performance and organizational culture. He founded SafetyTech Academy to close the AI literacy gap he saw across the profession — building the world's first IOSH-approved, CPD-accredited Safety 4.0 certification.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {tags.map((tag) => (
                <span key={tag} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <a
                href="https://www.linkedin.com/in/lucas-domingues-msc-cmiosh-49b2b820/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium transition-colors shadow-md hover:shadow-lg"
              >
                <Linkedin className="w-5 h-5" />
                Connect on LinkedIn
              </a>
            </div>

            {/* Credentials */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-900">CMIOSH</div>
                  <div className="text-xs text-[#69697b]">Chartered Member, IOSH</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Briefcase className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-900">15+ Years</div>
                  <div className="text-xs text-[#69697b]">In occupational health & safety</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Learn directly from Lucas
            </h3>
            <p className="text-[#69697b] mb-6">
              Every SafetyTech Academy course is built and taught by Lucas himself.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-[22px] bg-primary text-white font-medium text-base uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Founder;
