import { useEffect, useRef, useState } from "react";
import { Download, FileText } from "lucide-react";
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
      description: "Download our comprehensive academy brochure featuring all our courses, certifications, and professional development programs.",
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
        .order("created_at", { ascending: false });

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
        margin: 10,
        filename: "SafetyTech-Academy-Brochure.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf().set(opt).from(element).save();
      toast.success("Brochure downloaded successfully!");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Failed to download brochure");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#69697b]">Loading brochure...</p>
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
              Academy <span className="text-primary">Brochure</span>
            </h1>
            <p className="text-lg text-[#69697b] max-w-2xl">
              Discover our comprehensive portfolio of professional development courses and certifications designed to empower EHS leaders with AI and Safety 4.0 expertise.
            </p>
          </div>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="mt-6 md:mt-0 inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-[8px] hover:bg-[#2a2ad6] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Download size={20} />
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>

        {/* Brochure Content */}
        <div
          ref={brochureRef}
          className="bg-white rounded-[20px] border border-slate-200 overflow-hidden shadow-lg"
          style={{ pageBreakAfter: "always" }}
        >
          {/* Brochure Cover */}
          <div
            className="bg-gradient-to-r from-primary to-[#2a2ad6] text-white p-16 text-center"
            style={{ pageBreakAfter: "avoid" }}
          >
            <div className="mb-8">
              <h2 className="text-5xl font-bold mb-4">SafetyTech Academy</h2>
              <p className="text-xl opacity-90">Professional Development in AI & Safety Leadership</p>
            </div>
            <div className="text-sm opacity-75">
              <p>Empowering EHS Professionals with Modern Skills</p>
              <p className="mt-2">2024 Course Catalog</p>
            </div>
          </div>

          {/* About Section */}
          <div className="p-12 bg-slate-50" style={{ pageBreakAfter: "avoid" }}>
            <h3 className="text-2xl font-bold text-[#0b0b2c] mb-4">About SafetyTech Academy</h3>
            <p className="text-[#69697b] leading-relaxed mb-4">
              SafetyTech Academy is the leading platform for professional development in Environmental, Health & Safety (EHS) combined with cutting-edge AI and digitalization expertise. Our mission is to transform how safety leaders approach modern challenges in the workplace.
            </p>
            <p className="text-[#69697b] leading-relaxed">
              We provide IOSH-approved certifications, hands-on training, and expert-led masterclasses designed for organizations navigating the future of safety management. Our courses blend traditional safety excellence with emerging technologies like AI, Safety 4.0, and Microsoft Copilot.
            </p>
          </div>

          {/* Courses Section */}
          <div className="p-12">
            <h3 className="text-3xl font-bold text-[#0b0b2c] mb-12">Our Courses</h3>

            <div className="space-y-8">
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  className="border-l-4 border-primary pl-6 pb-8"
                  style={{
                    pageBreakInside: "avoid",
                    pageBreakAfter: index === courses.length - 1 ? "avoid" : "auto",
                  }}
                >
                  <h4 className="text-xl font-bold text-[#0b0b2c] mb-2">
                    {course.title}
                  </h4>
                  <p className="text-[#69697b] mb-4 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap gap-6 text-sm">
                    {course.cpd_hours && (
                      <div>
                        <span className="font-semibold text-[#0b0b2c]">CPD Hours:</span>
                        <span className="text-[#69697b] ml-2">{course.cpd_hours}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-[#0b0b2c]">Price:</span>
                      <span className="text-[#69697b] ml-2">
                        £{(course.price_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features Section */}
          <div className="p-12 bg-slate-50" style={{ pageBreakAfter: "avoid" }}>
            <h3 className="text-2xl font-bold text-[#0b0b2c] mb-8">Why Choose SafetyTech Academy?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-[#0b0b2c] mb-2">✓ IOSH Approved</h4>
                <p className="text-[#69697b] text-sm">
                  Industry-recognized certifications that advance your career
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#0b0b2c] mb-2">✓ Expert-Led</h4>
                <p className="text-[#69697b] text-sm">
                  Learn from experienced safety and AI professionals
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#0b0b2c] mb-2">✓ Modern Curriculum</h4>
                <p className="text-[#69697b] text-sm">
                  Stay ahead with AI, Safety 4.0, and digital transformation
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#0b0b2c] mb-2">✓ Flexible Learning</h4>
                <p className="text-[#69697b] text-sm">
                  Online courses and live masterclasses fit your schedule
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-12 bg-gradient-to-r from-primary to-[#2a2ad6] text-white text-center" style={{ pageBreakAfter: "avoid" }}>
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Career?</h3>
            <p className="text-white/90 mb-6">
              Explore our full course catalog and start your professional development journey today.
            </p>
            <p className="text-sm opacity-75">
              Visit safetytech.academy to enroll or request more information
            </p>
          </div>

          {/* Footer */}
          <div className="p-8 text-center text-sm text-[#94a3b8] bg-slate-50" style={{ pageBreakAfter: "avoid" }}>
            <p>© 2024 SafetyTech Academy. All rights reserved.</p>
            <p className="mt-2">For inquiries: hello@safetyacademy.tech | www.safetytech.academy</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Brochure;
