import { useEffect, useState } from "react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import { TrustedByBanner } from "@/components/TrustedByBanner";
import {
  BookOpen, Target, AlertTriangle, Award, Smartphone,
  Wrench, Database, Sparkles, Shield, Rocket,
  Brain, Users, PlayCircle, UserCheck, ChevronDown,
  CheckCircle, ArrowRight, FileDown
} from "lucide-react";
import BrochureDownloadModal from "@/components/BrochureDownloadModal";

const modules = [
  {
    icon: BookOpen,
    title: "Introduction & Orientation",
    description: "Course overview, objectives, CPD & IOSH value, learner expectations",
    details: ["Programme structure and assessment criteria", "How to maximise your learning experience", "IOSH and CPD certification pathway"],
    color: "from-lime-500/20 to-lime-600/10",
    accent: "border-lime-500/30",
  },
  {
    icon: Target,
    title: "What is Safety 4.0?",
    description: "Definition of Safety 4.0, triangle (People, Processes, Tech), role of data",
    details: ["The Safety 4.0 framework and its three pillars", "How Industry 4.0 is reshaping EHS", "The role of data in modern safety management"],
    color: "from-lime-500/20 to-lime-600/10",
    accent: "border-lime-500/30",
  },
  {
    icon: AlertTriangle,
    title: "The Safety Status Quo is Broken",
    description: "Compliance-heavy culture, lagging indicators, reactive safety trap",
    details: ["Why traditional safety approaches are failing", "The cost of reactive vs proactive safety", "Breaking free from the compliance trap"],
    color: "from-orange-500/20 to-red-500/10",
    accent: "border-orange-500/30",
  },
  {
    icon: Award,
    title: "Skills for the Digital Age",
    description: "Digital literacy, AI/data awareness, adaptive intelligence, communication skills",
    details: ["The digital competency framework for safety leaders", "Building AI and data awareness without coding", "Adaptive intelligence and future-ready thinking"],
    color: "from-lime-500/20 to-lime-600/10",
    accent: "border-lime-500/30",
  },
  {
    icon: Smartphone,
    title: "Safetytech Applications",
    description: "Wearables, IoT, drones, mobile-first systems, computer vision",
    details: ["IoT sensors for real-time hazard monitoring", "Wearable technology for worker safety", "Drones and computer vision in the field"],
    color: "from-lime-500/20 to-lime-600/10",
    accent: "border-lime-500/30",
  },
  {
    icon: Wrench,
    title: "Digital Safety Toolkit",
    description: "Reporting apps, AI writing, automation, QR codes",
    details: ["AI-powered reporting and documentation", "Automating routine safety processes", "Mobile-first digital tools for the field"],
    color: "from-lime-500/20 to-lime-600/10",
    accent: "border-lime-500/30",
  },
  {
    icon: Database,
    title: "Data Strategy",
    description: "Data collection, centralisation, cleaning, analysis; pitfalls & benefits",
    details: ["Building a safety data strategy from scratch", "Common data pitfalls and how to avoid them", "Turning safety data into actionable insights"],
    color: "from-blue-500/20 to-blue-600/10",
    accent: "border-blue-500/30",
  },
  {
    icon: Sparkles,
    title: "AI Essentials for Safety",
    description: "AI history, ML, NLP, LLMs, computer vision, agentic AI, real-world cases",
    details: ["Understanding ML, NLP, and LLMs in plain language", "Real-world AI applications in EHS", "The future of agentic AI in safety"],
    color: "from-purple-500/20 to-purple-600/10",
    accent: "border-purple-500/30",
  },
  {
    icon: Shield,
    title: "Compliance & Governance",
    description: "Digital compliance, regulation, governance frameworks, ethical AI",
    details: ["Navigating digital safety regulations", "Building governance frameworks for AI use", "Ethical considerations in safety technology"],
    color: "from-lime-500/20 to-lime-600/10",
    accent: "border-lime-500/30",
  },
  {
    icon: Rocket,
    title: "Transformation Framework",
    description: "ROI, executive influence, linking safety to business performance",
    details: ["Building a compelling business case for Safety 4.0", "Influencing executive decision-makers", "Measuring ROI and demonstrating impact"],
    color: "from-lime-500/20 to-lime-600/10",
    accent: "border-lime-500/30",
  },
];

const benefits = [
  { icon: Brain, title: "Learn AI, IoT, & SafetyTech", subtitle: "without coding", description: "Master cutting-edge safety technologies through practical, hands-on training designed for safety professionals." },
  { icon: Award, title: "IOSH & CPD Recognized", subtitle: "certification", description: "Earn globally recognized credentials that demonstrate your expertise in digital safety leadership." },
  { icon: Rocket, title: "Future-proof your career", subtitle: "in hours", description: "Transform your safety career with skills that make you indispensable in the digital age." },
  { icon: Users, title: "Global safety leader", subtitle: "community", description: "Join an exclusive network of forward-thinking safety professionals worldwide." },
  { icon: PlayCircle, title: "Masterclass Sessions", subtitle: "with experts", description: "Learn from industry leaders through exclusive masterclass sessions covering advanced Safety 4.0 strategies." },
  { icon: UserCheck, title: "1:1 Mentoring", subtitle: "personalized guidance", description: "Receive personalized coaching and mentorship to accelerate your digital safety transformation journey." },
];

const Syllabus = () => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [brochureOpen, setBrochureOpen] = useState(false);

  useEffect(() => {
    setPageSEO({
      title: "Curriculum — Safety 4.0 Academy | IOSH Approved Programme",
      description: "Explore the full Safety 4.0 curriculum: 10 modules covering AI, IoT, SafetyTech, data strategy, and digital leadership. IOSH approved & CPD accredited.",
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
              The <span className="text-lime-400">Curriculum</span>
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

      {/* WHY THIS PROGRAMME */}
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

      {/* MODULE BREAKDOWN */}
      <section className="py-16 md:py-24 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              10 Modules. <span className="text-lime-400">One Transformation.</span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Each module builds on the last, taking you from foundational concepts to leading organisational change.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-3">
            {modules.map((m, i) => {
              const Icon = m.icon;
              const isExpanded = expandedModule === i;
              return (
                <button
                  key={i}
                  onClick={() => setExpandedModule(isExpanded ? null : i)}
                  className={`w-full text-left rounded-xl border transition-all duration-300 ${
                    isExpanded
                      ? `bg-white/[0.06] ${m.accent} shadow-lg`
                      : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4 p-5">
                    {/* Module number */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold tabular-nums ${
                      isExpanded ? "bg-lime-500 text-black" : "bg-white/10 text-white"
                    } transition-colors duration-300`}>
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-white">{m.title}</h3>
                      <p className="text-sm text-gray-400 mt-0.5 truncate">{m.description}</p>
                    </div>

                    <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                      isExpanded ? "rotate-180 text-lime-400" : ""
                    }`} />
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                  }`}>
                    <div className="px-5 pb-5 pt-1">
                      <div className="pl-14 space-y-2">
                        {m.details.map((detail, di) => (
                          <div key={di} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
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
