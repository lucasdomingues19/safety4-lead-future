import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Mail, User, Building2, Phone, Loader2, Check } from "lucide-react";

export function BrochurePage() {
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
      // Save lead to database
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

      // Track event
      console.log("Lead captured from brochure:", formData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save your details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/brochure.pdf";
    link.download = "Safety4.0-Academy-Brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ background: "#0b0b2c", color: "#fff", padding: "40px 28px", textAlign: "center" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8ab815",
            marginBottom: "8px",
          }}
        >
          Digital Brochure
        </div>
        <h1 style={{ fontSize: "40px", fontWeight: 700, margin: 0 }}>
          SafetyTech Academy Brochure
        </h1>
        <p style={{ marginTop: "12px", fontSize: "16px", color: "rgba(255,255,255,0.7)" }}>
          Explore our comprehensive safety training courses and AI-powered solutions
        </p>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px 28px",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "40px",
          alignItems: "start",
        }}
      >
        {/* PDF Viewer */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(11,11,44,0.1)",
          }}
        >
          {/* PDF Container */}
          <div
            style={{
              background: "#fff",
              aspectRatio: "8.5/11",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              minHeight: "800px",
            }}
          >
            <iframe
              src={`/brochure.pdf#page=${currentPage}`}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title="Safety Academy Brochure"
            />
          </div>

          {/* Page Navigation */}
          <div
            style={{
              padding: "20px 28px",
              background: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                background: "#fff",
                color: "#0b0b2c",
                fontFamily: "inherit",
                fontSize: "14px",
                fontWeight: 700,
                padding: "10px 18px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
            >
              ← Previous
            </button>

            <div style={{ fontSize: "14px", fontWeight: 600, color: "#0b0b2c" }}>
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                background: "#fff",
                color: "#0b0b2c",
                fontFamily: "inherit",
                fontSize: "14px",
                fontWeight: 700,
                padding: "10px 18px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Lead Capture Form */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "32px 28px",
            position: "sticky",
            top: "40px",
            boxShadow: "0 10px 30px rgba(11,11,44,0.1)",
          }}
        >
          {!submitted ? (
            <>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  color: "#8ab815",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Get Your Copy
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#0b0b2c", marginTop: 0, marginBottom: "8px" }}>
                Download Brochure
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "#69697b",
                  marginBottom: "24px",
                  lineHeight: 1.6,
                }}
              >
                Enter your details to download our comprehensive course brochure and stay updated with the latest safety training solutions.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
                {/* Name */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0b0b2c",
                      marginBottom: "6px",
                    }}
                  >
                    <User size={14} /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    style={{
                      width: "100%",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "11px 13px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0b0b2c",
                      marginBottom: "6px",
                    }}
                  >
                    <Mail size={14} /> Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@company.com"
                    required
                    style={{
                      width: "100%",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "11px 13px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Company */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0b0b2c",
                      marginBottom: "6px",
                    }}
                  >
                    <Building2 size={14} /> Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="ABC Corporation"
                    style={{
                      width: "100%",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "11px 13px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0b0b2c",
                      marginBottom: "6px",
                    }}
                  >
                    <Phone size={14} /> Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+44 (0)1234 567890"
                    style={{
                      width: "100%",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "11px 13px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Privacy Notice */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "12px",
                    color: "#69697b",
                    lineHeight: 1.5,
                  }}
                >
                  We'll use your details to send you the brochure and relevant course information. You can unsubscribe anytime.
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    border: "0",
                    borderRadius: "8px",
                    background: "#3434ff",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: 700,
                    padding: "14px 20px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: submitting ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) e.currentTarget.style.background = "#2a2ad6";
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) e.currentTarget.style.background = "#3434ff";
                  }}
                >
                  {submitting && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                  {submitting ? "Saving..." : "Get Brochure"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center", paddingTop: "20px" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#f4fbe4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Check size={28} color="#8ab815" />
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0b0b2c", margin: 0 }}>
                  Thank You!
                </h3>
                <p style={{ marginTop: "8px", fontSize: "14px", color: "#69697b" }}>
                  Your details have been saved. You can now download the brochure.
                </p>

                <button
                  onClick={handleDownload}
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    border: "0",
                    borderRadius: "8px",
                    background: "#8ab815",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: 700,
                    padding: "14px 20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#75910d";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#8ab815";
                  }}
                >
                  <Download size={16} /> Download PDF
                </button>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", company: "", phone: "" });
                  }}
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#0b0b2c",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: 700,
                    padding: "12px 20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                  }}
                >
                  Share with Colleague
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div
        style={{
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          padding: "60px 28px",
          marginTop: "60px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#0b0b2c", marginBottom: "16px" }}>
            What's Inside
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
              marginTop: "32px",
            }}
          >
            {[
              { title: "Course Overview", desc: "Comprehensive safety training programs" },
              { title: "AI Technology", desc: "Copilot & automated learning features" },
              { title: "Pricing & Plans", desc: "Flexible enrollment options" },
              { title: "Success Stories", desc: "Case studies from leading organizations" },
              { title: "Certifications", desc: "Industry-recognized certificates" },
              { title: "Implementation", desc: "Quick deployment strategies" },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0b0b2c",
                    marginBottom: "8px",
                  }}
                >
                  ✓ {item.title}
                </div>
                <p style={{ fontSize: "13px", color: "#69697b", margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
