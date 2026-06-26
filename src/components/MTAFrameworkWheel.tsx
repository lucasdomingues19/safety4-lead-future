import { useEffect, useState } from "react";
import { Search, PenTool, ShieldCheck, Rocket, TrendingUp, type LucideIcon } from "lucide-react";

type Step = {
  num: string;
  label: string;
  icon: LucideIcon;
};

// Clockwise from top-right, mirroring the MTA framework wheel.
const STEPS: Step[] = [
  { num: "01", label: "Discovery", icon: Search },
  { num: "02", label: "Design", icon: PenTool },
  { num: "03", label: "Govern", icon: ShieldCheck },
  { num: "04", label: "Deploy", icon: Rocket },
  { num: "05", label: "Scale", icon: TrendingUp },
];

const CENTER = 200;
const R_OUTER = 176;
const R_INNER = 92;
const R_LABEL = (R_OUTER + R_INNER) / 2;
const GAP_DEG = 2.5; // gap between segments
const SEG = 360 / STEPS.length;

// angle measured from top (12 o'clock), clockwise, in degrees
const polar = (r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180; // -90 so 0deg = top
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
};

const annularSector = (start: number, end: number) => {
  const oStart = polar(R_OUTER, start);
  const oEnd = polar(R_OUTER, end);
  const iEnd = polar(R_INNER, end);
  const iStart = polar(R_INNER, start);
  const largeArc = end - start > 180 ? 1 : 0;
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${iStart.x} ${iStart.y}`,
    "Z",
  ].join(" ");
};

export const MTAFrameworkWheel = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-[300px] sm:w-[360px] lg:w-[400px] aspect-square select-none">
      <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="mtaActive" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(230 80% 62%)" />
            <stop offset="100%" stopColor="hsl(230 80% 48%)" />
          </linearGradient>
          <filter id="mtaGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {STEPS.map((step, i) => {
          const start = i * SEG - 90 + GAP_DEG / 2;
          const end = (i + 1) * SEG - 90 - GAP_DEG / 2;
          const isActive = i === active;
          return (
            <path
              key={step.num}
              d={annularSector(start, end)}
              fill={isActive ? "url(#mtaActive)" : "hsl(230 80% 95%)"}
              stroke={isActive ? "hsl(230 80% 56%)" : "hsl(230 60% 88%)"}
              strokeWidth={1}
              filter={isActive ? "url(#mtaGlow)" : undefined}
              style={{
                transformOrigin: "200px 200px",
                transform: isActive ? "scale(1.04)" : "scale(1)",
                transition: "transform 0.5s ease, fill 0.5s ease",
              }}
            />
          );
        })}

        {/* Center hub */}
        <circle cx={CENTER} cy={CENTER} r={R_INNER - 8} fill="white" stroke="hsl(230 60% 90%)" strokeWidth={1.5} />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="font-syne text-4xl sm:text-5xl font-black text-primary leading-none">MTA</span>
        <span className="mt-1 text-[9px] sm:text-[10px] font-bold tracking-[0.18em] text-slate-500 leading-tight">
          TRANSFORMATION<br />METHOD
        </span>
      </div>

      {/* Segment labels + icons */}
      {STEPS.map((step, i) => {
        const mid = i * SEG + SEG / 2 - 90;
        const pos = polar(R_LABEL, mid);
        const isActive = i === active;
        const Icon = step.icon;
        return (
          <div
            key={step.num}
            className="absolute flex flex-col items-center text-center transition-all duration-500"
            style={{
              left: `${(pos.x / 400) * 100}%`,
              top: `${(pos.y / 400) * 100}%`,
              transform: `translate(-50%, -50%) scale(${isActive ? 1.08 : 1})`,
            }}
          >
            <span
              className={`font-syne text-xl sm:text-2xl font-black leading-none transition-colors duration-500 ${
                isActive ? "text-white" : "text-primary"
              }`}
            >
              {step.num}
            </span>
            <Icon
              className={`my-1 h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-500 ${
                isActive ? "text-white" : "text-primary/70"
              }`}
            />
            <span
              className={`text-[10px] sm:text-xs font-semibold tracking-wide transition-colors duration-500 ${
                isActive ? "text-white" : "text-slate-600"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default MTAFrameworkWheel;
