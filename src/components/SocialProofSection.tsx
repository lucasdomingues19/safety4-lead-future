import { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    content: "As an HSE leader, I found the content highly relevant to the current needs of the industry. The online training provided clear insights into modern HSE strategies and the latest safety technologies that organizations must start integrating. It was to the point, forward-thinking, and aligned with the real challenges HSE leaders face today.",
    rating: 5,
    image: shebinAbrahamPhoto
  },
  {
    name: "Ana Coutinho",
    role: "HSE Manager, LEGO Group",
    content: "To be honest, my knowledge about SafetyTech and AI in general was not very good at all. I really enjoyed the fact that it is simple to understand and designed for people who, such as myself, have very little knowledge on the subject. I also really enjoyed the practical examples as they helped me understand the applications of SafetyTech better.",
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
    content: "Safety 4.0 is a solid introductory course for anyone looking to understand how technology is shaping modern health and safety work. The content is clear, accessible, and supported by well-produced examples that make the concepts easy to follow.",
    rating: 5,
    image: jacquelineCarrPhoto
  },
  {
    name: "Stephanie Osborne",
    role: "Health & Safety Leader",
    content: "I've just completed Safety 4.0 - Leading Safety in the Digital Age. The course was relevant, easy to digest and thought provoking. It is aimed at organisations at all stages on their digital transformation journey so has something to offer, whatever the current progress in this area. Particularly like that it is IOSH Approved too.",
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
    content: "This course did a great job in bridging traditional safety management and the digital future that we're already living in. The lessons made it clear that integrating data from multiple sources is critical to prevent harm before it happens. This course gives you the vision and the roadmap to make it happen.",
    rating: 5,
    image: emilyHaasPhoto
  },
  {
    name: "Johannes Buchmann",
    role: "Global Health & Safety Manager, Siemens",
    content: "Safety 4.0 is a great entry-level course for EHS professionals starting their journey into Industry 4.0 and health & safety tech. It introduces AI concepts in a clear way and includes practical tips and tricks that make applying the knowledge easier.",
    rating: 5,
    image: johannesBuchmannPhoto
  },
  {
    name: "Stewart Deary",
    role: "Global HSE Director",
    content: "The course felt like a great entry-level introduction to how AI technology is influencing today's HSE leadership. What stood out first was the high production quality and the way the ideas were brought to life through polished, relevant examples that made the topics easy to understand.",
    rating: 5,
    image: stewartDearyPhoto
  },
  {
    name: "Renauld Wilson",
    role: "Senior Risk Manager, ICW Group",
    content: "I really enjoyed how the course explained the transition from traditional safety management to Safety 4.0. The practical examples, case studies, and real-world applications of technologies such as AI, SafetyTech, and data analytics made the content easy to understand and relevant to modern workplace safety.",
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

export const SocialProofSection = () => {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  const next = () => setCurrent((c) => (c === total - 1 ? 0 : c + 1));

  const t = testimonials[current];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-16 animate-fade-in">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-secondary mb-4 md:mb-8">
            Trusted by <span className="text-primary">Safety Leaders</span> Worldwide
          </h2>
          <p className="text-base md:text-xl text-white">
            Join global safety professionals who boosted their careers impact with the Safety 4.0 Academy
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="p-6 md:p-10 shadow-card border-0 bg-white transition-all duration-300">
            <CardContent className="p-0">
              <div className="flex items-center mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <Quote className="w-8 h-8 text-lime-500 fill-lime-500 mb-4" />

              <p className="text-black mb-6 leading-relaxed text-base md:text-lg min-h-[120px]">
                "{t.content}"
              </p>

              <div className="flex items-center space-x-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors active:scale-95"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white/60 text-sm tabular-nums">
              {current + 1} / {total}
            </span>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors active:scale-95"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
