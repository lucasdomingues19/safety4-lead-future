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
      title: "Safety 4.0 Academy FAQ | eLearning, Accelerator & In-Company Training",
      description: "Frequently asked questions about the Safety 4.0 Academy. Learn about our eLearning course, Accelerator cohort, In-Company training, IOSH certification, pricing and more.",
      canonical: "https://safetyacademy.tech/faq",
    });
  }, []);

  const categories = [
    {
      title: "General",
      faqs: [
        { question: "What is Safety 4.0 and how is it different from traditional safety programs?", answer: "Safety 4.0 represents the integration of digital technologies like AI, IoT, and data analytics into workplace safety management. Unlike traditional safety programs that rely on reactive measures, Safety 4.0 uses predictive analytics and smart technologies to prevent incidents before they occur. Our program is the first globally to combine IOSH certification with cutting-edge digital safety methodologies." },
        { question: "Is this program really IOSH and CPD certified?", answer: "Yes, absolutely. We are fully accredited by both IOSH (Institution of Occupational Safety and Health) and CPD (Continuing Professional Development). This means your certification will be recognized globally by employers and professional bodies. You'll receive 8+ hours of CPD credits upon completion." },
        { question: "Who should take this program?", answer: "This program is designed for senior EHS professionals at managerial, head of, director and VP levels." },
        { question: "What technology skills do I need to get started?", answer: "No advanced technical skills are required to start. We begin with fundamentals and gradually build your digital safety expertise. Basic computer literacy and familiarity with safety concepts is all you need. Our program is designed to take professionals from any technical background and make them Safety 4.0 ready." },
        { question: "What kind of career advancement can I expect?", answer: "Our graduates usually become Safety 4.0 champions in their organisations. The IOSH and CPD approval means that your credentials are recognised globally, opening new opportunities in the job market." },
        { question: "Is there ongoing support after completion?", answer: "Yes! Graduates join our exclusive Safety 4.0 Leaders Network with lifetime access to updates, quarterly webinars, networking events, and career advancement resources. You'll also receive priority access to advanced specialized courses and certifications." },
        { question: "What if I'm not satisfied with the program?", answer: "We offer a 14-day money-back guarantee. If you're not completely satisfied with the program within the first 14 days, we'll provide a full refund, no questions asked. We're confident in the value and quality of our training." },
      ],
    },
    {
      title: "eLearning",
      faqs: [
        { question: "How long does the eLearning program take to complete?", answer: "The online course is self-paced and usually takes 8 hours to be completed. You have 12-month access to all materials." },
        { question: "How is the eLearning program delivered?", answer: "The program is delivered through our advanced online learning platform with interactive modules, video lectures, practical exercises, and real-world case studies. You'll also have access to downloadable resources and email support." },
        { question: "How much does the eLearning cost?", answer: "The eLearning programme is £597 (reduced from £697). This includes IOSH & CPD certification, 10 core modules, 2 bonus masterclasses, 50+ video lessons, downloadable resources, interactive assessments, and 12-month access to materials." },
      ],
    },
    {
      title: "Safety 4.0 Accelerator",
      faqs: [
        { question: "What is the Safety 4.0 Accelerator?", answer: "The Safety 4.0 Accelerator is a 4-week live cohort programme designed to help senior EHS professionals lead in the digital age. It combines 60+ on-demand lessons with 5 live sessions led by Lucas Domingues, a peer cohort of 10–15 professionals, and direct access to expert guidance. You'll earn an IOSH-approved, CPD-accredited certificate — the world's first in Safety 4.0." },
        { question: "Who is the Accelerator for?", answer: "The programme is built for experienced EHS professionals in leadership roles — EHS Directors, Heads of Safety, Senior Safety Managers, Regional/Global Leads, Consultants, and Operational Leaders with an EHS remit. If you're responsible for safety strategy and want to integrate AI, data, and digital tools into your function, this is for you." },
        { question: "Can I do the eLearning instead?", answer: "Yes. If the live cohort format isn't right for you, you can access the same IOSH-approved course content as a self-paced eLearning programme for £597. You'll get all 60+ lessons and the same certification — just without the live sessions, peer cohort, and direct access to Lucas." },
        { question: "How much time do I need to commit each week?", answer: "Expect 3–4 hours per week: 90 minutes for the live session, 1–2 hours of on-demand content, and some reflection/application time. The programme is designed for working professionals." },
        { question: "What if I miss a live session?", answer: "All live sessions are recorded and available in your dashboard within 24 hours. You'll never fall behind — but showing up live is where the peer discussion happens and where the real value is built." },
        { question: "Can my employer pay via invoice?", answer: "Yes. We support PO/invoice billing for employer-sponsored enrolments and team places. Mention this in your application and we'll handle the paperwork. We're used to working within procurement processes." },
        { question: "Is this relevant if my team is small or I work alone?", answer: "Absolutely. The programme is designed for safety professionals at all levels — from sole EHS advisors to heads of large safety functions. The peer cohort gives you a team experience even if you're working solo in your organisation." },
        { question: "When is the next cohort after April 2026?", answer: "Cohorts run monthly. If April fills before your application is processed, you'll be offered a place on the next available cohort." },
        { question: "How much does the Accelerator cost?", answer: "The Accelerator is £997 +VAT per person (reduced from £1,497). This includes everything in the eLearning plus 4-week live cohort program, weekly live sessions with the instructor, peer networking, group projects, live Q&A, career coaching, priority support, and exclusive community membership." },
      ],
    },
    {
      title: "In-Company Training",
      faqs: [
        { question: "How does in-company delivery work around our team's schedule?", answer: "The programme is designed for working professionals. Live sessions are scheduled around your team, and all 60+ video lessons are on-demand. The full programme is delivered in 4 weeks, spending 3–4 hours per week on average." },
        { question: "Can the content be customised for our sector?", answer: "Yes. While the core curriculum is standardised and IOSH-approved, live sessions and case studies are tailored to your sector — construction, manufacturing, energy, logistics, and others." },
        { question: "What does IOSH approval actually mean for our compliance?", answer: "IOSH is the world's largest professional body for health and safety practitioners. An IOSH-approved programme meets rigorous standards for content, delivery, and assessment." },
        { question: "We already have NEBOSH/IOSH training budgets. How does this fit?", answer: "Safety 4.0 complements, not replaces, your existing development. NEBOSH and IOSH qualifications cover safety management fundamentals. Safety 4.0 covers the digital and AI capability layer that those qualifications don't yet address." },
        { question: "What happens after the programme ends?", answer: "Participants retain lifetime access to course materials and join the Safety 4.0 alumni community — a network of certified EHS leaders from 12+ countries." },
        { question: "Can we get a proposal without committing to anything?", answer: "Absolutely. The 30-minute discovery call is a conversation, not a sales pitch. You'll receive a tailored written proposal within 48 hours. No obligation." },
        { question: "Can my company enroll multiple employees?", answer: "Absolutely! We offer corporate packages with group discounts starting at 5+ employees. Corporate clients also receive additional benefits like customized content, on-site training options, and dedicated support. Contact us for a customized corporate training proposal." },
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
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-black"></div>
        <AudienceNav />

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-600/20 to-violet-500/15 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
          <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/15 via-purple-500/20 to-purple-400/10 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-lime-500/15 via-lime-400/20 to-lime-600/10 blur-3xl animate-[float_28s_ease-in-out_infinite_reverse]"></div>
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Back Navigation */}
          <div className="mb-12">
            <Button variant="outline" size="sm" asChild className="border-border text-foreground hover:bg-muted">
              <a href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </a>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Everything you need to know about eLearning, the Accelerator, and In-Company training
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-12">
            {categories.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
                  {category.title}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${catIndex}-${faqIndex}`} className="border-border">
                      <AccordionTrigger className="text-base font-semibold text-foreground text-left hover:no-underline py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
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
            <div className="bg-gradient-to-r from-pink-500/20 to-primary/20 rounded-3xl p-12 border border-border">
              <h2 className="text-3xl font-bold text-foreground mb-6">Still Have Questions?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Can't find what you're looking for? Our team is here to help you make the right decision for your safety career.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6">
                  <a href="/contact">Contact Our Team</a>
                </Button>
                <Button variant="outline" className="border-border text-foreground hover:bg-muted text-lg px-8 py-6" asChild>
                  <a href="https://calendly.com/lucas-getshield360/30min" target="_blank" rel="noopener noreferrer">Schedule a Call</a>
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
