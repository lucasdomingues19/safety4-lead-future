import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { countryCodes } from "@/data/countryCodes";
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
  FileDown,
  Loader2,
  Star,
  Calendar,
  Clock,
  MapPin,
  Lock } from
"lucide-react";
import { Link } from "react-router-dom";
import AudienceNav from "@/components/AudienceNav";
import { AnimatedSpiderChart } from "@/components/AnimatedSpiderChart";
import ioshLogo from "@/assets/iosh-approved-logo.jpg";
import cpdLogo from "@/assets/cpd-approved-logo.png";
import anaCoutinhoPhoto from "@/assets/ana-coutinho-photo.jpeg";
import stewartDearyPhoto from "@/assets/stewart-deary-photo.jpeg";
import jacquelineCarrPhoto from "@/assets/jacqueline-carr-photo.jpeg";
import eamonnDohertyPhoto from "@/assets/eamonn-doherty-photo.jpeg";
import ioshCpdCombined from "@/assets/iosh-cpd-combined-transparent.png";

const cohortSchedule = [
{ month: "September", year: 2026, startDate: "2 Sep 2026", status: "filling" as const, seatsLeft: 10, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£1,997" },
{ month: "October", year: 2026, startDate: "6 Oct 2026", status: "open" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£1,997" },
{ month: "November", year: 2026, startDate: "3 Nov 2026", status: "open" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 GMT", price: "£1,997" },
{ month: "December", year: 2026, startDate: "1 Dec 2026", status: "coming_soon" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 GMT", price: "£1,997" },
{ month: "January", year: 2027, startDate: "", status: "coming_soon" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 GMT", price: "£1,997" },
{ month: "February", year: 2027, startDate: "", status: "coming_soon" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 GMT", price: "£1,997" }];


const Cohort = () => {
  const fadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<typeof cohortSchedule[0] | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+44",
    phone: "",
    jobTitle: "",
    linkedin: "",
    country: "",
    organisation: "",
    digitalFluency: "",
    upskillAttempts: [] as string[],
    blockers: [] as string[],
    motivation: "",
    budgetApproval: "",
    canAfford: "",
    canCommit: ""
  });


  // Countdown to September 2, 2026
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date("2026-09-02T00:00:00Z").getTime();
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
      title: "Accelerator • Cohort — 4-Week IOSH Approved Live Programme | September 2026",
      description: "Join the Accelerator • Cohort: 4 weeks of live sessions with Lucas Domingues, peer learning, IOSH certification. Only 15 seats per cohort. Apply for September 2026.",
      canonical: "https://safetyacademy.tech/accelerator"
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
    const cohortLabel = selectedCohort ? `${selectedCohort.month} ${selectedCohort.year}` : "Unknown";
    const messageDetails = [
    `Cohort: ${cohortLabel}`,
    `LinkedIn: ${formData.linkedin || "Not provided"}`,
    `Country: ${formData.country || "Not provided"}`,
    `Organisation: ${formData.organisation || "Not provided"}`,
    `Digital Fluency: ${formData.digitalFluency}`,
    `Upskill Attempts: ${formData.upskillAttempts.join(", ")}`,
    `Blockers: ${formData.blockers.join(", ")}`,
    `Motivation: ${formData.motivation}`,
    `Budget Approval: ${formData.budgetApproval}`,
    `Can Afford: ${formData.canAfford}`,
    `Can Commit: ${formData.canCommit}`].
    join("\n");

    try {
      const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();
      const { error: leadError } = await supabase.functions.invoke("capture-lead", {
        body: {
          name: fullName,
          email: formData.email,
          phone: fullPhone,
          job_title: formData.jobTitle,
          source: "cohort-application",
          message: messageDetails
        }
      });
      if (leadError) throw leadError;

      const { error: emailError } = await supabase.functions.invoke("send-contact-email", {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: `${formData.countryCode} ${formData.phone}`.trim(),
          role: formData.jobTitle,
          inquiryType: "Cohort Application",
          message: `New Cohort Application — ${cohortLabel}\n\nJob Title: ${formData.jobTitle}\nLinkedIn: ${formData.linkedin}\nCountry: ${formData.country}\nOrganisation: ${formData.organisation || "N/A"}\nDigital Fluency: ${formData.digitalFluency}\nUpskill Attempts: ${formData.upskillAttempts.join(", ")}\nBlockers: ${formData.blockers.join(", ")}\nMotivation: ${formData.motivation}\nBudget Approval: ${formData.budgetApproval}\nCan Afford: ${formData.canAfford}\nCan Commit: ${formData.canCommit}`
        }
      });
      if (emailError) throw emailError;

      toast({
        title: "Application received!",
        description: `We'll confirm your place on the ${cohortLabel} cohort within 24 hours.`
      });

      setFormData({ firstName: "", lastName: "", email: "", countryCode: "+44", phone: "", jobTitle: "", linkedin: "", country: "", organisation: "", digitalFluency: "", upskillAttempts: [], blockers: [], motivation: "", budgetApproval: "", canAfford: "", canCommit: "" });
      setFormStep(1);
      setSelectedCohort(null);
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
  { icon: Video, title: "7 Live Sessions", desc: "Weekly live group sessions — not webinars. Interactive, discussion-led, and tailored to what the cohort needs. Lucas brings 15 years of practitioner experience into every session." },
  { icon: Users, title: "Cohort of 10–15 Peers max", desc: "Deliberately small. You'll learn alongside EHS professionals from construction, manufacturing, energy, and logistics. Real problems, real perspectives, lasting relationships." },
  { icon: Award, title: "IOSH-Approved Certificate", desc: "The world's first IOSH-approved Safety 4.0 programme. Your certificate carries IOSH's institutional credibility — recognised by employers in the UK and internationally." },
  { icon: BookOpen, title: "60+ On-Demand Lessons", desc: "Studio-recorded lessons available anytime, alongside live sessions. 10 modules covering AI, SafetyTech, data strategy, digital culture, and leadership. 8+ CPD hours." },
  { icon: Globe, title: "Alumni Community Access", desc: "Graduates join a growing network of Safety 4.0 leaders across 12+ countries. Lucas runs regular alumni sessions for ongoing development. A career-long network." },
  { icon: Zap, title: "Weekly Q&A Sessions", desc: "Live weekly Q&A sessions where you can ask questions, share progress, and get feedback on how to apply what you're learning in your specific context." }];


  const timeline = [
  { weeks: "WK 1", title: "Foundations — Safety 4.0 & the Digital Shift", desc: "What Industry 4.0 means for EHS. Where AI, IoT, and data intersect with safety. The strategic case for change. Building your digital safety foundations" },
  { weeks: "WK 2", title: "Data strategy, Safetytech applications", desc: "Data strategy for safety functions. Wearables, sensors, computer vision, and drones in practice. Predictive analytics for proactive risk reduction." },
  { weeks: "WK 3", title: "AI Essentials & Risk, Compliance and Governance", desc: "Machine learning, NLP, and large language models applied to EHS. Practical tools for reporting, risk assessment, incident analysis, and compliance. Live demo session." },
  { weeks: "WK 4", title: "Leadership, Change and Transformation", desc: "Leading digital transformation in safety. Building AI-ready teams. Board communication and business case development with ROI determination. Final certification assessment." }];


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
  { feature: "5 live sessions with Lucas", accelerator: true, elearning: false },
  { feature: "Cohort peer community (10–15 people)", accelerator: true, elearning: false },
  { feature: "Direct Q&A access to Lucas", accelerator: true, elearning: false },
  { feature: "Accountability & cohort structure", accelerator: true, elearning: false },
  { feature: "Alumni community access", accelerator: true, elearning: false },
  { feature: "Team option (2+ seats)", accelerator: true, elearning: false }];


  return (
    <AnalyticsTracker>
      <SEOStructuredData type="course" />
      <div className="min-h-screen relative font-dm bg-white text-slate-900">
        <div className="fixed inset-0 bg-white -z-10" />

        {/* Floating background decorations */}

        {/* NAV */}
        <AudienceNav />

        {/* HERO */}
        <section className="min-h-screen flex items-center pt-32 pb-20 px-4 relative overflow-hidden">
          {/* Grid pattern */}

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">
              {/* Left column - Hero content */}
              <div className="text-left">
                {/* Tag */}

                <h1 className="font-syne text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-slate-900 mb-6 md:mb-8">
                  Safety 4.0 Accelerator&nbsp;<br />
                  <span className="text-primary">Cohort</span>
                </h1>

                <p className="text-base md:text-xl text-slate-600 max-w-xl leading-relaxed mb-10 font-light">
                  A senior executive leadership programme delivered LIVE.
                  <br />6 weeks. Live sessions and self-paced modules.
                  <br />A cohort of EHS leaders navigating the AI transition in the digital age.
                </p>

                {/* Countdown */}
                <div className="mb-10">
                  <div className="text-[11px] tracking-[3px] text-muted-foreground font-syne mb-4">NEXT COHORT STARTS IN</div>
                  <div className="flex gap-3">
                    {[
                    { val: countdown.days, label: "DAYS" },
                    { val: countdown.hours, label: "HRS" },
                    { val: countdown.minutes, label: "MIN" },
                    { val: countdown.seconds, label: "SEC" }].
                    map((item) =>
                    <div key={item.label} className="bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 min-w-[72px] text-center">
                        <div className="font-syne text-3xl font-black text-primary leading-none">{item.val}</div>
                        <div className="text-[10px] tracking-[2px] text-muted-foreground font-syne mt-1">{item.label}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex gap-4 flex-wrap mb-8">
                  <a href="/enrol">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 shadow-glow animate-glow-pulse rounded-full">
                      Apply for September Cohort <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                  <a href="#experience">
                    <Button variant="outline" size="lg" className="border-border text-muted-foreground hover:border-primary hover:text-primary rounded-full">
                      See what's included
                    </Button>
                  </a>
                </div>


              </div>

              {/* Right column - Spider Chart */}
              <div className="hidden lg:flex items-center justify-center">
                <AnimatedSpiderChart
                  categories={[
                  { label: "Knowledge", icon: "🔍" },
                  { label: "Technology", icon: "⚙️" },
                  { label: "Risk\nManagement", icon: "🛡" },
                  { label: "Change\nManagement", icon: "🔄" },
                  { label: "Leadership", icon: "👤" }]
                  }
                  beforeValues={[28, 22, 35, 18, 30]}
                  afterValues={[85, 80, 90, 75, 88]}
                  beforeLabel="BEFORE PROGRAMME"
                  afterLabel="AFTER SAFETY 4.0" />
                
              </div>
            </div>
          </div>
        </section>

        {/* ACCELERATOR EXPERIENCE */}
        <section id="experience" className="py-12 md:py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">THE ACCELERATOR EXPERIENCE</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-4">
              This isn't an online course.<br />
              It's a <span className="text-primary">transformation journey</span>.
            </h2>
            <p className="text-lg text-slate-700 max-w-xl mb-12">
              The Accelerator combines on-demand course content with live weekly sessions, a peer cohort, and direct access to Lucas. The result is accountability, community, and a credential.
            </p>

            <div ref={setFadeRef(0)} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-0 translate-y-6 transition-all duration-700">
              {experienceItems.map((item, i) =>
              <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 hover:border-primary/30 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="font-syne text-[15px] font-bold text-slate-900 mb-2">{item.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              )}
            </div>

            <a href="https://learning.safetyacademy.tech/brochure" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group">
              <FileDown className="w-4 h-4" />
              Download Cohort Brochure
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>

        {/* 4-WEEK TIMELINE */}
        <section className="py-12 md:py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">4-WEEK PROGRAMME</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-12">
              Week by <span className="text-primary">week</span>.
            </h2>

            <div ref={setFadeRef(1)} className="space-y-6 max-w-3xl opacity-0 translate-y-6 transition-all duration-700">
              {timeline.map((item, i) =>
              <div key={i} className="grid grid-cols-[80px_1fr] gap-6 items-start pb-6 border-b border-border last:border-b-0">
                  <div className="bg-card border border-primary/30 rounded-lg p-3 text-center">
                    <span className="font-syne text-xs font-bold text-primary tracking-[1px]">{item.weeks}</span>
                  </div>
                  <div>
                    <div className="font-syne text-[15px] font-bold text-slate-900 mb-2">{item.title}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* THE PROGRAMME */}
        <section id="programme" className="py-12 md:py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">THE PROGRAMME</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-2">
              Accelerator • Cohort
            </h2>
            <h3 className="font-syne text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-4">
              4 weeks. 10 modules. 60+ lessons and masterclasses.<br />One <span className="text-primary">IOSH-certified</span> and <span className="text-primary">CPD-accredited</span> outcome.
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {[
              { num: "01", title: "Introduction & Orientation", desc: "Course overview, objectives, CPD & IOSH value, learner expectations." },
              { num: "02", title: "What is Safety 4.0?", desc: "Definition of Safety 4.0, triangle (People, Processes, Tech), role of data, 4th Industrial Revolution." },
              { num: "03", title: "The Safety Status Quo is Broken", desc: "Compliance-heavy culture, lagging indicators, reactive safety trap." },
              { num: "04", title: "Skills for the Safety Leader in the Digital Age", desc: "Digital literacy, AI/data awareness, adaptive intelligence, communication skills." },
              { num: "05", title: "Safetytech Practical Applications", desc: "Wearables, IoT, drones, mobile-first systems, computer vision." },
              { num: "06", title: "Building your Digital Safety Toolkit", desc: "Practical day-to-day tools: reporting apps, AI writing, automation, QR codes." },
              { num: "07", title: "Data Strategy: From Chaos to Clarity", desc: "Data collection, centralisation, cleaning, analysis; pitfalls & benefits." },
              { num: "08", title: "AI Essentials for Safety Leaders", desc: "AI history, ML, NLP, LLMs, CV, agentic AI, real-world cases, myths & risks." },
              { num: "09", title: "Compliance, Risk & Governance Essentials", desc: "Digital compliance, regulation, governance frameworks, ethical AI." },
              { num: "10", title: "Digital Safety Transformation Framework", desc: "ROI, executive influence, linking safety to business performance." }].
              map((mod, i) =>
              <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-primary/30 hover:-translate-y-0.5 transition-all">
                  <div className={`text-[11px] tracking-[2px] font-bold mb-2 ${i % 2 === 1 ? 'text-primary' : 'text-primary'}`}>MODULE {mod.num}</div>
                  <div className="text-[15px] font-bold text-slate-900 mb-2">{mod.title}</div>
                  <div className="text-sm text-muted-foreground">{mod.desc}</div>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
              { val: "60+", label: "Studio-recorded video lessons, available on demand" },
              { val: "CPD", label: "Continued Professional Development — verifiable CPD hours upon completion" },
              { val: "IOSH", label: "Approved certification recognised globally" },
              { val: "Global", label: "Impact — delivered to teams in 12+ countries" }].
              map((s, i) =>
              <div key={i} className="bg-primary/8 border border-primary/25 rounded-xl p-5">
                  <div className="text-2xl font-black text-primary">{s.val}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">WHAT ALUMINI GRADUATES SAY</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-12">
              From safety leaders <span className="text-primary">just like you</span>.
            </h2>

            <div ref={setFadeRef(2)} className="grid md:grid-cols-2 gap-6 opacity-0 translate-y-6 transition-all duration-700">
              {testimonials.map((t, i) =>
              <div key={i} className="bg-primary border border-primary rounded-2xl md:rounded-3xl p-8 md:p-10 flex flex-col shadow-lg hover:shadow-xl hover:border-secondary transition-all">
                  <p className="text-base md:text-lg text-primary-foreground italic leading-relaxed flex-1 mb-6">
                    <span className="text-primary-foreground/70 text-3xl leading-none align-[-8px] mr-1 not-italic">"</span>
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-primary-foreground/30" />
                    <div>
                      <div className="text-base font-bold text-primary-foreground">{t.name}</div>
                      <div className="text-sm text-primary-foreground/70">{t.role}, {t.company}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Money-back guarantee */}
            <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-5 md:p-7 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              <Shield className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <div className="font-syne text-lg font-bold text-slate-900 mb-2">14-Day Satisfaction Guarantee</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If you complete Week 1 and don't believe the Accelerator is worth your investment, we'll refund you in full — no questions asked.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="py-12 md:py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white bg-primary inline-block px-3 py-1.5 rounded-md mb-4">WHAT'S INCLUDED</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-12">
              Accelerator vs eLearning.<br />
              <span className="text-primary">Understand the difference</span>.
            </h2>

            <div ref={setFadeRef(3)} className="overflow-x-auto opacity-0 translate-y-6 transition-all duration-700">
              <table className="w-full max-w-3xl border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 md:p-4 font-syne text-xs font-bold tracking-[1px] text-muted-foreground bg-card border-b-2 border-border">Feature</th>
                    <th className="p-3 md:p-4 font-syne text-xs font-bold tracking-[1px] text-primary bg-card border-b-2 border-border text-center">Accelerator</th>
                    <th className="p-3 md:p-4 font-syne text-xs font-bold tracking-[1px] text-muted-foreground bg-card border-b-2 border-border text-center">eLearning</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) =>
                  <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : ""}>
                      <td className="p-3 md:p-4 text-sm text-muted-foreground font-medium border-b border-border">{row.feature}</td>
                      <td className="p-3 md:p-4 text-center border-b border-border">
                        {row.accelerator ? <CheckCircle className="w-5 h-5 text-primary inline-block" /> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-3 md:p-4 text-center border-b border-border">
                        {row.elearning ? <CheckCircle className="w-5 h-5 text-primary inline-block" /> : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-card">
                    <td className="p-3 md:p-4 text-sm font-bold text-slate-900">Price</td>
                    <td className="p-3 md:p-4 text-center font-syne text-lg font-black text-primary">£1,997</td>
                    <td className="p-3 md:p-4 text-center font-syne text-lg font-bold text-muted-foreground">£597</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* COHORT CALENDAR */}

        {/* APPLICATION MODAL */}
        <Dialog open={!!selectedCohort} onOpenChange={(open) => {if (!open) {setSelectedCohort(null);setFormStep(1);}}}>
          <DialogContent className="bg-white border-slate-200 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-syne text-xl font-black text-slate-900">
                Apply for {selectedCohort?.month} {selectedCohort?.year} Cohort
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Starting {selectedCohort?.startDate || "TBC"} · {selectedCohort?.seatsLeft} seats remaining · Step {formStep} of 2
              </DialogDescription>
            </DialogHeader>

            {/* Progress bar */}
            <div className="w-full h-1 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: formStep === 1 ? "50%" : "100%" }} />
            </div>

            {formStep === 1 ?
            <div className="space-y-4 mt-2">
                <div className="text-xs font-syne font-bold text-primary tracking-[2px] mb-2">YOUR DETAILS</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">FIRST NAME *</label>
                    <input required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-colors" placeholder="Jane" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">LAST NAME *</label>
                    <input required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-colors" placeholder="Smith" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">WORK EMAIL *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-colors" placeholder="jane@company.com" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">PHONE NUMBER *</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="bg-white border border-slate-300 rounded-lg px-2 py-2.5 text-sm text-slate-900 w-28 flex-shrink-0 focus:border-primary focus:outline-none transition-colors"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code} className="bg-white text-slate-900">
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-colors" placeholder="7911 123456" />
                  </div>
                </div>
                <div>
                  <input required value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-colors" placeholder="HSE Manager" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">LINKEDIN PROFILE *</label>
                  <input required value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-colors" placeholder="https://linkedin.com/in/yourprofile" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">COUNTRY *</label>
                  <input required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-colors" placeholder="United Kingdom" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">ORGANISATION</label>
                  <input value={formData.organisation} onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-colors" placeholder="Acme Corp" />
                </div>
                <Button type="button" onClick={() => {
                if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.jobTitle || !formData.linkedin || !formData.country) {
                  toast({ title: "Please fill in all required fields", variant: "destructive" });
                  return;
                }
                setFormStep(2);
              }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm py-3">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div> :

            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                <div className="text-xs font-syne font-bold text-primary tracking-[2px] mb-2">ABOUT YOU</div>

                {/* Digital Fluency */}
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-2 tracking-[0.5px]">DIGITAL FLUENCY / MATURITY *</label>
                  <div className="space-y-2">
                    {[
                  "I'm great at safety, but tech isn't my strength",
                  "I want to learn, but I don't know what to focus on",
                  "I've tried a few tools, but I don't fully trust the outputs yet",
                  "I'm confident with tools — I need a structure + roadmap",
                  "I'm already driving digital initiatives — I want to level up"].
                  map((opt) =>
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.digitalFluency === opt ? "border-primary bg-primary/10 text-slate-900" : "border-slate-300 text-slate-700 hover:border-primary/30"}`}>
                        <input type="radio" name="digitalFluency" value={opt} checked={formData.digitalFluency === opt}
                    onChange={() => setFormData({ ...formData, digitalFluency: opt })} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.digitalFluency === opt ? "border-primary" : "border-slate-400"}`}>
                          {formData.digitalFluency === opt && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        {opt}
                      </label>
                  )}
                  </div>
                </div>

                {/* Upskill attempts */}
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-2 tracking-[0.5px]">WHAT HAVE YOU TRIED TO UPSKILL? * (select all)</label>
                  <div className="space-y-2">
                    {["YouTube / podcasts", "Short courses (Udemy, Coursera, etc.)", "Formal certification / accredited training", "Internal company training (L&D)", "Reading (books, newsletters, blogs)", "Attending webinars / conferences", "Experimenting with tools (ChatGPT, Copilot, Power BI)", "Mentoring / coaching", "Nothing yet"].map((opt) =>
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.upskillAttempts.includes(opt) ? "border-primary bg-primary/10 text-slate-900" : "border-slate-300 text-slate-700 hover:border-primary/30"}`}>
                        <input type="checkbox" checked={formData.upskillAttempts.includes(opt)}
                    onChange={() => setFormData({ ...formData, upskillAttempts: formData.upskillAttempts.includes(opt) ? formData.upskillAttempts.filter((x) => x !== opt) : [...formData.upskillAttempts, opt] })} className="sr-only" />
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.upskillAttempts.includes(opt) ? "border-primary bg-primary" : "border-slate-400"}`}>
                          {formData.upskillAttempts.includes(opt) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        {opt}
                      </label>
                  )}
                  </div>
                </div>

                {/* Blockers */}
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-2 tracking-[0.5px]">BIGGEST BLOCKERS * (select all)</label>
                  <div className="space-y-2">
                    {["I don't have time / overloaded with compliance", "I don't know what to focus on", "I start but struggle to stay consistent", "I don't have a clear EHS use case", "I don't trust the outputs / fear getting it wrong", "My organisation isn't supportive", "Security / GDPR / governance concerns", "Budget constraints"].map((opt) =>
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.blockers.includes(opt) ? "border-primary bg-primary/10 text-slate-900" : "border-slate-300 text-slate-700 hover:border-primary/30"}`}>
                        <input type="checkbox" checked={formData.blockers.includes(opt)}
                    onChange={() => setFormData({ ...formData, blockers: formData.blockers.includes(opt) ? formData.blockers.filter((x) => x !== opt) : [...formData.blockers, opt] })} className="sr-only" />
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.blockers.includes(opt) ? "border-primary bg-primary" : "border-slate-400"}`}>
                          {formData.blockers.includes(opt) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        {opt}
                      </label>
                  )}
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-2 tracking-[0.5px]">BIGGEST MOTIVATION *</label>
                  <div className="space-y-2">
                    {[
                  "A clear, structured path to stop consuming and start executing",
                  "Real digital/AI fluency for EHS — without hype",
                  "Confidence to evaluate tools/vendors and challenge outputs",
                  "Career acceleration and future-proofing",
                  "Save time by replacing admin with smarter workflows",
                  "Accountability and coaching to stay consistent"].
                  map((opt) =>
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.motivation === opt ? "border-primary bg-primary/10 text-slate-900" : "border-slate-300 text-slate-700 hover:border-primary/30"}`}>
                        <input type="radio" name="motivation" value={opt} checked={formData.motivation === opt}
                    onChange={() => setFormData({ ...formData, motivation: opt })} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.motivation === opt ? "border-primary" : "border-slate-400"}`}>
                          {formData.motivation === opt && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        {opt}
                      </label>
                  )}
                  </div>
                </div>

                {/* Budget Approval */}
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-2 tracking-[0.5px]">BUDGET APPROVAL ABILITY *</label>
                  <div className="space-y-2">
                    {["I own the budget and will approve it", "I recommend, someone else approves", "I need full approval"].map((opt) =>
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.budgetApproval === opt ? "border-primary bg-primary/10 text-slate-900" : "border-slate-300 text-slate-700 hover:border-primary/30"}`}>
                        <input type="radio" name="budgetApproval" value={opt} checked={formData.budgetApproval === opt}
                    onChange={() => setFormData({ ...formData, budgetApproval: opt })} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.budgetApproval === opt ? "border-primary" : "border-slate-400"}`}>
                          {formData.budgetApproval === opt && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        {opt}
                      </label>
                  )}
                  </div>
                </div>

                {/* Can Afford */}
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-2 tracking-[0.5px]">CAN YOU AFFORD THE £1,997 + VAT FEE? *</label>
                  <div className="flex gap-3">
                    {["Yes", "No"].map((opt) =>
                  <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-sm font-semibold ${formData.canAfford === opt ? "border-primary bg-primary/10 text-slate-900" : "border-slate-300 text-slate-700 hover:border-primary/30"}`}>
                        <input type="radio" name="canAfford" value={opt} checked={formData.canAfford === opt}
                    onChange={() => setFormData({ ...formData, canAfford: opt })} className="sr-only" />
                        {opt}
                      </label>
                  )}
                  </div>
                </div>

                {/* Can Commit */}
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-2 tracking-[0.5px]">CAN YOU COMMIT TO THE COHORT SCHEDULE? *</label>
                  <div className="space-y-2">
                    {["Yes, 100%", "Yes, but will need some adjustments", "No"].map((opt) =>
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.canCommit === opt ? "border-primary bg-primary/10 text-slate-900" : "border-slate-300 text-slate-700 hover:border-primary/30"}`}>
                        <input type="radio" name="canCommit" value={opt} checked={formData.canCommit === opt}
                    onChange={() => setFormData({ ...formData, canCommit: opt })} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${formData.canCommit === opt ? "border-primary" : "border-slate-400"}`}>
                          {formData.canCommit === opt && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        {opt}
                      </label>
                  )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setFormStep(1)} className="border-border text-muted-foreground hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !formData.digitalFluency || formData.upskillAttempts.length === 0 || formData.blockers.length === 0 || !formData.motivation || !formData.budgetApproval || !formData.canAfford || !formData.canCommit}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm py-3 shadow-glow">
                    {isSubmitting ?
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> :
                  <>Submit Application <ArrowRight className="w-4 h-4 ml-2" /></>
                  }
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  This is not a payment. We review applications and confirm your place within 24 hours. 14-day satisfaction guarantee.
                </p>
              </form>
            }
          </DialogContent>
        </Dialog>

        {/* FAQ Link */}
        <section className="py-12 md:py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-4">
              Have questions?
            </h2>
            <p className="text-muted-foreground mb-8">Find answers about the Accelerator, eLearning, and In-Company training.</p>
            <a href="/faq" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-lg transition-colors">
              Visit our FAQ page →
            </a>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div ref={setFadeRef(6)} className="bg-gradient-to-br from-slate-50 to-primary/5 border border-primary/20 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden opacity-0 translate-y-6 transition-all duration-700">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,hsl(85,100%,72%,0.04)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-4">
                  Ready to join the<br />next cohort?
                </h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a href="/enrol">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-10 shadow-glow">
                      Apply Now <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                  <a href="https://safetyacademy.mykajabi.com/offers/E2ZXsoXV" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-base px-10">
                      Or start with eLearning (£597)
                    </Button>
                  </a>
                </div>
                <div className="flex flex-wrap gap-6 justify-center mt-7">
                  {["14-day money-back guarantee", "IOSH-approved programme", "Only 15 per cohort", "Payment plans available"].map((item) =>
                  <span key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" /> {item}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>


        <Footer />
      </div>
    </AnalyticsTracker>);

};

export default Cohort;
