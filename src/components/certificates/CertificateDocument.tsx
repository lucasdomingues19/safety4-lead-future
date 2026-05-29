import { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

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

const NAVY = "#11113a";
const NAVY_DEEP = "#0a0a26";
const LIME = "#c1ff72";
const SLATE = "#cbd5e1";
const MUTED = "#8a93a8";

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
    return (
      <div
        ref={ref}
        style={{
          width: 1000,
          minHeight: 707,
          background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)`,
          color: "#ffffff",
          fontFamily: "Inter, Arial, sans-serif",
          position: "relative",
          padding: "48px 56px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Decorative frame */}
        <div
          style={{
            position: "absolute",
            inset: 18,
            border: `1px solid rgba(193,255,114,0.35)`,
            borderRadius: 8,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: `1px solid rgba(255,255,255,0.08)`,
            borderRadius: 6,
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <div style={{ color: LIME, letterSpacing: 4, fontSize: 13, textTransform: "uppercase", fontWeight: 700 }}>
              Safety 4.0 Academy
            </div>
            <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>
              Approved training provider by IOSH
            </div>
          </div>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: LIME,
              color: NAVY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: -1,
            }}
          >
            S4
          </div>
        </div>

        {/* Body */}
        <div style={{ textAlign: "center", marginTop: 44, position: "relative" }}>
          <div style={{ color: SLATE, fontSize: 15, letterSpacing: 2, textTransform: "uppercase" }}>
            Certificate of Completion
          </div>
          <div style={{ color: MUTED, fontSize: 14, marginTop: 30 }}>This is proudly presented to</div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              margin: "10px 0 6px",
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            {cert.recipient_name}
          </div>
          <div
            style={{
              width: 260,
              height: 2,
              background: LIME,
              margin: "10px auto 26px",
              opacity: 0.7,
            }}
          />
          <div style={{ color: SLATE, fontSize: 15 }}>for successfully completing</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: LIME, marginTop: 8, padding: "0 40px" }}>
            {cert.course_name}
          </div>
          {(cert.credential_level || cert.cpd_hours) && (
            <div style={{ color: SLATE, fontSize: 14, marginTop: 12 }}>
              {cert.credential_level ? cert.credential_level : ""}
              {cert.credential_level && cert.cpd_hours ? " · " : ""}
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
            marginTop: 48,
            position: "relative",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{formatDate(cert.completion_date)}</div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.2)", margin: "6px 0", width: 180 }} />
            <div style={{ color: MUTED, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              Date of Completion
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ background: "#fff", padding: 8, borderRadius: 8, display: "inline-block" }}>
              <QRCodeCanvas value={verifyUrl} size={92} fgColor={NAVY} bgColor="#ffffff" level="M" />
            </div>
            <div style={{ color: MUTED, fontSize: 10, marginTop: 6 }}>Scan to verify</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: LIME, letterSpacing: 1 }}>
              {cert.certificate_number}
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.2)", margin: "6px 0", width: 180, marginLeft: "auto" }} />
            <div style={{ color: MUTED, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              Certificate No. (immutable)
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CertificateDocument.displayName = "CertificateDocument";
