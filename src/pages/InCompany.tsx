import { useEffect, useRef, useState } from "react";
import { AnimatedSpiderChart } from "@/components/AnimatedSpiderChart";
import anaCoutinhoPhoto from "@/assets/ana-coutinho-photo.jpeg";
import stewartDearyPhoto from "@/assets/stewart-deary-photo.jpeg";
import jacquelineCarrPhoto from "@/assets/jacqueline-carr-photo.jpeg";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import { ROICalculator } from "@/components/ROICalculator";
import {
  ArrowRight,
  ArrowDown,
  CheckCircle,
  ClipboardList,
  Zap,
  BarChart3,
  Trophy,
  Users,
  Building2,
  Shield,
  Clock,
  BookOpen,
  Award,
  MessageCircle,
} from "lucide-react";
import safetyAcademyLogo from "@/assets/safety-academy-logo.png";
import ioshLogo from "@/assets/iosh-approved-logo.jpg";
import cpdLogo from "@/assets/cpd-approved-logo.png";
import seadrillLogo from "@/assets/seadrill-logo-real.svg";
import legoLogo from "@/assets/lego-logo.png";
import siemensLogo from "@/assets/siemens-logo.jpeg";
import marshLogo from "@/assets/marsh-logo.jpg";
import samaLogo from "@/assets/sama-logo.png";
import crtsLogo from "@/assets/crts-global-logo.png";
import velestroylLogo from "@/assets/velesstroy-logo.jpeg";
import soterLogo from "@/assets/soter-ai-logo.avif";
import fieldLogo from "@/assets/field-energy-logo.jpeg";
import fugroLogo from "@/assets/fugro-logo.png";
import nioshLogo from "@/assets/niosh-logo.png";


const CALENDLY_LINK = "https://calendly.com/lucas-getshield360/30min";

