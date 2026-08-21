import { useRef, useState } from "react";

// A "digital rain" field of small square pixels for full-bleed brand-blue
// sections — grid-aligned like a data/pixel matrix, each one drifting on
// its own continuous loop (staggered) plus responding to mouse position
// for parallax depth.

const COLS = 14;
const ROWS = 5;

const DOTS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  // deterministic pseudo-random jitter per cell, no Math.random so SSR/CSR match
  const seed = (col * 13 + row * 37) % 97;
  const show = seed % 3 !== 0; // skip ~1/3 of cells for an irregular matrix
  return {
    x: (col / (COLS - 1)) * 100 + (((seed % 5) - 2) * 1.4),
    y: (row / (ROWS - 1)) * 100 + ((((seed * 7) % 5) - 2) * 3),
    size: 2 + (seed % 3),
    depth: 0.3 + (seed % 7) / 10,
    delay: (seed % 40) / 10,
    duration: 5 + (seed % 5),
    bright: seed % 11 === 0,
    show,
  };
}).filter((d) => d.show);

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
            transform: `translate3d(${pos.x * 36 * dot.depth}px, ${pos.y * 36 * dot.depth}px, 0)`,
            transition: "transform 0.4s ease-out",
          }}
        >
          <span
            className="block bg-white animate-dot-float"
            style={{
              width: dot.size,
              height: dot.size,
              opacity: dot.bright ? 0.8 : 0.25 + dot.depth * 0.3,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
};
