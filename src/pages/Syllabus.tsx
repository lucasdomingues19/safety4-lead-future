import { useEffect, useState } from "react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import {
  ArrowRight, FileDown, BookOpen, Award, Rocket, Users, Brain, UserCheck, PlayCircle
} from "lucide-react";
import BrochureDownloadModal from "@/components/BrochureDownloadModal";

const benefits = [
  { icon: Brain, title: "Learn AI, IoT, & SafetyTech", subtitle: "without coding", description: "Master cutting-edge safety technologies through practical, hands-on training designed for safety professionals." },
  { icon: Award, title: "IOSH & CPD Recognized", subtitle: "certification", description: "Earn globally recognized credentials that demonstrate your expertise in digital safety leadership." },
  { icon: Rocket, title: "Future-proof your career", subtitle: "in hours", description: "Transform your safety career with skills that make you indispensable in the digital age." },
  { icon: Users, title: "Global safety leader", subtitle: "community", description: "Join an exclusive network of forward-thinking safety professionals worldwide." },
  { icon: PlayCircle, title: "Masterclass Sessions", subtitle: "with experts", description: "Learn from industry leaders through exclusive masterclass sessions covering advanced Safety 4.0 strategies." },
  { icon: UserCheck, title: "1:1 Mentoring", subtitle: "personalized guidance", description: "Receive personalized coaching and mentorship to accelerate your digital safety transformation journey." },
];

const Syllabus = () => {
  const [brochureOpen, setBrochureOpen] = useState(false);

  useEffect(() => {
    setPageSEO({
      title: "Safety 4.0 Accelerator — IOSH Approved Programme | Safety 4.0 Academy",
      description: "The world's first IOSH-approved Safety 4.0 programme. Master AI, IoT, SafetyTech, data strategy, and digital leadership. CPD accredited.",
      canonical: "https://safetyacademy.tech/syllabus",
    });
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-black -z-10" />
      <AudienceNav />

      {/* HERO */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-lime-500/30 bg-lime-500/10 text-lime-400 text-sm font-medium mb-8">
              <BookOpen className="w-4 h-4" />
              10 Modules · 8+ CPD Hours · IOSH Approved
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              The Safety 4.0 <span className="text-lime-400">Accelerator</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
              A structured learning journey that takes you from understanding the digital safety landscape 
              to leading transformation in your organisation. No coding required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setBrochureOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-medium text-lg rounded-full border border-white/20 hover:bg-white/20 transition-colors active:scale-[0.97]"
              >
                <FileDown className="w-5 h-5" />
                Download Brochure
              </button>
              <a
                href="/cohort"
                className="inline-flex items-center gap-2 px-8 py-4 bg-lime-500 text-black font-semibold text-lg rounded-full hover:bg-lime-400 transition-colors active:scale-[0.97]"
              >
                Enrol Now
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL GAIN */}
      <section className="py-16 md:py-24 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              What You'll <span className="text-lime-400">Gain</span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              We've created the world's first comprehensive digital safety leadership programme 
              that transforms traditional safety professionals into future-ready leaders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="group relative p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-lime-500/30 transition-all duration-500"
                >
                  <div className="w-12 h-12 bg-lime-500/15 rounded-xl flex items-center justify-center mb-4 group-hover:bg-lime-500/25 transition-colors duration-500">
                    <Icon className="w-6 h-6 text-lime-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{b.title}</h3>
                  <p className="text-lime-400 font-medium text-sm mb-3">{b.subtitle}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Lead Safety in the <span className="text-lime-400">Digital Age</span>?
            </h2>
            <p className="text-lg text-gray-300 mb-10 leading-relaxed">
              Join safety professionals from Siemens, LEGO, Marsh, and organisations across 12 countries 
              who are already transforming their careers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/cohort"
                className="inline-flex items-center gap-2 px-8 py-4 bg-lime-500 text-black font-semibold text-lg rounded-full hover:bg-lime-400 transition-colors active:scale-[0.97]"
              >
                Enrol Now
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-medium text-lg rounded-full border border-white/20 hover:bg-white/20 transition-colors active:scale-[0.97]"
              >
                Talk to Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BrochureDownloadModal open={brochureOpen} onOpenChange={setBrochureOpen} />
    </div>
  );
};

export default Syllabus;
