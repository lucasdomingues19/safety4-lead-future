// Copied from Syngraph (smart-test-space/src/components/certificates/certificateDesigns.tsx)
// so LMS-issued certificates render with exactly the same designs as
// Syngraph's. Only change: the drag-to-position layout editor (react-rnd) is
// removed — the LMS only ever renders saved layouts. Keep in sync with Syngraph.
import type { ReactNode } from 'react';

/** Position as a percentage of the certificate canvas (scales across render
 *  sizes); size in pixels (the element has a natural aspect ratio, not a
 *  canvas-relative one). */
export interface ElementBox {
  xPct: number;
  yPct: number;
  widthPx: number;
  heightPx: number;
}

export type ElementKey = 'logo' | 'qr' | 'signature';

const DEFAULT_BOXES: Record<ElementKey, ElementBox> = {
  logo: { xPct: 4, yPct: 4, widthPx: 60, heightPx: 42 },
  qr: { xPct: 82, yPct: 84, widthPx: 46, heightPx: 46 },
  signature: { xPct: 62, yPct: 78, widthPx: 150, heightPx: 56 },
};

/**
 * Premium certificate design library.
 *
 * Each design is a genuinely distinct, crafted LAYOUT — not one parametric
 * template with the colour swapped. A creator picks a design, then brands it
 * (colours, font, background texture, logo, signature, sections).
 *
 * RULE: every design must honour EVERY toggle. If a design cannot show a
 * section, it must not silently ignore it — a control that does nothing is a
 * broken control.
 */
export interface CertResolved {
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  fontDisplay: string;
  pattern: string;
  logoUrl: string | null;
  showLogo: boolean;
  issuerName: string;
  showIssuer: boolean;
  header: string;
  footer: string | null;
  showScore: boolean;
  score: number;
  showDate: boolean;
  dateText: string;
  expiryText: string | null;
  showSignature: boolean;
  signatureName: string | null;
  signatureImageUrl: string | null;
  showSkills: boolean;
  skillsLabel: string;
  skills: string[];
  showCertificateId: boolean;
  certificateId?: string;
  qr: string | null;
  holderName: string;
  assessmentTitle: string;
  /** Short, customer-facing course/credential description, shown below the
   *  title line — separate from an assessment's internal AI-generation
   *  context. Only rendered when both this and showDescription are set. */
  showDescription: boolean;
  certificateDescription?: string | null;
  portrait: boolean;
  /** Per-element position/size overrides from the layout editor. Missing
   *  keys fall back to the design's default flow position. */
  elementLayout?: Partial<Record<ElementKey, ElementBox>> | null;
  /** True only inside the layout editor — makes logo/qr/signature
   *  draggable+resizable. Never true on the public verification page. */
  editable?: boolean;
  /** Pixel size of the rendered canvas — needed to convert react-rnd's pixel
   *  drag coordinates to the percentage-based storage format. Only required
   *  when editable. */
  canvasSizePx?: { width: number; height: number };
  onElementLayoutChange?: (key: ElementKey, box: ElementBox) => void;
}

