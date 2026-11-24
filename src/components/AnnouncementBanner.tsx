import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { INCIDENT_EVENT } from "@/data/events";

// Site-wide announcement shown above the main nav (rendered by AudienceNav).
// To change or retire it, edit ANNOUNCEMENT below. It hides itself after `endsAt`.
const ANNOUNCEMENT = {
  id: "incident-investigations-2026-12-09",
  endsAt: INCIDENT_EVENT.endsAt,
  full: `Free live session: ${INCIDENT_EVENT.title} · ${INCIDENT_EVENT.dateShort}, 3pm UK time`,
  short: `Free live: ${INCIDENT_EVENT.dateShort}, 3pm UK`,
  detailsHref: INCIDENT_EVENT.path,
  cta: "Register free",
  ctaHref: `${INCIDENT_EVENT.path}#register`,
};

// Must match the banner's height class (h-10) so the spacer keeps page content clear of the fixed nav.
export const ANNOUNCEMENT_HEIGHT_CLASS = "h-10";

const storageKey = `announcement-dismissed:${ANNOUNCEMENT.id}`;

const isDismissed = () => {
  try {
    return sessionStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
};

export const useAnnouncementVisible = () => {
  const [dismissed, setDismissed] = useState(isDismissed);
  const expired = Date.now() >= new Date(ANNOUNCEMENT.endsAt).getTime();
  const dismiss = () => {
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* storage unavailable: dismiss for this page view only */
    }
    setDismissed(true);
  };
  return { visible: !dismissed && !expired, dismiss };
};

export const AnnouncementBanner = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className={`${ANNOUNCEMENT_HEIGHT_CLASS} bg-primary text-white`}>
    <div className="container mx-auto px-4 pr-10 h-full flex items-center justify-center gap-3 relative">
      <Link
        to={ANNOUNCEMENT.detailsHref}
        className="text-xs sm:text-sm font-medium truncate hover:underline underline-offset-2"
      >
        <span className="hidden md:inline">{ANNOUNCEMENT.full}</span>
        <span className="md:hidden">{ANNOUNCEMENT.short}</span>
      </Link>
      <Link
        to={ANNOUNCEMENT.ctaHref}
        className="shrink-0 rounded bg-white text-primary px-2.5 py-1 text-xs font-semibold whitespace-nowrap hover:bg-white/90"
      >
        <span className="hidden sm:inline">{ANNOUNCEMENT.cta} →</span>
        <span className="sm:hidden">Register →</span>
      </Link>
      <button
        onClick={onDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);
