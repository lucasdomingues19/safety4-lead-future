import { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import logo from "@/assets/safety-academy-logo-transparent.png";
import bgWorker from "@/assets/certificate-bg-worker.png";

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
          background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
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

        {/* Digital grid — mesh (horizontal + vertical), drawn over the worker so the figure reads as part of the mesh */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(59,111,160,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,111,160,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        {/* Single thin frame */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: `1px solid rgba(201,168,76,0.35)`,
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
            borderBottom: "1px solid rgba(255,255,255,0.08)",
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
              <div style={{ color: MUTED, fontSize: 11.5, marginTop: 2, letterSpacing: 0.5 }}>
                Approved training provider by IOSH
              </div>
            </div>
          </div>
          <div
            style={{
              color: GOLD,
              fontSize: 10.5,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontWeight: 700,
              textAlign: "right",
            }}
          >
            Verified Credential
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
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
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
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
              {formatDate(cert.completion_date)}
            </div>
            <div style={{ height: 1, background: "rgba(201,168,76,0.4)", margin: "7px 0", width: 180 }} />
            <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5 }}>
              Date of Completion
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                background: "#fff",
                padding: 8,
                borderRadius: 8,
                display: "inline-block",
              }}
            >
              <QRCodeCanvas value={verifyUrl} size={84} fgColor={NAVY_DEEP} bgColor="#ffffff" level="M" />
            </div>
            <div style={{ color: MUTED, fontSize: 10, marginTop: 6, letterSpacing: 1 }}>Scan to verify</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: GOLD, letterSpacing: 0.5 }}>
              {cert.certificate_number}
            </div>
            <div
              style={{
                height: 1,
                background: "rgba(201,168,76,0.4)",
                margin: "7px 0",
                width: 180,
                marginLeft: "auto",
              }}
            />
            <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5 }}>
              Certificate No. (immutable)
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CertificateDocument.displayName = "CertificateDocument";
