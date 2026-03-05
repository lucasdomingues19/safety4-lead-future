import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Video,
  Users,
  Award,
  BookOpen,
  Globe,
  Zap,
  Shield,
  Building2,
  Loader2,
  Star } from
"lucide-react";
import { Link } from "react-router-dom";
import AudienceNav from "@/components/AudienceNav";
import ioshLogo from "@/assets/iosh-approved-logo.jpg";
import cpdLogo from "@/assets/cpd-approved-logo.png";
import anaCoutinhoPhoto from "@/assets/ana-coutinho-photo.jpeg";
import stewartDearyPhoto from "@/assets/stewart-deary-photo.jpeg";
import jacquelineCarrPhoto from "@/assets/jacqueline-carr-photo.jpeg";
import eamonnDohertyPhoto from "@/assets/eamonn-doherty-photo.jpeg";

const TALLY_LINK = "https://tally.so/r/ZjNNl5";

const Cohort = () => {
  const fadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    organisation: "",
    seatsNeeded: "1",
    fundingSource: ""
  });

  // Countdown to May 5, 2026
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date("2026-05-05T00:00:00Z").getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor(diff % 86400000 / 3600000),
        minutes: Math.floor(diff % 3600000 / 60000),
        seconds: Math.floor(diff % 60000 / 1000)
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Safety 4.0 Accelerator Cohort — 8-Week IOSH Approved Live Programme | May 2026",
      description: "Join the Safety 4.0 Accelerator Cohort: 8 weeks of live sessions with Lucas Domingues, peer learning, IOSH certification. Only 12 seats per cohort. Apply for May 2026.",
      canonical: "https://safetyacademy.tech/cohort"
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("opacity-100", "translate-y-0");
        });
      },
      { threshold: 0.12 }
    );
    fadeRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setFadeRef = (index: number) => (el: HTMLDivElement | null) => {
    fadeRefs.current[index] = el;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const messageDetails = [
    `Organisation: ${formData.organisation || "Not provided"}`,
    `Seats needed: ${formData.seatsNeeded}`,
    `Funding: ${formData.fundingSource || "Not specified"}`].
    join("\n");

    try {
      // Save lead
      const { error: leadError } = await supabase.functions.invoke("capture-lead", {
        body: {
          name: fullName,
          email: formData.email,
          job_title: formData.jobTitle,
          source: "cohort-application",
          message: messageDetails
        }
      });
      if (leadError) throw leadError;

      // Send notification email
      const { error: emailError } = await supabase.functions.invoke("send-contact-email", {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.jobTitle,
          inquiryType: "Cohort Application",
          message: `New Cohort Application\n\nJob Title: ${formData.jobTitle}\nOrganisation: ${formData.organisation || "N/A"}\nSeats: ${formData.seatsNeeded}\nFunding: ${formData.fundingSource || "N/A"}`
        }
      });
      if (emailError) throw emailError;

      toast({
        title: "Application received!",
        description: "We'll confirm your place within 24 hours. Check your email."
      });

      setFormData({ firstName: "", lastName: "", email: "", jobTitle: "", organisation: "", seatsNeeded: "1", fundingSource: "" });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us at hello@safetyacademy.tech",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const experienceItems = [
  { icon: Video, title: "8 Live Sessions with Lucas", desc: "Weekly live group sessions — not webinars. Interactive, discussion-led, and tailored to what the cohort needs. Lucas brings 15 years of practitioner experience into every session." },
  { icon: Users, title: "Cohort of 10–12 Peers", desc: "Deliberately small. You'll learn alongside EHS professionals from construction, manufacturing, energy, and logistics. Real problems, real perspectives, lasting relationships." },
  { icon: Award, title: "IOSH-Approved Certificate", desc: "The world's first IOSH-approved Safety 4.0 programme. Your certificate carries IOSH's institutional credibility — recognised by employers in the UK and internationally." },
  { icon: BookOpen, title: "60+ On-Demand Lessons", desc: "Studio-recorded lessons available anytime, alongside live sessions. 10 modules covering AI, SafetyTech, data strategy, digital culture, and leadership. 8+ CPD hours." },
  { icon: Globe, title: "Alumni Community Access", desc: "Graduates join a growing network of Safety 4.0 leaders across 12+ countries. Lucas runs regular alumni sessions for ongoing development. A career-long network." },
  { icon: Zap, title: "Direct Access to Lucas", desc: "A dedicated cohort communication channel. Ask questions between sessions, share progress, get feedback on how to apply what you're learning in your specific context." }];


  const timeline = [
  { weeks: "WK 1–2", title: "Foundations — Safety 4.0 & the Digital Shift", desc: "What Industry 4.0 means for EHS. Where AI, IoT, and data intersect with safety. The strategic case for change. Building your digital safety vision." },
  { weeks: "WK 3–4", title: "AI Essentials & the Digital Safety Toolkit", desc: "Machine learning, NLP, and large language models applied to EHS. Practical tools for reporting, risk assessment, incident analysis, and compliance. Live demo session." },
  { weeks: "WK 5–6", title: "Data, SafetyTech & Incident Prevention", desc: "Data strategy for safety functions. Wearables, sensors, computer vision, and drones in practice. Predictive analytics for proactive risk reduction." },
  { weeks: "WK 7–8", title: "Leadership, Culture & IOSH Assessment", desc: "Leading digital transformation in safety. Building AI-ready teams. Board communication and business case development. IOSH certification assessment." }];


  const testimonials = [
  {
    quote: "To be honest, my knowledge about SafetyTech and AI in general was not very good at all. I really enjoyed the fact that it is simple to understand and designed for people who, such as myself, have very little knowledge on the subject.",
    name: "Ana Coutinho", role: "HSE Manager", company: "LEGO GROUP", photo: anaCoutinhoPhoto
  },
  {
    quote: "Safety 4.0 is a solid introductory course for anyone looking to understand how technology is shaping modern health and safety work. It's a great starting point for OHS professionals wanting to build confidence in the health and safety tech space.",
    name: "Jacqueline Carr", role: "Global OSH Leader", company: "SIEMENS", photo: jacquelineCarrPhoto
  },
  {
    quote: "The course felt like a great entry-level introduction to how AI technology is influencing today's HSE leadership. What stood out first was the high production quality and the way the ideas were brought to life through polished, relevant examples.",
    name: "Stewart Deary", role: "Global HSE Director", company: "CRTS GLOBAL", photo: stewartDearyPhoto
  },
  {
    quote: "This program bridges the gap between traditional safety and digital transformation perfectly. The practical applications have revolutionized our safety management systems.",
    name: "Eamonn Doherty", role: "HSSEQ Director", company: "SAMA CONSTRUCTION", photo: eamonnDohertyPhoto
  }];


  const comparisonFeatures = [
  { feature: "Full 10-module course content", accelerator: true, elearning: true },
  { feature: "60+ on-demand video lessons", accelerator: true, elearning: true },
  { feature: "IOSH-approved certificate", accelerator: true, elearning: true },
  { feature: "8+ CPD hours", accelerator: true, elearning: true },
  { feature: "8 live sessions with Lucas", accelerator: true, elearning: false },
  { feature: "Cohort peer community (10–12 people)", accelerator: true, elearning: false },
  { feature: "Direct Q&A access to Lucas", accelerator: true, elearning: false },
  { feature: "Accountability & cohort structure", accelerator: true, elearning: false },
  { feature: "Alumni community access", accelerator: true, elearning: false },
  { feature: "Team option (2+ seats)", accelerator: true, elearning: false }];


  const faqItems = [
  { q: "What if I miss a live session?", a: "All live sessions are recorded and available in your dashboard within 24 hours. You'll never fall behind — but showing up live is where the peer discussion happens and where the real value is built." },
  { q: "Can my employer pay via invoice?", a: "Yes. We support PO/invoice billing for employer-sponsored enrolments and team places. Mention this in your application and we'll handle the paperwork. We're used to working within procurement processes." },
  { q: "Is this relevant if my team is small or I work alone?", a: "Absolutely. The programme is designed for safety professionals at all levels — from sole EHS advisors to heads of large safety functions. The peer cohort gives you a team experience even if you're working solo in your organisation." },
  { q: "How much time do I need to commit each week?", a: "Expect 3–4 hours per week: 90 minutes for the live session, 1–2 hours of on-demand content, and some reflection/application time. The programme is designed for working professionals." },
  { q: "When is the next cohort after May 2026?", a: "Cohorts run quarterly. The next cohort after May 2026 will be September 2026. If May fills before your application is processed, you'll be offered a place on the September cohort." }];


  return (
    <AnalyticsTracker>
      <SEOStructuredData type="course" />
      <div className="min-h-screen relative font-dm">
        <div className="fixed inset-0 bg-gradient-to-br from-[hsl(240,55%,15%)] via-slate-900 to-black -z-10" />

        {/* Floating background decorations */}
        <div className="fixed inset-0 -z-[5] overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/15 via-purple-600/10 to-violet-500/5 blur-3xl animate-[float_20s_ease-in-out_infinite]" />
          <div className="absolute top-[20%] -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-lime-400/10 via-lime-500/15 to-lime-600/8 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-[45%] -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/10 via-pink-600/8 to-pink-400/5 blur-3xl animate-[float_22s_ease-in-out_infinite]" />
          <div className="absolute top-[60%] right-[10%] w-80 h-80 rounded-full bg-gradient-to-br from-purple-600/10 via-purple-500/12 to-purple-400/5 blur-3xl animate-[float_30s_ease-in-out_infinite]" />
          <div className="absolute top-[80%] -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-lime-500/8 via-lime-400/12 to-lime-600/5 blur-3xl animate-[float_28s_ease-in-out_infinite_reverse]" />
          <div className="absolute bottom-[10%] right-[5%] w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/8 via-pink-400/10 to-pink-600/5 blur-3xl animate-[float_24s_ease-in-out_infinite]" />
        </div>

        {/* NAV */}
        <AudienceNav />

        {/* HERO */}
        <section className="min-h-screen flex items-center pt-32 pb-20 px-4 relative overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="text-center">
              {/* Audience Toggle */}
              <div className="flex items-center justify-center mb-6 md:mb-8">
                <AudienceNav inline />
              </div>

              {/* Tag */}
              <div className="inline-flex items-center gap-2 border border-primary/40 rounded-full px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] tracking-[2px] text-primary font-bold font-syne">LIVE COHORT  · APRIL 2026</span>
              </div>

              <h1 className="font-syne text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-6 md:mb-8">
                The Safety 4.0<br />
                <span className="text-primary">Accelerator Cohort</span>
              </h1>

              <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
                4 weeks. Live sessions and self-paced modules.
                <br />A cohort of EHS leaders
                transforming how they lead safety in the digital age.{" "}
                <span className="font-bold text-primary">IOSH certificate</span>. Your next chapter.
              </p>

              {/* Countdown */}
              <div className="mb-10">
                <div className="text-[11px] tracking-[3px] text-muted-foreground font-syne mb-4">COHORT STARTS IN</div>
                <div className="flex gap-3 justify-center">
                  {[
                  { val: countdown.days, label: "DAYS" },
                  { val: countdown.hours, label: "HRS" },
                  { val: countdown.minutes, label: "MIN" },
                  { val: countdown.seconds, label: "SEC" }].
                  map((item) =>
                  <div key={item.label} className="bg-card border border-border rounded-xl px-4 py-3 min-w-[72px] text-center">
                      <div className="font-syne text-3xl font-black text-primary leading-none">{item.val}</div>
                      <div className="text-[10px] tracking-[2px] text-muted-foreground font-syne mt-1">{item.label}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-4 justify-center flex-wrap mb-8">
                <a href="#apply">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 shadow-glow animate-glow-pulse rounded-full">
                    Apply for May Cohort <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
                <a href="#experience">
                  <Button variant="outline" size="lg" className="border-border text-muted-foreground hover:border-primary hover:text-primary rounded-full">
                    See what's included
                  </Button>
                </a>
              </div>

              {/* Seats indicator */}
              <div className="inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-full px-5 py-2">
                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "75%" }} />
                </div>
                <span className="text-amber-500 font-bold text-sm font-syne">Only 3 seats left — Cohort capped at 12</span>
              </div>

              {/* Cross-sell to In-Company */}
              <div className="mt-12 bg-card/60 border border-border rounded-2xl p-6 max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-pink-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-white font-syne">Training your team?</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Enrol 2+ team members together for discounted team pricing, shared experience, and post-cohort debrief.
                </p>
                <Link to="/in-company" className="text-pink-500 hover:text-pink-400 text-sm font-semibold inline-flex items-center gap-1 transition-colors">
                  Explore In-Company training <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ACCELERATOR EXPERIENCE */}
        <section id="experience" className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-pink-500 font-bold mb-4">THE ACCELERATOR EXPERIENCE</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              This isn't an online course.<br />
              It's a <span className="text-primary">transformation cohort</span>.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mb-12">
              The Accelerator combines on-demand course content with live weekly sessions, a peer cohort, and direct access to Lucas. The result is accountability, community, and a credential.
            </p>

            <div ref={setFadeRef(0)} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-0 translate-y-6 transition-all duration-700">
              {experienceItems.map((item, i) =>
              <div key={i} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all">
                  <item.icon className={`w-6 h-6 mb-4 ${i % 2 === 0 ? "text-primary" : "text-pink-500"}`} />
                  <div className="font-syne text-[15px] font-bold text-white mb-2">{item.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 8-WEEK TIMELINE */}
        <section className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">8-WEEK PROGRAMME</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-12">
              Week by <span className="text-pink-500">week</span>.
            </h2>

            <div ref={setFadeRef(1)} className="space-y-6 max-w-3xl opacity-0 translate-y-6 transition-all duration-700">
              {timeline.map((item, i) =>
              <div key={i} className="grid grid-cols-[80px_1fr] gap-6 items-start pb-6 border-b border-border last:border-b-0">
                  <div className="bg-card border border-primary/30 rounded-lg p-3 text-center">
                    <span className="font-syne text-xs font-bold text-primary tracking-[1px]">{item.weeks}</span>
                  </div>
                  <div>
                    <div className="font-syne text-[15px] font-bold text-white mb-2">{item.title}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">WHAT GRADUATES SAY</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-12">
              From professionals<br />
              <span className="text-pink-500">just like you</span>.
            </h2>

            <div ref={setFadeRef(2)} className="grid md:grid-cols-2 gap-5 opacity-0 translate-y-6 transition-all duration-700">
              {testimonials.map((t, i) =>
              <div key={i} className="bg-card border border-border rounded-2xl p-7 flex flex-col hover:border-primary/35 transition-colors">
                  <div className="flex gap-0.5 text-amber-500 mb-4">
                    {Array.from({ length: 5 }).map((_, si) =>
                  <Star key={si} className="w-4 h-4 fill-amber-500" />
                  )}
                  </div>
                  <p className="text-sm text-white italic leading-relaxed flex-1 mb-5">
                    <span className="text-pink-500 text-2xl leading-none align-[-8px] mr-1 not-italic">"</span>
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                  <span className="inline-block mt-3 bg-primary/10 border border-primary/25 rounded-full px-3 py-1 text-[10px] text-primary tracking-[1px] font-semibold w-fit">
                    {t.company}
                  </span>
                </div>
              )}
            </div>

            {/* Money-back guarantee */}
            <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-7 flex gap-6 items-start max-w-3xl">
              <Shield className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <div className="font-syne text-lg font-bold text-white mb-2">14-Day Satisfaction Guarantee</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If you complete Week 1 and don't believe the Accelerator is worth your investment, we'll refund you in full — no questions asked.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-pink-500 font-bold mb-4">WHAT'S INCLUDED</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-12">
              Accelerator vs eLearning.<br />
              <span className="text-primary">Understand the difference</span>.
            </h2>

            <div ref={setFadeRef(3)} className="overflow-x-auto opacity-0 translate-y-6 transition-all duration-700">
              <table className="w-full max-w-3xl border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 font-syne text-xs font-bold tracking-[1px] text-muted-foreground bg-card border-b-2 border-border">Feature</th>
                    <th className="p-4 font-syne text-xs font-bold tracking-[1px] text-primary bg-card border-b-2 border-border text-center">Accelerator Cohort</th>
                    <th className="p-4 font-syne text-xs font-bold tracking-[1px] text-muted-foreground bg-card border-b-2 border-border text-center">eLearning</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) =>
                  <tr key={i} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
                      <td className="p-4 text-sm text-muted-foreground font-medium border-b border-border">{row.feature}</td>
                      <td className="p-4 text-center border-b border-border">
                        {row.accelerator ? <CheckCircle className="w-5 h-5 text-primary inline-block" /> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-4 text-center border-b border-border">
                        {row.elearning ? <CheckCircle className="w-5 h-5 text-primary inline-block" /> : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-card">
                    <td className="p-4 text-sm font-bold text-white">Price</td>
                    <td className="p-4 text-center font-syne text-lg font-black text-primary">£997</td>
                    <td className="p-4 text-center font-syne text-lg font-bold text-muted-foreground">£597</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* APPLICATION FORM */}
        <section id="apply" className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">APPLY FOR MAY COHORT</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-12">
              3 seats remaining.<br />
              <span className="text-pink-500">Applications close 25 April</span>.
            </h2>

            <div ref={setFadeRef(4)} className="bg-card border border-primary/25 rounded-3xl overflow-hidden grid lg:grid-cols-2 opacity-0 translate-y-6 transition-all duration-700">
              {/* Left - details */}
              <div className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="font-syne text-sm font-bold tracking-[2px] text-primary mb-6">MAY 2026 COHORT DETAILS</div>
                <div className="space-y-4">
                  {[
                  { label: "Start date", val: "5 May 2026" },
                  { label: "Duration", val: "8 weeks" },
                  { label: "Live sessions", val: "Tuesdays, 18:30–20:00 BST" },
                  { label: "Cohort size", val: "12 participants max" },
                  { label: "Seats remaining", val: "3 of 12" },
                  { label: "Individual price", val: "£997" },
                  { label: "Team price (2+)", val: "£895/person" },
                  { label: "IOSH certificate", val: "Included for all" },
                  { label: "Application deadline", val: "25 April 2026" }].
                  map((row, i) =>
                  <div key={i} className="flex justify-between border-b border-border pb-3 text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="text-white font-medium">{row.val}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 bg-primary/10 border border-primary/25 rounded-xl p-5">
                  <div className="font-syne text-xs font-bold tracking-[1px] text-primary mb-2">14-DAY MONEY-BACK GUARANTEE</div>
                  <p className="text-sm text-muted-foreground">Complete Week 1. If you're not convinced, get a full refund. No questions asked.</p>
                </div>
              </div>

              {/* Right - form */}
              <div className="p-8 md:p-12 border-t lg:border-t-0 lg:border-l border-border">
                <h3 className="font-syne text-xl font-bold text-white mb-2">Apply for the May 2026 Cohort</h3>
                <p className="text-sm text-muted-foreground mb-6">We'll confirm your place within 24 hours.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">FIRST NAME</label>
                      <input
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                        placeholder="Jane" />
                      
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">LAST NAME</label>
                      <input
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                        placeholder="Smith" />
                      
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">WORK EMAIL</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      placeholder="jane@company.com" />
                    
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">JOB TITLE</label>
                    <input
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      placeholder="HSE Manager" />
                    
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">ORGANISATION</label>
                      <input
                        value={formData.organisation}
                        onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                        className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                        placeholder="Acme Corp" />
                      
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">SEATS NEEDED</label>
                      <select
                        value={formData.seatsNeeded}
                        onChange={(e) => setFormData({ ...formData, seatsNeeded: e.target.value })}
                        className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none transition-colors appearance-none">
                        
                        <option value="1">1 seat (£997)</option>
                        <option value="2">2 seats (£895/person)</option>
                        <option value="3">3 seats (£895/person)</option>
                        <option value="4+">4+ seats — contact us</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">HOW ARE YOU FUNDING THIS?</label>
                    <select
                      value={formData.fundingSource}
                      onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                      className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none transition-colors appearance-none">
                      
                      <option value="">Select...</option>
                      <option value="self-funding">Self-funding</option>
                      <option value="employer-sponsored">Employer-sponsored</option>
                      <option value="team-budget">Team / In-Company budget</option>
                      <option value="not-sure">Not sure yet</option>
                    </select>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm py-3 shadow-glow mt-2">
                    {isSubmitting ?
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> :

                    <>Apply for May Cohort <ArrowRight className="w-4 h-4 ml-2" /></>
                    }
                  </Button>

                  <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                    Submitting this form is not a payment. We'll confirm your place and send payment details within 24 hours. 14-day satisfaction guarantee on all places.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-pink-500 font-bold mb-4">FREQUENTLY ASKED</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-12">
              Questions before <span className="text-primary">you apply</span>.
            </h2>

            <div ref={setFadeRef(5)} className="max-w-3xl opacity-0 translate-y-6 transition-all duration-700">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) =>
                <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                    <AccordionTrigger className="text-sm font-bold text-white text-left hover:no-underline py-5">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div ref={setFadeRef(6)} className="bg-gradient-to-br from-card to-primary/5 border border-primary/20 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden opacity-0 translate-y-6 transition-all duration-700">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,hsl(85,100%,72%,0.04)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                  Ready to join the<br />May cohort?
                </h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
                  3 seats remaining. Applications close 25 April 2026.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a href="#apply">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-10 shadow-glow">
                      Apply Now <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                  <a href="https://safetyacademy.mykajabi.com/offers/E2ZXsoXV" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold text-base px-10">
                      Or start with eLearning (£597)
                    </Button>
                  </a>
                </div>
                <div className="flex flex-wrap gap-6 justify-center mt-7">
                  {["14-day money-back guarantee", "IOSH-approved programme", "Only 12 per cohort", "Payment plans available"].map((item) =>
                  <span key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" /> {item}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certification logos */}
        <div className="flex items-center justify-center gap-8 py-10 border-t border-border">
          <img src={ioshLogo} alt="IOSH Approved" className="h-12 opacity-70" />
          <img src={cpdLogo} alt="CPD Approved" className="h-12 opacity-70" />
        </div>

        <Footer />
      </div>
    </AnalyticsTracker>);

};

export default Cohort;