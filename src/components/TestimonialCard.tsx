import { Star, Quote } from "lucide-react";

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

export const TestimonialCard = ({ t, className = "" }: { t: Testimonial; className?: string }) => (
  <div
    className={`relative bg-white rounded-[28px] shadow-lg p-8 md:p-10 text-center overflow-hidden flex flex-col ${className}`}
  >
    <Quote className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-20 text-primary/5 fill-primary/5 pointer-events-none" />
    <div className="relative z-10 flex flex-col flex-1">
      <p className="text-lg md:text-xl text-slate-600 leading-relaxed flex-1 mb-8">
        {t.content}
      </p>
      <div className="flex justify-center gap-0.5 mb-4">
        {[...Array(t.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <img
        src={t.image}
        alt={t.name}
        className="w-14 h-14 rounded-full object-cover mx-auto mb-3"
      />
      <div className="text-base font-bold text-slate-900">{t.name}</div>
      <div className="text-sm text-slate-500">{t.role}</div>
    </div>
  </div>
);
