import { useEffect, useState, useRef } from "react";

const CATEGORIES = [
  { label: "Digital Readiness", icon: "⚡" },
  { label: "Leadership", icon: "👤" },
  { label: "Productivity", icon: "📈" },
  { label: "Performance", icon: "🎯" },
  { label: "Risk Reduction", icon: "🛡" },
];

const BEFORE_VALUES = [32, 25, 40, 20, 35]; // Before training
const AFTER_VALUES = [88, 82, 92, 78, 85]; // After training

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 110;
const LEVELS = 4;

function polarToCartesian(angle: number, radius: number) {
  // Start from top (-90deg)
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function getPolygonPoints(values: number[], maxVal = 100) {
  return values
    .map((v, i) => {
      const angle = (360 / values.length) * i;
      const r = (v / maxVal) * RADIUS;
      const { x, y } = polarToCartesian(angle, r);
      return `${x},${y}`;
    })
    .join(" ");
}

export const AnimatedSpiderChart = () => {
  const [currentValues, setCurrentValues] = useState(BEFORE_VALUES);
  const [phase, setPhase] = useState<"before" | "after">("before");
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Intersection observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Animate between before/after
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setPhase((prev) => (prev === "before" ? "after" : "before"));
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Smooth interpolation
  useEffect(() => {
    const target = phase === "before" ? BEFORE_VALUES : AFTER_VALUES;
    const duration = 1200;
    const startTime = Date.now();
    const startValues = [...currentValues];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const newValues = startValues.map(
        (start, i) => start + (target[i] - start) * eased
      );
      setCurrentValues(newValues);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [phase]);

  // Grid lines
  const gridPolygons = Array.from({ length: LEVELS }, (_, level) => {
    const r = ((level + 1) / LEVELS) * RADIUS;
    return CATEGORIES.map((_, i) => {
      const angle = (360 / CATEGORIES.length) * i;
      const { x, y } = polarToCartesian(angle, r);
      return `${x},${y}`;
    }).join(" ");
  });

  // Axis lines
  const axes = CATEGORIES.map((_, i) => {
    const angle = (360 / CATEGORIES.length) * i;
    return polarToCartesian(angle, RADIUS);
  });

  // Label positions (slightly outside)
  const labelPositions = CATEGORIES.map((cat, i) => {
    const angle = (360 / CATEGORIES.length) * i;
    const { x, y } = polarToCartesian(angle, RADIUS + 32);
    return { ...cat, x, y };
  });

  // Value label positions
  const valuePositions = currentValues.map((v, i) => {
    const angle = (360 / CATEGORIES.length) * i;
    const r = (v / 100) * RADIUS;
    return { ...polarToCartesian(angle, r + 16), val: Math.round(v) };
  });

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      {/* Phase label */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all duration-500 ${
          phase === "before"
            ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
            : "bg-primary/20 text-primary border border-primary/30"
        }`}>
          <div className={`w-2 h-2 rounded-full ${phase === "before" ? "bg-pink-500" : "bg-primary"} animate-pulse`} />
          {phase === "before" ? "BEFORE TRAINING" : "AFTER SAFETY 4.0"}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-[260px] h-[260px] md:w-[320px] md:h-[320px] lg:w-[360px] lg:h-[360px]"
        style={{ filter: "drop-shadow(0 0 30px rgba(214, 255, 0, 0.08))" }}
      >
        {/* Radial gradient background */}
        <defs>
          <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(240, 55%, 18%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(240, 55%, 12%)" stopOpacity="0.2" />
          </radialGradient>
          <linearGradient id="beforeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(236, 72, 153)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="afterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(85, 100%, 72%)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(85, 100%, 72%)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS + 8} fill="url(#chartBg)" />

        {/* Grid polygons */}
        {gridPolygons.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="hsl(240, 30%, 30%)"
            strokeWidth="0.5"
            opacity={0.5 + i * 0.1}
          />
        ))}

        {/* Axis lines */}
        {axes.map((pos, i) => (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={pos.x}
            y2={pos.y}
            stroke="hsl(240, 30%, 30%)"
            strokeWidth="0.5"
            opacity="0.4"
          />
        ))}

        {/* Data polygon - fill */}
        <polygon
          points={getPolygonPoints(currentValues)}
          fill={phase === "after" ? "url(#afterGrad)" : "url(#beforeGrad)"}
          className="transition-all duration-300"
        />

        {/* Data polygon - stroke */}
        <polygon
          points={getPolygonPoints(currentValues)}
          fill="none"
          stroke={phase === "after" ? "hsl(85, 100%, 72%)" : "rgb(236, 72, 153)"}
          strokeWidth="2"
          strokeLinejoin="round"
          className="transition-all duration-300"
          style={{
            filter: phase === "after"
              ? "drop-shadow(0 0 8px hsl(85, 100%, 72%, 0.5))"
              : "drop-shadow(0 0 8px rgb(236, 72, 153, 0.4))",
          }}
        />

        {/* Data points */}
        {currentValues.map((v, i) => {
          const angle = (360 / CATEGORIES.length) * i;
          const r = (v / 100) * RADIUS;
          const { x, y } = polarToCartesian(angle, r);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill={phase === "after" ? "hsl(85, 100%, 72%)" : "rgb(236, 72, 153)"}
                className="transition-all duration-300"
                style={{
                  filter: phase === "after"
                    ? "drop-shadow(0 0 6px hsl(85, 100%, 72%, 0.6))"
                    : "drop-shadow(0 0 6px rgb(236, 72, 153, 0.5))",
                }}
              />
              <circle
                cx={x}
                cy={y}
                r="2"
                fill="white"
                className="transition-all duration-300"
              />
            </g>
          );
        })}

        {/* Category labels */}
        {labelPositions.map((cat, i) => (
          <text
            key={i}
            x={cat.x}
            y={cat.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="hsl(240, 10%, 60%)"
            className="text-[9px] md:text-[10px] font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {cat.label}
          </text>
        ))}

        {/* Value labels */}
        {valuePositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[8px] font-bold"
            fill={phase === "after" ? "hsl(85, 100%, 72%)" : "rgb(236, 72, 153)"}
            style={{
              fontFamily: "'Syne', sans-serif",
              transition: "fill 0.3s",
            }}
          >
            {pos.val}%
          </text>
        ))}
      </svg>

      {/* Bottom stat */}
      <div className="mt-4 text-center">
        <div className={`text-2xl md:text-3xl font-black font-syne transition-all duration-500 ${
          phase === "after" ? "text-primary" : "text-pink-500"
        }`}>
          {phase === "after" ? "+156%" : "Baseline"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {phase === "after" ? "avg. capability uplift" : "pre-programme score"}
        </div>
      </div>
    </div>
  );
};
