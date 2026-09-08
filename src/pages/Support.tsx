import { useState } from "react";
import { Search, ChevronDown, MessageCircle, Mail, Phone, FileText, HelpCircle, Send } from "lucide-react";
import { LmsChat } from "@/components/LmsChat";

const Support = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [chatOpen, setChatOpen] = useState(false);

  const style = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
  `;

  const faqs = [
    {
      id: 1,
      question: "How do I access my courses?",
      answer: "Once you enroll in a course, you can access it from your dashboard or the 'My Courses' page. You'll have lifetime access to all course materials.",
    },
    {
      id: 2,
      question: "Can I download course videos?",
      answer: "Course videos can be streamed online, but downloads are not available to protect intellectual property. However, you have lifetime access to stream them anytime.",
    },
    {
      id: 3,
      question: "How long do I have access to a course?",
      answer: "You have lifetime access to all courses you enroll in. There is no expiration date, and you can review the materials as many times as you need.",
    },
    {
      id: 4,
      question: "How do I get my certificate?",
      answer: "Certificates are automatically generated when you complete 100% of the course lessons. You can download your certificate from your dashboard.",
    },
    {
      id: 5,
      question: "What if I need a refund?",
      answer: "We offer a 7-day money-back guarantee for all paid courses. Please contact support with your order details to request a refund.",
    },
    {
      id: 6,
      question: "How can I contact support?",
      answer: "You can reach us through email (support@safetytech.com), phone (+1-800-SAFETY-1), or submit a support ticket below. We respond within 24 hours.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        body, html { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* Accent bar */}
      <div className="fixed left-0 top-0 w-1 h-screen" style={{ backgroundColor: "#3434FF" }}></div>

      {/* Header */}
      <div className="px-8 py-12 ml-1" style={{ backgroundColor: "#F7F7FB" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-3" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: "-0.5px" }}>
            How Can We Help?
          </h1>
          <p className="text-lg mb-10" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400, lineHeight: 1.6 }}>
            Find answers to your questions or reach out to our support team
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5" style={{ color: "#69697B" }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 bg-white focus:outline-none"
              style={{ borderColor: "#ECECF4", color: "#0B0B2C" }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-12 ml-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Options */}
          {[
            { icon: Mail, title: "Email Support", desc: "support@safetytech.com", value: "Email us" },
            { icon: Phone, title: "Phone Support", desc: "+1-800-SAFETY-1", value: "Call us" },
            { icon: MessageCircle, title: "Chat Support", desc: "Available 9AM-5PM EST", value: "Live chat" },
          ].map((option, i) => {
            const Icon = option.icon;
            return (
              <div key={i} className="rounded-2xl p-7 text-center hover:shadow-xl transition-all hover:translate-y-[-2px]" style={{ backgroundColor: "#F7F7FB", border: "1px solid #ECECF4", borderLeft: "4px solid #3434FF" }}>
                <div className="flex justify-center mb-5">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(52, 52, 255, 0.1)" }}>
                    <Icon className="w-7 h-7" style={{ color: "#3434FF" }} />
                  </div>
                </div>
                <h3 className="font-bold mb-2" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontSize: "18px", fontWeight: 700 }}>
                  {option.title}
                </h3>
                <p className="text-sm mb-5" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                  {option.desc}
                </p>
                <button
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-all hover:shadow-lg"
                  style={{ backgroundColor: "#3434FF", color: "#FFFFFF", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                >
                  {option.value}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-3xl font-bold mb-8" style={{ color: "#0B0B2C" }}>
            Frequently Asked Questions
          </h2>

          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-lg border-2 overflow-hidden"
                  style={{ borderColor: "#ECECF4" }}
                >
                  <button
                    onClick={() =>
                      setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                    }
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="font-bold" style={{ color: "#0B0B2C" }}>
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform flex-shrink-0`}
                      style={{
                        color: "#69697B",
                        transform: expandedFaq === faq.id ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  {expandedFaq === faq.id && (
                    <div
                      className="border-t p-6"
                      style={{ borderColor: "#ECECF4", backgroundColor: "#F7F7FB" }}
                    >
                      <p style={{ color: "#69697B", lineHeight: "1.6" }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#69697B" }} />
              <p style={{ color: "#69697B" }}>
                No results found. Try a different search term.
              </p>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div className="mt-16 rounded-2xl border-2 p-8" style={{ borderColor: "#ECECF4", backgroundColor: "#F7F7FB" }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#0B0B2C" }}>
            Still Need Help?
          </h2>
          <p className="mb-6" style={{ color: "#69697B" }}>
            Send us a message and we'll get back to you within 24 hours.
          </p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#0B0B2C" }}>
                Subject
              </label>
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) =>
                  setContactForm({ ...contactForm, subject: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#ECECF4",
                  color: "#0B0B2C",
                  focusRingColor: "#3434FF",
                }}
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#0B0B2C" }}>
                Message
              </label>
              <textarea
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#ECECF4",
                  color: "#0B0B2C",
                }}
                placeholder="Tell us more about your issue..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
              style={{ background: "#3434FF" }}
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 hover:shadow-xl z-40"
        style={{ background: "#3434FF", fontFamily: "'Poppins', sans-serif" }}
        title="Chat with AI Assistant"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Chat Widget */}
      {chatOpen && (
        <LmsChat
          userRole="student"
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
};

export default Support;
