import { useEffect } from "react";
import AudienceNav from "@/components/AudienceNav";
import { CoursePreviewSection } from "@/components/CoursePreviewSection";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import {
  ArrowRight, FileDown, BookOpen, Award, Rocket, Users, Brain, UserCheck, PlayCircle,
  Layers, BarChart3, Cpu, ShieldCheck, Wrench, Database, Bot, Scale, TrendingUp, Compass,
  Shield, Globe, Zap, Clock, Infinity, CheckCircle, Tablet, GraduationCap
} from "lucide-react";

const Syllabus = () => {
  useEffect(() => {
    setPageSEO({
      title: "eLearning — IOSH-approved Safety 4.0 Course",
      description: "Self-paced, IOSH-approved eLearning. Master AI, IoT, SafetyTech and digital leadership at your own pace. CPD accredited.",
      canonical: "https://safetyacademy.tech/elearning",
    });
  }, []);

  return (
    <div className="min-h-screen relative bg-white">
      <AudienceNav />

      {/* HERO */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-[11px] tracking-[3px] font-bold text-primary mb-4">IOSH APPROVED · CPD ACCREDITED&nbsp;</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Safety 4.0 - <span className="text-primary">Leading Safety in the Digital Age</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4">
                The world's first IOSH-approved eLearning programme for safety professionals 
                ready to master AI, IoT, and digital transformation — at their own pace.
              </p>
              <p className="text-base text-slate-600 max-w-xl mx-auto">
                Flexible. Self-paced. Lifelong access. Complete in 30 days.
              </p>
            </div>

            {/* Key Benefits Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
              {[
                { icon: Clock, label: "Self-Paced", desc: "Learn on your schedule" },
                { icon: Infinity, label: "Lifelong Access", desc: "Materials yours forever" },
                { icon: Award, label: "IOSH & CPD Certified", desc: "Globally recognised" },
                { icon: GraduationCap, label: "90-Day Programme", desc: "Complete at your pace" },
              ].map((b, i) => (
                <div key={i} className="rounded-xl border border-primary/20 bg-primary/[0.06] p-5 text-center">
                  <b.icon className="w-7 h-7 text-primary mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-900">{b.label}</div>
                  <div className="text-xs text-slate-600 mt-1">{b.desc}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a
                href="https://safetyacademy.mykajabi.com/offers/E2ZXsoXV"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-full hover:bg-primary/90 transition-colors active:scale-[0.97]"
              >
                Start Learning — £597
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="https://learning.safetyacademy.tech/brochure"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-medium text-lg rounded-full border border-slate-300 hover:bg-slate-100 transition-colors active:scale-[0.97]"
              >
                <FileDown className="w-5 h-5" />
                Download Brochure
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-16 px-4 border-t border-slate-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block text-[10px] tracking-[3px] text-primary font-bold mb-4">WHAT'S INCLUDED</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Lead in <span className="text-primary">Safety 4.0</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              { icon: PlayCircle, title: "60+ Video Lessons", desc: "Studio-recorded, on-demand content covering all 10 modules" },
              { icon: BookOpen, title: "Downloadable Resources", desc: "Templates, frameworks, and toolkits you can use immediately" },
              { icon: CheckCircle, title: "Interactive Assessments", desc: "Test your knowledge and earn your IOSH & CPD certification" },
              { icon: Brain, title: "Real-World Case Studies", desc: "Learn from organisations already implementing Safety 4.0" },
              { icon: Tablet, title: "Mobile App Access", desc: "Learn anywhere — desktop, tablet, or mobile" },
              { icon: Shield, title: "Email Support", desc: "Get help when you need it throughout your learning journey" },
            ].map((item, i) => (
              <div key={i} className="group rounded-2xl border border-slate-200 bg-white shadow-sm p-6 hover:border-primary/50 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 MODULES CURRICULUM */}
      <section className="py-16 px-4 border-t border-slate-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block text-[10px] tracking-[3px] text-primary font-bold mb-4">10 MODULES · 60+ LESSONS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              A Modern <span className="text-primary">Curriculum</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Each module builds on the last — from foundational concepts to strategic leadership.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { num: "01", icon: Compass, title: "Introduction & Orientation", desc: "Course overview, objectives, CPD & IOSH value, learner expectations.", color: "text-primary" },
              { num: "02", icon: Layers, title: "What is Safety 4.0?", desc: "Definition of Safety 4.0, triangle (People, Processes, Tech), role of data, 4th Industrial Revolution.", color: "text-primary" },
              { num: "03", icon: BarChart3, title: "The Safety Status Quo is Broken", desc: "Compliance-heavy culture, lagging indicators, reactive safety trap.", color: "text-primary" },
              { num: "04", icon: Brain, title: "Skills for the Safety Leader in the Digital Age", desc: "Digital literacy, AI/data awareness, adaptive intelligence, communication skills.", color: "text-primary" },
              { num: "05", icon: Wrench, title: "Safetytech Practical Applications", desc: "Wearables, IoT, drones, mobile-first systems, computer vision.", color: "text-primary" },
              { num: "06", icon: Cpu, title: "Building your Digital Safety Toolkit", desc: "Practical day-to-day tools: reporting apps, AI writing, automation, QR codes.", color: "text-primary" },
              { num: "07", icon: Database, title: "Data Strategy: From Chaos to Clarity", desc: "Data collection, centralisation, cleaning, analysis; pitfalls & benefits.", color: "text-primary" },
              { num: "08", icon: Bot, title: "AI Essentials for Safety Leaders", desc: "AI history, ML, NLP, LLMs, CV, agentic AI, real-world cases, myths & risks.", color: "text-primary" },
              { num: "09", icon: Scale, title: "Compliance, Risk & Governance Essentials", desc: "Digital compliance, regulation, governance frameworks, ethical AI.", color: "text-primary" },
              { num: "10", icon: TrendingUp, title: "Digital Safety Transformation Framework", desc: "ROI, executive influence, linking safety to business performance.", color: "text-primary" },
            ].map((mod, i) => {
              const Icon = mod.icon;
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm p-6 hover:border-primary/50 transition-all duration-500"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15 group-hover:scale-110 transition-transform duration-500">
                        <Icon className={`w-5 h-5 ${mod.color}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] tracking-[2px] font-bold mb-1.5 ${mod.color}`}>MODULE {mod.num}</div>
                      <h3 className="text-[15px] font-bold text-slate-900 mb-2 leading-snug">{mod.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{mod.desc}</p>
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
              <div key={i} className="rounded-xl border border-primary/20 bg-primary/[0.06] p-5">
                <div className="text-2xl font-black text-primary">{s.val}</div>
                <div className="text-sm text-slate-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="py-20 px-4 border-t border-slate-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">WHO IS IT FOR?</div>
          <h2 className="font-syne text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
            Built for senior EHS leaders<br />
            <span className="text-primary">ready to lead in the digital age</span>.
          </h2>
          <p className="text-lg text-slate-700 max-w-xl mb-12">
            This programme is designed for experienced safety professionals who want to future-proof their leadership and drive measurable change.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: "EHS Directors & Heads of Safety", desc: "Leading safety strategy and looking to integrate AI, data, and digital tools into your function." },
              { icon: Users, title: "Senior Safety Managers", desc: "Managing teams and processes, ready to champion Safety 4.0 across your organisation." },
              { icon: Globe, title: "Regional / Global EHS Leads", desc: "Overseeing multi-site operations and seeking scalable digital safety solutions." },
              { icon: Zap, title: "Safety Consultants & Advisors", desc: "Advising clients on modern safety practices and wanting to add Safety 4.0 to your toolkit." },
              { icon: Award, title: "Operational Leaders with EHS Remit", desc: "COOs, VPs of Operations, or Plant Managers responsible for safety performance and transformation." },
              { icon: BookOpen, title: "EHS Professionals Seeking Certification", desc: "Experienced practitioners wanting an IOSH & CPD-approved credential in digital safety leadership." },
            ].map((item, i) => (
              <div key={i} className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm p-6 hover:border-primary/50 transition-all duration-500">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-syne text-[15px] font-bold text-slate-900 mb-2">{item.title}</div>
                <div className="text-sm text-slate-600 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CoursePreviewSection />

      {/* Final CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Start Your Safety 4.0 Journey <span className="text-primary">Today</span>
            </h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Join safety professionals from Siemens, LEGO, Marsh, and organisations across 12 countries 
              who are already transforming their careers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://safetyacademy.mykajabi.com/offers/E2ZXsoXV"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-full hover:bg-primary/90 transition-colors active:scale-[0.97]"
              >
                Start Learning — £597
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/accelerator"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-medium text-lg rounded-full border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                Explore Accelerator
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Syllabus;
