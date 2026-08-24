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
import heroCopilotCourse from "@/assets/hero-copilot-course.jpg";
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
    title: "1. Foundations of AI for EHS",
    body: "What Copilot is and is not, where it fits in safety work, and the Assurative AI standard that keeps a competent person accountable for every output. Sets the mindset for the whole program.",
  },
  {
    title: "2. Prompting with GRACE",
    body: "The GRACE framework (Ground, Role, Artefact, Constraints, Evidence) for writing reliable, source-grounded prompts. Participants practise on real EHS tasks and learn why weak prompts produce unsafe output.",
  },
  {
    title: "3. Copilot Chat for safety work + image and video generation",
    body: "Using Copilot Chat to draft, summarise, and interrogate safety information. Grounding responses in work data, checking sources, and the data-handling rules for confidential and personal information. Learn prompt techniques to create custom images and videos on safety topics.",
  },
  {
    title: "4. Working with your own EHS documents",
    body: "Applying Copilot to participants' own material: summarising incident reports, drafting risk assessments and toolbox talks, and turning raw notes into structured records, always under human review.",
  },
  {
    title: "5. Copilot in Word and Outlook",
    body: "Drafting, editing, and reviewing safety documents in Word, and managing safety correspondence, actions, and follow-ups in Outlook. Practical time-saving on everyday reporting and communication.",
  },
  {
    title: "6. Copilot in Excel for incident data",
    body: "Using Copilot in Excel to analyse incident and inspection data, surface trends, and build leading and lagging indicators. Reading results critically rather than taking them at face value.",
  },
  {
    title: "7. Copilot in PowerPoint and Teams",
    body: "Turning safety data and findings into clear presentations for leadership and shop floor, and using Copilot in Teams to capture actions and summarise safety meetings.",
  },
  {
    title: "8. Built-in agents: Researcher and Analyst",
    body: "Using Microsoft's built-in Researcher and Analyst agents for deeper safety research and data analysis, with the review discipline to trust the output appropriately.",
  },
  {
    title: "9. Introduction to Cowork and Skills",
    body: "Copilot Cowork and skills for longer multi-step tasks.",
  },
  {
    title: "10. Introduction to Copilot Studio",
    body: "An introduction to Copilot Studio and Agent Builder: how a simple EHS agent is built, scoped, and bounded, with hard-stop rules so it never operates outside its competence.",
  },
  {
    title: "11. AI risk, compliance and governance",
    body: "The governance and data rules that keep AI use compliant and safe.",
  },
  {
    title: "12. Your 30-day plan",
    body: "A personal 30-day plan so every participant leaves with a concrete path to applying what they learned.",
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
          { icon: Calendar, label: "12 Modules" },
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
        <div className="relative max-w-6xl mx-auto rounded-[24px] overflow-hidden">
          <img
            src={heroCopilotCourse}
            alt="Microsoft Copilot working across Word, Excel, PowerPoint, Teams and OneNote"
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 flex items-center">
            <p className="text-slate-900 font-bold leading-snug max-w-[46%] pl-4 sm:pl-8 md:pl-12 text-xs sm:text-lg md:text-2xl lg:text-3xl">
              "You have the tool, now make your EHS & sustainability function competent."
            </p>
          </div>
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
                principle runs through all twelve modules, so the AI makes your team faster without your people
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
                  "Twelve live modules, paced for hands-on practice",
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
                  "Self-paced twelve-module library",
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

      {/* The twelve modules */}
      <section className="py-10 md:py-14 border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="mb-2 text-center">The twelve modules</h2>
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
                  {m.body}
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
          <h2 className="mb-2 text-center">See the return for your team</h2>
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
