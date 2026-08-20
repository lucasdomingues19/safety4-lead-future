import { useEffect } from "react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";
import { CourseHero } from "@/components/course/CourseHero";
import { CourseReviews } from "@/components/course/CourseReviews";
import { RelatedCourses } from "@/components/course/RelatedCourses";
import badgeElearningHero from "@/assets/badge-elearning.png";
import { testimonials } from "@/components/SocialProofSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle, BookOpen, Award, Users, Brain, PlayCircle,
  Layers, BarChart3, Cpu, Wrench, Database, Bot, Scale, TrendingUp, Compass,
  Shield, Globe, Zap, Clock, Infinity, Tablet, GraduationCap,
} from "lucide-react";
import cpdCertifiedLogo from "@/assets/cpd-certified-badge.png";
import ioshApprovedLogo from "@/assets/iosh-approved-logo.jpg";
import certificateSample from "@/assets/certificate-sample.png";

const reviews = testimonials.filter((t) =>
  ["Jacqueline Carr", "Stephanie Osborne", "Johannes Buchmann", "Emily Haas"].includes(t.name)
).slice(0, 4);

const modules = [
  { num: "01", icon: Compass, title: "Introduction & Orientation", desc: "Course overview, objectives, CPD & IOSH value, learner expectations." },
  { num: "02", icon: Layers, title: "What is Safety 4.0?", desc: "Definition of Safety 4.0, triangle (People, Processes, Tech), role of data, 4th Industrial Revolution." },
  { num: "03", icon: BarChart3, title: "The Safety Status Quo is Broken", desc: "Compliance-heavy culture, lagging indicators, reactive safety trap." },
  { num: "04", icon: Brain, title: "Skills for the Safety Leader in the Digital Age", desc: "Digital literacy, AI/data awareness, adaptive intelligence, communication skills." },
  { num: "05", icon: Wrench, title: "Safetytech Practical Applications", desc: "Wearables, IoT, drones, mobile-first systems, computer vision." },
  { num: "06", icon: Cpu, title: "Building your Digital Safety Toolkit", desc: "Practical day-to-day tools: reporting apps, AI writing, automation, QR codes." },
  { num: "07", icon: Database, title: "Data Strategy: From Chaos to Clarity", desc: "Data collection, centralisation, cleaning, analysis; pitfalls & benefits." },
  { num: "08", icon: Bot, title: "AI Essentials for Safety Leaders", desc: "AI history, ML, NLP, LLMs, CV, agentic AI, real-world cases, myths & risks." },
  { num: "09", icon: Scale, title: "Compliance, Risk & Governance Essentials", desc: "Digital compliance, regulation, governance frameworks, ethical AI." },
  { num: "10", icon: TrendingUp, title: "Digital Safety Transformation Framework", desc: "ROI, executive influence, linking safety to business performance." },
];