export const CERT_FONTS: { value: string; label: string; stack: string }[] = [
  { value: 'serif', label: 'Classic Serif', stack: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif" },
  { value: 'sans', label: 'Modern Sans', stack: "'Geist', 'SF Pro Display', system-ui, sans-serif" },
  { value: 'elegant', label: 'Didone (elegant)', stack: "'Didot', 'Bodoni 72', 'Hoefler Text', Georgia, serif" },
  { value: 'cinzel', label: 'Cinzel (inscriptional)', stack: "'Cinzel', Georgia, serif" },
  { value: 'playfair', label: 'Playfair Display', stack: "'Playfair Display', Georgia, serif" },
  { value: 'cormorant', label: 'Cormorant Garamond', stack: "'Cormorant Garamond', Georgia, serif" },
  { value: 'libre', label: 'Libre Baskerville', stack: "'Libre Baskerville', Georgia, serif" },
  { value: 'lora', label: 'Lora', stack: "'Lora', Georgia, serif" },
  { value: 'marcellus', label: 'Marcellus', stack: "'Marcellus', Georgia, serif" },
  { value: 'montserrat', label: 'Montserrat', stack: "'Montserrat', system-ui, sans-serif" },
];

export const fontStack = (v?: string | null) =>
  CERT_FONTS.find((f) => f.value === v)?.stack ?? CERT_FONTS[0].stack;

export const CERT_PATTERNS = [
  { value: 'none', label: 'None' },
  { value: 'circles', label: 'Guilloché circles' },
  { value: 'lines', label: 'Fine lines' },
  { value: 'dots', label: 'Digital dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'waves', label: 'Waves' },
  { value: 'hatch', label: 'Diagonal hatch' },
];

const SANS = "'Geist', 'SF Pro Display', system-ui, sans-serif";
const SCRIPT = "'Snell Roundhand', 'Dancing Script', cursive";
const MONO = "'Geist Mono', 'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace";

export const rgba = (hex: string, a: number) => {
  const h = (hex || '#000').replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(n, 16);
  if (Number.isNaN(num)) return `rgba(0,0,0,${a})`;
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${a})`;
};

/** Background texture. Each option is a real, distinct security-print style. */
function Pattern({ c, opacity = 0.06 }: { c: CertResolved; opacity?: number }) {
  if (!c.pattern || c.pattern === 'none') return null;
  const id = `pat-${c.pattern}-${c.primary.replace('#', '')}`;
  const p = c.primary;
  const s = c.secondary;
  let shape: ReactNode = null;

  if (c.pattern === 'circles') {
    shape = (
      <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
        <circle cx="22" cy="22" r="19" fill="none" stroke={p} strokeWidth="0.5" />
        <circle cx="22" cy="22" r="11" fill="none" stroke={s} strokeWidth="0.5" />
      </pattern>
    );
  } else if (c.pattern === 'lines') {
    shape = (
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="6" stroke={p} strokeWidth="0.6" />
      </pattern>
    );
  } else if (c.pattern === 'dots') {
    shape = (
      <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.1" fill={p} />
      </pattern>
    );
  } else if (c.pattern === 'grid') {
    shape = (
      <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
        <path d="M26 0H0V26" fill="none" stroke={p} strokeWidth="0.6" />
      </pattern>
    );
  } else if (c.pattern === 'waves') {
    shape = (
      <pattern id={id} width="60" height="18" patternUnits="userSpaceOnUse">
        <path d="M0 9 Q15 0 30 9 T60 9" fill="none" stroke={p} strokeWidth="0.7" />
      </pattern>
    );
  } else if (c.pattern === 'hatch') {
    shape = (
      <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="10" stroke={p} strokeWidth="0.7" />
      </pattern>
    );
  }

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>{shape}</defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}

/**
 * Wraps a movable element (logo, QR, signature) with an optional saved
 * position override, or — in the layout editor — a drag/resize handle.
 *
 * Pass-through by default: with no override and not in edit mode, renders
 * `children` completely untouched, so every design's own flow/absolute
 * positioning for this element is exactly what it was before this existed.
 */
function PositionedElement({ c, elementKey, children }: { c: CertResolved; elementKey: ElementKey; children: ReactNode }) {
  const savedBox = c.elementLayout?.[elementKey];

  if (!savedBox && !c.editable) {
    return <>{children}</>;
  }

  const box = savedBox ?? DEFAULT_BOXES[elementKey];

  if (!c.editable) {
    // A saved override, rendered on the public/verification page — no handles.
    return (
      <div style={{ position: 'absolute', left: `${box.xPct}%`, top: `${box.yPct}%`, width: box.widthPx, height: box.heightPx }}>
        {children}
      </div>
    );
  }

  return null;
}

function Frame({ c, children, style }: { c: CertResolved; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="relative mx-auto w-full overflow-hidden print:shadow-none"
      style={{
        maxWidth: c.portrait ? 620 : 920,
        aspectRatio: c.portrait ? '1 / 1.414' : '1.414 / 1',
        background: c.bg,
        color: c.text,
        boxShadow: '0 30px 70px -30px rgba(17,17,17,0.35)',
        ...style,
      }}
    >
      {children}
      <LogoOverlay c={c} />
    </div>
  );
}

function Seal({ color, size = 76 }: { color: string; size?: number }) {
  const rays = Array.from({ length: 32 });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {rays.map((_, i) => (
        <rect key={i} x="49" y="4" width="2" height="9" rx="1" fill={color} opacity="0.9" transform={`rotate(${(360 / 32) * i} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="34" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="50" cy="50" r="28" fill="none" stroke={color} strokeWidth="1" strokeDasharray="1.5 2.5" />
      <path d="M38 51l8 8 16-19" stroke={color} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function MarkContent({ c, size = 60 }: { c: CertResolved; size?: number }) {
  return c.logoUrl ? (
    <img src={c.logoUrl} alt="" style={{ maxHeight: '100%', maxWidth: '100%', height: size * 0.7, objectFit: 'contain' }} />
  ) : (
    <Seal color={c.primary} size={size} />
  );
}

function Mark({ c, size = 60 }: { c: CertResolved; size?: number }) {
  if (!c.showLogo) return null;
  // A positioned logo renders once, centrally, via LogoOverlay below — not
  // here, since this call site is sometimes itself inside an absolutely
  // positioned wrapper (e.g. Meridian), which would break the percentage
  // math if PositionedElement nested inside it.
  if (c.elementLayout?.logo || c.editable) return null;
  return <MarkContent c={c} size={size} />;
}

/** Renders the logo at its saved/dragged position, always as a direct
 *  sibling within Frame — see the comment on Mark above for why. */
function LogoOverlay({ c }: { c: CertResolved }) {
  if (!c.showLogo) return null;
  if (!c.elementLayout?.logo && !c.editable) return null;
  return (
    <PositionedElement c={c} elementKey="logo">
      <MarkContent c={c} size={c.elementLayout?.logo?.heightPx ? c.elementLayout.logo.heightPx / 0.7 : 60} />
    </PositionedElement>
  );
}

function Skills({ c, variant = 'outline' }: { c: CertResolved; variant?: 'outline' | 'solid' }) {
  if (!c.showSkills || c.skills.length === 0) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontFamily: SANS, fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: rgba(c.text, 0.5), marginBottom: 6 }}>
        {c.skillsLabel}
      </p>
      <div className="flex flex-wrap gap-2" style={{ justifyContent: variant === 'outline' ? 'center' : 'flex-start' }}>
        {c.skills.map((s) => (
          <span
            key={s}
            style={{
              fontFamily: SANS,
              fontSize: '0.66rem',
              padding: '3px 10px',
              borderRadius: variant === 'outline' ? 999 : 6,
              border: variant === 'outline' ? `1px solid ${rgba(c.primary, 0.4)}` : 'none',
              background: variant === 'solid' ? rgba(c.primary, 0.09) : 'transparent',
              color: c.text,
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Short course/credential description, below the title line — separate
 *  from Skills (a tag list) and from an assessment's internal AI-generation
 *  context. Opt-in per template (showDescription) and per-credential (text
 *  must actually be set), so it never appears as an empty gap. */
function Description({ c, align = 'center' }: { c: CertResolved; align?: 'center' | 'left' }) {
  if (!c.showDescription || !c.certificateDescription) return null;
  return (
    <p
      style={{
        fontFamily: SANS,
        fontSize: '0.82rem',
        lineHeight: 1.55,
        color: rgba(c.text, 0.65),
        marginTop: 8,
        maxWidth: align === 'center' ? '85%' : '100%',
        textAlign: align,
      }}
    >
      {c.certificateDescription}
    </p>
  );
}

/** Just the mark — the uploaded image, or a typed/script name when there's
 *  no image. This is the ONLY part that's draggable/resizable: a creator
 *  repositioning "their signature" means this, not the printed label under
 *  it. `imgHeight` lets SignatureOverlay scale the uploaded image with the
 *  resize handles — see its own comment for why this couldn't just be a
 *  fixed 40px like it used to be. */
function SignatureMark({ c, mono = false, imgHeight = 40 }: {
  c: CertResolved; mono?: boolean; imgHeight?: number;
}) {
  // `mono` is for technical designs, where a copperplate script signature
  // reads as a costume. An uploaded signature image always wins either way.
  if (c.signatureImageUrl) {
    return <img src={c.signatureImageUrl} alt="" style={{ height: imgHeight, maxWidth: '100%', objectFit: 'contain' }} />;
  }
  if (mono) {
    return (
      <p style={{ fontFamily: MONO, fontSize: '0.98rem', fontWeight: 600, letterSpacing: '0.03em', lineHeight: 1.75, color: c.text }}>
        {c.signatureName || c.issuerName}
      </p>
    );
  }
  return (
    <p style={{ fontFamily: SCRIPT, fontSize: '1.7rem', lineHeight: 1, color: c.text }}>
      {c.signatureName || c.issuerName}
    </p>
  );
}

/** The underline + printed name/label under the mark. Always rendered in
 *  its normal-flow spot — deliberately NOT part of the position/resize
 *  system, so dragging the signature mark elsewhere doesn't drag the
 *  "Authorised signature" caption along with it, the way a real printed
 *  document's caption line doesn't move just because someone signs above
 *  it in a slightly different spot. */
function SignatureCaption({ c, align = 'center', mono = false }: {
  c: CertResolved; align?: 'center' | 'left'; mono?: boolean;
}) {
  if (!c.showSignature) return null;
  return (
    <div style={{ textAlign: align }}>
      <div style={{ width: 150, borderTop: `1px solid ${rgba(c.text, 0.3)}`, margin: align === 'center' ? '6px auto 0' : '6px 0 0' }} />
      <p style={{ fontFamily: mono ? MONO : SANS, fontSize: '0.6rem', letterSpacing: mono ? '0.16em' : '0.12em', textTransform: 'uppercase', color: rgba(c.text, 0.5), marginTop: 4 }}>
        {c.signatureName || 'Authorised signature'}
      </p>
    </div>
  );
}

/** Normal-flow mark, inline within a design's own layout — exactly as
 *  before. Once a position override exists (or the layout editor is open),
 *  defers entirely to SignatureOverlay, same as Mark defers to LogoOverlay —
 *  for the identical reason: this call site is nested inside a
 *  `position: relative` content wrapper, so a PositionedElement nested HERE
 *  would compute its percentage position against that wrapper, not the full
 *  canvas. SignatureOverlay renders as a Frame-level sibling instead, where
 *  the percentage math is correct.
 *
 *  Renders ONLY the mark — SignatureCaption is called separately at each
 *  site, unconditionally, so it never disappears or moves when the mark
 *  gets repositioned. */
function SignatureBlock({ c, align = 'center', mono = false }: {
  c: CertResolved; align?: 'center' | 'left'; mono?: boolean;
}) {
  if (!c.showSignature) return null;
  if (c.elementLayout?.signature || c.editable) return null;
  return (
    <div style={{ textAlign: align }}>
      <SignatureMark c={c} mono={mono} />
    </div>
  );
}

/** The positioned counterpart to SignatureBlock — render as a direct sibling
 *  within Frame (like IdQr), never nested inside a design's content wrapper.
 *  Mirror image of SignatureBlock's guard: only renders once positioned.
 *
 *  The resize handles on the box only ever changed the BOX — the mark used
 *  to render at a hardcoded 40px regardless, so dragging a corner larger did
 *  nothing visible. Same fix as LogoOverlay's `size` prop: derive the image
 *  height from the box's current heightPx (falling back to the default box
 *  height, which is what 40px was tuned against) so resizing actually
 *  resizes the mark. Only the mark moves here — the caption stays behind in
 *  normal flow, rendered separately by SignatureCaption. */
function SignatureOverlay({ c, mono = false }: {
  c: CertResolved; mono?: boolean;
}) {
  if (!c.showSignature) return null;
  if (!c.elementLayout?.signature && !c.editable) return null;
  const boxHeight = c.elementLayout?.signature?.heightPx ?? DEFAULT_BOXES.signature.heightPx;
  const imgHeight = boxHeight * (40 / DEFAULT_BOXES.signature.heightPx);
  return (
    <PositionedElement c={c} elementKey="signature">
      <SignatureMark c={c} mono={mono} imgHeight={imgHeight} />
    </PositionedElement>
  );
}

function DateBlock({ c, align = 'center' }: { c: CertResolved; align?: 'center' | 'left' }) {
  if (!c.showDate) return null;
  return (
    <div style={{ textAlign: align }}>
      <p style={{ fontSize: '0.9rem', color: c.text }}>{c.dateText}</p>
      <div style={{ width: 150, borderTop: `1px solid ${rgba(c.text, 0.3)}`, margin: align === 'center' ? '6px auto 0' : '6px 0 0' }} />
      <p style={{ fontFamily: SANS, fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: rgba(c.text, 0.5), marginTop: 4 }}>
        {c.expiryText || 'Date of issue'}
      </p>
    </div>
  );
}

function IdQr({ c }: { c: CertResolved }) {
  const show = c.showCertificateId || c.footer || c.qr;
  if (!show) return null;
  // A positioned QR must render as a SIBLING of this block, not nested inside
  // it — this block is itself `position: absolute`, which would become the
  // containing block for a nested absolutely-positioned child, breaking the
  // percentage math (which assumes it's relative to the full canvas/Frame).
  const qrPositioned = !!c.elementLayout?.qr || c.editable;
  return (
    <>
      <div className="absolute inset-x-[7%] bottom-[5%] flex items-end justify-between">
        <div style={{ fontFamily: SANS, fontSize: '0.6rem', letterSpacing: '0.08em', color: rgba(c.text, 0.5) }}>
          {c.showCertificateId && c.certificateId && <div>ID {c.certificateId.slice(0, 8).toUpperCase()}</div>}
          {c.footer && <div style={{ marginTop: 2 }}>{c.footer}</div>}
        </div>
        {c.qr && !qrPositioned && (
          <img src={c.qr} alt="Verification QR" style={{ height: 46, width: 46, background: '#fff', padding: 2, borderRadius: 3 }} />
        )}
      </div>
      {c.qr && qrPositioned && (
        <PositionedElement c={c} elementKey="qr">
          <img src={c.qr} alt="Verification QR" style={{ height: '100%', width: '100%', background: '#fff', padding: 2, borderRadius: 3, objectFit: 'contain' }} />
        </PositionedElement>
      )}
    </>
  );
}

/* ============================ BLANK — start from scratch ============================ */

/**
 * For a creator who doesn't want any of the five personalities below — no
 * heraldry, no grid, no branded band, just a plain centred certificate they
 * build up themselves via Colors/Content and, if they want a non-default
 * layout, the drag-and-resize position editor. Deliberately the least
 * opinionated of the six: a single hairline border, no background pattern
 * by default, no decorative divider.
 */
function Blank(c: CertResolved) {
  return (
    <Frame c={c} style={{ border: `1px solid ${rgba(c.text, 0.18)}`, borderRadius: 4 }}>
      <div className="relative flex h-full flex-col items-center justify-center px-[11%] text-center" style={{ fontFamily: SANS }}>
        {c.showLogo && <div style={{ marginBottom: 10 }}><Mark c={c} size={56} /></div>}
        {c.showIssuer && (
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: rgba(c.text, 0.7) }}>{c.issuerName}</p>
        )}
        <p style={{ marginTop: 16, fontSize: '0.72rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: c.primary, fontWeight: 500 }}>
          {c.header}
        </p>
        <p style={{ marginTop: 18, fontSize: '0.9rem', color: rgba(c.text, 0.6) }}>This certifies that</p>
        <h2 style={{ fontFamily: c.fontDisplay, fontSize: c.portrait ? '2.3rem' : '2.9rem', fontWeight: 600, lineHeight: 1.05, margin: '6px 0 4px', color: c.text }}>
          {c.holderName}
        </h2>
        <p style={{ fontSize: '0.95rem', color: rgba(c.text, 0.8), maxWidth: '78%' }}>
          has successfully completed <span style={{ fontWeight: 600 }}>{c.assessmentTitle}</span>
        </p>
        <Description c={c} />
        <Skills c={c} />
        <div className="flex items-end justify-center gap-16" style={{ marginTop: 20 }}>
          {c.showScore && (
            <div>
              <div style={{ fontSize: '1.7rem', fontWeight: 700, lineHeight: 1, color: c.primary }}>{c.score}%</div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: rgba(c.text, 0.5) }}>Score</div>
            </div>
          )}
          <DateBlock c={c} />
          <div>
            <SignatureBlock c={c} />
            <SignatureCaption c={c} />
          </div>
        </div>
      </div>
      <SignatureOverlay c={c} />
      <IdQr c={c} />
    </Frame>
  );
}

/* ============================ SOVEREIGN — formal / ceremonial ============================ */
function Sovereign(c: CertResolved) {
  return (
    <Frame c={c} style={{ border: `2px solid ${c.primary}`, borderRadius: 4 }}>
      <Pattern c={c} />
      <div className="pointer-events-none absolute inset-[10px] rounded" style={{ border: `1px solid ${rgba(c.primary, 0.4)}` }} />
      <div className="pointer-events-none absolute inset-[14px] rounded" style={{ border: `1px solid ${rgba(c.primary, 0.2)}` }} />
      <div className="relative flex h-full flex-col items-center justify-center px-[11%] text-center" style={{ fontFamily: c.fontDisplay }}>
        {c.showLogo && <div style={{ marginBottom: 6 }}><Mark c={c} size={64} /></div>}
        <p style={{ fontFamily: SANS, fontSize: '0.72rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: rgba(c.text, 0.55) }}>{c.header}</p>
        <div style={{ margin: '10px 0', width: 60, borderTop: `2px solid ${c.primary}` }} />
        <p style={{ fontSize: '0.9rem', color: rgba(c.text, 0.6) }}>This is proudly presented to</p>
        {/* fontFamily set explicitly: the global h1-h6 rule in index.css would
            otherwise override the creator's chosen display font. */}
        <h2 style={{ fontFamily: c.fontDisplay, fontSize: c.portrait ? '2.3rem' : '2.9rem', fontWeight: 600, lineHeight: 1.05, margin: '6px 0 4px', color: c.text }}>
          {c.holderName}
        </h2>
        <p style={{ fontSize: '0.95rem', color: rgba(c.text, 0.7), maxWidth: '82%' }}>
          for successfully completing <span style={{ fontWeight: 700 }}>{c.assessmentTitle}</span>
          {c.showScore ? <> with a score of <span style={{ color: c.primary, fontWeight: 700 }}>{c.score}%</span></> : null}
          {c.showIssuer ? <>, issued by {c.issuerName}</> : null}.
        </p>
        <Description c={c} />
        <Skills c={c} />
        <div className="flex items-end justify-center gap-16" style={{ marginTop: 20 }}>
          <DateBlock c={c} />
          <div>
            <SignatureBlock c={c} />
            <SignatureCaption c={c} />
          </div>
        </div>
      </div>
      <SignatureOverlay c={c} />
      <IdQr c={c} />
    </Frame>
  );
}

/* ============================ MERIDIAN — modern / minimal ============================ */
function Meridian(c: CertResolved) {
  return (
    <Frame c={c} style={{ borderRadius: 8 }}>
      <Pattern c={c} opacity={0.05} />
      <div className="absolute inset-y-0 left-0" style={{ width: 10, background: c.primary }} />
      <div className="relative flex h-full flex-col justify-center px-[11%]" style={{ fontFamily: SANS }}>
        {c.showLogo && <div className="absolute right-[8%] top-[9%]"><Mark c={c} size={42} /></div>}
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: c.primary, fontWeight: 500 }}>{c.header}</p>
        <p style={{ marginTop: 22, fontSize: '0.9rem', color: rgba(c.text, 0.55) }}>This certifies that</p>
        <h2 style={{ fontFamily: c.fontDisplay, fontSize: c.portrait ? '2.4rem' : '3.1rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1, margin: '4px 0', color: c.text }}>
          {c.holderName}
        </h2>
        <p style={{ marginTop: 12, fontSize: '1.02rem', color: rgba(c.text, 0.8), maxWidth: '82%' }}>
          has completed <span style={{ fontWeight: 600, color: c.text }}>{c.assessmentTitle}</span>
        </p>
        <Description c={c} align="left" />
        <div className="flex items-center gap-8" style={{ marginTop: 16 }}>
          {c.showScore && (
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, lineHeight: 1, color: c.primary }}>{c.score}%</div>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: rgba(c.text, 0.5) }}>Score</div>
            </div>
          )}
          {c.showDate && (
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 500 }}>{c.dateText}</div>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: rgba(c.text, 0.5) }}>{c.expiryText || 'Issued'}</div>
            </div>
          )}
          {c.showIssuer && (
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 500 }}>{c.issuerName}</div>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: rgba(c.text, 0.5) }}>Issuer</div>
            </div>
          )}
          {c.showSignature && (
            <div className="ml-auto">
              <SignatureBlock c={c} align="left" />
              <SignatureCaption c={c} align="left" />
            </div>
          )}
        </div>
        <Skills c={c} variant="solid" />
      </div>
      <SignatureOverlay c={c} />
      <IdQr c={c} />
    </Frame>
  );
}

