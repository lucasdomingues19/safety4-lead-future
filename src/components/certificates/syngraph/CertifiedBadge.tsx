import { forwardRef, useImperativeHandle, useRef } from "react";
import mark from "@/assets/brand-mark-white.png";
import type { CertificateData } from "@/components/certificates/CertificateDocument";

// The "Certified" badge — same design as Syngraph's 'certified' badge style
// (smart-test-space/src/components/badges/badgeDesigns.tsx): navy body, blue
// rim and level band, the academy mark, issuer, title and subtitle.

const BODY = "#0b0b2c";
const BLUE = "#3434ff";
const SANS = "'Plus Jakarta Sans', 'Geist', system-ui, sans-serif";

/** Title + subtitle per course. */
export function badgeCopy(course: string) {
  if (/AI Fundamentals|Fundamentals of AI/i.test(course)) return { title: "AI Fundamentals", subtitle: "AI in EHS" };
  if (/Accelerator/i.test(course)) return { title: "Safety 4.0", subtitle: "Accelerator Programme" };
  if (/Copilot/i.test(course)) return { title: "Copilot for EHS", subtitle: "EHS & Sustainability" };
  return { title: "Safety 4.0", subtitle: "Lead Safety in the Digital Age" };
}

function roundedHex(cx: number, cy: number, R: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k - Math.PI / 2;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as const;
  });
  let d = "";
  pts.forEach((p1, i) => {
    const p0 = pts[(i + 5) % 6], p2 = pts[(i + 1) % 6];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(v1[0], v1[1]), l2 = Math.hypot(v2[0], v2[1]);
    const a = [p1[0] + (v1[0] / l1) * r, p1[1] + (v1[1] / l1) * r];
    const b = [p1[0] + (v2[0] / l2) * r, p1[1] + (v2[1] / l2) * r];
    d += `${i ? "L" : "M"}${a[0].toFixed(2)} ${a[1].toFixed(2)} Q${p1[0].toFixed(2)} ${p1[1].toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)} `;
  });
  return d + "Z";
}

export interface CertifiedBadgeHandle {
  /** Renders the badge to a transparent PNG data URL at the given pixel size. */
  toPng: (px?: number) => Promise<string>;
}

export const CertifiedBadge = forwardRef<CertifiedBadgeHandle, { cert: CertificateData; size?: number }>(function CertifiedBadge({ cert, size = 260 }, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { title, subtitle } = badgeCopy(cert.course_name);
  const titleSize = title.length > 12 ? Math.max(19, 32 - (title.length - 12) * 1.4) : 32;
  const subSize = subtitle.length > 30 ? Math.max(9.5, 12 - (subtitle.length - 30) * 0.18) : 12;
  const inner = roundedHex(150, 150, 127, 17);

  useImperativeHandle(ref, () => ({
    toPng: async (px = 1200) => {
      const svg = svgRef.current;
      if (!svg) throw new Error("Badge not ready");
      // Inline the mark so the standalone SVG renders inside an <img>.
      const markData = await fetch(mark).then((r) => r.blob()).then((b) => new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.readAsDataURL(b); }));
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("width", String(px));
      clone.setAttribute("height", String(px));
      clone.querySelector("image")?.setAttribute("href", markData);
      const xml = new XMLSerializer().serializeToString(clone);
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = px; canvas.height = px;
      canvas.getContext("2d")!.drawImage(img, 0, 0, px, px);
      return canvas.toDataURL("image/png");
    },
  }));

  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width={size} height={size} role="img" aria-label={`${title} — ${subtitle}, certified badge`}>
      <path d={roundedHex(150, 150, 140, 21)} fill={BLUE} />
      <path d={inner} fill={BODY} />
      <defs><clipPath id="certified-band-clip"><path d={inner} /></clipPath></defs>
      <g clipPath="url(#certified-band-clip)"><rect x="0" y="184.5" width="300" height="44" fill={BLUE} /></g>
      <image href={mark} x={150 - 14.5} y={55} width={29} height={25.5} preserveAspectRatio="xMidYMid meet" />
      <text x="150" y="104" textAnchor="middle" fontFamily={SANS} fontSize="10" fontWeight={700} letterSpacing="2.5" fill="rgba(255,255,255,0.78)">SAFETYTECH ACADEMY</text>
      <text x="150" y="145" textAnchor="middle" fontFamily={SANS} fontSize={titleSize} fontWeight={800} letterSpacing="-0.5" fill="#ffffff">{title}</text>
      <text x="150" y="166" textAnchor="middle" fontFamily={SANS} fontSize={subSize} fontWeight={600} fill="rgba(255,255,255,0.74)">{subtitle}</text>
      <text x="150" y="211" textAnchor="middle" fontFamily={SANS} fontSize="12" fontWeight={800} letterSpacing="3.4" fill="#ffffff">CERTIFIED</text>
    </svg>
  );
});
