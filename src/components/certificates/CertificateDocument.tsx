import { forwardRef, type CSSProperties } from "react";
import { QRCodeCanvas } from "qrcode.react";
import logoGold from "@/assets/safety-academy-logo-gold.png";

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

// Corporate Navy Trust + Champagne Gold palette (inline hex for html2canvas reliability)
const NAVY = "#0f1e44";
const NAVY_DEEP = "#0a1530";
const GOLD = "#c9a84c";
const GOLD_SOFT = "#e6cf8f";
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
 * Print/PDF-ready certificate. Uses inline hex colours (no CSS variables)
 * so html2canvas captures it reliably.
 */
export const CertificateDocument = forwardRef<HTMLDivElement, Props>(
  ({ cert, verifyUrl }, ref) => {
    const Corner = ({ style }: { style: CSSProperties }) => (
      <div style={{ position: "absolute", width: 46, height: 46, ...style }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: 46, height: 2, background: GOLD }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: 46, background: GOLD }} />
      </div>
    );

    return (
      <div
        ref={ref}
        style={{
          width: 1000,
          minHeight: 707,
          background: `radial-gradient(120% 120% at 50% 0%, ${NAVY} 0%, ${NAVY_DEEP} 70%)`,
          color: "#ffffff",
          fontFamily: SANS,
          position: "relative",
          padding: "56px 64px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Digital grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(59,111,160,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,111,160,0.07) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            pointerEvents: "none",
          }}
        />

        {/* Circuit traces */}
        <svg
          width="1000"
          height="707"
          viewBox="0 0 1000 707"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <g stroke={GOLD} strokeWidth="1.2" fill="none" opacity="0.22">
            <path d="M0 120 H120 L150 150 H260" />
            <path d="M0 200 H80 L110 230 V300" />
            <path d="M1000 150 H880 L850 180 H720" />
            <path d="M1000 250 H900 L870 280 V360" />
            <path d="M1000 560 H840 L810 530 H700" />
            <path d="M0 580 H160 L190 550 H300" />
            <path d="M150 707 V640 L180 610" />
            <path d="M850 707 V650 L820 620" />
          </g>
          <g fill={GOLD} opacity="0.5">
            <circle cx="260" cy="150" r="3.5" />
            <circle cx="110" cy="300" r="3.5" />
            <circle cx="720" cy="180" r="3.5" />
            <circle cx="870" cy="360" r="3.5" />
            <circle cx="700" cy="530" r="3.5" />
            <circle cx="300" cy="550" r="3.5" />
            <circle cx="180" cy="610" r="3.5" />
            <circle cx="820" cy="620" r="3.5" />
          </g>
          {/* Hex node, bottom-right */}
          <g transform="translate(840 560)" stroke={GOLD} strokeWidth="1.4" fill="none" opacity="0.18">
            <polygon points="60,0 30,52 -30,52 -60,0 -30,-52 30,-52" />
            <polygon points="100,0 50,87 -50,87 -100,0 -50,-87 50,-87" />
          </g>
        </svg>


        {/* Double gold frame */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: `1px solid rgba(201,168,76,0.45)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 27,
            border: `1px solid rgba(255,255,255,0.08)`,
            pointerEvents: "none",
          }}
        />

        {/* Ornamental corners */}
        <Corner style={{ top: 34, left: 34 }} />
        <Corner style={{ top: 34, right: 34, transform: "scaleX(-1)" }} />
        <Corner style={{ bottom: 34, left: 34, transform: "scaleY(-1)" }} />
        <Corner style={{ bottom: 34, right: 34, transform: "scale(-1,-1)" }} />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
              src={logoGold}
              alt="Safety 4.0 Academy"
              crossOrigin="anonymous"
              style={{ width: 62, height: 62, objectFit: "contain" }}
            />

            <div>
              <div
                style={{
                  color: "#ffffff",
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
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
              fontSize: 11,
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
        <div style={{ textAlign: "center", marginTop: 40, position: "relative" }}>
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              margin: "12px 0 24px",
            }}
          >
            <div style={{ height: 1, width: 54, background: "rgba(201,168,76,0.4)" }} />
            <div style={{ width: 5, height: 5, background: GOLD, transform: "rotate(45deg)" }} />
            <div style={{ fontFamily: MONO, color: STEEL, fontSize: 10, letterSpacing: 2 }}>
              {"<verified/>"}
            </div>
            <div style={{ width: 5, height: 5, background: GOLD, transform: "rotate(45deg)" }} />
            <div style={{ height: 1, width: 54, background: "rgba(201,168,76,0.4)" }} />
          </div>


          <div style={{ color: MUTED, fontSize: 14 }}>This is proudly presented to</div>
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
              width: 280,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              margin: "8px auto 28px",
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
                marginTop: 16,
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
            marginTop: 46,
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
                border: `2px solid ${GOLD}`,
              }}
            >
              <QRCodeCanvas value={verifyUrl} size={88} fgColor={NAVY_DEEP} bgColor="#ffffff" level="M" />
            </div>
            <div style={{ color: MUTED, fontSize: 10, marginTop: 6, letterSpacing: 1 }}>Scan to verify</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>
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
