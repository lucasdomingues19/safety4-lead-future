import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

const slides = [
  "Photo 1 — replace with a real photo",
  "Photo 2 — replace with a real photo",
  "Photo 3 — replace with a real photo",
];

export const StoryCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-slate-100 border border-slate-200">
        {slides.map((label, i) => (
          <div
            key={label}
            className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 to-primary/5 transition-opacity duration-700 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <ImageIcon className="w-10 h-10 text-primary/40" strokeWidth={1.5} />
            <span className="text-sm text-slate-400 font-medium px-6 text-center">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-5">
        {slides.map((label, i) => (
          <button
            key={label}
            onClick={() => setCurrent(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-6 bg-primary" : "w-2 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
