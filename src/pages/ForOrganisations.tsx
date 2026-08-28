import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";

export const ForOrganisations = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Build an AI-Ready EHS Function | SafetyTech Academy",
      description: "Transform your EHS team's capability. IOSH-approved training for organizations navigating AI and SafetyTech. Executive briefings to enterprise programs.",
      canonical: "https://safetytech.academy/for-organisations",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AudienceNav />

      {/* Hero Section */}
      <section className="py-28 md:py-40 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Build an AI-Ready
              <br />
              <span className="text-primary">EHS Function.</span>
            </h1>
            <p className="text-lg text-[#69697b] leading-relaxed max-w-2xl mx-auto mb-10">
              Practical Safety 4.0 capability building for EHS teams navigating AI, data and SafetyTech.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700">
                IOSH-Approved
              </span>
              <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700">
                EHS-Specific
              </span>
              <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700">
                Practical
              </span>
              <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700">
                Human-Led
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-10 md:py-14 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Does this sound familiar?</h2>
            <p className="text-lg text-[#69697b] leading-relaxed mb-8">
              Your organization is exploring AI, but your EHS team faces real obstacles:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            {[
              "Your organization is exploring AI, but EHS doesn't have a clear position on how it should be used",
              "Safety technology pilots are appearing across sites, but there's no common framework for evaluation",
              "Your safety team understands risk and compliance but has limited experience with AI, data or digital transformation",
              "AI tools are already being used informally, while governance is still catching up",
              "Leadership wants to 'do something with AI', but the EHS team isn't sure which problems technology should solve",
              "You're concerned about privacy, worker trust, monitoring, bias or over-reliance on automated systems",
            ].map((problem, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="text-slate-400 text-xl mt-1">•</div>
                <p className="text-[#69697b]">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-900">
            What changes when your EHS team becomes AI-ready
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Build a common digital language",
                description: "Your EHS team can confidently discuss AI, data and SafetyTech with IT, Digital, Operations and senior leadership.",
              },
              {
                title: "Identify better use cases",
                description: "Move from 'where can we use AI?' to identifying real safety problems where technology can add measurable value.",
              },
              {
                title: "Evaluate technology critically",
                description: "Understand capabilities, limitations, data requirements, implementation risks and human factors before investing.",
              },
              {
                title: "Strengthen AI governance in EHS",
                description: "Know where AI is being used, what requires oversight and where human judgment must remain in control.",
              },
              {
                title: "Lead adoption, not just deployment",
                description: "Prepare leaders to manage trust, behavior, workflow changes and workforce concerns around new technology.",
              },
              {
                title: "Build a practical transformation roadmap",
                description: "Translate learning into concrete priorities and next actions for your EHS function.",
              },
            ].map((outcome, idx) => (
              <div key={idx} className="flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">{outcome.title}</h3>
                  <p className="text-[#69697b] text-sm">{outcome.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-10 md:py-14 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-900">
            SafetyTech's Transformation Methodology
          </h2>
          <p className="text-lg text-[#69697b] leading-relaxed mb-12 max-w-2xl">
            From AI curiosity to responsible implementation. Our proven framework helps organizations build capability at every stage.
          </p>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              {
                step: "1",
                title: "Discover",
                description: "Understand your current digital maturity, skills, technology landscape and EHS priorities.",
              },
              {
                step: "2",
                title: "Design",
                description: "Identify valuable use cases and build the capabilities required to support them.",
              },
              {
                step: "3",
                title: "Govern",
                description: "Establish roles, oversight, risk controls and responsible-use principles.",
              },
              {
                step: "4",
                title: "Deploy",
                description: "Pilot technology with the people, processes and operational context in mind.",
              },
              {
                step: "5",
                title: "Scale",
                description: "Measure results, capture learning and develop repeatable capability.",
              },
            ].map((stage, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {stage.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{stage.title}</h3>
                <p className="text-sm text-slate-600">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Options */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-900">
            Training solutions for every organizational need
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Executive Briefing",
                duration: "90 minutes",
                audience: "C-suite, Board, Senior Leaders",
                description: "Equip leadership with AI governance, accountability and investment strategy for EHS.",
                features: ["Strategic overview", "Governance framework", "Investment case"],
              },
              {
                name: "AI Fundamentals for EHS",
                duration: "1 full day",
                audience: "EHS Teams",
                description: "Baseline knowledge on AI, SafetyTech and digital transformation in context.",
                features: ["Practical concepts", "Real-world use cases", "Governance basics"],
              },
              {
                name: "Safety 4.0 Leadership Programme",
                duration: "8 weeks",
                audience: "EHS Directors, Managers, Leaders",
                description: "Deep dive into AI literacy, data, SafetyTech evaluation and transformation leadership.",
                features: ["IOSH-approved", "Advanced topics", "Implementation planning"],
              },
            ].map((option, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all">
                <h3 className="font-bold text-slate-900 mb-2">{option.name}</h3>
                <p className="text-primary font-medium text-sm mb-3">{option.duration}</p>
                <p className="text-[#69697b] text-sm mb-4">{option.description}</p>
                <p className="text-xs font-medium text-slate-500 mb-4">{option.audience}</p>
                <ul className="space-y-2">
                  {option.features.map((feature, fi) => (
                    <li key={fi} className="flex gap-2 items-start text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border border-slate-200 rounded-lg p-8 bg-white">
            <h3 className="font-bold text-slate-900 mb-4">Enterprise & Bespoke Programmes</h3>
            <p className="text-[#69697b] mb-6">
              For organizations requiring tailored solutions: custom programmes designed around your specific tools, workflows, industry and timeline. From 6 weeks to 12+ months.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80"
            >
              Discuss your custom programme
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-14 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your EHS function?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Let's discuss your team's needs and design a programme that works for your organization.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-[22px] bg-white text-primary font-bold text-base uppercase tracking-[0.08em] rounded hover:bg-blue-50 transition-colors"
            >
              Discuss Team Training
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/assess-readiness"
              className="inline-flex items-center gap-2 px-8 py-[22px] border-2 border-white text-white font-bold text-base uppercase tracking-[0.08em] rounded hover:bg-blue-700 transition-colors"
            >
              Assess Your Readiness
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForOrganisations;