/* ============================ REGALIA — elegant / editorial ============================ */
function Regalia(c: CertResolved) {
  return (
    <Frame c={c} style={{ borderRadius: 4 }}>
      <Pattern c={c} opacity={0.05} />
      <div className="relative flex h-full flex-col items-center justify-center px-[13%] text-center" style={{ fontFamily: c.fontDisplay }}>
        <div className="flex w-full items-center gap-4" style={{ marginBottom: 16 }}>
          <span className="h-px flex-1" style={{ background: rgba(c.text, 0.25) }} />
          {c.showLogo ? <Mark c={c} size={44} /> : <span />}
          <span className="h-px flex-1" style={{ background: rgba(c.text, 0.25) }} />
        </div>
        <p style={{ fontFamily: SANS, fontSize: '0.66rem', letterSpacing: '0.42em', textTransform: 'uppercase', color: rgba(c.text, 0.5) }}>{c.header}</p>
        <h2 style={{ fontFamily: c.fontDisplay, fontSize: c.portrait ? '1.9rem' : '2.4rem', fontWeight: 400, fontStyle: 'italic', margin: '10px 0 14px', color: c.text }}>
          {c.assessmentTitle}
        </h2>
        <Description c={c} />
        <p style={{ fontFamily: SANS, fontSize: '0.8rem', letterSpacing: '0.05em', color: rgba(c.text, 0.6), marginTop: c.showDescription && c.certificateDescription ? 12 : 0 }}>awarded to</p>
        <p style={{ fontSize: c.portrait ? '2.1rem' : '2.6rem', fontWeight: 500, margin: '2px 0', color: c.text }}>{c.holderName}</p>
        {c.showIssuer && <p style={{ fontFamily: SANS, fontSize: '0.8rem', color: rgba(c.text, 0.6) }}>conferred by {c.issuerName}</p>}
        {c.showScore && (
          <p style={{ fontFamily: SANS, marginTop: 10, fontSize: '0.85rem', color: rgba(c.text, 0.7) }}>
            Final score <span style={{ color: c.primary, fontWeight: 600 }}>{c.score}%</span>
          </p>
        )}
        <Skills c={c} />
        <div className="flex w-full items-end justify-between" style={{ marginTop: 22, paddingInline: '4%' }}>
          <DateBlock c={c} align="left" />
          <div>
            <SignatureBlock c={c} />
            <SignatureCaption c={c} />
          </div>
        </div>
      </div>
      <SignatureOverlay c={c} />
      <IdQr c={c} />
    </Frame>
  );
}

