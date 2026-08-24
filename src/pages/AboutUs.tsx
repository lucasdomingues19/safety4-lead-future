import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Target, Users, Award, Rocket, Linkedin, Briefcase } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { BlueBandDecor } from "@/components/BlueBandDecor";
import { StoryCarousel } from "@/components/StoryCarousel";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import founderPhoto from "@/assets/founder-cutout.png";

const founderTags = [
  "Safety Leadership",
  "Digital Transformation",
  "Risk Management",
  "SafetyTech",
  "Career Transformation",
  "AI",
];

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
      <section className="pt-28 pb-20 md:pt-32 md:pb-24 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              Our Mission to Lead Safety
              <br />
              <span className="text-primary">Forward.</span>
            </h1>
            <p className="text-lg text-[#69697b] leading-relaxed max-w-xl mx-auto mb-10">
              We're on a mission to lead safety forward — helping EHS professionals build the AI literacy and digital skills to thrive in the Safety 4.0 era, not get left behind by it.
            </p>
            <a
              href="#story"
              className="inline-flex items-center gap-2 px-8 py-[14px] border border-primary text-primary font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/5 transition-colors"
            >
              Our Story
            </a>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="py-10 md:py-14 scroll-mt-24 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="mb-6">Our Story</h2>
              <h3 className="text-xl font-bold text-slate-900 leading-snug mb-5">
                SafetyTech Academy was born from field observations: technology was transforming the workplace faster than safety professionals were being prepared for it.
              </h3>
              <div className="space-y-4 text-[#69697b] leading-relaxed">
                <p>
                  After 15+ years in EHS and Sustainability, Lucas saw the gap first-hand. AI, automation and digital tools were creating new opportunities to work smarter, but traditional safety training wasn't keeping pace.
                </p>
                <p className="italic text-slate-900 border-l-2 border-primary pl-4">
                  "We can't manage Industry 4.0 risks with outdated safety methods," he says.
                </p>
                <p>
                  So he built SafetyTech Academy to help EHS and Sustainability professionals understand, adopt and lead with technology — combining practical industry experience with AI and digital transformation.
                </p>
                <p>
                  Today, the Academy helps professionals and organisations navigate the transition to Safety 4.0 with the knowledge, tools and confidence to thrive in the digital age.
                </p>
              </div>
            </div>

            <StoryCarousel />
          </div>
        </div>
      </section>

      {/* Values grid */}
      <section id="mission" className="py-10 md:py-14 scroll-mt-24">
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

      {/* Founder — full-bleed brand band matching the homepage introduction section.
          On desktop the photo is pinned to the band's full outer height
          (absolute + h-full against the relative section), independent of
          the padding that sizes the band itself, so it always fills it
          edge to edge rather than floating with gaps. Mobile keeps a
          simpler in-flow photo since there's no room to break out sideways. */}
      <section className="relative bg-primary py-8 md:py-10">
        <BlueBandDecor />

        <div className="relative z-10 container mx-auto px-4">
          <div className="relative max-w-5xl mx-auto">
            <img
              src={founderPhoto}
              alt="Lucas Domingues, MSc, CMIOSH"
              loading="lazy"
              decoding="async"
              className="hidden lg:block absolute left-0 bottom-0 z-10 h-full w-auto max-w-[420px] object-contain object-bottom drop-shadow-2xl pointer-events-none"
            />

            <div className="lg:hidden flex justify-center mb-8">
              <img
                src={founderPhoto}
                alt="Lucas Domingues, MSc, CMIOSH"
                loading="lazy"
                decoding="async"
                className="h-[420px] w-auto max-w-full object-contain drop-shadow-2xl"
              />
            </div>

            <div className="lg:pl-[420px] xl:pl-[460px] text-center lg:text-left">
              <blockquote className="text-white text-2xl md:text-4xl font-medium leading-snug mb-8 max-w-lg mx-auto lg:mx-0">
                "I started the SafetyTech Academy because AI is here to stay and EHS leaders can't be left behind."
              </blockquote>
              <span className="text-xs uppercase tracking-[0.2em] text-white/70 font-medium mb-4 block">
                Founder, SafetyTech Academy
              </span>
              <h2 className="text-white mb-3">Lucas Domingues</h2>
              <p className="text-white/80 text-lg mb-8">MSc, CMIOSH</p>
              <a
                href="https://www.linkedin.com/in/lucas-domingues-msc-cmiosh-49b2b820/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-full font-medium hover:bg-white/90 transition-colors shadow-md"
              >
                <Linkedin className="w-5 h-5" />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Founder bio */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
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

            <div className="flex flex-wrap gap-3 mb-10">
              {founderTags.map((tag) => (
                <span key={tag} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>

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
      </section>

      {/* CTA */}
      <section className="py-10 md:py-14">
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
