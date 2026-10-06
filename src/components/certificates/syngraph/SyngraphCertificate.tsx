import { forwardRef, useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { CERT_DESIGNS, fontStack, type CertResolved } from "./certificateDesigns";
import type { CertificateData } from "@/components/certificates/CertificateDocument";

// LMS certificates drawn with Syngraph's certificate designs, using the
// branding Lucas set up in Syngraph for the IOSH Safety 4.0 assessment
// (template "IOSH Approved Safety 4.0 - Leading Safety in the Digital Age",
// Atelier design since 2026-10-02). Update here if the Syngraph template
// changes, so LMS and Syngraph certificates stay identical.
const SYNGRAPH_ASSETS = "https://bzmumnflczajlagnmppd.supabase.co/storage/v1/object/public/assessment-assets";
export const SAFETYTECH_TEMPLATE = {
  template_style: "atelier",
  background_pattern: "none",
  font_family: "instrument",
  orientation: "landscape" as "landscape" | "portrait",
  primary_color: "#2b00ff",
  secondary_color: "#2b00ff",
  background_color: "#FBFBFD",
  text_color: "#0B0B2C",
  custom_header: "Certificate of Achievement",
  custom_footer: "safetytech.academy",
  issuer_name: "SafetyTech Academy",
  signature_name: "Lucas Domingues, Founder",
  skills_label: "Skills Demonstrated",
  logo_file: "certificate-mark-safetytech-blue.png",
  element_layout: null,
};

// Skills printed per course (the Syngraph template lists Safety 4.0's).
const SKILLS: Record<string, string[]> = {
  safety: ["SafetyTech", "Digital Transformation", "Artificial Intelligence", "Compliance & Governance", "Risk Management", "Safety Leadership"],
  ai: ["Artificial Intelligence", "AI Literacy", "Digital Transformation", "AI Risk & Governance", "Safety 4.0"],
};
export const skillsFor = (course: string) => (/AI Fundamentals|Fundamentals of AI/i.test(course) ? SKILLS.ai : SKILLS.safety);

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });

let fontsRequested = false;
const ensureFonts = () => {
  if (fontsRequested || typeof document === "undefined") return;
  fontsRequested = true;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Instrument+Serif&family=Dancing+Script:wght@600&family=Great+Vibes&display=swap";
  document.head.appendChild(l);
};

interface Props {
  cert: CertificateData;
  verifyUrl: string;
}

export const SyngraphCertificate = forwardRef<HTMLDivElement, Props>(function SyngraphCertificate({ cert, verifyUrl }, ref) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [qr, setQr] = useState<string | null>(null);
  useEffect(ensureFonts, []);
  useEffect(() => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) setQr(canvas.toDataURL("image/png"));
  }, [verifyUrl]);

  const t = SAFETYTECH_TEMPLATE;
  const c: CertResolved = {
    primary: t.primary_color,
    secondary: t.secondary_color,
    bg: t.background_color,
    text: t.text_color,
    fontDisplay: fontStack(t.font_family),
    pattern: t.background_pattern,
    logoUrl: `${SYNGRAPH_ASSETS}/${t.logo_file}`,
    showLogo: true,
    issuerName: t.issuer_name,
    showIssuer: true,
    header: t.custom_header,
    footer: t.custom_footer,
    showScore: false,
    score: 0,
    showDate: true,
    dateText: fmt(cert.completion_date || cert.issued_at || new Date().toISOString()),
    expiryText: null,
    showSignature: true,
    signatureName: t.signature_name,
    signatureImageUrl: `${SYNGRAPH_ASSETS}/certificate-signature-transparent-1789476025417.png`,
    showSkills: true,
    skillsLabel: t.skills_label,
    skills: skillsFor(cert.course_name),
    showCertificateId: true,
    certificateId: cert.certificate_number,
    qr,
    holderName: cert.recipient_name,
    assessmentTitle: cert.course_name,
    // Lucas (2026-10-04): CPD hours are not printed on the certificate.
    showDescription: false,
    certificateDescription: null,
    portrait: t.orientation === "portrait",
    elementLayout: t.element_layout,
    editable: false,
  } as CertResolved;

  const Design = (CERT_DESIGNS[t.template_style] ?? CERT_DESIGNS.summit).Component;
  return (
    // Pinned at the design's intended width (Syngraph's Frame is fluid up to
    // 620px portrait / 920px landscape, but its type is fixed-size); the verify
    // page scales this whole block down to fit small screens.
    <div ref={ref} style={{ width: c.portrait ? 620 : 920 }}>
      {Design(c)}
      <div ref={qrRef} aria-hidden style={{ position: "absolute", left: -9999, top: 0 }}>
        <QRCodeCanvas value={verifyUrl} size={220} fgColor="#111827" bgColor="#FFFFFF" level="M" />
      </div>
    </div>
  );
});

export { SYNGRAPH_ASSETS };
