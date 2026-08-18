import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Target, Users, Award, Rocket } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { TrustedByBanner } from "@/components/TrustedByBanner";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import founderPhoto from "@/assets/founder-cutout.png";

const AboutUs = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "About Us — SafetyTech Academy",
      description: "SafetyTech Academy's mission is to lead safety forward. Meet the team behind the world's first IOSH-approved, CPD-accredited Safety 4.0 certification.",
      canonical: "https://safetytech.academy/about-us",
    });
  }, []);

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To lead safety forward — equipping EHS professionals with the AI literacy and digital skills the Safety 4.0 era demands.",
    },
    {
      icon: Rocket,
      title: "Why We Started",
      description: "Traditional safety certifications weren't built for a world where AI, IoT, and digital tools are reshaping how safety gets done.",
    },
    {
      icon: Award,
      title: "What Makes Us Different",
      description: "The world's first IOSH-approved, CPD-accredited Safety 4.0 programme — built by practitioners, not theorists.",
    },
    {
      icon: Users,
      title: "Who We Serve",
      description: "EHS directors, managers, and consultants across 12+ countries who want to lead — not just survive — the digital transition.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      {/* Hero */}
      <section className="pt-28 pb-20 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="mb-6">
              About <span className="text-primary">SafetyTech Academy</span>
            </h1>
            <p className="text-lg text-[#69697b] leading-relaxed">
              We're on a mission to lead safety forward — helping EHS professionals build the AI literacy and digital skills to thrive in the Safety 4.0 era, not get left behind by it.
            </p>
          </div>
        </div>
      </section>

      <TrustedByBanner />

      {/* Values grid */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="flex gap-5">
                  <div className="relative w-14 h-14 shrink-0">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-slate-900" strokeWidth={1.75} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                    <p className="text-[#69697b] leading-relaxed">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder highlight */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              <div className="relative aspect-[3/4] rounded-[30px] overflow-hidden bg-slate-100">
                <img
                  src={founderPhoto}
                  alt="Lucas Domingues, MSc, CMIOSH — Founder of SafetyTech Academy"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4 block">
                Meet the Founder
              </span>
              <h2 className="mb-4">Lucas Domingues</h2>
              <p className="text-primary font-medium mb-6">MSc, CMIOSH</p>
              <p className="text-[#69697b] leading-relaxed mb-8">
                Lucas brings over 15 years of experience in occupational health and safety, specializing in digital transformation and modern safety leadership practices. He founded SafetyTech Academy to help safety professionals transition from traditional methods to cutting-edge, data-driven approaches that drive real business value.
              </p>
              <Link
                to="/teacher/lucas-domingues"
                className="inline-flex items-center gap-2 px-8 py-[22px] bg-primary text-white font-medium text-base uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
              >
                Meet Lucas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="mb-4">Ready to lead safety forward?</h2>
          <p className="text-[#69697b] mb-8">
            Explore our IOSH-approved, CPD-accredited courses and find the right programme for your team.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-[22px] bg-primary text-white font-medium text-base uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
          >
            Our Courses
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
