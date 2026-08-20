import { useEffect } from "react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";
import { CourseHero } from "@/components/course/CourseHero";
import { CourseReviews } from "@/components/course/CourseReviews";
import { RelatedCourses } from "@/components/course/RelatedCourses";
import badgeAIFundamentals from "@/assets/badge-ai-fundamentals.png";
import iconAIFundamentals from "@/assets/icon-ai-fundamentals.png";
import { testimonials } from "@/components/SocialProofSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2, Clock, PlayCircle, Award, Tablet,
  Brain, Bot, Lightbulb, ShieldAlert, MessageSquare, Users, Briefcase,
  UserCheck, Compass, BookOpen, Zap, Sparkles,
} from "lucide-react";

const CHECKOUT_URL = "https://learning.safetytech.academy/offers/osRfeBFj/checkout";

const reviews = testimonials.filter((t) => ["Dan Warnock", "Shebin Abraham"].includes(t.name));

const AIFundamentals = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "AI Fundamentals in EHS | SafetyTech Academy",
      description:
        "Build the AI literacy every modern EHS professional needs in 90 minutes. Practical, no jargon — actionable skills you can use immediately.",
      canonical: "https://safetytech.academy/ai-fundamentals",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <CourseHero
        eyebrow="NEW · 90-MINUTE COURSE"
        title={<>AI Fundamentals in <span className="text-primary">EHS</span></>}
        subtitle="Build the AI literacy every modern EHS professional needs in just 90 minutes. Practical. No jargon. No buzzwords. Just actionable skills you can start using immediately."
        features={[
          { icon: PlayCircle, label: "5 Practical Modules" },
          { icon: BookOpen, label: "Prompt Library" },
          { icon: Award, label: "Certificate" },
          { icon: Tablet, label: "Any Device" },
        ]}
        icon={iconAIFundamentals}
        badgeSrc={badgeAIFundamentals}
        price="£97"
        meta={[
          { icon: Clock, label: "Level", value: "Beginner" },
          { icon: PlayCircle, label: "Duration", value: "90 minutes" },
          { icon: BookOpen, label: "Modules", value: "5" },
          { icon: Award, label: "Certificate", value: "Included" },
        ]}
        cta={{ label: "Start Learning — £97", href: CHECKOUT_URL, external: true }}
        secondaryCta={{ label: "Talk to Us", href: "/contact" }}
        guarantee="7-day money-back guarantee"
      />

      <div className="container mx-auto px-4 max-w-4xl pb-20">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="h-auto p-1 bg-slate-100 rounded-lg mb-10">
            <TabsTrigger value="about" className="text-sm px-5 py-2.5 rounded-md">About the Course</TabsTrigger>
            <TabsTrigger value="content" className="text-sm px-5 py-2.5 rounded-md">Course Content</TabsTrigger>
            <TabsTrigger value="reviews" className="text-sm px-5 py-2.5 rounded-md">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-14 mt-0">
            <div>
              <h2 className="mb-4">Confidently apply AI in EHS</h2>
              <p className="text-[#69697b] leading-relaxed">
                No previous AI knowledge required. Just bring your curiosity. By the end of this course you'll be able to:
              </p>
              <div className="grid sm:grid-cols-2 gap-5 mt-6">
                {[
                  { icon: Brain, title: "Understand AI in EHS", desc: "Grasp what AI is and how it applies directly to environment, health and safety." },
                  { icon: Bot, title: "Use AI Tools Responsibly", desc: "Apply AI in your workflows effectively, ethically and with the right guardrails." },
                  { icon: Lightbulb, title: "Spot Practical Use Cases", desc: "Identify opportunities that save time and improve decision-making." },
                  { icon: ShieldAlert, title: "Recognise Risks & Limits", desc: "Understand common risks, biases and limitations of AI in a safety context." },
                  { icon: MessageSquare, title: "Write Better Prompts", desc: "Craft effective prompts that consistently produce better, usable results." },
                  { icon: Zap, title: "Start Using It Immediately", desc: "Walk away with real skills you can apply from day one." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <div className="text-sm font-bold text-slate-900 mb-1">{item.title}</div>
                      <div className="text-sm text-[#69697b] leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4">Who is it for?</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { icon: UserCheck, title: "EHS Advisors & Supervisors", desc: "Ground-level practitioners who want to bring AI into their day-to-day work." },
                  { icon: Users, title: "EHS Managers", desc: "Team leaders introducing AI-driven ways of working across their function." },
                  { icon: Briefcase, title: "EHS Heads & Directors", desc: "Senior leaders wanting a clear, jargon-free view of AI's role in safety." },
                  { icon: Compass, title: "EHS Consultants", desc: "Advisors who need to speak the AI language with clients and stakeholders." },
                  { icon: BookOpen, title: "Career Changers into EHS", desc: "Anyone stepping into safety who wants to arrive ready for the digital age." },
                  { icon: Sparkles, title: "Anyone Curious About AI", desc: "Wondering where to start with AI in safety? This is your starting line." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <div className="text-sm font-bold text-slate-900 mb-1">{item.title}</div>
                      <div className="text-sm text-[#69697b] leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            <h2 className="mb-6">What's included</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                "90-minute on-demand course",
                "5 practical learning modules",
                "Downloadable SafetyTech glossary",
                "Ready-to-use prompt library",
                "Certificate of Completion by SafetyTech Academy",
                "Access from desktop, tablet or mobile",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-800 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <h2 className="mb-6">What learners say</h2>
            <CourseReviews reviews={reviews} />
          </TabsContent>
        </Tabs>
      </div>

      {/* FAQ */}
      <section className="py-16 md:py-20 px-4 border-t border-slate-200">
        <div className="container mx-auto max-w-3xl">
          <h2 className="mb-8 text-center">Questions? Answered.</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "Do I need any AI experience to take this course?", a: "No. The course is designed for EHS professionals with little or no AI background. We explain concepts in plain language and focus on practical application, not theory." },
              { q: "How long do I have access to the course?", a: "You get lifetime access to the course materials, including any future updates we make to the AI Fundamentals in EHS curriculum." },
              { q: "Is the certificate recognised by employers?", a: "You will receive a Certificate of Completion issued by SafetyTech Academy, an approved training provider by IOSH. It demonstrates practical AI literacy in an EHS context." },
              { q: "Can my employer pay for this course?", a: "Yes. At checkout you can use a company card or request an invoice. Many learners expense this as professional development." },
              { q: "What is the time commitment?", a: "The course is 90 minutes in total, split into 5 short modules. You can complete it in one sitting or across multiple sessions." },
              { q: "Is there a money-back guarantee?", a: "Yes. If you are not satisfied, contact us within 7 days of purchase for a full refund — no questions asked." },
              { q: "Will this teach me to build AI systems?", a: "No. This course focuses on using AI tools responsibly and effectively in EHS workflows — not coding or building models." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`ai-faq-${i}`} className="border-slate-200">
                <AccordionTrigger className="text-base font-semibold text-slate-900 text-left hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#69697b] leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <RelatedCourses currentHref="/ai-fundamentals" />

      <Footer />
    </div>
  );
};

export default AIFundamentals;
