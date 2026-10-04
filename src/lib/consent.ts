// Cookie consent (UK GDPR / PECR). The loader in index.html reads the same
// localStorage key on page load and starts only the trackers the visitor has
// agreed to; this module records new choices and hands them to it.

export const CONSENT_KEY = "stc-consent-v1";
export const OPEN_COOKIE_SETTINGS = "open-cookie-settings";
export const CONSENT_SAVED = "cookie-consent-saved";

export interface Consent {
  v: 1;
  analytics: boolean;
  marketing: boolean;
  /** ISO time the choice was made — kept as the record of consent. */
  ts: string;
}

declare global {
  interface Window {
    __consent?: Consent | null;
    __applyConsent?: (c: Consent | null) => void;
  }
}

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  if (window.__consent !== undefined) return window.__consent ?? null;
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveConsent(choice: { analytics: boolean; marketing: boolean }) {
  const prev = readConsent();
  const next: Consent = { v: 1, analytics: choice.analytics, marketing: choice.marketing, ts: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  } catch {
    /* private mode: choice lasts for this page only */
  }
  window.__consent = next;
  // Trackers already running can't be unloaded, so withdrawing consent for
  // something that was on needs a fresh page.
  const withdrew = !!prev && ((prev.analytics && !next.analytics) || (prev.marketing && !next.marketing));
  if (withdrew) {
    window.location.reload();
    return;
  }
  window.__applyConsent?.(next);
  window.dispatchEvent(new Event(CONSENT_SAVED));
}

export const hasAnalyticsConsent = () => !!readConsent()?.analytics;

export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS));
