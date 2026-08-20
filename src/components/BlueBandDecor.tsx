import { useRef, useState } from "react";

// Soft decorative circles for full-bleed brand-blue sections. Track the
// mouse within the section and drift each circle a little, so the band
// feels alive instead of a static gradient.
export const BlueBandDecor = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      className="absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute -top-32 -left-24 w-96 h-96 bg-white/[0.06] rounded-full pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${pos.x * 40}px, ${pos.y * 40}px, 0)` }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/[0.05] rounded-full pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${pos.x * -30}px, calc(-50% + ${pos.y * -30}px), 0)` }}
      />
      <div
        className="absolute -bottom-40 right-0 w-[30rem] h-[30rem] bg-white/[0.07] rounded-full pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(calc(25% + ${pos.x * 50}px), ${pos.y * 50}px, 0)` }}
      />
    </div>
  );
};
