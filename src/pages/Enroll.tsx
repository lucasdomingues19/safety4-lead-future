import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { setPageSEO } from "@/utils/seo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle, Loader2, Users, Award, BookOpen, Calendar, Shield, Building2 } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { useEffect } from "react";
import { countryCodes } from "@/data/countryCodes";

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
    country: "",
    linkedIn: "",
    jobTitle: "",
    company: "",
    experience: "",
    budgetApproval: "",
    paymentMethod: "",
    cohort: "",
    motivation: "",
    hearAbout: "",
    scholarshipInterest: false,
  });

  useEffect(() => {
    setPageSEO({
      title: "Enrol – Safety 4.0 Accelerator | Safety 4.0 Academy",
      description: "Apply to join the Safety 4.0 Accelerator programme. IOSH-approved, CPD-certified training for safety professionals.",
      canonical: "https://safetyacademy.tech/enrol",
    });
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.country || !form.linkedIn || !form.jobTitle || !form.company || !form.experience || !form.budgetApproval || !form.paymentMethod || !form.cohort || !form.motivation || !form.hearAbout) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const messageData = JSON.stringify({
        country: form.country,
        linkedIn: form.linkedIn,
        company: form.company,
        experience: form.experience,
        budgetApproval: form.budgetApproval,
        paymentMethod: form.paymentMethod,
        cohort: form.cohort,
        motivation: form.motivation,
        hearAbout: form.hearAbout,
        scholarshipInterest: form.scholarshipInterest,
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

      // Send notification email to admin
      try {
        await supabase.functions.invoke("send-contact-email", {
          body: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: `${form.countryCode} ${form.phone}`,
            role: form.jobTitle,
            inquiryType: "Accelerator Application",
            message: `Country: ${form.country}\nLinkedIn: ${form.linkedIn}\nCompany: ${form.company}\nExperience: ${form.experience}\nBudget Approval: ${form.budgetApproval}\nPayment Method: ${form.paymentMethod}\nCohort: ${form.cohort}\nHow they heard: ${form.hearAbout}\nScholarship Interest: ${form.scholarshipInterest ? 'Yes' : 'No'}\n\nMotivation:\n${form.motivation}`,
          },
        });
      } catch (emailErr) {
        console.error("Failed to send notification email:", emailErr);
      }

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
        <AnalyticsTracker>
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
        </AnalyticsTracker>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AudienceNav />
      <AnalyticsTracker>
      <SEOStructuredData type="course" />

      {/* Hero */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="lg:pr-[40%]">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 whitespace-nowrap">
              Enrol in the <span className="text-primary">Safety 4.0 Accelerator</span>
            </h1>
            <div className="space-y-4 text-white/70 text-base leading-relaxed">
              <p>
                Thank you for your interest in the Safety 4.0 Accelerator, a 4-week long IOSH-approved and CPD accredited programme preparing EHS senior professionals to lead in the digital age.
              </p>
              <p>
                Our next cohort runs from <span className="text-white font-semibold">2nd June – 30th June, 2026</span>.
              </p>
              <p>Kindly fill in the application form below.</p>
              <p className="text-sm text-white/50 italic">
                *Safety 4.0 Accelerator offers a limited number of need-based partial scholarships for individuals with underrepresented backgrounds and limited financial means. Kindly select the 'I am interested in the Safety 4.0 Accelerator scholarship' option below.
              </p>
              <p>
                Once your application is submitted, our team will review your candidacy and invite you for a call. If you are accepted to join the programme, payment information will be shared with you to secure your place prior to its commencement.
              </p>
              <p className="text-sm font-medium text-white/80">
                Note: Space is limited and we encourage aspiring participants to enrol early. Admission is based on the application form below and an interview.
              </p>
              <p className="text-lime-400">
                If you're interested in the eLearning, please <a href="/#elearning" className="underline hover:text-lime-300">click here</a>.
              </p>
            </div>
          </div>
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
                            {c.code} {c.label.split(' ')[0]}
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

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Country *</label>
                  <Input
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    placeholder="Your country of residence"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">LinkedIn URL *</label>
                  <Input
                    type="url"
                    value={form.linkedIn}
                    onChange={(e) => handleChange("linkedIn", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Job Title *</label>
                    <Input
                      value={form.jobTitle}
                      onChange={(e) => handleChange("jobTitle", e.target.value)}
                      placeholder="e.g. HSE Manager"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Company *</label>
                    <Input
                      value={form.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      placeholder="Your organisation"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Years of Safety Experience *</label>
                  <Select value={form.experience} onValueChange={(v) => handleChange("experience", v)} required>
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
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Which best describes your ability to approve training? *</label>
                  <Select value={form.budgetApproval} onValueChange={(v) => handleChange("budgetApproval", v)} required>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Choose one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own-budget">I own the budget and will approve it</SelectItem>
                      <SelectItem value="recommend">I recommend, someone else approves</SelectItem>
                      <SelectItem value="need-approval">I need full approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

<div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Should you be admitted in the programme, how would you fund? *</label>
                  <Select value={form.paymentMethod} onValueChange={(v) => handleChange("paymentMethod", v)} required>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Choose one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self-pay">I will pay for it myself</SelectItem>
                      <SelectItem value="company-pay">An organisation/company is paying for me</SelectItem>
                      <SelectItem value="not-sure">I am not sure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Which cohort are you applying for? *</label>
                  <Select value={form.cohort} onValueChange={(v) => handleChange("cohort", v)} required>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Choose one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="june-2026">June (2nd June – 30th June)</SelectItem>
                      <SelectItem value="july-2026">July (waitlisted)</SelectItem>
                      <SelectItem value="august-2026">August (waitlisted)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Describe why you wish to join the programme and your expectations *</label>
                  <Textarea
                    value={form.motivation}
                    onChange={(e) => handleChange("motivation", e.target.value)}
                    placeholder="Tell us what you hope to gain from the programme..."
                    rows={4}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">How did you hear about the Safety 4.0 Academy? *</label>
                  <Select value={form.hearAbout} onValueChange={(v) => handleChange("hearAbout", v)} required>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Choose one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="friends-colleagues">Friends/Colleagues</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="scholarship"
                    checked={form.scholarshipInterest}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, scholarshipInterest: checked === true }))}
                    className="mt-0.5 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="scholarship" className="text-sm text-white/70 cursor-pointer leading-relaxed">
                    I am interested in the Safety 4.0 Accelerator scholarship
                  </label>
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
                <h3 className="text-xl font-bold mb-3"><h3 className="text-xl font-bold mb-3">£997 <span className="text-sm font-normal text-white/60">+VAT</span></h3></h3>
                <p className="text-sm text-white/60 mb-4">
                  Full programme fee. Includes all modules, live sessions, 1:1 coaching, and certification.
                </p>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>90-day access to complete course</span>
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

              {/* Fallback cards */}
              <div className="rounded-2xl border border-border bg-card/60 p-5 flex flex-col gap-3">
                <BookOpen className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="text-sm font-bold text-white">Not ready for the Accelerator?</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Self-paced eLearning — same IOSH-approved content, at your own pace.
                </p>
                <a href="https://safetyacademy.mykajabi.com/offers/E2ZXsoXV" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors mt-auto">
                  View eLearning (£597) <ArrowRight className="w-3 h-3" /> <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-5 flex flex-col gap-3">
                <Building2 className="w-6 h-6 text-pink-500 flex-shrink-0" />
                <div className="text-sm font-bold text-white">Training your whole team?</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In-Company programme — customised curriculum, bulk pricing, and dedicated support.
                </p>
                <a href="/in-company" className="inline-flex items-center gap-1 text-xs font-semibold text-pink-500 hover:text-pink-400 transition-colors mt-auto">
                  Discover In-Company <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      </AnalyticsTracker>
      <Footer />
    </div>
  );
};

export default Enroll;
