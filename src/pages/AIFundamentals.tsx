import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";

const AIFundamentals = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "AI Fundamentals in EHS | Safety 4.0 Academy",
      description:
        "Learn the fundamentals of AI for environment, health and safety. A practical introduction to using AI in EHS workflows.",
      canonical: "https://safetyacademy.tech/ai-fundamentals",
    });
  }, []);

  return (
    <>
      <div className="min-h-screen bg-white">
        <AudienceNav />

        <div className="container mx-auto px-4 py-20">
          {/* Back Navigation */}
          <div className="mb-12">
            <Button
              variant="default"
              size="sm"
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <a href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </a>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-mono text-xs uppercase tracking-[0.25em] mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              New Programme
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.05]">
              AI Fundamentals in{" "}
              <span className="text-primary">EHS</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              A practical introduction to using artificial intelligence in
              environment, health and safety workflows. Content for this
              programme is being finalised and will be available shortly.
            </p>
          </div>

          {/* Placeholder card */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-[hsl(222,47%,16%)] rounded-2xl p-8 md:p-12 text-center border border-white/10 shadow-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Coming Soon
              </h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                We are building the curriculum, resources and assessments for the
                AI Fundamentals in EHS programme. Check back shortly for the
                full course details, or join the waitlist to be notified first.
              </p>
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 px-10"
              >
                <a
                  href="https://learning.safetyacademy.tech/offers/osRfeBFj/checkout"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start Learning
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AIFundamentals;
