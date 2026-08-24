import { Sparkles, MessageSquare, Award, ShieldCheck, Users, Calendar, CheckCircle2, Bot, FileCheck } from "lucide-react";
import badgeAIFundamentals from "@/assets/badge-ai-fundamentals.png";
import badgeElearning from "@/assets/badge-elearning.png";
import badgeAccelerator from "@/assets/badge-accelerator.png";
import badgeCopilot from "@/assets/badge-copilot-placeholder.png";
import iconAIFundamentals from "@/assets/icon-ai-fundamentals.png";
import iconElearning from "@/assets/icon-elearning.png";
import iconAccelerator from "@/assets/icon-accelerator.png";
import iconCopilot from "@/assets/icon-copilot-placeholder.png";
import iconWhiteAIFundamentals from "@/assets/icon-white-ai-fundamentals.png";
import iconWhiteElearning from "@/assets/icon-white-elearning.png";
import iconWhiteAccelerator from "@/assets/icon-white-accelerator.png";
import iconWhiteCopilot from "@/assets/icon-white-copilot-placeholder.png";

// Per-course illustrated header — a mini "product mockup" panel plus
// floating icon chips, themed to what each course is actually about.

export const AIFundamentalsIllustration = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="relative w-[74%] aspect-[4/3] bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-2 -rotate-2">
      <div className="h-2 w-3/5 bg-slate-200 rounded-full" />
      <div className="h-2 w-2/5 bg-slate-200 rounded-full" />
      <div className="h-2 w-4/5 bg-primary/20 rounded-full mt-1" />
      <div className="flex-1" />
      <div className="flex items-center gap-2 bg-primary/10 rounded-xl p-2">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="h-2 w-3/5 bg-primary/30 rounded-full" />
      </div>
    </div>
    <div className="absolute top-[14%] right-[10%] w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center rotate-6">
      <MessageSquare className="w-6 h-6 text-primary" />
    </div>
    <div className="absolute bottom-[16%] left-[8%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center -rotate-6">
      <Sparkles className="w-5 h-5 text-primary" />
    </div>
  </div>
);

export const CertificationIllustration = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="relative w-[74%] aspect-[4/3] bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-2.5 rotate-2">
      <div className="flex items-center justify-between mb-1">
        <div className="h-2.5 w-2/5 bg-slate-300 rounded-full" />
        <Award className="w-5 h-5 text-primary" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className={`h-1.5 rounded-full bg-slate-200 ${i === 1 ? "w-3/5" : "w-4/5"}`} />
        </div>
      ))}
    </div>
    <div className="absolute top-[12%] right-[8%] w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center -rotate-6">
      <ShieldCheck className="w-6 h-6 text-primary" />
    </div>
    <div className="absolute bottom-[14%] left-[10%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center rotate-6">
      <Award className="w-5 h-5 text-primary" />
    </div>
  </div>
);

export const CohortIllustration = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="relative w-[74%] aspect-[4/3] bg-white rounded-2xl shadow-2xl p-4 -rotate-2">
      <div className="grid grid-cols-2 gap-2 h-full">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`rounded-lg flex items-center justify-center ${i === 0 ? "bg-primary" : "bg-primary/10"}`}>
            <div className={`w-5 h-5 rounded-full ${i === 0 ? "bg-white/80" : "bg-primary/30"}`} />
          </div>
        ))}
      </div>
    </div>
    <div className="absolute top-[12%] right-[9%] w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center rotate-6">
      <Users className="w-6 h-6 text-primary" />
    </div>
    <div className="absolute bottom-[15%] left-[9%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center -rotate-6">
      <Calendar className="w-5 h-5 text-primary" />
    </div>
  </div>
);

export const CopilotIllustration = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="relative w-[74%] aspect-[4/3] bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-2 rotate-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-full bg-primary shrink-0" />
        <div className="h-2 w-2/5 bg-slate-200 rounded-full" />
      </div>
      <div className="h-2 w-4/5 bg-slate-200 rounded-full" />
      <div className="h-2 w-3/5 bg-primary/20 rounded-full" />
      <div className="flex-1" />
      <div className="flex items-center gap-2 bg-primary/10 rounded-xl p-2">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="h-2 w-3/5 bg-primary/30 rounded-full" />
      </div>
    </div>
    <div className="absolute top-[14%] right-[9%] w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center rotate-6">
      <Bot className="w-6 h-6 text-primary" />
    </div>
    <div className="absolute bottom-[16%] left-[8%] w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center -rotate-6">
      <FileCheck className="w-5 h-5 text-primary" />
    </div>
  </div>
);

export interface CourseMeta {
  name: string;
  href: string;
  description: string;
  Illustration: React.ComponentType;
  badge: string;
  icon: string;
  iconWhite: string;
  level: string;
  price: string;
  originalPrice?: string;
  period: string;
  popular: boolean;
  features: string[];
  cta: string;
}

export const courses: CourseMeta[] = [
  {
    name: "Microsoft Copilot for EHS & Sustainability",
    href: "/copilot-for-ehs",
    description: "Practical, audit-ready Copilot training for EHS & sustainability teams — built for the EU AI Act Article 4 obligation.",
    Illustration: CopilotIllustration,
    badge: badgeCopilot,
    icon: iconCopilot,
    iconWhite: iconWhiteCopilot,
    level: "Group Training",
    price: "Custom Pricing",
    period: "",
    popular: false,
    features: ["12-module live or self-paced curriculum", "EU AI Act Article 4 aligned", "Group pricing for 10–30+ participants"],
    cta: "Join Waitlist",
  },
  {
    name: "AI Fundamentals in EHS",
    href: "/ai-fundamentals",
    description: "A fast-track introduction to AI for EHS professionals.",
    Illustration: AIFundamentalsIllustration,
    badge: badgeAIFundamentals,
    icon: iconAIFundamentals,
    iconWhite: iconWhiteAIFundamentals,
    level: "Beginner",
    price: "£97",
    period: "",
    popular: false,
    features: ["90-minute eLearning course", "Understand AI in EHS", "Certificate of completion"],
    cta: "Start Learning",
  },
  {
    name: "IOSH-approved Safety 4.0",
    href: "/elearning",
    description: "Self-paced online learning — 10 core modules, 60+ video lessons.",
    Illustration: CertificationIllustration,
    badge: badgeElearning,
    icon: iconElearning,
    iconWhite: iconWhiteElearning,
    level: "All Levels",
    price: "£497",
    originalPrice: "£697",
    period: "",
    popular: true,
    features: ["IOSH & CPD certification", "10 core modules, 60+ lessons", "90-day access"],
    cta: "Start Learning",
  },
  {
    name: "Safety 4.0 Accelerator Cohort",
    href: "/accelerator",
    description: "Live group training with expert guidance and peer interaction.",
    Illustration: CohortIllustration,
    badge: badgeAccelerator,
    icon: iconAccelerator,
    iconWhite: iconWhiteAccelerator,
    level: "Advanced",
    price: "£1,997",
    originalPrice: "£2,497",
    period: "per person",
    popular: false,
    features: ["6-week live cohort programme", "Expert-led live sessions", "Peer networking & community"],
    cta: "Apply Now",
  },
];
