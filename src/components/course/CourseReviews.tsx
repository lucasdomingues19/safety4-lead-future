import { Star, Quote } from "lucide-react";

export interface Review {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

export const CourseReviews = ({ reviews }: { reviews: Review[] }) => (
  <div className="grid md:grid-cols-2 gap-6">
    {reviews.map((r) => (
      <div
        key={r.name}
        className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-0.5">
            {[...Array(r.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <Quote className="w-7 h-7 text-primary/15 fill-primary/15" />
        </div>
        <p className="text-slate-700 leading-relaxed mb-6 flex-1">{r.content}</p>
        <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
          <img src={r.image} alt={r.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
          <div>
            <div className="text-sm font-bold text-slate-900">{r.name}</div>
            <div className="text-xs text-[#69697b]">{r.role}</div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