/* ============================ SUMMIT — corporate / branded ============================ */
function Summit(c: CertResolved) {
  const onBand = '#ffffff';
  return (
    <Frame c={c} style={{ borderRadius: 8 }}>
      <div className="relative flex items-center justify-between px-[8%]" style={{ height: '24%', background: c.primary }}>
        <div>
          <p style={{ fontFamily: SANS, fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: rgba(onBand, 0.75) }}>{c.header}</p>
          {c.showIssuer && (
            <p style={{ fontFamily: c.fontDisplay, fontSize: c.portrait ? '1.1rem' : '1.3rem', fontWeight: 600, color: onBand, marginTop: 2 }}>{c.issuerName}</p>
          )}
        </div>
        {/* Deferred to LogoOverlay once the logo has a saved custom position —
            same rule as Mark (see its comment above). This block used to
            render unconditionally, so a repositioned logo showed up twice:
            once here at the default spot, once again via LogoOverlay. */}
        {c.showLogo && !(c.elementLayout?.logo || c.editable) && (c.logoUrl
          ? <img src={c.logoUrl} alt="" style={{ height: 38, objectFit: 'contain' }} />
          : <Seal color={onBand} size={46} />)}
      </div>
      <div className="relative flex flex-col px-[8%]" style={{ height: '76%', justifyContent: 'center', fontFamily: SANS }}>
        <Pattern c={c} opacity={0.045} />
        <p style={{ fontSize: '0.85rem', color: rgba(c.text, 0.55) }}>This certifies that</p>
        <h2 style={{ fontFamily: c.fontDisplay, fontSize: c.portrait ? '2.1rem' : '2.7rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, margin: '4px 0 8px', color: c.text }}>
          {c.holderName}
        </h2>
        <p style={{ fontSize: '1rem', color: rgba(c.text, 0.8), maxWidth: '78%' }}>
          has successfully completed <span style={{ fontWeight: 600 }}>{c.assessmentTitle}</span>.
        </p>
        <Description c={c} align="left" />
        <Skills c={c} variant="solid" />
        <div className="flex items-end gap-12" style={{ marginTop: 16 }}>
          {c.showScore && (
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: c.primary }}>{c.score}%</div>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: rgba(c.text, 0.5) }}>Score achieved</div>
            </div>
          )}
          {c.showDate && (
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 500 }}>{c.dateText}</div>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: rgba(c.text, 0.5) }}>{c.expiryText || 'Date of issue'}</div>
            </div>
          )}
          {c.showSignature && (
            <div className="ml-auto">
              <SignatureBlock c={c} align="left" />
              <SignatureCaption c={c} align="left" />
            </div>
          )}
        </div>
      </div>
      <SignatureOverlay c={c} />
      <IdQr c={c} />
    </Frame>
  );
}

