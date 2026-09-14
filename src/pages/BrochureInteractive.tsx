import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Mail, User, Building2, Phone, Loader2, Check } from "lucide-react";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";

const BrochureInteractive = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 69;

  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "SafetyTech Academy Brochure",
      description: "Premium brochure featuring industry-leading courses in AI and Safety 4.0.",
      canonical: "https://safetytech.academy/brochure",
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert([
        {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          source: "brochure_download",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      toast.success("Thank you! Your brochure is ready to download.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save your details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("/brochure.pdf");
      if (!response.ok) throw new Error("Failed to fetch PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Safety4.0-Academy-Brochure.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download PDF");
    }
  };

  return (
    <>
      <AudienceNav />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div style={{ background: "#0b0b2c", color: "#fff", padding: "40px 28px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8ab815", marginBottom: "8px" }}>
            Digital Brochure
          </div>
          <h1 style={{ fontSize: "40px", fontWeight: 700, margin: 0 }}>SafetyTech Academy Brochure</h1>
          <p style={{ marginTop: "12px", fontSize: "16px", color: "rgba(255,255,255,0.7)" }}>
            Explore our comprehensive safety training courses and AI-powered solutions
          </p>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 28px", display: "grid", gridTemplateColumns: "1fr 380px", gap: "40px", alignItems: "start" }}>
          {/* PDF Viewer */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "visible", boxShadow: "0 10px 30px rgba(11,11,44,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#fff", width: "100%", minHeight: "800px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
              <iframe
                src={`/brochure.pdf#page=${currentPage}`}
                style={{ width: "100%", height: "100%", minHeight: "800px", border: "none", display: "block" }}
                title="Safety Academy Brochure"
              />
            </div>

            {/* Page Navigation */}
            <div style={{ padding: "20px 28px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", zIndex: 10, position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
              >
                ← Previous
              </button>

              <div style={{ fontSize: "14px", fontWeight: 600, color: "#0b0b2c", whiteSpace: "nowrap" }}>
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Lead Capture Form */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "32px 28px", position: "sticky", top: "40px", boxShadow: "0 10px 30px rgba(11,11,44,0.1)" }}>
            {!submitted ? (
              <>
                <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815", textTransform: "uppercase", marginBottom: "8px" }}>
                  Get Your Copy
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#0b0b2c", marginTop: 0, marginBottom: "8px" }}>
                  Download Brochure
                </h2>
                <p style={{ fontSize: "14px", color: "#69697b", marginBottom: "24px", lineHeight: 1.6 }}>
                  Enter your details to download our comprehensive course brochure and stay updated.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "#0b0b2c", marginBottom: "6px" }}>
                      <User size={14} /> Full Name *
                    </label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "#0b0b2c", marginBottom: "6px" }}>
                      <Mail size={14} /> Email Address *
                    </label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@company.com" required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "#0b0b2c", marginBottom: "6px" }}>
                      <Building2 size={14} /> Company
                    </label>
                    <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="ABC Corporation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "#0b0b2c", marginBottom: "6px" }}>
                      <Phone size={14} /> Phone
                    </label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+44 (0)1234 567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <button type="submit" disabled={submitting} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                    {submitting ? "Saving..." : "Get Brochure"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", paddingTop: "20px" }}>
                <Check size={48} style={{ margin: "0 auto 16px", color: "#8ab815" }} />
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0b0b2c", margin: 0 }}>Thank You!</h3>
                <p style={{ marginTop: "8px", fontSize: "14px", color: "#69697b" }}>
                  Your details have been saved. You can now download the brochure.
                </p>

                <button onClick={handleDownload} className="w-full mt-5 py-3 bg-green-600 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                  <Download size={16} /> Download PDF
                </button>

                <button onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", company: "", phone: "" }); }}
                  className="w-full mt-2 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Share with Colleague
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BrochureInteractive;
