import AudienceNav from "@/components/AudienceNav";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, CheckCircle, Star, User, Mail, Building2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import bookCover from "@/assets/book-cover-safety-4-leader.png";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";

const EBook = () => {
  const [formData, setFormData] = useState({ name: "", email: "", company: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Lead first, then the download. The lead is saved in the same place as the brochure leads.
  const getEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) { toast.error("Please fill in all required fields"); return; }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("capture-lead", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          company: formData.company.trim() || null,
          phone: formData.phone.trim() || null,
          source: "ebook_download",
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Could not save your details");
      setUnlocked(true);
    } catch (err) {
      console.error("eBook lead error:", err);
      toast.error("Something went wrong. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Free Safety 4.0 eBook | Digital Safety Leadership Guide Download",
      description: "Download the free Safety 4.0 eBook — your guide to leading safety in the digital age. Learn about AI, IoT, and SafetyTech for modern workplace safety management.",
      canonical: "https://safetytech.academy/ebook",
    });
  }, []);

  return (
    <>
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 tracking-tight leading-[1.05]">
            Free <span className="text-primary">Safety 4.0</span> eBook
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Short read for EHS professionals who is starting to navigate the safetytech and AI transition.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center space-y-8">
            {/* eBook Cover */}
            <div className="relative max-w-md">
              <img
                src={bookCover}
                alt="Become the Safety 4.0 Leader eBook cover by Lucas Domingues"
                loading="lazy"
                decoding="async"
                className="w-full h-auto rounded-2xl shadow-2xl border border-slate-200"
              />
            </div>

            {/* eBook Details */}
            <div className="space-y-6 text-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Become the Safety 4.0 Leader
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  A comprehensive under 30-page guide that unpacks personal stories by Lucas, 
                  case studies and deep research to develop digital safety leadership 
                  in the Industry 4.0 era.
                </p>
              </div>


              {/* Rating */}
              <div className="flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-slate-900 font-semibold">4.9/5</span>
                <span className="text-slate-500">(2,847 downloads)</span>
              </div>

              {/* Lead form, then the download */}
              {unlocked ? (
                <div className="space-y-3">
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 px-10 group"
                  >
                    <a href="/Safety-4.0-Leader-eBook.pdf" download="Safety-4.0-Leader-eBook.pdf">
                      <Download className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
                      Download Free eBook
                    </a>
                  </Button>
                  <p className="text-sm text-slate-500">Thanks, {formData.name.split(" ")[0]}. Your copy is ready.</p>
                </div>
              ) : (
                <form onSubmit={getEbook} style={{ display: "grid", gap: "14px", textAlign: "left" }}>
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
                    {submitting ? "Saving..." : "Get eBook"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default EBook;
