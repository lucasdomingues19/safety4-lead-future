import { useEffect, useRef, useState } from "react";

// An animated "network" decoration for full-bleed brand-blue sections —
// nodes drift slowly on independent sine paths, connected to their
// nearest neighbours by thin lines, like a live data/plexus graph.
// The whole layer also parallaxes gently with the mouse.

const NODE_COUNT = 16;

interface Node {
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  freqX: number;
  freqY: number;
  phase: number;
  r: number;
}

const NODES: Node[] = Array.from({ length: NODE_COUNT }, (_, i) => {
  const seed = (i * 53) % 97;
  const col = i % 5;
  const row = Math.floor(i / 5);
  return {
    baseX: 8 + col * 22 + ((seed % 9) - 4),
    baseY: 12 + row * 28 + (((seed * 3) % 9) - 4),
    ampX: 3 + (seed % 5),
    ampY: 2 + (seed % 4),
    freqX: 0.15 + (seed % 5) / 40,
    freqY: 0.12 + (seed % 7) / 45,
    phase: seed,
    r: 1.6 + (seed % 3) * 0.5,
  };
});

// Connect each node to its 2 nearest neighbours (by base position) — a
// fixed topology computed once, positions just drift within it.
const EDGES: [number, number][] = (() => {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  NODES.forEach((n, i) => {
    const distances = NODES.map((o, j) => ({
      j,
      d: i === j ? Infinity : (o.baseX - n.baseX) ** 2 + (o.baseY - n.baseY) ** 2,
    })).sort((a, b) => a.d - b.d);
    distances.slice(0, 2).forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    });
  });
  return edges;
})();

export const BlueBandDecor = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const live = NODES.map((n) => ({
    x: n.baseX + Math.sin(t * n.freqX + n.phase) * n.ampX,
    y: n.baseY + Math.cos(t * n.freqY + n.phase) * n.ampY,
    r: n.r,
  }));

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out"
        style={{ transform: `translate3d(${pos.x * 24}px, ${pos.y * 24}px, 0)` }}
      >
        {EDGES.map(([a, b], i) => {
          const accentEdge = NODES[a].phase % 8 === 0 || NODES[b].phase % 8 === 0;
          return (
            <line
              key={i}
              x1={live[a].x}
              y1={live[a].y}
              x2={live[b].x}
              y2={live[b].y}
              stroke={accentEdge ? "#a6e21a" : "white"}
              strokeOpacity={accentEdge ? 0.22 : 0.18}
              strokeWidth={0.1}
            />
          );
        })}
        {live.map((n, i) => {
          const accent = NODES[i].phase % 8 === 0;
          return (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={(accent ? n.r * 1.15 : n.r) * 0.6}
              fill={accent ? "#a6e21a" : "white"}
              fillOpacity={accent ? 0.7 : NODES[i].phase % 4 === 0 ? 0.55 : 0.3}
            />
          );
        })}
      </svg>
    </div>
  );
};
