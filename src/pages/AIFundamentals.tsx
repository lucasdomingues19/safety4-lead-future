import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";
import {
  ArrowRight, ArrowLeft, Sparkles, Clock, Award, Tablet, CheckCircle,
  Brain, Bot, Lightbulb, ShieldAlert, MessageSquare, Users, Briefcase,
  UserCheck, Compass, BookOpen, Zap, PlayCircle, FileDown,
} from "lucide-react";

const CHECKOUT_URL = "https://learning.safetyacademy.tech/offers/osRfeBFj/checkout";

const AIFundamentals = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "AI Fundamentals in EHS | Safety 4.0 Academy",
      description:
        "Build the AI literacy every modern EHS professional needs in 90 minutes. Practical, no jargon — actionable skills you can use immediately.",
      canonical: "https://safetyacademy.tech/ai-fundamentals",
    });
  }, []);

  return (
    <div className="min-h-screen relative bg-white">
      <AudienceNav />

      <div className="container mx-auto px-4 pt-28 md:pt-32">
        <Button variant="default" size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </Button>
      </div>

      {/* HERO */}
      <section className="pt-8 pb-16 md:pt-10 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-flex items-center gap-2 px-3 py-1.5 rounded-md mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                NEW · 90-MINUTE COURSE
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.05]">
                AI Fundamentals in <span className="text-primary">EHS</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-4">
                Build the AI literacy every modern EHS professional needs in just 90 minutes.
                Practical. No jargon. No buzzwords. Just actionable skills you can start using immediately.
              </p>
              <p className="text-base text-slate-600 max-w-xl mx-auto">
                Trusted by EHS leaders at Carrier, PepsiCo, P&amp;G, Siemens, ABB, LEGO and Marsh.
              </p>
            </div>

            {/* Key Benefits Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
              {[
                { icon: Clock, label: "90 Minutes", desc: "On-demand, bite-sized" },
                { icon: PlayCircle, label: "5 Modules", desc: "Practical & actionable" },
                { icon: Award, label: "Certificate", desc: "Issued on completion" },
                { icon: Tablet, label: "Any Device", desc: "Desktop, tablet, mobile" },
              ].map((b, i) => (
                <div key={i} className="rounded-xl border border-primary/20 bg-primary/[0.06] p-5 text-center">
                  <b.icon className="w-7 h-7 text-primary mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-900">{b.label}</div>
                  <div className="text-xs text-slate-600 mt-1">{b.desc}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-full hover:bg-primary/90 transition-colors active:scale-[0.97]"
              >
                Start Learning — £72
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-medium text-lg rounded-full border border-slate-300 hover:bg-slate-100 transition-colors active:scale-[0.97]"
              >
                <FileDown className="w-5 h-5" />
                Talk to Us
              </a>
            </div>
            <p className="text-center text-sm text-slate-500">
              Founding price — only available to the first 100 learners. 7-day money-back guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL LEARN */}
      <section className="py-12 md:py-16 px-4 border-t border-slate-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">WHAT YOU'LL LEARN</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-4">
              Confidently apply AI in <span className="text-primary">EHS</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              By the end of this course you'll be able to:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Brain, title: "Understand AI in EHS", desc: "Grasp what AI is and how it applies directly to environment, health and safety." },
              { icon: Bot, title: "Use AI Tools Responsibly", desc: "Apply AI in your workflows effectively, ethically and with the right guardrails." },
              { icon: Lightbulb, title: "Spot Practical Use Cases", desc: "Identify opportunities that save time and improve decision-making across your function." },
              { icon: ShieldAlert, title: "Recognise Risks & Limits", desc: "Understand the common risks, biases and limitations of AI in a safety context." },
              { icon: MessageSquare, title: "Write Better Prompts", desc: "Craft effective prompts that consistently produce better, more usable results." },
              { icon: Zap, title: "Start Using It Immediately", desc: "Walk away with real skills you can apply from day one — no theory-only fluff." },
            ].map((item, i) => (
              <div key={i} className="group rounded-2xl border border-slate-200 bg-white shadow-sm p-6 hover:border-primary/50 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-12 md:py-16 px-4 border-t border-slate-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">WHAT'S INCLUDED</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-4">
              Everything you need to <span className="text-primary">get started</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              "90-minute on-demand course",
              "5 practical learning modules",
              "Downloadable SafetyTech glossary",
              "Ready-to-use prompt library",
              "Certificate of Completion by Safety 4.0 Academy",
              "Access from desktop, tablet or mobile",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-slate-800 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="py-12 md:py-16 px-4 border-t border-slate-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">WHO IS IT FOR?</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-4">
              Built for EHS professionals<br />
              <span className="text-primary">curious about AI</span>.
            </h2>
            <p className="text-lg text-slate-700 max-w-xl mx-auto">
              No previous AI knowledge required. Just bring your curiosity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: UserCheck, title: "EHS Advisors, Coordinators & Supervisors", desc: "Ground-level practitioners who want to bring AI into their day-to-day work." },
              { icon: Users, title: "EHS Managers", desc: "Team leaders looking to introduce AI-driven ways of working across their function." },
              { icon: Briefcase, title: "EHS Heads, Directors & Above", desc: "Senior leaders wanting a clear, jargon-free view of AI's role in modern safety." },
              { icon: Compass, title: "EHS Consultants", desc: "Advisors who need to speak the AI language fluently with clients and stakeholders." },
              { icon: BookOpen, title: "Career Changers into EHS", desc: "Anyone stepping into safety who wants to arrive ready for the digital age." },
              { icon: Sparkles, title: "Anyone Curious About AI in EHS", desc: "If you're wondering where to start with AI in safety — this is your starting line." },
            ].map((item, i) => (
              <div key={i} className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm p-6 hover:border-primary/50 transition-all duration-500">
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-[15px] font-bold text-slate-900 mb-2">{item.title}</div>
                <div className="text-sm text-slate-600 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="py-12 md:py-16 px-4 border-t border-slate-200">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-8 md:p-10 text-center">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
              7-Day Money-Back Guarantee
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Start the course. If you genuinely don't believe you've gained value, contact us within
              7 days for a full refund. No questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-6">
              Get AI-ready in <span className="text-primary">90 minutes</span>
            </h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Join EHS professionals from leading organisations who are building the practical AI
              skills that modern safety demands.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-full hover:bg-primary/90 transition-colors active:scale-[0.97]"
              >
                Start Learning — £72
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/elearning"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-medium text-lg rounded-full border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                Explore Safety 4.0
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Founding price — only available to the first 100 learners.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIFundamentals;
