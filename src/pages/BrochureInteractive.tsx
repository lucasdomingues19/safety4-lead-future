import { useEffect } from "react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";

const BrochureInteractive = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "SafetyTech Academy Brochure",
      description: "Premium brochure featuring industry-leading courses in AI and Safety 4.0.",
      canonical: "https://safetytech.academy/brochure",
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-[#2a2ad6] to-[#1a1a9c] flex flex-col">
      <AudienceNav />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="text-center text-white max-w-2xl">
          <h1 className="text-5xl font-bold mb-6">SafetyTech Academy Brochure</h1>
          <p className="text-2xl mb-8 opacity-90">Premium digital brochure coming soon</p>
          <p className="text-lg opacity-75 mb-12">
            We're designing a beautiful, premium brochure experience for you. Check back soon!
          </p>
          <a
            href="/courses"
            className="inline-block px-8 py-3 bg-yellow-400 text-[#0b0b2c] font-bold rounded-lg hover:bg-yellow-300 transition-colors"
          >
            Explore Our Courses
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrochureInteractive;
