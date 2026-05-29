import { forwardRef } from "react";
import type { CertificateData } from "./CertificateDocument";

const NAVY = "#11113a";
const NAVY_DEEP = "#0a0a26";
const LIME = "#c1ff72";

interface Props {
  cert: CertificateData;
  size?: number;
}

/** Square shareable badge / medallion. Inline hex colours for clean PDF/PNG capture. */
export const BadgeMedallion = forwardRef<HTMLDivElement, Props>(
  ({ cert, size = 420 }, ref) => {
    const year = new Date(cert.completion_date).getFullYear();
    return (
      <div
        ref={ref}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 50% 35%, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
          borderRadius: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, Arial, sans-serif",
          position: "relative",
          boxSizing: "border-box",
          padding: 28,
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            width: size * 0.66,
            height: size * 0.66,
            borderRadius: "50%",
            border: `3px solid ${LIME}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: `0 0 0 8px rgba(193,255,114,0.12)`,
          }}
        >
          <div
            style={{
              width: size * 0.52,
              height: size * 0.52,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${LIME} 0%, #9be24a 100%)`,
              color: NAVY,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 12,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: size * 0.13, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>S4</div>
            <div style={{ fontSize: size * 0.035, fontWeight: 800, letterSpacing: 2, marginTop: 4 }}>
              CERTIFIED
            </div>
            <div style={{ fontSize: size * 0.028, fontWeight: 600, marginTop: 2 }}>{year}</div>
          </div>
        </div>

        <div style={{ color: "#ffffff", fontSize: size * 0.05, fontWeight: 800, marginTop: 18, textAlign: "center", lineHeight: 1.2, padding: "0 6px" }}>
          {cert.course_name}
        </div>
        <div style={{ color: LIME, fontSize: size * 0.03, letterSpacing: 2, marginTop: 6, textTransform: "uppercase" }}>
          Safety 4.0 Academy
        </div>
      </div>
    );
  },
);

BadgeMedallion.displayName = "BadgeMedallion";