/* ============================ VECTOR — digital / technical ============================ */

/**
 * Vector's signature: a blueprint grid with brighter node dots at every major
 * intersection. This is structural, not the creator's chosen Pattern — that
 * still layers on top, so the "background texture" control keeps working here
 * exactly as it does on the other four designs.
 */
function GridField({ c }: { c: CertResolved }) {
  const id = `vec-${c.primary.replace('#', '')}`;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={`${id}-fine`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke={c.primary} strokeWidth="0.4" />
        </pattern>
        <pattern id={`${id}-node`} width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill={`url(#${id}-fine)`} />
          <circle cx="0" cy="0" r="1.7" fill={c.secondary} />
          <circle cx="64" cy="0" r="1.7" fill={c.secondary} />
          <circle cx="0" cy="64" r="1.7" fill={c.secondary} />
          <circle cx="64" cy="64" r="1.7" fill={c.secondary} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-node)`} opacity="0.14" />
    </svg>
  );
}

/**
 * Vector's fallback mark. The shared `Seal` is an engraved sunburst — right for
 * Sovereign, a costume on a technical layout — so this is a geometric node
 * marker instead. An uploaded logo still takes precedence.
 */
function TechGlyph({ color, size = 46 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <rect x="24" y="24" width="52" height="52" stroke={color} strokeWidth="3.5" transform="rotate(45 50 50)" />
      <rect x="36" y="36" width="28" height="28" stroke={color} strokeWidth="2" opacity="0.45" />
      <circle cx="50" cy="50" r="5" fill={color} />
      <path d="M50 0v9M50 91v9M0 50h9M91 50h9" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function VectorMark({ c, size = 46 }: { c: CertResolved; size?: number }) {
  if (!c.showLogo) return null;
  // Same deferral as Mark/Summit above: once the logo has a saved custom
  // position, LogoOverlay (rendered once per Frame) owns it — rendering it
  // here too duplicated it.
  if (c.elementLayout?.logo || c.editable) return null;
  return c.logoUrl ? (
    <img src={c.logoUrl} alt="" style={{ height: size * 0.75, objectFit: 'contain' }} />
  ) : (
    <TechGlyph color={c.primary} size={size} />
  );
}

/** HUD-style corner brackets — reads as a viewfinder / technical drawing. */
function Corners({ color }: { color: string }) {
  const base = { position: 'absolute' as const, width: 24, height: 24 };
  const s = `2px solid ${color}`;
  return (
    <>
      <div style={{ ...base, top: 13, left: 13, borderTop: s, borderLeft: s }} />
      <div style={{ ...base, top: 13, right: 13, borderTop: s, borderRight: s }} />
      <div style={{ ...base, bottom: 13, left: 13, borderBottom: s, borderLeft: s }} />
      <div style={{ ...base, bottom: 13, right: 13, borderBottom: s, borderRight: s }} />
    </>
  );
}

/** Score as an instrument readout rather than a number in a serif face. */
function ScoreMeter({ c }: { c: CertResolved }) {
  const pct = Math.max(0, Math.min(100, c.score));
  return (
    <div>
      <div className="flex items-baseline" style={{ gap: 2 }}>
        <span style={{ fontFamily: MONO, fontSize: '1.85rem', fontWeight: 700, lineHeight: 1, color: c.primary }}>{c.score}</span>
        <span style={{ fontFamily: MONO, fontSize: '0.8rem', fontWeight: 600, color: rgba(c.primary, 0.65) }}>%</span>
      </div>
      <div style={{ marginTop: 7, width: 104, height: 4, background: rgba(c.text, 0.12), borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${c.primary}, ${c.secondary})`, borderRadius: 2 }} />
      </div>
      <div style={{ fontFamily: MONO, fontSize: '0.56rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: rgba(c.text, 0.5), marginTop: 6 }}>
        Score
      </div>
    </div>
  );
}

