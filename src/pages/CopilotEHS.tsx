import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";
import { CourseHero } from "@/components/course/CourseHero";
import { RelatedCourses } from "@/components/course/RelatedCourses";
import { CopilotROICalculator } from "@/components/CopilotROICalculator";
import { CopilotWaitlistForm } from "@/components/CopilotWaitlistForm";
import badgeCopilot from "@/assets/badge-copilot.png";
import iconCopilot from "@/assets/icon-copilot.png";
import iconWord from "@/assets/icon-word.png";
import iconExcel from "@/assets/icon-excel.png";
import iconPowerpoint from "@/assets/icon-powerpoint.png";
import iconOutlook from "@/assets/icon-outlook.png";
import iconTeams from "@/assets/icon-teams.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2, Users, Calendar, Laptop, ShieldCheck, Target,
} from "lucide-react";

const modules = [
  {
    title: "1. AI Fundamentals for EHS Professionals",
    topics: [
      "What is AI and machine learning?",
      "How does Copilot work?",
      "Capabilities and limitations of current AI",
      "Practical applications in EHS",
      "Risk awareness and responsible use principles",
    ],
    practicalActivities: [
      "Test Copilot in a real EHS scenario",
      "Identify where AI adds value in your role",
      "Explore the limitations through practical examples",
    ],
  },
  {
    title: "2. Prompt Engineering for EHS",
    topics: [
      "The anatomy of effective prompts",
      "The GRACE framework: Ground, Role, Artefact, Constraints, Evidence",
      "Writing source-grounded prompts for safety-critical work",
      "Structuring prompts for accuracy and compliance",
      "Testing and iterating prompts",
    ],
    practicalActivities: [
      "Write and test 5 safety-critical prompts",
      "Apply the GRACE framework to an audit scenario",
      "Compare weak vs. strong prompts for risk assessment",
    ],
  },
  {
    title: "3. Copilot in Apps for EHS Productivity (Part 1)",
    topics: [
      "Copilot in Word: drafting policies, procedures, and reports",
      "Copilot in Excel: structuring data and spotting trends",
      "Copilot in Outlook: managing incident communications",
      "Copilot in Teams: facilitating safety conversations",
      "Assurative AI: draft, review, underwrite",
    ],
    practicalActivities: [
      "Draft an EHS policy using Copilot in Word",
      "Create a safety dashboard in Excel with Copilot assistance",
      "Compose an incident notification with Copilot in Outlook",
    ],
  },
  {
    title: "4. Copilot in Apps for EHS Productivity (Part 2)",
    topics: [
      "Copilot in PowerPoint: building safety presentations",
      "Copilot in OneNote: organizing safety knowledge",
      "Copilot in Loop: collaborative safety planning",
      "Cross-app workflows for incident response",
      "Building EHS playbooks with Copilot",
    ],
    practicalActivities: [
      "Create a safety campaign presentation in PowerPoint",
      "Build a searchable incident response knowledge base",
      "Design a cross-app workflow for near-miss reporting",
    ],
  },
  {
    title: "5. Notebook",
    topics: [
      "Microsoft Copilot for structured notes",
      "Recording and summarizing safety meetings",
      "Building searchable EHS knowledge repositories",
      "Organizing compliance documentation",
      "Integration with incident investigations",
    ],
    practicalActivities: [
      "Transcribe and summarize a safety meeting",
      "Organize a complex incident file with Copilot",
      "Create a searchable policy and procedure archive",
    ],
  },
  {
    title: "6. Copilot Cowork",
    topics: [
      "Collaborative AI for team safety initiatives",
      "Real-time safety meeting assistance",
      "Group problem-solving with Copilot",
      "Building consensus on risk controls",
      "Documenting collaborative decisions",
    ],
    practicalActivities: [
      "Run a safety meeting with Copilot Cowork live note-taking",
      "Facilitate a risk assessment workshop with AI support",
      "Create shared safety playbooks collaboratively",
    ],
  },
  {
    title: "7. Copilot Agents",
    topics: [
      "What are agents and why they matter for EHS?",
      "Researcher Agent for regulatory compliance",
      "Analyst Agent for data-driven safety decisions",
      "Custom agents for your EHS processes",
      "Integration with existing safety systems",
      "Governance and oversight of agentic workflows",
    ],
    practicalActivities: [
      "Use Researcher Agent to gather regulatory updates",
      "Apply Analyst Agent to safety trend data",
      "Design a custom agent for incident classification",
    ],
  },
  {
    title: "8. AI Risks, Ethics, Security and Governance",
    topics: [
      "AI hallucinations and how to prevent them in safety work",
      "Ethical use of AI in risk assessment and audits",
      "Data security and confidentiality with Copilot",
      "Regulatory compliance: EU AI Act Article 4 obligations",
      "Organizational AI governance for EHS",
      "Audit trails and accountability frameworks",
    ],
    practicalActivities: [
      "Conduct an AI risk assessment for your safety processes",
      "Build AI governance checkpoints into your EHS workflows",
      "Create an AI audit trail for compliance documentation",
    ],
  },
  {
    title: "9. Stay Copilot Confident",
    topics: [
      "Recognizing and managing AI-induced overconfidence",
      "Building healthy skepticism into safety workflows",
      "Verification and validation protocols",
      "Escalation triggers for high-risk decisions",
      "Keeping the human in the loop",
      "Continuous learning and skill adaptation",
    ],
    practicalActivities: [
      "Design a verification checklist for AI-assisted decisions",
      "Run a tabletop exercise with Copilot assistance",
      "Establish escalation protocols for your team",
    ],
  },
  {
    title: "10. Capstone Project: Copilot-Powered EHS Investigation & Improvement Programme",
    topics: [
      "Integrating Copilot across a complete EHS workflow",
      "Leading teams through AI-enabled transformation",
      "Building a business case for AI in safety",
      "Managing organizational change and adoption",
      "Measuring ROI and impact of Copilot initiatives",
      "Scaling AI across your EHS function",
    ],
    practicalActivities: [
      "Design a Copilot-powered incident investigation process",
      "Develop a 12-month AI implementation roadmap",
      "Present your EHS AI strategy to leadership",
      "Create implementation guides for your team",
    ],
  },
];

