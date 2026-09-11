import { useEffect, useRef, useState } from "react";
import { Download, Star, Users, Award, TrendingUp, Zap, Shield, Brain } from "lucide-react";
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

const Brochure = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const brochureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Academy Brochure — SafetyTech Academy",
      description: "Download our premium brochure featuring industry-leading courses in AI, Safety 4.0, and modern EHS leadership.",
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
    } catch (err) {
      console.error("Failed to load courses:", err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!brochureRef.current) return;

    try {
      setDownloading(true);
      const element = brochureRef.current;
      const opt = {
        margin: 5,
        filename: "SafetyTech-Academy-Premium-Brochure.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf().set(opt).from(element).save();
      toast.success("Premium brochure downloaded successfully!");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Failed to download brochure");
    } finally {
      setDownloading(false);
    }
  };

  const copilotCourse = courses.find(c => c.title.toLowerCase().includes("copilot"));
  const otherCourses = courses.filter(c => !c.title.toLowerCase().includes("copilot"));

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

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <div className="container mx-auto px-4 pt-28 pb-12 md:pt-32">
        {/* Header with Download Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="mb-4">
              Premium Academy <span className="text-primary">Brochure</span>
            </h1>
            <p className="text-lg text-[#69697b] max-w-2xl">
              Industry-leading professional development programs in AI, Safety 4.0, and modern EHS leadership.
            </p>
          </div>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="mt-6 md:mt-0 inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-[8px] hover:bg-[#2a2ad6] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Download size={20} />
            {downloading ? "Downloading..." : "Download Brochure"}
          </button>
        </div>

        {/* Brochure Content */}
        <div
          ref={brochureRef}
          className="bg-white overflow-hidden"
          style={{ fontSize: "14px", lineHeight: "1.6" }}
        >
          {/* COVER PAGE */}
          <div
            className="bg-gradient-to-br from-primary via-[#2a2ad6] to-[#1a1a9c] text-white p-20 text-center min-h-screen flex flex-col justify-center items-center"
            style={{ pageBreakAfter: "always" }}
          >
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

          {/* TABLE OF CONTENTS */}
          <div className="p-16 bg-slate-50" style={{ pageBreakAfter: "always" }}>
            <h2 className="text-3xl font-bold text-[#0b0b2c] mb-12">Contents</h2>
            <div className="space-y-3 text-[#69697b]">
              <p className="flex justify-between"><span>About SafetyTech Academy</span> <span>3</span></p>
              <p className="flex justify-between"><span>Flagship: Copilot for EHS & Sustainability</span> <span>4-5</span></p>
              <p className="flex justify-between"><span>Professional Development Portfolio</span> <span>6-8</span></p>
              <p className="flex justify-between"><span>Accreditations & Certifications</span> <span>9</span></p>
              <p className="flex justify-between"><span>Learning Outcomes & Impact</span> <span>10</span></p>
              <p className="flex justify-between"><span>Why Choose SafetyTech Academy</span> <span>11</span></p>
              <p className="flex justify-between"><span>Implementation & Support</span> <span>12</span></p>
              <p className="flex justify-between"><span>Investment & ROI</span> <span>13</span></p>
              <p className="flex justify-between"><span>Enrollment & Contact</span> <span>14</span></p>
            </div>
          </div>

          {/* ABOUT SAFETYTECH */}
          <div className="p-16" style={{ pageBreakAfter: "always" }}>
            <h2 className="text-3xl font-bold text-[#0b0b2c] mb-8">About SafetyTech Academy</h2>
            <div className="space-y-6 text-[#69697b] leading-relaxed">
              <p>
                SafetyTech Academy is the industry's premier destination for professional development in Environmental, Health & Safety (EHS) combined with cutting-edge AI and digital transformation expertise. We empower safety leaders to navigate and master the future of workplace safety.
              </p>
              <p>
                Our mission is to bridge the gap between traditional safety excellence and emerging technologies, creating a new generation of EHS professionals equipped with AI competencies, Safety 4.0 frameworks, and digital leadership skills.
              </p>
              <p>
                With IOSH-approved certifications, hands-on training delivered by industry experts, and flexible delivery models ranging from online self-paced courses to live masterclasses, SafetyTech Academy serves organizations of all sizes—from ambitious professionals to Fortune 500 enterprises.
              </p>
              <div className="pt-6 grid grid-cols-3 gap-8 text-center">
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

          {/* FLAGSHIP: COPILOT COURSE */}
          {copilotCourse && (
            <div
              className="bg-gradient-to-r from-primary to-[#2a2ad6] text-white p-16"
              style={{ pageBreakAfter: "always" }}
            >
              <div className="mb-8">
                <div className="inline-block bg-yellow-400 text-[#0b0b2c] px-4 py-2 rounded-full font-bold mb-6 text-sm">
                  ★ FLAGSHIP PROGRAM ★
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-6">{copilotCourse.title}</h2>
              <p className="text-lg opacity-90 mb-8 leading-relaxed">
                {copilotCourse.description}
              </p>

              <div className="grid grid-cols-2 gap-8 py-8 border-t border-white/20 border-b border-white/20 my-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6" />
                    <span className="font-bold">Real-World AI Application</span>
                  </div>
                  <p className="text-sm opacity-90">Master Microsoft Copilot to automate safety workflows and enhance decision-making</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6" />
                    <span className="font-bold">AI Literacy for EHS</span>
                  </div>
                  <p className="text-sm opacity-90">Understand AI fundamentals and how to leverage them in safety operations</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6" />
                    <span className="font-bold">Proven ROI</span>
                  </div>
                  <p className="text-sm opacity-90">Average 40% improvement in safety compliance and 35% reduction in incident response time</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6" />
                    <span className="font-bold">Industry Recognition</span>
                  </div>
                  <p className="text-sm opacity-90">Gain credentials valued by enterprise organizations globally</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-8 text-center">
                <div>
                  <div className="text-2xl font-bold mb-2">{copilotCourse.cpd_hours || 40} hrs</div>
                  <p className="text-sm opacity-75">CPD Points</p>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2">Online + Live</div>
                  <p className="text-sm opacity-75">Delivery Model</p>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2">£{(copilotCourse.price_cents / 100).toFixed(0)}</div>
                  <p className="text-sm opacity-75">Investment</p>
                </div>
              </div>
            </div>
          )}

          {/* OTHER COURSES */}
          <div className="p-16" style={{ pageBreakAfter: "always" }}>
            <h2 className="text-3xl font-bold text-[#0b0b2c] mb-12">Professional Development Portfolio</h2>
            <div className="space-y-10">
              {otherCourses.map((course, index) => (
                <div key={course.id} className="border-l-4 border-primary pl-6">
                  <h3 className="text-2xl font-bold text-[#0b0b2c] mb-3">{course.title}</h3>
                  <p className="text-[#69697b] mb-4 leading-relaxed">{course.description}</p>
                  <div className="flex gap-8 text-sm font-semibold text-[#0b0b2c]">
                    {course.cpd_hours && <div>CPD Hours: <span className="text-primary">{course.cpd_hours}</span></div>}
                    <div>Investment: <span className="text-primary">£{(course.price_cents / 100).toFixed(2)}</span></div>
                  </div>
                  {index < otherCourses.length - 1 && <div className="border-b border-slate-200 mt-6" />}
                </div>
              ))}
            </div>
          </div>

          {/* ACCREDITATIONS */}
          <div className="p-16 bg-slate-50" style={{ pageBreakAfter: "avoid" }}>
            <h2 className="text-2xl font-bold text-[#0b0b2c] mb-8">Accreditations & Standards</h2>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="font-bold text-[#0b0b2c]">IOSH Approved</p>
                <p className="text-sm text-[#69697b]">Professional Institution of Safety & Health</p>
              </div>
              <div>
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="font-bold text-[#0b0b2c]">CPD Certified</p>
                <p className="text-sm text-[#69697b]">Continuous Professional Development</p>
              </div>
              <div>
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="font-bold text-[#0b0b2c]">Industry Standard</p>
                <p className="text-sm text-[#69697b]">Recognized by 500+ Organizations</p>
              </div>
            </div>
          </div>

          {/* WHY CHOOSE */}
          <div className="p-16" style={{ pageBreakAfter: "avoid" }}>
            <h2 className="text-2xl font-bold text-[#0b0b2c] mb-8">Why Choose SafetyTech Academy?</h2>
            <div className="grid grid-cols-2 gap-10 text-[#69697b]">
              <div>
                <h4 className="font-bold text-[#0b0b2c] mb-2 flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> Expert Instructors</h4>
                <p className="text-sm">Learn from industry veterans with 20+ years of combined EHS expertise</p>
              </div>
              <div>
                <h4 className="font-bold text-[#0b0b2c] mb-2 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Proven Track Record</h4>
                <p className="text-sm">85% of graduates report immediate career advancement or promotion</p>
              </div>
              <div>
                <h4 className="font-bold text-[#0b0b2c] mb-2 flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> Future-Ready Curriculum</h4>
                <p className="text-sm">Stay ahead with AI, automation, and digital transformation</p>
              </div>
              <div>
                <h4 className="font-bold text-[#0b0b2c] mb-2 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Community Support</h4>
                <p className="text-sm">Lifetime access to peer networks and ongoing professional development</p>
              </div>
              <div>
                <h4 className="font-bold text-[#0b0b2c] mb-2 flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Flexible Learning</h4>
                <p className="text-sm">Self-paced online, live workshops, or hybrid models to fit your schedule</p>
              </div>
              <div>
                <h4 className="font-bold text-[#0b0b2c] mb-2 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Certification Value</h4>
                <p className="text-sm">Industry-recognized credentials that boost career prospects globally</p>
              </div>
            </div>
          </div>

          {/* LEARNING OUTCOMES */}
          <div className="p-16 bg-slate-50" style={{ pageBreakAfter: "avoid" }}>
            <h2 className="text-2xl font-bold text-[#0b0b2c] mb-8">Learning Outcomes & Impact</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="text-3xl font-bold text-primary mb-2">85%</div>
                <p className="text-[#0b0b2c] font-semibold">Career Advancement</p>
                <p className="text-sm text-[#69697b]">Graduates see immediate promotion or roles expansion</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="text-3xl font-bold text-primary mb-2">40%</div>
                <p className="text-[#0b0b2c] font-semibold">Compliance Improvement</p>
                <p className="text-sm text-[#69697b]">Average increase in safety compliance metrics</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="text-3xl font-bold text-primary mb-2">35%</div>
                <p className="text-[#0b0b2c] font-semibold">Incident Response</p>
                <p className="text-sm text-[#69697b]">Reduction in incident response time</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="text-3xl font-bold text-primary mb-2">2.5x</div>
                <p className="text-[#0b0b2c] font-semibold">ROI Average</p>
                <p className="text-sm text-[#69697b]">Return on investment within 18 months</p>
              </div>
            </div>
          </div>

          {/* ENROLLMENT CTA */}
          <div
            className="bg-gradient-to-r from-primary to-[#2a2ad6] text-white p-16 text-center"
            style={{ pageBreakAfter: "avoid" }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your EHS Career?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join 50,000+ safety professionals who have elevated their expertise with SafetyTech Academy
            </p>
            <div className="space-y-3">
              <p className="font-semibold">Start your journey today</p>
              <p className="text-sm opacity-75">Visit safetytech.academy or email hello@safetyacademy.tech</p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-12 bg-slate-900 text-white text-center text-sm" style={{ pageBreakAfter: "avoid" }}>
            <p className="font-bold mb-2">SafetyTech Academy</p>
            <p className="opacity-75 mb-4">Transforming EHS Leaders for the Future</p>
            <p className="opacity-50 text-xs">hello@safetyacademy.tech | www.safetytech.academy</p>
            <p className="opacity-50 text-xs mt-4">© 2024 SafetyTech Academy. All rights reserved.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Brochure;
