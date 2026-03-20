import { useEffect, useState } from "react";
import AudienceNav from "@/components/AudienceNav";
import { CoursePreviewSection } from "@/components/CoursePreviewSection";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import {
  ArrowRight, FileDown, BookOpen, Award, Rocket, Users, Brain, UserCheck, PlayCircle,
  Layers, BarChart3, Cpu, ShieldCheck, Wrench, Database, Bot, Scale, TrendingUp, Compass
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


      {/* HERO + CURRICULUM */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] tracking-[3px] font-bold text-primary mb-4">10 MODULES · 60+ LESSONS · EXPERT-LED MASTERCLASSES</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                The Full <span className="text-primary">Curriculum</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Each module builds on the last — from foundational concepts to strategic leadership, 
                giving you a complete Safety 4.0 skillset.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { num: "01", icon: Compass, title: "Introduction & Orientation", desc: "Course overview, objectives, CPD & IOSH value, learner expectations.", color: "text-primary" },
                { num: "02", icon: Layers, title: "What is Safety 4.0?", desc: "Definition of Safety 4.0, triangle (People, Processes, Tech), role of data, 4th Industrial Revolution.", color: "text-pink-500" },
                { num: "03", icon: BarChart3, title: "The Safety Status Quo is Broken", desc: "Compliance-heavy culture, lagging indicators, reactive safety trap.", color: "text-primary" },
                { num: "04", icon: Brain, title: "Skills for the Safety Leader in the Digital Age", desc: "Digital literacy, AI/data awareness, adaptive intelligence, communication skills.", color: "text-pink-500" },
                { num: "05", icon: Wrench, title: "Safetytech Practical Applications", desc: "Wearables, IoT, drones, mobile-first systems, computer vision.", color: "text-primary" },
                { num: "06", icon: Cpu, title: "Building your Digital Safety Toolkit", desc: "Practical day-to-day tools: reporting apps, AI writing, automation, QR codes.", color: "text-pink-500" },
                { num: "07", icon: Database, title: "Data Strategy: From Chaos to Clarity", desc: "Data collection, centralisation, cleaning, analysis; pitfalls & benefits.", color: "text-primary" },
                { num: "08", icon: Bot, title: "AI Essentials for Safety Leaders", desc: "AI history, ML, NLP, LLMs, CV, agentic AI, real-world cases, myths & risks.", color: "text-pink-500" },
                { num: "09", icon: Scale, title: "Compliance, Risk & Governance Essentials", desc: "Digital compliance, regulation, governance frameworks, ethical AI.", color: "text-primary" },
                { num: "10", icon: TrendingUp, title: "Digital Safety Transformation Framework", desc: "ROI, executive influence, linking safety to business performance.", color: "text-pink-500" },
              ].map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={i}
                    className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-lime-500/30 transition-all duration-500"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i % 2 === 0 ? 'bg-lime-500/15' : 'bg-pink-500/15'} group-hover:scale-110 transition-transform duration-500`}>
                          <Icon className={`w-5 h-5 ${mod.color}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[11px] tracking-[2px] font-bold mb-1.5 ${mod.color}`}>MODULE {mod.num}</div>
                        <h3 className="text-[15px] font-bold text-white mb-2 leading-snug">{mod.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{mod.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                { val: "60+", label: "Studio-recorded video lessons, available on demand" },
                { val: "8+", label: "CPD hours — verifiable upon completion" },
                { val: "IOSH", label: "Approved certification recognised globally" },
                { val: "CPD", label: "Demonstrate continuous professional development in your field" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-lime-500/20 bg-lime-500/[0.06] p-5">
                  <div className="text-2xl font-black text-primary">{s.val}</div>
                  <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
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

      <CoursePreviewSection />
      <Footer />
      <BrochureDownloadModal open={brochureOpen} onOpenChange={setBrochureOpen} />
    </div>
  );
};

export default Syllabus;
