import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { setPageSEO } from "@/utils/seo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle, Loader2, Users, Award, BookOpen, Calendar, Shield } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { useEffect } from "react";

const countryCodes = [
  { code: "+44", country: "UK" },
  { code: "+1", country: "US" },
  { code: "+353", country: "IE" },
  { code: "+61", country: "AU" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+31", country: "NL" },
  { code: "+34", country: "ES" },
  { code: "+39", country: "IT" },
  { code: "+351", country: "PT" },
  { code: "+55", country: "BR" },
  { code: "+91", country: "IN" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "SA" },
  { code: "+27", country: "ZA" },
  { code: "+65", country: "SG" },
  { code: "+852", country: "HK" },
  { code: "+81", country: "JP" },
  { code: "+82", country: "KR" },
  { code: "+86", country: "CN" },
  { code: "+47", country: "NO" },
  { code: "+46", country: "SE" },
  { code: "+45", country: "DK" },
  { code: "+358", country: "FI" },
  { code: "+48", country: "PL" },
  { code: "+41", country: "CH" },
  { code: "+43", country: "AT" },
  { code: "+32", country: "BE" },
  { code: "+64", country: "NZ" },
  { code: "+60", country: "MY" },
];

const programHighlights = [
  { icon: BookOpen, text: "10 On-Demand Modules" },
  { icon: Users, text: "5 Live Sessions" },
  { icon: Award, text: "IOSH & CPD Certified" },
  { icon: Calendar, text: "4-Week Programme" },
  { icon: Shield, text: "7-Day Money-Back Guarantee" },
];

const Enroll = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+44",
    phone: "",
    jobTitle: "",
    company: "",
    experience: "",
    motivation: "",
  });

  useEffect(() => {
    setPageSEO({
      title: "Enrol – Safety 4.0 Accelerator | Safety 4.0 Academy",
      description: "Apply to join the Safety 4.0 Accelerator programme. IOSH-approved, CPD-certified training for safety professionals.",
    });
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const messageData = JSON.stringify({
        company: form.company,
        experience: form.experience,
        motivation: form.motivation,
      });

      const { error } = await supabase.functions.invoke("capture-lead", {
        body: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: `${form.countryCode} ${form.phone}`,
          source: "accelerator-enrol",
          job_title: form.jobTitle,
          message: messageData,
        },
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Application submitted successfully!" });
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AudienceNav />
        <AnalyticsTracker />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Application Received!</h1>
            <p className="text-white/70 text-lg mb-8">
              Thank you for your interest in the Safety 4.0 Accelerator. We'll review your application and get back to you within 48 hours.
            </p>
            <Button variant="hero" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AudienceNav />
      <AnalyticsTracker />
      <SEOStructuredData type="course" />

      {/* Hero */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Enrol in the <span className="text-primary">Safety 4.0 Accelerator</span>
          </h1>
          <p className="text-lg text-white/70">
            Complete the form below to apply. Limited to 15 participants per cohort.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">First Name *</label>
                    <Input
                      value={form.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="First name"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Last Name *</label>
                    <Input
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Last name"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Email Address *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Phone Number *</label>
                  <div className="flex gap-2">
                    <Select value={form.countryCode} onValueChange={(v) => handleChange("countryCode", v)}>
                      <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} {c.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Phone number"
                      required
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Job Title</label>
                    <Input
                      value={form.jobTitle}
                      onChange={(e) => handleChange("jobTitle", e.target.value)}
                      placeholder="e.g. HSE Manager"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Company</label>
                    <Input
                      value={form.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      placeholder="Your organisation"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Years of Safety Experience</label>
                  <Select value={form.experience} onValueChange={(v) => handleChange("experience", v)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0–2 years</SelectItem>
                      <SelectItem value="3-5">3–5 years</SelectItem>
                      <SelectItem value="6-10">6–10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Why do you want to join?</label>
                  <Textarea
                    value={form.motivation}
                    onChange={(e) => handleChange("motivation", e.target.value)}
                    placeholder="Tell us what you hope to gain from the programme..."
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-black font-semibold text-lg py-6 rounded-full hover:bg-primary/90 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-white/40 text-center">
                  By submitting, you agree to our{" "}
                  <a href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</a>.
                </p>
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-lime-500/20 bg-lime-500/[0.05] p-6">
                <h3 className="text-xl font-bold mb-4">Programme Highlights</h3>
                <div className="space-y-4">
                  {programHighlights.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-white/80">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-bold mb-3">£997</h3>
                <p className="text-sm text-white/60 mb-4">
                  Full programme fee. Includes all modules, live sessions, 1:1 coaching, and certification.
                </p>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>12-month access to all content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>IOSH & CPD certification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>100% money-back guarantee</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-bold mb-2">Have Questions?</h3>
                <p className="text-sm text-white/60 mb-4">
                  Get in touch and we'll help you decide if the programme is right for you.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Contact Us <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Enroll;
