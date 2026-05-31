import { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import logo from "@/assets/safety-academy-logo-transparent.png";
import bgWorker from "@/assets/certificate-bg-worker.png";
import ioshApprovedLogo from "@/assets/iosh-approved-provider.png";
import cpdMemberLogo from "@/assets/cpd-member-logo.jpg";

export interface CertificateData {
  certificate_number: string;
  recipient_name: string;
  course_name: string;
  completion_date: string;
  issued_at?: string;
  credential_level?: string | null;
  cpd_hours?: number | null;
  status?: string;
}

// Dark navy → black gradient with Safety 4.0 brand accents (lime + pink)
const NAVY = "#0c1733";
const NAVY_DEEP = "#05080f";
const LIME = "#c1ff72"; // brand lime green
const PINK = "#ff66c4"; // brand pink
// Kept GOLD/GOLD_SOFT names as accent aliases to avoid touching every usage
const GOLD = LIME;
const GOLD_SOFT = PINK;
const STEEL = "#3b6fa0";
const SLATE = "#cbd5e1";
const MUTED = "#8a93a8";

const SERIF = "'Instrument Serif', Georgia, serif";
const SANS = "'Work Sans', Inter, Arial, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Courier New', monospace";
const SCRIPT = "'Great Vibes', 'Brush Script MT', cursive";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

interface Props {
  cert: CertificateData;
  verifyUrl: string;
}

/**
 * Print/PDF-ready certificate. Minimal, corporate, tech-clean.
 * Uses inline hex colours (no CSS variables) so html2canvas captures it reliably.
 */
export const CertificateDocument = forwardRef<HTMLDivElement, Props>(
  ({ cert, verifyUrl }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 1000,
          minHeight: 707,
          background: `linear-gradient(155deg, ${NAVY} 0%, #070b18 55%, ${NAVY_DEEP} 100%)`,
          color: "#ffffff",
          fontFamily: SANS,
          position: "relative",
          padding: "60px 70px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Subtle low-poly worker, deep in the background, blended with the grid */}
        <img
          src={bgWorker}
          alt=""
          style={{
            position: "absolute",
            right: -60,
            bottom: 0,
            top: 0,
            height: "100%",
            width: 640,
            objectFit: "cover",
            objectPosition: "left center",
            opacity: 0.16,
            mixBlendMode: "screen",
            WebkitMaskImage:
              "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 55%), radial-gradient(ellipse 75% 85% at 55% 50%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 92%)",
            WebkitMaskComposite: "source-in",
            maskImage:
              "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 55%), radial-gradient(ellipse 75% 85% at 55% 50%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 92%)",
            maskComposite: "intersect",
            pointerEvents: "none",
          }}
        />

        {/* Digital grid — hard-clipped to the left so it cannot overlay the polygon worker. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 640,
            backgroundImage:
              "linear-gradient(rgba(59,111,160,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,111,160,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            // Grid reaches toward the centre and dissolves smoothly before the polygon worker.
            WebkitMaskImage:
              "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
            pointerEvents: "none",
          }}
        />


        {/* Single thin frame */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: `1px solid rgba(193,255,114,0.30)`,
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            paddingBottom: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
              src={logo}
              alt="Safety 4.0 Academy"
              style={{ width: 60, height: 60, objectFit: "contain" }}
            />
            <div>
              <div style={{ color: "#ffffff", fontSize: 17, fontWeight: 700, letterSpacing: 1 }}>
                Safety 4.0 Academy
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ textAlign: "center", marginTop: 44, position: "relative" }}>
          <div
            style={{
              color: GOLD,
              fontSize: 13,
              letterSpacing: 5,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Certificate of Completion
          </div>

          <div style={{ color: MUTED, fontSize: 14, marginTop: 30 }}>
            This is proudly presented to
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 66,
              fontWeight: 400,
              margin: "6px 0 4px",
              color: "#ffffff",
              lineHeight: 1.05,
            }}
          >
            {cert.recipient_name}
          </div>
          <div
            style={{
              width: 260,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${LIME}, ${PINK}, transparent)`,
              margin: "10px auto 30px",
            }}
          />
          <div style={{ color: SLATE, fontSize: 15 }}>for successfully completing</div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 34,
              fontWeight: 400,
              color: GOLD_SOFT,
              marginTop: 6,
              padding: "0 60px",
              lineHeight: 1.2,
            }}
          >
            {cert.course_name}
          </div>
          {(cert.credential_level || cert.cpd_hours) && (
            <div
              style={{
                display: "inline-block",
                color: SLATE,
                fontSize: 13,
                marginTop: 18,
                padding: "6px 16px",
                border: `1px solid rgba(59,111,160,0.6)`,
                borderRadius: 999,
                letterSpacing: 0.5,
              }}
            >
              {cert.credential_level ? cert.credential_level : ""}
              {cert.credential_level && cert.cpd_hours ? "  ·  " : ""}
              {cert.cpd_hours ? `${cert.cpd_hours} CPD Hours` : ""}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 54,
            position: "relative",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
              <div
                style={{
                  background: "#c1ff72",
                  padding: 8,
                  borderRadius: 8,
                  display: "inline-block",
                  height: 100,
                  width: 100,
                  boxSizing: "border-box",
                }}
              >
                <QRCodeCanvas value={verifyUrl} size={84} fgColor={NAVY_DEEP} bgColor="#c1ff72" level="M" />
              </div>

              {/* Accreditations */}
              <div
                style={{
                  background: "#c1ff72",
                  borderRadius: 8,
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  height: 100,
                  width: 100,
                  boxSizing: "border-box",
                }}
              >
                <img
                  src={ioshApprovedLogo}
                  alt="IOSH Approved Training Provider 5522"
                  style={{ height: 44, width: "auto", objectFit: "contain" }}
                />
                <img
                  src={cpdMemberLogo}
                  alt="CPD Member - The CPD Certification Service"
                  style={{ height: 40, width: "auto", objectFit: "contain" }}
                />
              </div>
            </div>

            <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, color: MUTED, marginTop: 10, whiteSpace: 'nowrap' }}>
              Certificate #{cert.certificate_number} issued on {cert.issued_at ? formatDate(cert.issued_at) : formatDate(cert.completion_date)}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CertificateDocument.displayName = "CertificateDocument";