function Vector(c: CertResolved) {
  const showFooter = c.showCertificateId || !!c.footer || !!c.qr;
  return (
    <Frame c={c} style={{ borderRadius: 6, border: `1px solid ${rgba(c.primary, 0.3)}` }}>
      <GridField c={c} />
      <Pattern c={c} opacity={0.04} />
      <Corners color={rgba(c.primary, 0.55)} />

      <div className="relative flex h-full flex-col" style={{ padding: `7% ${c.portrait ? '9%' : '8%'} 5.5%`, fontFamily: SANS }}>
        {/* Top rail — header, issuer, mark */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p style={{ fontFamily: MONO, fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: c.primary }}>
              {c.header}
            </p>
            {c.showIssuer && (
              <p style={{ fontFamily: c.fontDisplay, fontSize: c.portrait ? '1rem' : '1.15rem', fontWeight: 600, marginTop: 3, color: c.text }}>
                {c.issuerName}
              </p>
            )}
          </div>
          <VectorMark c={c} size={46} />
        </div>
        <div style={{ marginTop: 10, height: 1, background: `linear-gradient(90deg, ${c.primary}, ${rgba(c.primary, 0)})` }} />

        {/* Body */}
        <div className="flex flex-1 flex-col justify-center">
          <p style={{ fontFamily: MONO, fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: rgba(c.text, 0.5) }}>
            Issued to
          </p>
          <h2 style={{ fontFamily: c.fontDisplay, fontSize: c.portrait ? '2.2rem' : '2.9rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.02, margin: '5px 0 10px', color: c.text }}>
            {c.holderName}
          </h2>
          <p style={{ fontSize: '1rem', color: rgba(c.text, 0.78), maxWidth: '84%' }}>
            has completed <span style={{ fontWeight: 600, color: c.text }}>{c.assessmentTitle}</span>
          </p>
          <Description c={c} align="left" />
          <Skills c={c} variant="solid" />
        </div>

        {/* Readouts */}
        <div className="flex items-end gap-10">
          {c.showScore && <ScoreMeter c={c} />}
          {c.showDate && (
            <div>
              <div style={{ fontFamily: MONO, fontSize: '0.95rem', fontWeight: 500, color: c.text }}>{c.dateText}</div>
              <div style={{ fontFamily: MONO, fontSize: '0.56rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: rgba(c.text, 0.5), marginTop: 6 }}>
                {c.expiryText || 'Issued'}
              </div>
            </div>
          )}
          {c.showSignature && (
            <div className="ml-auto">
              <SignatureBlock c={c} align="left" mono />
              <SignatureCaption c={c} align="left" mono />
            </div>
          )}
        </div>

        {/* Footer rail — replaces the shared IdQr so it can sit inside the
            corner brackets rather than colliding with them. */}
        {showFooter && (
          <div
            className="flex items-center justify-between gap-4"
            style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${rgba(c.text, 0.14)}` }}
          >
            <div style={{ fontFamily: MONO, fontSize: '0.58rem', letterSpacing: '0.08em', color: rgba(c.text, 0.55) }}>
              {c.showCertificateId && c.certificateId && <div>ID · {c.certificateId.slice(0, 8).toUpperCase()}</div>}
              {c.footer && <div style={{ marginTop: 2 }}>{c.footer}</div>}
            </div>
            {c.qr && <img src={c.qr} alt="Verification QR" style={{ height: 44, width: 44, background: '#fff', padding: 2, borderRadius: 3 }} />}
          </div>
        )}
      </div>
      <SignatureOverlay c={c} mono />
    </Frame>
  );
}

export const CERT_DESIGNS: Record<string, { name: string; Component: (c: CertResolved) => JSX.Element }> = {
  classic: { name: 'Sovereign', Component: Sovereign },
  sovereign: { name: 'Sovereign', Component: Sovereign },
  modern: { name: 'Meridian', Component: Meridian },
  minimal: { name: 'Meridian', Component: Meridian },
  meridian: { name: 'Meridian', Component: Meridian },
  professional: { name: 'Regalia', Component: Regalia },
  elegant: { name: 'Regalia', Component: Regalia },
  regalia: { name: 'Regalia', Component: Regalia },
  corporate: { name: 'Summit', Component: Summit },
  summit: { name: 'Summit', Component: Summit },
  vector: { name: 'Vector', Component: Vector },
  blank: { name: 'Blank', Component: Blank },
};

export const DESIGN_GALLERY = [
  { style: 'sovereign', name: 'Sovereign', blurb: 'Formal, engraved, ceremonial' },
  { style: 'meridian', name: 'Meridian', blurb: 'Modern, minimal, confident' },
  { style: 'regalia', name: 'Regalia', blurb: 'Elegant, editorial, refined' },
  { style: 'summit', name: 'Summit', blurb: 'Corporate, bold, branded header' },
  { style: 'vector', name: 'Vector', blurb: 'Digital, technical, grid-built' },
  { style: 'blank', name: 'Blank', blurb: 'Start from scratch, make it yours' },
];
