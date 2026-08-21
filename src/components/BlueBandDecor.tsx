import { useRef, useState } from "react";

// A scattered field of small "digital" dots for full-bleed brand-blue
// sections — each drifts continuously (staggered float animation) and
// the whole field also responds to mouse position for parallax depth.

const DOTS = [
  { x: 6, y: 15, size: 3, depth: 0.4, delay: 0 },
  { x: 14, y: 62, size: 2, depth: 0.7, delay: 1.2 },
  { x: 22, y: 30, size: 4, depth: 0.3, delay: 2.4 },
  { x: 9, y: 85, size: 2, depth: 0.9, delay: 0.6 },
  { x: 31, y: 8, size: 3, depth: 0.5, delay: 3.1 },
  { x: 38, y: 48, size: 2, depth: 0.8, delay: 1.8 },
  { x: 27, y: 72, size: 3, depth: 0.4, delay: 2.9 },
  { x: 45, y: 20, size: 2, depth: 0.6, delay: 0.3 },
  { x: 52, y: 88, size: 3, depth: 0.5, delay: 3.6 },
  { x: 60, y: 40, size: 4, depth: 0.3, delay: 1.5 },
  { x: 48, y: 62, size: 2, depth: 0.9, delay: 2.1 },
  { x: 67, y: 12, size: 3, depth: 0.5, delay: 0.9 },
  { x: 73, y: 55, size: 2, depth: 0.7, delay: 3.3 },
  { x: 80, y: 78, size: 3, depth: 0.4, delay: 1.1 },
  { x: 85, y: 25, size: 2, depth: 0.8, delay: 2.7 },
  { x: 91, y: 45, size: 4, depth: 0.3, delay: 0.5 },
  { x: 94, y: 70, size: 2, depth: 0.6, delay: 3.9 },
  { x: 76, y: 32, size: 3, depth: 0.5, delay: 1.9 },
  { x: 17, y: 45, size: 2, depth: 0.7, delay: 2.5 },
  { x: 58, y: 15, size: 2, depth: 0.6, delay: 0.8 },
  { x: 40, y: 90, size: 3, depth: 0.4, delay: 3.4 },
  { x: 88, y: 92, size: 2, depth: 0.8, delay: 1.4 },
  { x: 4, y: 40, size: 2, depth: 0.6, delay: 2.2 },
  { x: 63, y: 68, size: 3, depth: 0.4, delay: 0.2 },
];

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
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {DOTS.map((dot, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            transform: `translate3d(${pos.x * 40 * dot.depth}px, ${pos.y * 40 * dot.depth}px, 0)`,
            transition: "transform 0.4s ease-out",
          }}
        >
          <span
            className="block rounded-full bg-white animate-dot-float"
            style={{
              width: dot.size,
              height: dot.size,
              opacity: 0.35 + dot.depth * 0.35,
              animationDelay: `${dot.delay}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
};
