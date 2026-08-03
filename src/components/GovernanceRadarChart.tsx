interface GovernanceRadarChartProps {
  labels: string[];
  values: number[];
  max?: number;
}

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 100;
const LEVELS = 4;

const point = (angle: number, radius: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
};

export const GovernanceRadarChart = ({ labels, values, max = 4 }: GovernanceRadarChartProps) => {
  const step = 360 / labels.length;

  const polygon = values
    .map((v, i) => {
      const { x, y } = point(step * i, (Math.max(0, Math.min(max, v)) / max) * RADIUS);
      return `${x},${y}`;
    })
    .join(" ");

  const grid = Array.from({ length: LEVELS }, (_, level) =>
    labels
      .map((_, i) => {
        const { x, y } = point(step * i, ((level + 1) / LEVELS) * RADIUS);
        return `${x},${y}`;
      })
      .join(" "),
  );

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Governance readiness by domain" className="w-full max-w-[320px] mx-auto">
      {grid.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="hsl(214 32% 91%)" strokeWidth="1" />
      ))}
      {labels.map((_, i) => {
        const { x, y } = point(step * i, RADIUS);
        return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="hsl(214 32% 91%)" strokeWidth="1" />;
      })}

      <polygon points={polygon} fill="hsl(230 80% 56% / 0.18)" stroke="hsl(230 80% 56%)" strokeWidth="2" strokeLinejoin="round" />

      {values.map((v, i) => {
        const { x, y } = point(step * i, (Math.max(0, Math.min(max, v)) / max) * RADIUS);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="hsl(230 80% 56%)" />;
      })}

      {labels.map((label, i) => {
        const { x, y } = point(step * i, RADIUS + 26);
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[10px] font-semibold"
            fill="hsl(215 25% 27%)"
          >
            {label}
            <tspan x={x} dy="1.15em" fill="hsl(215 16% 47%)" className="text-[9px] font-mono">
              {values[i].toFixed(1)}/{max}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
};

export default GovernanceRadarChart;
