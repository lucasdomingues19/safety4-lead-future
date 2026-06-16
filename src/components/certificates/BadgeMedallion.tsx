import { forwardRef } from "react";
import type { CertificateData } from "./CertificateDocument";
import logoAsset from "@/assets/safety-academy-logo.png.asset.json";
import safety40Badge from "@/assets/safety-4.0-badge.png.asset.json";

// Corporate Navy Trust + Champagne Gold palette
const NAVY = "#0f1e44";
const NAVY_DEEP = "#0a1530";
const GOLD = "#c9a84c";
const GOLD_SOFT = "#e6cf8f";
const STEEL = "#3b6fa0";

const SERIF = "'Instrument Serif', Georgia, serif";
const SANS = "'Work Sans', Inter, Arial, sans-serif";

interface Props {
  cert: CertificateData;
  size?: number;
}

/** Square shareable badge / medallion. Inline hex colours for clean PDF/PNG capture. */
export const BadgeMedallion = forwardRef<HTMLDivElement, Props>(
  ({ cert, size = 420 }, ref) => {
  const year = new Date(cert.completion_date).getFullYear();
  const notchCount = 36;
  const isSafety40Course =
    cert.course_name === "IOSH-approved Safety 4.0 - Leading Safety in the Digital Age";

  if (isSafety40Course) {
    return (
      <div
        ref={ref}
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxSizing: "border-box",
          padding: 10,
          overflow: "hidden",
        }}
      >
        <img
          src={safety40Badge.url}
          alt="IOSH-approved Safety 4.0 - Leading Safety in the Digital Age Certified Badge"
          style={{ width: size - 20, height: size - 20, objectFit: "contain" }}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 50% 32%, ${NAVY} 0%, ${NAVY_DEEP} 75%)`,
        borderRadius: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SANS,
        position: "relative",
        boxSizing: "border-box",
        padding: 26,
        overflow: "hidden",
      }}
    >
      {/* Medallion */}
      <div
        style={{
          width: size * 0.62,
          height: size * 0.62,
          borderRadius: "50%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Toothed/coin outer edge */}
        {Array.from({ length: notchCount }).map((_, i) => {
          const angle = (360 / notchCount) * i;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 4,
                height: size * 0.31,
                background: i % 2 === 0 ? GOLD : "rgba(201,168,76,0.45)",
                transformOrigin: "center top",
                transform: `translate(-50%, 0) rotate(${angle}deg)`,
              }}
            />
          );
        })}

        {/* Inner navy disc with gold rings */}
        <div
          style={{
            width: size * 0.54,
            height: size * 0.54,
            borderRadius: "50%",
            background: NAVY_DEEP,
            border: `2px solid ${GOLD}`,
            boxShadow: `0 0 0 7px ${NAVY_DEEP}, 0 0 0 9px rgba(201,168,76,0.35)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Navy core with transparent logo */}
          <div
            style={{
              width: size * 0.42,
              height: size * 0.42,
              borderRadius: "50%",
              background: NAVY_DEEP,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <img
              src={logoAsset.url}
              alt="Safety 4.0 Academy"
              style={{ width: size * 0.26, height: size * 0.26, objectFit: "contain", marginTop: size * 0.015 }}
            />
            <div
              style={{
                fontSize: size * 0.033,
                fontWeight: 800,
                letterSpacing: 3,
                marginTop: 1,
                color: GOLD_SOFT,
              }}
            >
              CERTIFIED
            </div>
            <div style={{ fontSize: size * 0.028, fontWeight: 700, marginTop: 1, color: GOLD }}>{year}</div>
          </div>
        </div>
      </div>


      <div
        style={{
          color: "#ffffff",
          fontFamily: SERIF,
          fontSize: size * 0.062,
          fontWeight: 400,
          marginTop: 16,
          textAlign: "center",
          lineHeight: 1.15,
          padding: "0 10px",
        }}
      >
        {cert.course_name}
      </div>
      <div
        style={{
          color: GOLD,
          fontSize: size * 0.028,
          letterSpacing: 2.5,
          marginTop: 6,
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        Safety 4.0 Academy
      </div>
    </div>
  );
  },
);

BadgeMedallion.displayName = "BadgeMedallion";