const Syllabus = () => {
  useEffect(() => {
    setPageSEO({
      title: "eLearning — IOSH-approved Safety 4.0 Course",
      description: "Self-paced, IOSH-approved eLearning. Master AI, IoT, SafetyTech and digital leadership at your own pace. CPD accredited.",
      canonical: "https://safetytech.academy/elearning",
    });
    trackPageView(window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <CourseHero
        eyebrow="IOSH APPROVED · CPD ACCREDITED"
        title={<>Safety 4.0 — <span className="text-primary">Leading Safety in the Digital Age</span></>}
        subtitle="The world's first IOSH-approved eLearning programme for safety professionals to develop AI, IoT, and digital transformation skills — at their own pace."
        features={[
          { icon: PlayCircle, label: "60+ Video Lessons" },
          { icon: Award, label: "IOSH & CPD Certified" },
          { icon: Clock, label: "Self-Paced" },
          { icon: Infinity, label: "Lifelong Access" },
        ]}
        badgeSrc={badgeElearningHero}
        price="£497"
        originalPrice="£697"
        meta={[
          { icon: BarChart3, label: "Level", value: "All Levels" },
          { icon: BookOpen, label: "Modules", value: "10" },
          { icon: PlayCircle, label: "Lessons", value: "60+" },
          { icon: GraduationCap, label: "Programme", value: "90 Days" },
        ]}
        cta={{ label: "Start Learning — £497", href: "https://safetyacademy.mykajabi.com/offers/E2ZXsoXV", external: true }}
        secondaryCta={{ label: "Download Brochure", href: "https://learning.safetytech.academy/brochure", external: true }}
      />

      <div className="container mx-auto px-4 max-w-4xl pb-20">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="h-auto p-1 bg-slate-100 rounded-lg mb-10">
            <TabsTrigger value="about" className="text-sm px-5 py-2.5 rounded-md">About the Course</TabsTrigger>
            <TabsTrigger value="content" className="text-sm px-5 py-2.5 rounded-md">Course Content</TabsTrigger>
            <TabsTrigger value="reviews" className="text-sm px-5 py-2.5 rounded-md">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-14 mt-0">
            <div>
              <h2 className="mb-4">Your toolkit to lead in Safety 4.0</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { icon: PlayCircle, title: "60+ Video Lessons", desc: "Studio-recorded, on-demand content covering all 10 modules." },
                  { icon: BookOpen, title: "Downloadable Resources", desc: "Templates, frameworks, and toolkits you can use immediately." },
                  { icon: CheckCircle, title: "Interactive Assessments", desc: "Test your knowledge and earn your IOSH & CPD certification." },
                  { icon: Brain, title: "Real-World Case Studies", desc: "Learn from organisations already implementing Safety 4.0." },
                  { icon: Tablet, title: "Mobile App Access", desc: "Learn anywhere — desktop, tablet, or mobile." },
                  { icon: Shield, title: "Email Support", desc: "Get help when you need it throughout your learning journey." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <div className="text-sm font-bold text-slate-900 mb-1">{item.title}</div>
                      <div className="text-sm text-[#69697b] leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4">Who is it for?</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { icon: Shield, title: "EHS Directors & Heads of Safety", desc: "Leading strategy and integrating AI, data, and digital tools into your function." },
                  { icon: Users, title: "Senior Safety Managers", desc: "Managing teams, ready to champion Safety 4.0 across your organisation." },
                  { icon: Globe, title: "Regional / Global EHS Leads", desc: "Overseeing multi-site operations, seeking scalable digital safety solutions." },
                  { icon: Zap, title: "Safety Consultants & Advisors", desc: "Advising clients on modern safety practices, adding Safety 4.0 to your toolkit." },
                  { icon: Award, title: "Operational Leaders with EHS Remit", desc: "COOs, VPs of Operations, Plant Managers responsible for safety performance." },
                  { icon: BookOpen, title: "EHS Professionals Seeking Certification", desc: "Practitioners wanting an IOSH & CPD-approved credential in digital safety." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <div className="text-sm font-bold text-slate-900 mb-1">{item.title}</div>
                      <div className="text-sm text-[#69697b] leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            <h2 className="mb-2">A modern curriculum</h2>
            <p className="text-[#69697b] leading-relaxed mb-8">
              Each module builds on the last — from foundational concepts to strategic leadership.
            </p>
            <div className="space-y-4">
              {modules.map((mod) => (
                <div key={mod.num} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <mod.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-[11px] tracking-[2px] font-bold text-primary mb-1">MODULE {mod.num}</div>
                    <h3 className="text-[15px] font-bold text-slate-900 mb-1.5 leading-snug">{mod.title}</h3>
                    <p className="text-sm text-[#69697b] leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <h2 className="mb-6">What learners say</h2>
            <CourseReviews reviews={reviews} />
          </TabsContent>
        </Tabs>
      </div>

      {/* ACCREDITATION */}
      <section id="accreditation" className="py-16 md:py-20 px-4 border-t border-slate-200 scroll-mt-24">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="mb-4">Globally Recognised <span className="text-primary">Credentials</span></h2>
            <p className="text-lg text-[#69697b] max-w-2xl mx-auto leading-relaxed">
              Earn a certification that validates your Safety 4.0 expertise to employers worldwide.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
              <img src={ioshApprovedLogo} alt="IOSH Approved Training Provider" className="h-10 w-auto mb-4" />
              <h3 className="text-[15px] font-bold text-slate-900 mb-2">IOSH Approved</h3>
              <p className="text-sm text-[#69697b] leading-relaxed mb-4">
                Digital certificate issued by the Institution of Occupational Safety and Health, recognised in 130+ countries.
              </p>
              <div className="space-y-2">
                {["Recognised in 130+ countries", "Enhanced career advancement", "Strict quality standard met"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#69697b]">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
              <img src={cpdCertifiedLogo} alt="CPD Certified" className="h-10 w-auto mb-4" />
              <h3 className="text-[15px] font-bold text-slate-900 mb-2">CPD Certified</h3>
              <p className="text-sm text-[#69697b] leading-relaxed mb-4">
                8+ hours of certified Continuing Professional Development credits, required by many professional bodies.
              </p>
              <div className="space-y-2">
                {["8+ hours of certified CPD credits", "Internationally recognised standard", "Validates commitment to excellence"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#69697b]">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <img
                src={certificateSample}
                alt="IOSH Approved Certificate Sample"
                className="w-full h-auto rounded-lg mb-3"
              />
              <p className="text-xs text-slate-500 text-center">Sample certificate — digital & printable</p>
            </div>
          </div>
        </div>
      </section>

      <RelatedCourses currentHref="/elearning" />

      <Footer />
    </div>
  );
};

export default Syllabus;
