import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import shebinAbrahamPhoto from "@/assets/shebin-abraham-photo.jpeg";
import anaCoutinhoPhoto from "@/assets/ana-coutinho-photo.jpeg";
import eamonnDohertyPhoto from "@/assets/eamonn-doherty-photo.jpeg";
import benCanterburyPhoto from "@/assets/ben-canterbury-photo.jpeg";
import jacquelineCarrPhoto from "@/assets/jacqueline-carr-photo.jpeg";
import stephanieOsbornePhoto from "@/assets/stephanie-osborne-photo.jpeg";
import alexSiedschlagPhoto from "@/assets/alex-siedschlag-photo.jpeg";
import emilyHaasPhoto from "@/assets/emily-haas-photo.png";
import johannesBuchmannPhoto from "@/assets/johannes-buchmann-photo.jpeg";
import stewartDearyPhoto from "@/assets/stewart-deary-photo.jpeg";
import renauldWilsonPhoto from "@/assets/renauld-wilson-photo.png";
import danWarnockPhoto from "@/assets/dan-warnock-photo.jpeg";

const testimonials = [
  {
    name: "Shebin Abraham",
    role: "Founder",
    content: "As an HSE leader, I found the content highly relevant to the current needs of the industry. The online training provided clear insights into modern HSE strategies and the latest safety technologies that organizations must start integrating.",
    rating: 5,
    image: shebinAbrahamPhoto
  },
  {
    name: "Ana Coutinho",
    role: "HSE Manager, LEGO Group",
    content: "To be honest, my knowledge about SafetyTech and AI in general was not very good at all. I really enjoyed the fact that it is simple to understand and designed for people who, such as myself, have very little knowledge on the subject.",
    rating: 5,
    image: anaCoutinhoPhoto
  },
  {
    name: "Eamonn Doherty",
    role: "HSSEQ Director, SAMA Construction",
    content: "This program bridges the gap between traditional safety and digital transformation perfectly. The practical applications have revolutionized our safety management systems.",
    rating: 5,
    image: eamonnDohertyPhoto
  },
  {
    name: "Ben Canterbury",
    role: "Corporate Safety Manager, OTC Technologies",
    content: "The AI-powered safety analytics completely transformed how we predict and prevent incidents. Our accident rate dropped significantly in the first year.",
    rating: 5,
    image: benCanterburyPhoto
  },
  {
    name: "Jacqueline Carr",
    role: "Global OSH Consultant, Siemens",
    content: "Safety 4.0 is a solid introductory course for anyone looking to understand how technology is shaping modern health and safety work. The content is clear, accessible, and supported by well-produced examples.",
    rating: 5,
    image: jacquelineCarrPhoto
  },
  {
    name: "Stephanie Osborne",
    role: "Health & Safety Leader",
    content: "I've just completed Safety 4.0 - Leading Safety in the Digital Age. The course was relevant, easy to digest and thought provoking. Particularly like that it is IOSH Approved too.",
    rating: 5,
    image: stephanieOsbornePhoto
  },
  {
    name: "Alex Siedschlag",
    role: "Performance Coach",
    content: "The Safety 4.0 methodology has revolutionized how I coach teams on workplace safety. The digital tools provide incredible insights for performance optimization.",
    rating: 5,
    image: alexSiedschlagPhoto
  },
  {
    name: "Emily Haas",
    role: "Associate Safety Director, NIOSH",
    content: "This course did a great job in bridging traditional safety management and the digital future that we're already living in. This course gives you the vision and the roadmap to make it happen.",
    rating: 5,
    image: emilyHaasPhoto
  },
  {
    name: "Johannes Buchmann",
    role: "Global Health & Safety Manager, Siemens",
    content: "Safety 4.0 is a great entry-level course for EHS professionals starting their journey into Industry 4.0 and health & safety tech. It introduces AI concepts in a clear way.",
    rating: 5,
    image: johannesBuchmannPhoto
  },
  {
    name: "Stewart Deary",
    role: "Global HSE Director",
    content: "The course felt like a great entry-level introduction to how AI technology is influencing today's HSE leadership. What stood out first was the high production quality and polished, relevant examples.",
    rating: 5,
    image: stewartDearyPhoto
  },
  {
    name: "Renauld Wilson",
    role: "Senior Risk Manager, ICW Group",
    content: "I really enjoyed how the course explained the transition from traditional safety management to Safety 4.0. It helped me think more proactively about using data and technology to prevent incidents.",
    rating: 5,
    image: renauldWilsonPhoto
  },
  {
    name: "Dan Warnock",
    role: "Director of Risk Control, Marsh",
    content: "The course was GREAT. Thank you. I have been very nervous about AI and this brought the AI tool into perspective and how I can best use it in my operations.",
    rating: 5,
    image: danWarnockPhoto
  }
];

const TestimonialCard = ({ t }: { t: typeof testimonials[0] }) => (
  <div className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] bg-white border border-border rounded-2xl p-7 flex flex-col hover:border-primary/35 transition-colors">
    <p className="text-sm text-slate-900 italic leading-relaxed flex-1 mb-5">
      <span className="text-pink-500 text-2xl leading-none align-[-8px] mr-1 not-italic">"</span>
      {t.content}
    </p>
    <div className="flex items-center gap-3">
      <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
      <div>
        <div className="text-sm font-bold text-slate-900">{t.name}</div>
        <div className="text-xs text-muted-foreground">{t.role}</div>
      </div>
    </div>
  </div>
);

export const SocialProofSection = () => {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [next]);

  const getVisible = () => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(testimonials[(current + i) % total]);
    }
    return items;
  };

  return (
    <section className="py-12 md:py-16 relative overflow-hidden ">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-16 animate-fade-in">
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-primary mb-5">
            DON'T TAKE OUR WORD FOR IT
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 md:mb-8 tracking-tight leading-[1.05] whitespace-pre-line">
            Trusted by{"\u00A0"}\n<span className="text-primary">Safety Leaders</span>{"\u00A0"}Worldwide
          </h2>
          <p className="text-base md:text-xl text-slate-900 whitespace-nowrap">
            Join global safety professionals who boosted their career's impact with the Safety 4.0 Academy
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex gap-6 transition-transform duration-700 ease-out">
            {getVisible().map((t, i) => (
              <TestimonialCard key={`${current}-${i}`} t={t} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-900 transition-colors active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-slate-900/60 text-sm tabular-nums">
            {current + 1} / {total}
          </span>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-900 transition-colors active:scale-95"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
