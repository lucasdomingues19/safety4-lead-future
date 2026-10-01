// Community live events: status, time formatting and calendar links.
import { toEmbedUrl } from "@/lib/lms";

export interface CommunityEvent {
  id: string;
  space: "academy" | "global-network";
  title: string;
  description: string | null;
  image_url: string | null;
  starts_at: string;
  ends_at: string;
  join_url: string | null;
  stream_url: string | null;
  replay_url: string | null;
  live_now: boolean;
}

export type EventStatus = "live" | "upcoming" | "ended";

/** Live when an admin flipped "Go live" or the clock is inside the scheduled window. */
export const statusOf = (e: CommunityEvent, now = Date.now()): EventStatus => {
  const start = new Date(e.starts_at).getTime();
  const end = new Date(e.ends_at).getTime();
  if (e.live_now || (now >= start && now < end)) return "live";
  return now < start ? "upcoming" : "ended";
};

const tzName = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { timeZoneName: "short" }).formatToParts(d).find((p) => p.type === "timeZoneName")?.value ?? "";

/** "Tue 7 Oct, 14:00–15:00 BST" in the viewer's own timezone. */
export const formatWhen = (e: Pick<CommunityEvent, "starts_at" | "ends_at">) => {
  const s = new Date(e.starts_at);
  const en = new Date(e.ends_at);
  const day = s.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const t = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${day}, ${t(s)}–${t(en)} ${tzName(s)}`;
};

export const formatDay = (iso: string) => {
  const d = new Date(iso);
  return { dow: d.toLocaleDateString("en-GB", { weekday: "short" }), day: d.getDate(), mon: d.toLocaleDateString("en-GB", { month: "short" }) };
};

export const countdown = (iso: string, now = Date.now()) => {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return "now";
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  if (d >= 1) return `${d}d ${h}h`;
  if (h >= 1) return `${h}h ${m % 60}m`;
  return `${Math.max(1, m)}m`;
};

/** Players we can embed. Zoom cloud recordings and most other links can't be framed. */
export const embedUrl = (url: string | null): string | null => {
  if (!url || !/(youtube\.com|youtu\.be|vimeo\.com|loom\.com)/i.test(url)) return null;
  return toEmbedUrl(url);
};

const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
};
const icsEscape = (t: string) => t.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

const detailsText = (e: CommunityEvent) =>
  [e.description ?? "", e.join_url ? `Join: ${e.join_url}` : "", "SafetyTech Academy community: https://www.safetytech.academy/learn"].filter(Boolean).join("\n\n");

export const googleCalendarUrl = (e: CommunityEvent) =>
  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${icsDate(e.starts_at)}/${icsDate(e.ends_at)}&details=${encodeURIComponent(detailsText(e))}${e.join_url ? `&location=${encodeURIComponent(e.join_url)}` : ""}`;

export const icsFile = (e: CommunityEvent) =>
  [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SafetyTech Academy//Community//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:${e.id}@safetytech.academy`, `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(e.starts_at)}`, `DTEND:${icsDate(e.ends_at)}`,
    `SUMMARY:${icsEscape(e.title)}`, `DESCRIPTION:${icsEscape(detailsText(e))}`,
    ...(e.join_url ? [`LOCATION:${icsEscape(e.join_url)}`, `URL:${e.join_url}`] : []),
    "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:Starting soon", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