const CopilotEHS = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Microsoft Copilot for EHS & Sustainability | SafetyTech Academy",
      description:
        "Group training that turns Microsoft Copilot licences into genuine, audit-ready AI competence for EHS and sustainability teams — aligned to the EU AI Act Article 4 obligation.",
      canonical: "https://safetytech.academy/copilot-for-ehs",
    });
  }, []);

  // React Router doesn't auto-scroll to a hash target — do it manually so
  // the hero's "Join the Waitlist" CTA (an internal Link to #waitlist)
  // actually brings the form into view.
  useEffect(() => {
    if (location.hash === "#waitlist") {
      document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <CourseHero
        eyebrow="B2B GROUP TRAINING · LAUNCHING OCTOBER 2026"
        title={<>Microsoft Copilot for <span className="text-primary">EHS & Sustainability</span></>}
        subtitle="Your team already has the Copilot licence. Under the EU AI Act, organisations now have a legal duty to ensure adequate AI literacy — Article 4 has applied since February 2025, enforced from August 2026. This program builds the practical, audit-ready competence to use Copilot safely in risk assessments, incident reporting and compliance work."
        features={[
          { icon: Users, label: "Live or Self-Paced" },
          { icon: ShieldCheck, label: "Article 4 Aligned" },
          { icon: Calendar, label: "10 Modules" },
          { icon: Laptop, label: "365-Day Access" },
        ]}
        icon={iconCopilot}
        badgeSrc={badgeCopilot}
        price="Custom Pricing"
        period="per participant"
        meta={[
          { icon: Users, label: "Format", value: "Live cohort or self-paced" },
          { icon: Target, label: "Group size", value: "10–30+ participants" },
          { icon: Calendar, label: "Launch", value: "October 2026" },
        ]}
        cta={{ label: "Join the Waitlist", href: "/copilot-for-ehs#waitlist" }}
        secondaryCta={{ label: "Talk to Us", href: "/contact" }}
        guarantee="Live cohorts launch October 2026 — waitlist members get early access."
      />

      {/* Copilot across the everyday EHS toolkit */}
      <div className="container mx-auto px-4">
        <div
          className="relative max-w-6xl mx-auto rounded-[24px] overflow-hidden aspect-[890/344]"
          style={{ background: "linear-gradient(135deg, #f3e8ff 0%, #eef2ff 40%, #e0f2fe 70%, #dbeafe 100%)" }}
        >
          <div className="absolute inset-0 flex items-center">
            <p className="text-slate-900 font-bold leading-snug max-w-[46%] pl-4 sm:pl-8 md:pl-12 text-xs sm:text-lg md:text-2xl lg:text-3xl">
              "You have the tool, now make your EHS & sustainability function competent."
            </p>
          </div>

          {/* Copilot logo, centered in the right-hand two-thirds */}
          <img
            src={iconCopilot}
            alt="Microsoft Copilot"
            className="absolute w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 drop-shadow-xl"
            style={{ left: "70%", top: "47%", transform: "translate(-50%, -50%)" }}
          />

          {/* Floating Microsoft app icons — outer span handles position (left/top
              + centering translate), inner img handles the float animation, so
              the animation's own transform doesn't clobber the positioning one.
              Positions form a tight ring close around the Copilot logo (70%,47%),
              with vertical % offsets scaled up ~2.6x horizontal ones to compensate
              for the container's wide/short aspect ratio and read as a circle. */}
          <span className="absolute" style={{ left: "64%", top: "29%", transform: "translate(-50%, -50%) rotate(3deg)" }}>
            <img
              src={iconWord}
              alt="Microsoft Word"
              className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 drop-shadow-lg animate-float"
              style={{ animationDelay: "0s" }}
            />
          </span>
          <span className="absolute" style={{ left: "77%", top: "31%", transform: "translate(-50%, -50%) rotate(-2deg)" }}>
            <img
              src={iconExcel}
              alt="Microsoft Excel"
              className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 drop-shadow-lg animate-float"
              style={{ animationDelay: "2.5s" }}
            />
          </span>
          <span className="absolute" style={{ left: "79%", top: "47%", transform: "translate(-50%, -50%) rotate(2deg)" }}>
            <img
              src={iconTeams}
              alt="Microsoft Teams"
              className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 drop-shadow-lg animate-float"
              style={{ animationDelay: "5s" }}
            />
          </span>
          <span className="absolute" style={{ left: "62%", top: "63%", transform: "translate(-50%, -50%) rotate(-3deg)" }}>
            <img
              src={iconPowerpoint}
              alt="Microsoft PowerPoint"
              className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 drop-shadow-lg animate-float"
              style={{ animationDelay: "7.5s" }}
            />
          </span>
          <span className="absolute" style={{ left: "78%", top: "64%", transform: "translate(-50%, -50%) rotate(2deg)" }}>
            <img
              src={iconOutlook}
              alt="Microsoft Outlook"
              className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 drop-shadow-lg animate-float"
              style={{ animationDelay: "10s" }}
            />
          </span>
        </div>
      </div>

      {/* Assurative AI + GRACE */}
      <section className="py-10 md:py-14 border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="mb-8 text-center">How the program teaches AI safely</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-[20px] border border-slate-200 bg-white p-6">
              <ShieldCheck className="w-8 h-8 text-primary mb-4" strokeWidth={1.75} />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Assurative AI</h3>
              <p className="text-sm text-[#69697b] leading-relaxed">
                Copilot drafts and flags. A competent person reviews, corrects, and underwrites every output. This
                principle runs through all ten modules, so the AI makes your team faster without your people
                losing accountability for safety-critical work.
              </p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-6">
              <Target className="w-8 h-8 text-primary mb-4" strokeWidth={1.75} />
              <h3 className="text-lg font-bold text-slate-900 mb-2">The GRACE prompt framework</h3>
              <p className="text-sm text-[#69697b] leading-relaxed">
                Ground, Role, Artefact, Constraints, Evidence — a simple structure so participants write reliable,
                source-grounded prompts for safety-critical work from day one, instead of the vague prompts that
                produce unsafe output.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two ways to run the program */}
      <section className="py-10 md:py-14 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="mb-2 text-center">Two ways to run the program</h2>
          <p className="text-[#69697b] text-center max-w-2xl mx-auto mb-10">
            Pricing scales with group size, from 10 to 30+ participants. Join the waitlist and we'll confirm a
            quote for your team.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-[20px] border border-primary bg-white p-6 md:p-8">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-4">
                Full enablement
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Option A — Live Cohort Program</h3>
              <p className="text-sm text-[#69697b] leading-relaxed mb-5">
                The complete transformation program, delivered live in small cohorts of up to 10–15.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Ten live modules, paced for hands-on practice",
                  "Fundamentals of AI in EHS eLearning as a foundation",
                  "Weekly live office hours for the duration",
                  "Private community space for delegates",
                  "Session recordings, workbooks, 365-day access",
                  "Dedicated project manager to coordinate delivery",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-6 md:p-8">
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wide mb-4">
                Scalable foundation
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Option B — Self-Paced Program</h3>
              <p className="text-sm text-[#69697b] leading-relaxed mb-5">
                A lower-cost, self-directed route that scales easily across larger groups. Available from
                October/November 2026.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Fundamentals of AI in EHS eLearning",
                  "Self-paced ten-module library",
                  "Workbooks and a private community space",
                  "365-day access to all materials",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 mt-5">
                Delivers the same core content without the live modules, weekly office hours, or dedicated project
                manager. Often used as a scalable foundation for larger populations, or alongside a live cohort for
                the core team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The ten modules */}
      <section className="py-10 md:py-14 border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="mb-2 text-center">The ten modules</h2>
          <p className="text-[#69697b] text-center mb-10">
            The program moves from foundations to applied automation — core capability first, then Copilot across
            the day-to-day safety workflow, then agents and automation with the governance to use them safely.
          </p>
          <Accordion type="single" collapsible className="w-full bg-white rounded-[20px] border border-slate-200 px-2">
            {modules.map((m, i) => (
              <AccordionItem key={i} value={`module-${i}`} className={i === modules.length - 1 ? "border-b-0" : "border-slate-200"}>
                <AccordionTrigger className="text-base font-semibold text-slate-900 text-left hover:no-underline py-5 px-4">
                  {m.title}
                </AccordionTrigger>
                <AccordionContent className="text-[#69697b] leading-relaxed px-4">
                  {"body" in m ? (
                    m.body
                  ) : (
                    <div className="space-y-4">
                      {m.topics && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Topics</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {m.topics.map((topic, idx) => (
                              <li key={idx}>{topic}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {m.practicalActivities && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Practical Activities</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {m.practicalActivities.map((activity, idx) => (
                              <li key={idx}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="text-xs text-slate-400 text-center mt-6">
            Module content is reviewed and updated on a rolling basis to keep pace with Microsoft's monthly Copilot
            releases.
          </p>
        </div>
      </section>

      {/* ROI calculator */}
      <section className="py-10 md:py-14 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="mb-2 text-center">What's the return for your team?</h2>
          <p className="text-[#69697b] text-center max-w-2xl mx-auto mb-10">
            The training pays for itself quickly — even a conservative time saving adds up fast across a team.
            Enter your own numbers below.
          </p>
          <CopilotROICalculator />
        </div>
      </section>

      {/* Delivery details */}
      <section className="py-10 md:py-14 border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="mb-6 text-center">Delivery details</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {[
              "Live cohorts capped at 10–15 participants to preserve hands-on quality",
              "365 days' access to materials, recordings and the community space",
              "Self-paced content available from October/November 2026",
              "Live cohorts can begin sooner by arrangement",
              "Cohorts above 20 participants run as two groups",
              "Bespoke blends of live and self-paced available for larger populations",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-slate-800 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-10 md:py-14 border-t border-slate-200 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="mb-4">Ready to give your team real Copilot competence?</h2>
          <p className="text-[#69697b] leading-relaxed mb-8 max-w-xl mx-auto">
            Live cohorts launch October 2026. Join the waitlist for early access and a quote scaled to your team.
          </p>
          <CopilotWaitlistForm />
          <p className="text-sm text-[#69697b] mt-6">
            Prefer to talk it through first?{" "}
            <a href="/contact" className="text-primary underline hover:text-primary/80">Talk to us</a>.
          </p>
        </div>
      </section>

      <RelatedCourses currentHref="/copilot-for-ehs" />

      <Footer />
    </div>
  );
};

export default CopilotEHS;
