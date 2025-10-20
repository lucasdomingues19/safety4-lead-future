import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useState } from "react";

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Safety 4.0 and how is it different from traditional safety programs?",
      answer: "Safety 4.0 represents the integration of digital technologies like AI, IoT, and data analytics into workplace safety management. Unlike traditional safety programs that rely on reactive measures, Safety 4.0 uses predictive analytics and smart technologies to prevent incidents before they occur. Our program is the first globally to combine IOSH certification with cutting-edge digital safety methodologies."
    },
    {
      question: "Is this program really IOSH and CPD certified?",
      answer: "Yes, absolutely. We are fully accredited by both IOSH (Institution of Occupational Safety and Health) and CPD (Continuing Professional Development). This means your certification will be recognized globally by employers and professional bodies. You'll receive 40 hours of CPD credits upon completion."
    },
    {
      question: "Who should take this program?",
      answer: "This program is designed for safety professionals, managers, engineers, and consultants who want to advance their careers in the digital age. Whether you're a Safety Officer, HSE Manager, Risk Analyst, or Safety Consultant, this program will give you the skills to lead in Industry 4.0 environments."
    },
    {
      question: "How long does the program take to complete?",
      answer: "The program is designed to be completed in 12 weeks with approximately 3-4 hours of study per week. However, it's self-paced, so you can complete it faster if you dedicate more time, or take longer if needed. You have 6 months access to all materials from enrollment."
    },
    {
      question: "What technology skills do I need to get started?",
      answer: "No advanced technical skills are required to start. We begin with fundamentals and gradually build your digital safety expertise. Basic computer literacy and familiarity with safety concepts is all you need. Our program is designed to take professionals from any technical background and make them Safety 4.0 ready."
    },
    {
      question: "What kind of career advancement can I expect?",
      answer: "98% of our graduates report significant career advancement within 12 months. This includes promotions to senior safety roles, salary increases averaging 25-40%, and new opportunities in digital safety consulting. Many graduates become Safety 4.0 champions in their organizations."
    },
    {
      question: "Is there ongoing support after completion?",
      answer: "Yes! Graduates join our exclusive Safety 4.0 Leaders Network with lifetime access to updates, quarterly webinars, networking events, and career advancement resources. You'll also receive priority access to advanced specialized courses and certifications."
    },
    {
      question: "What if I'm not satisfied with the program?",
      answer: "We offer a 30-day money-back guarantee. If you're not completely satisfied with the program within the first 30 days, we'll provide a full refund, no questions asked. We're confident in the value and quality of our training."
    },
    {
      question: "Can my company enroll multiple employees?",
      answer: "Absolutely! We offer corporate packages with group discounts starting at 5+ employees. Corporate clients also receive additional benefits like customized content, on-site training options, and dedicated support. Contact us for a customized corporate training proposal."
    },
    {
      question: "How is the program delivered?",
      answer: "The program is delivered through our advanced online learning platform with interactive modules, video lectures, practical exercises, and real-world case studies. You'll also have access to live Q&A sessions, peer discussion forums, and one-on-one mentoring sessions."
    }
  ];

  return (
    <>
    <div className="min-h-screen relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating elements - Purple and Lime */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Purple blob - Top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-600/20 to-violet-500/15 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        
        {/* Lime blob - Top right */}
        <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        
        {/* Purple blob - Bottom left */}
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/15 via-purple-500/20 to-purple-400/10 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
        
        {/* Lime blob - Bottom right */}
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-lime-500/15 via-lime-400/20 to-lime-600/10 blur-3xl animate-[float_28s_ease-in-out_infinite_reverse]"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Back Navigation */}
        <div className="mb-12">
          <Button variant="outline" size="sm" asChild className="border-white/30 text-white hover:bg-white/10">
            <a href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Frequently Asked <span className="text-pink-500">Questions</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Everything you need to know about the Safety 4.0 Academy program
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
              >
                <button
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                  {openFAQ === index ? (
                    <Minus className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Still Have Questions CTA */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-gradient-to-r from-pink-500/20 to-lime-500/20 rounded-3xl p-12 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Still Have Questions?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Can't find what you're looking for? Our team is here to help you make the right decision for your safety career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6">
                <a href="/contact">Contact Our Team</a>
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                Schedule a Call
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