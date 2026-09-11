import { useEffect, useRef, useState } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import { supabase } from "@/integrations/supabase/client";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
  cpd_hours?: number;
  price_cents: number;
  cover_image_url?: string;
}

const PAGES = [
  "cover",
  "toc",
  "about",
  "flagship1",
  "flagship2",
  "courses1",
  "courses2",
  "accreditations",
  "whychoose",
  "outcomes",
  "cta",
  "contact",
];

const BrochureInteractive = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const brochureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Premium Academy Brochure — SafetyTech Academy",
      description: "Interactive premium brochure featuring industry-leading courses in AI and Safety 4.0.",
      canonical: "https://safetytech.academy/brochure",
    });
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setCourses(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load courses:", err);
      toast.error("Failed to load courses");
      setLoading(false);
    }
  };

  const copilotCourse = courses.find(c => c.title.toLowerCase().includes("copilot"));
  const otherCourses = courses.filter(c => !c.title.toLowerCase().includes("copilot"));

  const downloadPDF = async () => {
    toast.info("Preparing PDF download...");
    // We'll create a downloadable version from the full content
  };

  const nextPage = () => {
    if (currentPage < PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#69697b]">Loading premium brochure...</p>
        </div>
      </div>
    );
  }

  const renderPage = (pageType: string) => {
    switch (pageType) {
      case "cover":
        return (
          <div className="bg-gradient-to-br from-primary via-[#2a2ad6] to-[#1a1a9c] text-white p-20 text-center h-full flex flex-col justify-center items-center">
            <div className="space-y-6 max-w-2xl">
              <div>
                <div className="text-6xl font-bold mb-4">SafetyTech</div>
                <div className="text-4xl font-light mb-8">Academy</div>
              </div>
              <p className="text-2xl font-light opacity-90">Transform Your EHS Career with AI & Safety 4.0</p>
              <div className="pt-8 space-y-3 opacity-75">
                <p>Industry-Leading Professional Development</p>
                <p>IOSH-Approved Certifications</p>
                <p>Microsoft Copilot for EHS Mastery</p>
              </div>
              <div className="pt-12 text-base opacity-50">
                <p>2024–2025 Professional Development Catalog</p>
              </div>
            </div>
          </div>
        );

      case "toc":
        return (
          <div className="bg-slate-50 p-16 h-full overflow-auto">
            <h2 className="text-3xl font-bold text-[#0b0b2c] mb-12">Contents</h2>
            <div className="space-y-3 text-[#69697b]">
              <p className="flex justify-between"><span>About SafetyTech Academy</span> <span>3</span></p>
              <p className="flex justify-between"><span>Flagship: Copilot for EHS & Sustainability</span> <span>4-5</span></p>
              <p className="flex justify-between"><span>Professional Development Portfolio</span> <span>6-8</span></p>
              <p className="flex justify-between"><span>Accreditations & Certifications</span> <span>9</span></p>
              <p className="flex justify-between"><span>Learning Outcomes & Impact</span> <span>10</span></p>
              <p className="flex justify-between"><span>Why Choose SafetyTech Academy</span> <span>11</span></p>
              <p className="flex justify-between"><span>Enrollment & Contact</span> <span>12</span></p>
            </div>
          </div>
        );

      case "about":
        return (
          <div className="p-16 h-full overflow-auto">
            <h2 className="text-3xl font-bold text-[#0b0b2c] mb-8">About SafetyTech Academy</h2>
            <div className="space-y-6 text-[#69697b] leading-relaxed">
              <p>
                SafetyTech Academy is the industry's premier destination for professional development in Environmental, Health & Safety (EHS) combined with cutting-edge AI and digital transformation expertise.
              </p>
              <p>
                We empower safety leaders to navigate and master the future of workplace safety through innovative programs that blend traditional safety excellence with emerging technologies.
              </p>
              <div className="pt-6 grid grid-cols-3 gap-8 text-center bg-white rounded-lg p-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <p className="text-sm">Professionals Trained</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">15+</div>
                  <p className="text-sm">Certifications & Programs</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">12</div>
                  <p className="text-sm">Industry Awards</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "flagship1":
        return (
          <div className="bg-gradient-to-r from-primary to-[#2a2ad6] text-white p-16 h-full overflow-auto">
            <div className="mb-8">
              <div className="inline-block bg-yellow-400 text-[#0b0b2c] px-4 py-2 rounded-full font-bold mb-6 text-sm">
                ★ FLAGSHIP PROGRAM ★
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-6">{copilotCourse?.title}</h2>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              {copilotCourse?.description}
            </p>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="font-bold mb-2">⚡ Real-World AI Application</p>
                <p className="text-sm opacity-90">Master Microsoft Copilot to automate safety workflows</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="font-bold mb-2">🧠 AI Literacy for EHS</p>
                <p className="text-sm opacity-90">Understand AI fundamentals and leverage them in safety operations</p>
              </div>
            </div>
          </div>
        );

      case "flagship2":
        return (
          <div className="bg-gradient-to-r from-primary to-[#2a2ad6] text-white p-16 h-full overflow-auto">
            <h2 className="text-3xl font-bold mb-8">Why Copilot Transforms EHS</h2>
            <div className="space-y-4 mb-8">
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="font-bold mb-2">📈 Proven Results</p>
                <p className="text-sm opacity-90">40% improvement in compliance • 35% faster incident response • 2.5x ROI</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="font-bold mb-2">🎓 Comprehensive Training</p>
                <p className="text-sm opacity-90">{copilotCourse?.cpd_hours || 40} CPD Hours • Expert instructors • Lifetime community access</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="font-bold mb-2">💼 Enterprise-Ready</p>
                <p className="text-sm opacity-90">IOSH-approved • Recognized by 500+ organizations • Career-advancing credential</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              Investment: £{(copilotCourse?.price_cents ?? 0 / 100).toFixed(0)}
            </div>
          </div>
        );

      case "courses1":
      case "courses2":
        const pageIndex = pageType === "courses1" ? 0 : 1;
        const coursesToShow = otherCourses.slice(pageIndex * 2, (pageIndex + 1) * 2);
        return (
          <div className="p-16 h-full overflow-auto">
            <h2 className="text-3xl font-bold text-[#0b0b2c] mb-8">
              {pageIndex === 0 ? "Professional Development Portfolio" : "More Programs"}
            </h2>
            <div className="space-y-8">
              {coursesToShow.map((course) => (
                <div key={course.id} className="border-l-4 border-primary pl-6 pb-6">
                  <h3 className="text-2xl font-bold text-[#0b0b2c] mb-3">{course.title}</h3>
                  <p className="text-[#69697b] mb-4">{course.description}</p>
                  <div className="flex gap-8 text-sm font-bold text-primary">
                    {course.cpd_hours && <div>CPD: {course.cpd_hours} hrs</div>}
                    <div>£{(course.price_cents / 100).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "accreditations":
        return (
          <div className="bg-slate-50 p-16 h-full overflow-auto">
            <h2 className="text-3xl font-bold text-[#0b0b2c] mb-12 text-center">Accreditations & Standards</h2>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div className="bg-white p-8 rounded-lg">
                <div className="text-4xl mb-4">🛡️</div>
                <p className="font-bold text-[#0b0b2c] mb-2">IOSH Approved</p>
                <p className="text-sm text-[#69697b]">Institution of Occupational Safety & Health</p>
              </div>
              <div className="bg-white p-8 rounded-lg">
                <div className="text-4xl mb-4">🏆</div>
                <p className="font-bold text-[#0b0b2c] mb-2">CPD Certified</p>
                <p className="text-sm text-[#69697b]">Continuous Professional Development</p>
              </div>
              <div className="bg-white p-8 rounded-lg">
                <div className="text-4xl mb-4">⭐</div>
                <p className="font-bold text-[#0b0b2c] mb-2">Industry Standard</p>
                <p className="text-sm text-[#69697b]">Recognized by 500+ Organizations</p>
              </div>
            </div>
          </div>
        );

      case "whychoose":
        return (
          <div className="p-16 h-full overflow-auto">
            <h2 className="text-3xl font-bold text-[#0b0b2c] mb-8">Why Choose SafetyTech?</h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: "⚡", title: "Expert Instructors", desc: "20+ years of combined EHS expertise" },
                { icon: "📈", title: "Proven Track Record", desc: "85% graduates see career advancement" },
                { icon: "🧠", title: "Future-Ready", desc: "AI, automation, digital transformation" },
                { icon: "👥", title: "Community Support", desc: "Lifetime peer network access" },
                { icon: "🎓", title: "Flexible Learning", desc: "Self-paced, live, or hybrid models" },
                { icon: "🏅", title: "Certified Value", desc: "Industry-recognized globally" },
              ].map((item, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-lg border border-slate-200">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <p className="font-bold text-[#0b0b2c] mb-2">{item.title}</p>
                  <p className="text-sm text-[#69697b]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "outcomes":
        return (
          <div className="bg-slate-50 p-16 h-full overflow-auto">
            <h2 className="text-3xl font-bold text-[#0b0b2c] mb-8 text-center">Learning Outcomes & Impact</h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { stat: "85%", label: "Career Advancement", desc: "Promotion or role expansion" },
                { stat: "40%", label: "Compliance Improvement", desc: "Safety metrics increase" },
                { stat: "35%", label: "Incident Response", desc: "Time reduction average" },
                { stat: "2.5x", label: "Average ROI", desc: "Within 18 months" },
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-lg border-l-4 border-primary">
                  <div className="text-4xl font-bold text-primary mb-2">{item.stat}</div>
                  <p className="font-bold text-[#0b0b2c] mb-1">{item.label}</p>
                  <p className="text-sm text-[#69697b]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "cta":
        return (
          <div className="bg-gradient-to-r from-primary to-[#2a2ad6] text-white p-16 h-full flex flex-col justify-center items-center text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your EHS Career?</h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl">
              Join 50,000+ safety professionals who have elevated their expertise with SafetyTech Academy
            </p>
            <div className="space-y-3 bg-white/10 p-8 rounded-lg backdrop-blur">
              <p className="text-2xl font-bold">Start Your Journey Today</p>
              <p className="opacity-75">Limited spots available for current cohort</p>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="bg-slate-900 text-white p-16 h-full flex flex-col justify-center items-center text-center">
            <p className="text-4xl font-bold mb-4">SafetyTech Academy</p>
            <p className="text-lg opacity-75 mb-8">Transforming EHS Leaders for the Future</p>
            <div className="space-y-4 bg-slate-800 p-8 rounded-lg">
              <p className="font-semibold">Get Started</p>
              <p className="text-2xl text-primary font-bold">hello@safetyacademy.tech</p>
              <p className="text-sm opacity-75">www.safetytech.academy</p>
              <p className="text-xs opacity-50 mt-6">© 2024 SafetyTech Academy. All rights reserved.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <AudienceNav />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0b0b2c]">Premium Academy Brochure</h1>
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#2a2ad6] transition-colors text-sm"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>

        {/* Brochure Viewer */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Page Display */}
          <div
            ref={brochureRef}
            className="bg-white w-full"
            style={{
              minHeight: "600px",
              perspective: "1000px",
              transition: "transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            }}
          >
            {renderPage(PAGES[currentPage])}
          </div>

          {/* Controls */}
          <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-6 py-2 bg-primary rounded-lg hover:bg-[#2a2ad6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="text-center">
              <p className="text-lg font-semibold">
                Page {currentPage + 1} of {PAGES.length}
              </p>
              <div className="flex gap-1 mt-2">
                {PAGES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === currentPage ? "bg-primary" : "bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === PAGES.length - 1}
              className="flex items-center gap-2 px-6 py-2 bg-primary rounded-lg hover:bg-[#2a2ad6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-[#69697b]">
          <p>💡 Tip: Use the Previous/Next buttons to flip through pages, or download the full PDF for sharing</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BrochureInteractive;
