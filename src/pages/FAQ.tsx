import AudienceNav from "@/components/AudienceNav";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import { trackPageView } from "@/utils/analytics";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { setPageSEO } from "@/utils/seo";
import { faqCategories, allFaqs } from "@/data/faqs";
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
      canonical: "https://www.safetytech.academy/faq",
    });
  }, []);

  const categories = faqCategories;


  return (
    <>
      <SEOStructuredData type="faq" faqItems={allFaqs} />
      <div className="min-h-screen bg-white">
        <AudienceNav />

        <div className="container mx-auto px-4 py-20 relative z-10">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 tracking-tight leading-[1.05]">
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
