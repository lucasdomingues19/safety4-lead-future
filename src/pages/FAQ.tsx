import AudienceNav from "@/components/AudienceNav";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import { trackPageView } from "@/utils/analytics";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { setPageSEO } from "@/utils/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "FAQ — SafetyTech Academy",
      description: "Answers on our eLearning, Accelerator cohort, In-Company training, IOSH certification and pricing.",
      canonical: "https://safetytech.academy/faq",
    });
  }, []);

  const categories = [
    {
      title: "General",
      faqs: [
        { question: "What is SafetyTech Academy?", answer: "SafetyTech Academy is the world's first IOSH-approved and CPD-accredited training programme focused on digital safety leadership. It integrates technologies like AI, IoT, and data analytics into workplace safety management, using predictive analytics and smart technologies to prevent incidents before they occur." },
        { question: "Is this program IOSH and CPD certified?", answer: "Yes. We are an approved training provider by IOSH (Institution of Occupational Safety and Health) and CPD (Continuing Professional Development). Your certification is recognised globally by employers and professional bodies." },
        { question: "Who is it designed for?", answer: "Senior EHS professionals in leadership roles — Managers, Heads of Safety, Directors, VPs, Regional/Global Leads, and Consultants responsible for safety strategy." },
        { question: "Do I need technical skills?", answer: "No. We start with fundamentals and gradually build your digital safety expertise. Basic computer literacy and familiarity with safety concepts is all you need." },
        { question: "What if I'm not satisfied?", answer: "We offer a 14-day money-back guarantee. If you're not completely satisfied within the first 14 days, we'll provide a full refund — no questions asked." },
        { question: "Is there support after completion?", answer: "Yes. Graduates join the Safety 4.0 Leaders Network with lifetime access to updates, quarterly webinars, networking events, and priority access to advanced courses." },
      ],
    },
    {
      title: "eLearning",
      faqs: [
        { question: "How does the eLearning work?", answer: "It's a self-paced online programme with 60+ video lessons, interactive assessments, case studies, and downloadable resources. It typically takes 8 hours to complete, and you have 90 days to finish the course. You also get lifetime access to the platform and community." },
        { question: "How much does it cost?", answer: "£497 (reduced from £697). Includes IOSH & CPD certification, 10 core modules, 60+ video lessons, and email support." },
      ],
    },
    {
      title: "Safety 4.0 Accelerator",
      faqs: [
        { question: "What is the Accelerator and how is it different from eLearning?", answer: "The Accelerator is a 6-week live cohort programme that includes everything in the eLearning plus 7 live sessions led by Lucas Domingues, a peer cohort of 10–15 professionals, group projects, and direct access to expert guidance." },
        { question: "How much time do I need each week?", answer: "Expect 3–4 hours per week: 90 minutes for the live session, 1–2 hours of on-demand content, and some reflection time. All live sessions are recorded if you miss one." },
        { question: "How much does it cost and can my employer pay?", answer: "£1,997 +VAT per person (reduced from £2,497). We support PO/invoice billing for employer-sponsored enrolments. Mention this in your application and we'll handle the paperwork." },
        { question: "When is the next cohort?", answer: "The next cohort runs 2nd September – 14th October, 2026. Cohorts run monthly — if September fills, you'll be offered a place on the next available one." },
      ],
    },
    {
      title: "In-Company Training",
      faqs: [
        { question: "Can the content be customised for our organisation?", answer: "Yes. While the core curriculum is IOSH-approved, live sessions and case studies are tailored to your sector — construction, manufacturing, energy, logistics, and others. We also support flexible scheduling around your team." },
        { question: "How does this fit alongside existing NEBOSH/IOSH training?", answer: "Safety 4.0 complements your existing development. NEBOSH and IOSH qualifications cover safety management fundamentals; Safety 4.0 covers the digital and AI capability layer those qualifications don't yet address." },
        { question: "Can we get a proposal without committing?", answer: "Absolutely. Book a 30-minute discovery call — it's a conversation, not a sales pitch. You'll receive a tailored written proposal within 48 hours with no obligation. Group discounts are available for 5+ employees." },
      ],
    },
  ];

  // Flatten for structured data
  const allFaqs = categories.flatMap((cat) =>
    cat.faqs.map((f) => ({ question: f.question, answer: f.answer }))
  );

  return (
    <>
      <SEOStructuredData type="faq" faqItems={allFaqs} />
      <div className="min-h-screen bg-white">
        <AudienceNav />

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Back Navigation */}
          <div className="mb-12">
            <Button variant="default" size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </a>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-[1.05]">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Everything you need to know about eLearning, the Accelerator, and In-Company training
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-12">
            {categories.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-2xl font-bold text-primary mb-6 border-b border-slate-200 pb-3">
                  {category.title}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${catIndex}-${faqIndex}`} className="border-slate-200">
                      <AccordionTrigger className="text-base font-semibold text-slate-900 text-left hover:no-underline py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Still Have Questions CTA */}
          <div className="max-w-4xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Still Have Questions?</h2>
              <p className="text-lg text-slate-600 mb-8">
                Can't find what you're looking for? Our team is here to help you make the right decision for your safety career.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
                  <a href="/contact">Contact Our Team</a>
                </Button>
                <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6" asChild>
                  <a href="https://scheduler.zoom.us/lucas-domingues/30-mins-with-lucas-safety-4-0-academy" target="_blank" rel="noopener noreferrer">Schedule a Call</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQ;