const InCompany = () => {
  const fadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentHeadline((prev) => (prev + 1) % 2);
        setIsTransitioning(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "In-Company Safety 4.0 Training | Team & Enterprise Pricing | Safety 4.0 Academy",
      description: "Train your entire EHS team with the world's first IOSH-approved Safety 4.0 programme. Fixed pricing from £4,975. AI, SafetyTech & digital leadership for teams of 5–20+.",
      canonical: "https://safetyacademy.tech/in-company",
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

  return (
    <AnalyticsTracker>
      <SEOStructuredData type="course" />
      <div className="min-h-screen relative font-dm">
        <div className="fixed inset-0 bg-gradient-to-br from-[hsl(240,55%,15%)] via-slate-900 to-black -z-10" />

        {/* Persistent background decorations — purple, lime, pink */}
        <div className="fixed inset-0 -z-[5] overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/15 via-purple-600/10 to-violet-500/5 blur-3xl animate-[float_20s_ease-in-out_infinite]" />
          <div className="absolute top-[20%] -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-lime-400/10 via-lime-500/15 to-lime-600/8 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-[45%] -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/10 via-pink-600/8 to-pink-400/5 blur-3xl animate-[float_22s_ease-in-out_infinite]" />
          <div className="absolute top-[60%] right-[10%] w-80 h-80 rounded-full bg-gradient-to-br from-purple-600/10 via-purple-500/12 to-purple-400/5 blur-3xl animate-[float_30s_ease-in-out_infinite]" />
          <div className="absolute top-[80%] -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-lime-500/8 via-lime-400/12 to-lime-600/5 blur-3xl animate-[float_28s_ease-in-out_infinite_reverse]" />
          <div className="absolute bottom-[10%] right-[5%] w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/8 via-pink-400/10 to-pink-600/5 blur-3xl animate-[float_24s_ease-in-out_infinite]" />
        </div>

        {/* NAV */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src={safetyAcademyLogo} alt="Safety 4.0 Academy" className="h-8" />
            </a>
            <div className="hidden md:flex items-center gap-8">
              <a href="#programme" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Programme</a>
              <a href="#proof" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Case Studies</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Pricing</a>
              <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs tracking-wider">
                  BOOK A CALL
                </Button>
              </a>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="min-h-screen flex items-center pt-32 pb-20 px-4 relative overflow-hidden">

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
              {/* Left column - text */}
              <div className="text-center lg:text-left">
                {/* Badges */}
                <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-4 mb-6 md:mb-8 flex-wrap">
                  <div className="inline-flex items-center space-x-1 md:space-x-2 text-primary font-medium bg-primary/10 px-3 md:px-6 py-2 md:py-3 rounded-full border border-primary/20 text-sm md:text-base">
                    <Award className="w-3 h-3 md:w-4 md:h-4" />
                    <span>IOSH Approved</span>
                  </div>
                  <div className="inline-flex items-center space-x-1 md:space-x-2 text-blue-400 font-medium bg-blue-400/10 px-3 md:px-6 py-2 md:py-3 rounded-full border border-blue-400/20 text-sm md:text-base">
                    <Shield className="w-3 h-3 md:w-4 md:h-4" />
                    <span>CPD Accredited</span>
                  </div>
                </div>

                <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  {currentHeadline === 0 ? (
                    <>
                      <h1 className="font-syne text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-4 md:mb-8">
                        Build an <span className="text-pink-500">AI-ready</span> safety team. <span className="text-primary">Upgrade your impact.</span>
                      </h1>
                      <p className="text-base md:text-xl lg:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8 md:mb-12 font-light">
                        The world's first IOSH-approved and CPD-accredited Safety 4.0 programme, delivered for your entire EHS function. Trusted by{" "}
                        <span className="font-bold text-lime-400">Siemens, LEGO, MARSH</span>, and safety teams across 12 countries.
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="font-syne text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-4 md:mb-8">
                        AI Is Moving <span className="text-primary">Fast</span>. Don't Leave Your Safety Team <span className="text-pink-500">Behind</span>
                      </h1>
                      <p className="text-base md:text-xl lg:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8 md:mb-12 font-light">
                        Build team-wide digital fluency so EHS can move faster and safer, make better decisions, and scale impact without adding headcount.
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
                  <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 shadow-glow animate-glow-pulse rounded-full">
                      Book a 20-minute call <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                  <a href="#roi" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
                    <ArrowDown className="w-4 h-4" /> Calculate your team's ROI
                  </a>
                </div>
              </div>

              {/* Right column - Spider Chart */}
              <div className="hidden lg:flex items-center justify-center">
                <AnimatedSpiderChart />
              </div>
            </div>
          </div>
        </section>

        <div className="border-y border-border bg-card/50 py-10 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-[10px] tracking-[3px] text-muted-foreground text-center mb-6 font-semibold">TRUSTED BY SAFETY TEAMS & PARTNERS AT</div>
          </div>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-card/80 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card/80 to-transparent z-10" />
            <div className="flex animate-scroll w-max" style={{ animationDuration: '30s' }}>
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex items-center gap-12 md:gap-20 px-6">
                  {[
                    { src: legoLogo, alt: "LEGO" },
                    { src: siemensLogo, alt: "Siemens" },
                    { src: marshLogo, alt: "Marsh" },
                    { src: samaLogo, alt: "SAMA" },
                    { src: crtsLogo, alt: "CRTS Global" },
                    { src: seadrillLogo, alt: "Seadrill" },
                    { src: velestroylLogo, alt: "Velesstroy" },
                    { src: nioshLogo, alt: "NIOSH" },
                    { src: soterLogo, alt: "Soter AI" },
                    { src: fieldLogo, alt: "Field Energy" },
                    { src: fugroLogo, alt: "Fugro" },
                  ].map((logo, i) => (
                    <div
                      key={`${setIndex}-${i}`}
                      className="flex-shrink-0 bg-white rounded-xl p-4 flex items-center justify-center h-16 md:h-20 w-28 md:w-36 hover:scale-105 transition-transform"
                    >
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className="max-h-10 md:max-h-14 max-w-20 md:max-w-28 object-contain"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STATS */}



        {/* PROBLEM SECTION */}
        <section id="problem" className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-pink-500 font-bold mb-4">THE CHALLENGE</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              Your team is expert in safety.<br />AI & tech are <span className="text-primary">reshaping</span> what that means.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mb-12">
              77% of EHS leaders say AI is a strategic priority. 86% of their teams have no meaningful AI capability. That gap is a leadership problem.
            </p>

            <div ref={setFadeRef(2)} className="grid md:grid-cols-2 gap-12 opacity-0 translate-y-6 transition-all duration-700">
              <div>
                <blockquote className="bg-card border-l-[3px] border-primary rounded-r-xl p-7 text-primary font-bold italic leading-relaxed mb-6">
                  "The question boards are now asking isn't whether AI matters for safety — it's who in their organisation is ready to lead the answer."
                  <div className="mt-4 text-sm not-italic text-muted-foreground/70">— Lucas Domingues, MSc CMIOSH, Founder</div>
                </blockquote>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="text-[11px] tracking-[2px] text-primary font-bold mb-5">THE DATA</div>
                  {[
                    { num: "25%", color: "text-primary", desc: "of safety professionals have zero AI skills (Safety 4.0 research, 2024)" },
                    { num: "61%", color: "text-secondary", desc: 'describe themselves as "AI beginners" with no structured path to change' },
                    { num: "77%", color: "text-white", desc: "of EHS leaders say AI adoption is a priority — but lack a training framework" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 mb-4 last:mb-0">
                      <div className={`text-3xl font-black ${item.color} min-w-[70px]`}>{item.num}</div>
                      <div className="text-sm text-muted-foreground">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
                {[
                  { icon: ClipboardList, title: "Manual reporting still consuming 5–8 hrs/week per person", desc: "AI-assisted reporting can reduce this by 55% — but only if your team knows how to apply it." },
                  { icon: Zap, title: "Reactive safety culture built on lagging indicators", desc: "Predictive analytics and IoT sensor data are available. The barrier is capability, not technology." },
                  { icon: BarChart3, title: "Safety data that doesn't make it to the board", desc: "Data visualisation and AI-powered dashboards can change this — with the right skills in your team." },
                  { icon: Trophy, title: "Talent retention risk in a rapidly shifting profession", desc: "Safety professionals are actively seeking digital upskilling. In-Company training is a retention tool." },
                ].map((item, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start">
                    <item.icon className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROGRAMME SECTION */}
        <section id="programme" className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">THE PROGRAMME</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-2">
              Safety 4.0 Accelerator
            </h2>
            <h3 className="font-syne text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
              4 weeks. 10 modules. 60+ lessons and masterclasses.<br />One <span className="text-pink-500">IOSH-certified</span> and <span className="text-primary">CPD-accredited</span> outcome.
            </h3>

            <div ref={setFadeRef(3)} className="grid md:grid-cols-2 gap-4 opacity-0 translate-y-6 transition-all duration-700">
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
                { num: "10", title: "Digital Safety Transformation Framework", desc: "ROI, executive influence, linking safety to business performance." },
              ].map((mod, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:-translate-y-0.5 transition-all">
                  <div className={`text-[11px] tracking-[2px] font-bold mb-2 ${i % 2 === 1 ? 'text-pink-500' : 'text-primary'}`}>MODULE {mod.num}</div>
                  <div className="text-[15px] font-bold text-white mb-2">{mod.title}</div>
                  <div className="text-sm text-muted-foreground">{mod.desc}</div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                { val: "60+", label: "Studio-recorded video lessons, available on demand" },
                { val: "CPD", label: "Continued Professional Development — verifiable CPD hours upon completion" },
                { val: "IOSH", label: "Approved certification recognised globally" },
                { val: "Global", label: "Impact — delivered to teams in 12+ countries" },
              ].map((s, i) => (
                <div key={i} className="bg-primary/8 border border-primary/25 rounded-xl p-5">
                  <div className="text-2xl font-black text-primary">{s.val}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DELIVERY MODEL */}
        <section className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-pink-500 font-bold mb-4">HOW IT WORKS</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-12">
              From first call to certified team<br />in <span className="text-primary">5 weeks</span>.
            </h2>

            <div ref={setFadeRef(4)} className="flex flex-col md:flex-row gap-6 md:gap-0 relative opacity-0 translate-y-6 transition-all duration-700">
              {/* Connector line */}
              <div className="hidden md:block absolute top-7 left-7 right-7 h-0.5 bg-border z-0" />

              {[
                { step: "1", title: "Discovery Call", desc: "20 minutes with Lucas to understand your team, objectives, and timeline." },
                { step: "2", title: "Tailored Proposal", desc: "Customised scope, delivery format, and fixed pricing within 48 hours." },
                { step: "3", title: "Onboarding", desc: "Team access + pre-programme diagnostic to baseline digital capability." },
                { step: "4", title: "Live + Self-Paced", desc: "Weekly live sessions + on-demand video content. Fits working schedules." },
                { step: "5", title: "IOSH Certification", desc: "Every participant earns their IOSH-approved and CPD-accredited certificate." },
              ].map((s, i) => (
                <div key={i} className="flex-1 text-center relative z-10 px-2 md:px-4">
                  <div className={`w-14 h-14 rounded-full bg-card border-2 flex items-center justify-center mx-auto mb-4 font-black text-lg shadow-[0_0_0_6px_hsl(240,55%,15%)] ${i % 2 === 0 ? 'border-primary text-primary' : 'border-pink-500 text-pink-500'}`}>
                    {s.step}
                  </div>
                  <div className="text-sm font-bold text-white mb-2">{s.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROOF / CASE STUDIES */}
        <section id="proof" className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">CASE STUDIES</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-12">
              Organisations that have<br />already made the shift.
            </h2>

            <div ref={setFadeRef(5)} className="grid md:grid-cols-3 gap-5 opacity-0 translate-y-6 transition-all duration-700">
              {[
                {
                  quote: "To be honest, my knowledge about SafetyTech and AI in general was not very good at all. I really enjoyed the fact that it is simple to understand and designed for people who, such as myself, have very little knowledge on the subject. I also really enjoyed the practical examples as they helped me understand the applications of SafetyTech better.",
                  name: "Ana Coutinho", role: "HSE Manager", photo: anaCoutinhoPhoto, company: "LEGO GROUP",
                },
                {
                  quote: "Safety 4.0 is a solid introductory course for anyone looking to understand how technology is shaping modern health and safety work. The content is clear, accessible, and supported by well-produced examples that make the concepts easy to follow. It's a great starting point for OHS professionals wanting to build confidence in the health and safety tech space.",
                  name: "Jacqueline Carr", role: "Global OSH Leader", photo: jacquelineCarrPhoto, company: "SIEMENS",
                },
                {
                  quote: "The course felt like a great entry-level introduction to how AI technology is influencing today's HSE leadership. What stood out first was the high production quality and the way the ideas were brought to life through polished, relevant examples that made the topics easy to understand. Overall, it came across as a strong starting point for HSE leaders who want to build confidence and capability in the health and safety AI technology space.",
                  name: "Stewart Deary", role: "Global HSE Director", photo: stewartDearyPhoto, company: "CRTS GLOBAL",
                },
              ].map((t, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-7 flex flex-col hover:border-primary/35 transition-colors">
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
              ))}
            </div>
          </div>
        </section>

        {/* ROI CALCULATOR */}
        <section id="roi" className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">ROI CALCULATOR</div>
              <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                What's the financial case<br />for your organisation?
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                All benchmarks sourced from NSC Injury Facts 2023, McKinsey 2024, and BLS 2024.
              </p>
            </div>
            <ROICalculator />
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-primary font-bold mb-4">PRICING</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-4">Fixed pricing. No surprises.</h2>
            <p className="text-lg text-muted-foreground max-w-xl mb-12">
              Every tier includes the full programme, IOSH certification, CPD hours, live sessions, and on-demand access. One fixed price for your whole team.
            </p>

            <div ref={setFadeRef(7)} className="grid md:grid-cols-3 gap-5 opacity-0 translate-y-6 transition-all duration-700">
              {[
                {
                  name: "PILOT", size: "Up to 5 people", price: "£4,985", per: "fixed team price · £997per person",
                  features: ["Full 10-module programme access", "IOSH-approved certification for all", "8+ CPD hours per participant", "4 live group sessions with Lucas", "60+ on-demand video lessons", "Team completion dashboard"],
                  featured: false, note: "Ideal for specialist EHS teams and SMEs",
                },
                {
                  name: "CORE TEAM", size: "6–10 people", price: "£7,950", per: "fixed team price · from £795 per person",
                  features: ["Full 10-module programme access", "IOSH-approved certification for all", "8+ CPD hours per participant", "4 live group sessions with Lucas", "60+ on-demand video lessons", "Cohort peer community access", "Team analytics & progress reports", "Priority support channel"],
                  featured: true, note: "Best value for mid-sized EHS functions",
                },
                {
                  name: "DEPARTMENT", size: "11–20 people", price: "£13,900", per: "fixed team price · from £695 per person",
                  features: ["Full 10-module programme access", "IOSH-approved certification for all", "8+ CPD hours per participant", "6 live group sessions with Lucas", "Custom onboarding & diagnostics", "Cohort peer community access", "Management capability report", "Post-programme strategy session"],
                  featured: false, note: "For whole-department transformation",
                },
              ].map((tier, i) => (
                <div
                  key={i}
                  className={`bg-card border rounded-2xl p-8 flex flex-col relative transition-all hover:-translate-y-1 ${
                    tier.featured
                      ? "border-primary shadow-[0_0_0_1px_hsl(85,100%,72%),0_20px_60px_hsl(85,100%,72%,0.15)]"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold tracking-[2px] px-4 py-1 rounded-full whitespace-nowrap">
                      ★ MOST POPULAR
                    </div>
                  )}
                  <div className="text-xs font-bold tracking-[2px] text-muted-foreground mb-2">{tier.name}</div>
                  <div className="text-xl font-black text-white mb-1">{tier.size}</div>
                  <div className="text-4xl font-black text-primary mb-1">{tier.price}</div>
                  <div className="text-xs text-muted-foreground mb-6">{tier.per}</div>
                  <ul className="flex-1 mb-6">
                    {tier.features.map((f, fi) => (
                      <li key={fi} className="text-sm text-muted-foreground py-2 border-b border-border flex gap-2.5 items-start">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="block">
                    <Button
                      className={`w-full font-bold tracking-wider text-sm py-3 ${
                        tier.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-transparent border border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                      variant={tier.featured ? "default" : "outline"}
                    >
                      Book a call
                    </Button>
                  </a>
                  <p className="text-[11px] text-muted-foreground text-center mt-3">{tier.note}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Need 20+ seats?{" "}
              <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Contact us for enterprise pricing →
              </a>
            </p>
          </div>
        </section>

        {/* OBJECTIONS / FAQ */}
        <section className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-[10px] tracking-[3px] text-pink-500 font-bold mb-4">COMMON QUESTIONS</div>
            <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-12">Before you book the call.</h2>

            <div ref={setFadeRef(8)} className="max-w-3xl opacity-0 translate-y-6 transition-all duration-700">
              <Accordion type="single" collapsible className="w-full">
                {[
                  { q: "What is the Safety 4.0 Accelerator?", a: "It's a tailored 4-week curriculum built for and by EHS senior professionals. It's the world's first IOSH approved and CPD accredited programme for EHS working professionals. The curriculum has 10 core modules and 4 masterclasses delivered weekly." },
                  { q: "How does delivery work around our team's schedule?", a: "The programme is designed for working professionals. Live sessions are scheduled around your team, and all 60+ video lessons are on-demand. The full programme is delivered in 4 weeks, spending 3–4 hours per week on average." },
                  { q: "Can the content be customised for our sector?", a: "Yes. While the core curriculum is standardised and IOSH-approved, live sessions and case studies are tailored to your sector — construction, manufacturing, energy, logistics, and others." },
                  { q: "What does IOSH approval actually mean for our compliance?", a: "IOSH is the world's largest professional body for health and safety practitioners. An IOSH-approved programme meets rigorous standards for content, delivery, and assessment." },
                  { q: "We already have NEBOSH/IOSH training budgets. How does this fit?", a: "Safety 4.0 complements, not replaces, your existing development. NEBOSH and IOSH qualifications cover safety management fundamentals. Safety 4.0 covers the digital and AI capability layer that those qualifications don't yet address." },
                  { q: "What happens after the programme ends?", a: "Participants retain lifetime access to course materials and join the Safety 4.0 alumni community — a network of certified EHS leaders from 12+ countries." },
                  { q: "Can we get a proposal without committing to anything?", a: "Absolutely. The 20-minute discovery call is a conversation, not a sales pitch. You'll receive a tailored written proposal within 48 hours. No obligation." },
                ].map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                    <AccordionTrigger className="text-sm font-bold text-white text-left hover:no-underline py-5">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section id="book" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div
              ref={setFadeRef(9)}
              className="bg-gradient-to-br from-card to-primary/5 border border-primary/20 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden opacity-0 translate-y-6 transition-all duration-700"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,hsl(85,100%,72%,0.04)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-syne text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                  Ready to talk about<br />your team?
                </h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
                  Book a 20-minute call with Lucas Domingues, MSc CMIOSH. You'll come away with clarity on what's possible — and a written proposal within 48 hours.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-10 shadow-glow">
                      Book a 20-minute call <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                </div>
                <div className="flex flex-wrap gap-6 justify-center mt-7">
                  {["No hard sell", "Written proposal within 48 hours", "IOSH-approved programme", "Fixed transparent pricing"].map((item) => (
                    <span key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" /> {item}
                    </span>
                  ))}
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
    </AnalyticsTracker>
  );
};

export default InCompany;
