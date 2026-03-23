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
{ month: "April", year: 2026, startDate: "6 Apr 2026", status: "filling" as const, seatsLeft: 8, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£997" },
{ month: "May", year: 2026, startDate: "4 May 2026", status: "open" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£997" },
{ month: "June", year: 2026, startDate: "1 Jun 2026", status: "open" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£997" },
{ month: "July", year: 2026, startDate: "7 Jul 2026", status: "open" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£997" },
{ month: "August", year: 2026, startDate: "", status: "coming_soon" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£997" },
{ month: "September", year: 2026, startDate: "", status: "coming_soon" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£997" },
{ month: "October", year: 2026, startDate: "", status: "coming_soon" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£997" },
{ month: "November", year: 2026, startDate: "", status: "coming_soon" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£997" },
{ month: "December", year: 2026, startDate: "", status: "coming_soon" as const, seatsLeft: 15, totalSeats: 15, liveSessions: "Tuesdays, 18:30–20:00 BST", price: "£997" }];


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

  // Countdown to April 6, 2026
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date("2026-04-06T00:00:00Z").getTime();
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
      title: "Accelerator • Cohort — 4-Week IOSH Approved Live Programme | April 2026",
      description: "Join the Accelerator • Cohort: 4 weeks of live sessions with Lucas Domingues, peer learning, IOSH certification. Only 15 seats per cohort. Apply for April 2026.",
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

      const { error: emailError } = await supabase.functions.invoke("send-contact-email", {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
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

      setFormData({ firstName: "", lastName: "", email: "", jobTitle: "", linkedin: "", country: "", organisation: "", digitalFluency: "", upskillAttempts: [], blockers: [], motivation: "", budgetApproval: "", canAfford: "", canCommit: "" });
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
  { icon: Video, title: "5 Live Sessions ", desc: "Weekly live group sessions — not webinars. Interactive, discussion-led, and tailored to what the cohort needs. Lucas brings 15 years of practitioner experience into every session." },
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
      <div className="min-h-screen relative font-dm">
        <div className="fixed inset-0 bg-black -z-10" />

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

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">
              {/* Left column - Hero content */}
              <div className="text-left">
                {/* Tag */}

                <h1 className="font-syne text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-6 md:mb-8">
                  Accelerator •<br />
                  <span className="text-primary">Cohort </span>
                </h1>

                <p className="text-base md:text-xl text-gray-300 max-w-xl leading-relaxed mb-10 font-light">
                  4 weeks. Live sessions and self-paced modules.
                  <br />A cohort of EHS professionals
                   transforming how they lead safety in the digital age.
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
                    <div key={item.label} className="bg-card border border-border rounded-xl px-4 py-3 min-w-[72px] text-center">
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
                      Apply for April Cohort <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                  <a href="#experience">
                    <Button variant="outline" size="lg" className="border-border text-muted-foreground hover:border-primary hover:text-primary rounded-full">
                      See what's included
                    </Button>
                  </a>
                </div>


                {/* Cross-sell to In-Company */}
                <div className="mt-8 bg-card/60 border border-border rounded-2xl p-4 md:p-6 max-w-lg flex items-center gap-3 flex-wrap">
                  <Building2 className="w-5 h-5 text-pink-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-white font-syne">Training your team?</span>
                  <Link to="/in-company" className="text-pink-500 hover:text-pink-400 text-sm font-semibold inline-flex items-center gap-1 transition-colors">
                    Explore In-Company training <ArrowRight className="w-4 h-4" />
                  </Link>
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
        <section id="experience" className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-pink-500 font-bold mb-4">THE ACCELERATOR EXPERIENCE</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              This isn't an online course.<br />
              It's a <span className="text-primary">transformation journey</span>.
            </h2>
            <p className="text-lg text-white max-w-xl mb-12">
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

            <a href="/contact?request=cohort-brochure" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-pink-500 hover:text-pink-400 transition-colors group">
              <FileDown className="w-4 h-4" />
              Download Cohort Brochure
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>

        {/* 4-WEEK TIMELINE */}
        <section className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">4-WEEK PROGRAMME</div>
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

        {/* THE PROGRAMME */}
        <section id="programme" className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">THE PROGRAMME</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-2">
              Accelerator • Cohort
            </h2>
            <h3 className="font-syne text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
              4 weeks. 10 modules. 60+ lessons and masterclasses.<br />One <span className="text-pink-500">IOSH-certified</span> and <span className="text-primary">CPD-accredited</span> outcome.
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
              <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:-translate-y-0.5 transition-all">
                  <div className={`text-[11px] tracking-[2px] font-bold mb-2 ${i % 2 === 1 ? 'text-pink-500' : 'text-primary'}`}>MODULE {mod.num}</div>
                  <div className="text-[15px] font-bold text-white mb-2">{mod.title}</div>
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

        <section className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">WHAT GRADUATES SAY</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-12">
              From leaders <span className="text-pink-500">just like you</span>.
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
            <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-5 md:p-7 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
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
                    <th className="text-left p-3 md:p-4 font-syne text-xs font-bold tracking-[1px] text-muted-foreground bg-card border-b-2 border-border">Feature</th>
                    <th className="p-3 md:p-4 font-syne text-xs font-bold tracking-[1px] text-primary bg-card border-b-2 border-border text-center">Accelerator</th>
                    <th className="p-3 md:p-4 font-syne text-xs font-bold tracking-[1px] text-muted-foreground bg-card border-b-2 border-border text-center">eLearning</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) =>
                  <tr key={i} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
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
                    <td className="p-3 md:p-4 text-sm font-bold text-white">Price</td>
                    <td className="p-3 md:p-4 text-center font-syne text-lg font-black text-primary">£997</td>
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
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-syne text-xl font-black text-white">
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
                  className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" placeholder="Jane" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">LAST NAME *</label>
                    <input required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" placeholder="Smith" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">WORK EMAIL *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" placeholder="jane@company.com" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">JOB TITLE *</label>
                  <input required value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" placeholder="HSE Manager" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">LINKEDIN PROFILE *</label>
                  <input required value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" placeholder="https://linkedin.com/in/yourprofile" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">COUNTRY *</label>
                  <input required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" placeholder="United Kingdom" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-[0.5px]">ORGANISATION</label>
                  <input value={formData.organisation} onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                className="w-full bg-border/50 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" placeholder="Acme Corp" />
                </div>
                <Button type="button" onClick={() => {
                if (!formData.firstName || !formData.lastName || !formData.email || !formData.jobTitle || !formData.linkedin || !formData.country) {
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
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.digitalFluency === opt ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                        <input type="radio" name="digitalFluency" value={opt} checked={formData.digitalFluency === opt}
                    onChange={() => setFormData({ ...formData, digitalFluency: opt })} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.digitalFluency === opt ? "border-primary" : "border-muted-foreground"}`}>
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
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.upskillAttempts.includes(opt) ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                        <input type="checkbox" checked={formData.upskillAttempts.includes(opt)}
                    onChange={() => setFormData({ ...formData, upskillAttempts: formData.upskillAttempts.includes(opt) ? formData.upskillAttempts.filter((x) => x !== opt) : [...formData.upskillAttempts, opt] })} className="sr-only" />
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.upskillAttempts.includes(opt) ? "border-primary bg-primary" : "border-muted-foreground"}`}>
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
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.blockers.includes(opt) ? "border-pink-500 bg-pink-500/10 text-white" : "border-border text-muted-foreground hover:border-pink-500/30"}`}>
                        <input type="checkbox" checked={formData.blockers.includes(opt)}
                    onChange={() => setFormData({ ...formData, blockers: formData.blockers.includes(opt) ? formData.blockers.filter((x) => x !== opt) : [...formData.blockers, opt] })} className="sr-only" />
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.blockers.includes(opt) ? "border-pink-500 bg-pink-500" : "border-muted-foreground"}`}>
                          {formData.blockers.includes(opt) && <CheckCircle className="w-3 h-3 text-white" />}
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
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.motivation === opt ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                        <input type="radio" name="motivation" value={opt} checked={formData.motivation === opt}
                    onChange={() => setFormData({ ...formData, motivation: opt })} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.motivation === opt ? "border-primary" : "border-muted-foreground"}`}>
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
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.budgetApproval === opt ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                        <input type="radio" name="budgetApproval" value={opt} checked={formData.budgetApproval === opt}
                    onChange={() => setFormData({ ...formData, budgetApproval: opt })} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.budgetApproval === opt ? "border-primary" : "border-muted-foreground"}`}>
                          {formData.budgetApproval === opt && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        {opt}
                      </label>
                  )}
                  </div>
                </div>

                {/* Can Afford */}
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-2 tracking-[0.5px]">CAN YOU AFFORD THE £997 + VAT FEE? *</label>
                  <div className="flex gap-3">
                    {["Yes", "No"].map((opt) =>
                  <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-sm font-semibold ${formData.canAfford === opt ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/30"}`}>
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
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${formData.canCommit === opt ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                        <input type="radio" name="canCommit" value={opt} checked={formData.canCommit === opt}
                    onChange={() => setFormData({ ...formData, canCommit: opt })} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${formData.canCommit === opt ? "border-primary" : "border-muted-foreground"}`}>
                          {formData.canCommit === opt && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        {opt}
                      </label>
                  )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setFormStep(1)} className="border-border text-muted-foreground hover:text-white">
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
        <section className="py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              Have questions?
            </h2>
            <p className="text-muted-foreground mb-8">Find answers about the Accelerator, eLearning, and In-Company training.</p>
            <a href="/faq" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-lg transition-colors">
              Visit our FAQ page →
            </a>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div ref={setFadeRef(6)} className="bg-gradient-to-br from-card to-primary/5 border border-primary/20 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden opacity-0 translate-y-6 transition-all duration-700">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,hsl(85,100%,72%,0.04)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-4">
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
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold text-base px-10">
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
