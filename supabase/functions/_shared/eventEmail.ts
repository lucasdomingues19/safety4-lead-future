// Paid live events: the details checkout charges for, and the booking confirmation
// (with a calendar invite) sent once Stripe confirms payment. Only slugs listed here
// can be bought or emailed. Keep the dates and price in step with src/data/events.ts.
import { htmlToText, resendSend } from "./emailText.ts";

export interface LiveEvent {
  title: string;
  priceCents: number;
  currency: string;
  startsAt: string;
  endsAt: string;
  when: string;
  short: string;
  url: string;
  /** Teams details live in secrets EVENT_JOIN_<joinKey>_URL / _ID / _PASSCODE (the repo is public). */
  joinKey: string;
}

export const EVENTS: Record<string, LiveEvent> = {
  "incident-investigations-copilot-2026-12-09": {
    title: "Incident Investigations with Copilot",
    priceCents: 5900,
    currency: "gbp",
    startsAt: "2026-12-09T15:00:00Z",
    endsAt: "2026-12-09T16:00:00Z",
    when: "Wednesday 9 December 2026, 3:00 PM UK time (GMT)",
    short: "Wed 9 Dec, 3pm UK",
    url: "https://www.safetytech.academy/events/incident-investigations-copilot",
    joinKey: "INCIDENT_INVESTIGATIONS",
  },
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");

interface Join { url: string; id: string; passcode: string }
const joinOf = (ev: LiveEvent): Join | null => {
  const url = Deno.env.get(`EVENT_JOIN_${ev.joinKey}_URL`) ?? "";
  if (!/^https:\/\/teams\.microsoft\.com\//.test(url)) return null;
  return { url, id: Deno.env.get(`EVENT_JOIN_${ev.joinKey}_ID`) ?? "", passcode: Deno.env.get(`EVENT_JOIN_${ev.joinKey}_PASSCODE`) ?? "" };
};
// iCalendar text values escape backslash, semicolon, comma and newlines.
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

const ics = (slug: string, ev: LiveEvent, join: Join | null) =>
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SafetyTech Academy//Events//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${slug}@safetytech.academy`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(ev.startsAt)}`,
    `DTEND:${stamp(ev.endsAt)}`,
    `SUMMARY:${ev.title} (SafetyTech Academy)`,
    `DESCRIPTION:${icsText(join
      ? `Live session with Lucas Domingues on Microsoft Teams.\nJoin: ${join.url}\nMeeting ID: ${join.id}\nPasscode: ${join.passcode}`
      : "Live session with Lucas Domingues on Microsoft Teams. Your joining link will be emailed before the session.")}`,
    `LOCATION:${icsText(join ? `Microsoft Teams: ${join.url}` : "Microsoft Teams")}`,
    `URL:${join?.url ?? ev.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

/** Returns null when sent, or a short reason when not. Never throws. */
export async function sendEventConfirmation(slug: string, to: string, name: string): Promise<string | null> {
  const ev = EVENTS[slug];
  if (!ev) return "unknown event";
  if (Date.now() > Date.parse(ev.endsAt)) return "event is over";
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "RESEND_API_KEY missing";
  const first = esc(name.trim().split(/\s+/)[0] || "there");
  const join = joinOf(ev);
  const where = join
    ? `<p style="margin:0 0 4px;font-size:15px;line-height:1.6"><strong>Where:</strong> live on Microsoft Teams</p>
<div style="margin:16px 0 20px;padding:16px;border-radius:10px;background:#F5F7FF">
<a href="${esc(join.url)}" style="display:inline-block;background:#3434FF;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:14px;font-weight:bold">Join the session on Teams</a>
<p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#4E4E65">Meeting ID: <strong>${esc(join.id)}</strong><br>Passcode: <strong>${esc(join.passcode)}</strong></p>
<p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#69697B">This link is for you. Please don't share it.</p>
</div>`
    : `<p style="margin:0 0 16px;font-size:15px;line-height:1.6"><strong>Where:</strong> live on Microsoft Teams. We'll email your joining link before the session.</p>`;

  const html = `<!doctype html><html><body style="margin:0;background:#f7f8fc;font-family:Arial,Helvetica,sans-serif;color:#0b0b2c">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e5e7f0">
<p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#3434FF;font-weight:bold">You're booked</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25">${esc(ev.title)}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4E4E65">Hi ${first}, thanks for booking your place on this live session with Lucas Domingues. Your payment receipt comes separately from Stripe.</p>
<p style="margin:0 0 4px;font-size:15px;line-height:1.6"><strong>When:</strong> ${esc(ev.when)}</p>
${where}
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4E4E65">A calendar invite is attached so the time is in your diary. If you're working on an investigation, bring it along (anonymised) for the Q&amp;A.</p>
<a href="${ev.url}" style="display:inline-block;background:#3434FF;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:6px;font-size:14px;font-weight:bold">See the session details</a>
</div>
<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#69697B;text-align:center">SafetyTech Academy · 20 Wenlock Rd, London N1 7GU<br>You're getting this email because you booked this session. Reply if you have any questions.</p>
</div></body></html>`;

  const res = await resendSend(key, {
    from: "SafetyTech Academy <hello@safetytech.academy>",
    reply_to: "hello@safetytech.academy",
    to: [to],
    bcc: ["lucas@safetytech.academy"],
    subject: `You're booked: ${ev.title} (${ev.short})`,
    html,
    text: htmlToText(html),
    attachments: [{ filename: "invite.ics", content: btoa(ics(slug, ev, join)), content_type: "text/calendar" }],
  });
  return res.ok ? null : `resend ${res.status}`;
}

/** Morning-of reminder with the joining details. Returns null when sent, or a short reason. */
export async function sendEventReminder(slug: string, to: string, name: string): Promise<string | null> {
  const ev = EVENTS[slug];
  if (!ev) return "unknown event";
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "RESEND_API_KEY missing";
  const join = joinOf(ev);
  if (!join) return "no joining link configured";
  const first = esc(name.trim().split(/\s+/)[0] || "there");
  const html = `<!doctype html><html><body style="margin:0;background:#f7f8fc;font-family:Arial,Helvetica,sans-serif;color:#0b0b2c">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e5e7f0">
<p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#3434FF;font-weight:bold">Today at 3pm UK time</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25">${esc(ev.title)}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4E4E65">Hi ${first}, see you this afternoon. The session starts at <strong>3:00 PM UK time</strong> (10:00 AM New York, 4:00 PM Berlin, 7:00 PM Dubai) on Microsoft Teams.</p>
<div style="margin:16px 0 20px;padding:16px;border-radius:10px;background:#F5F7FF">
<a href="${esc(join.url)}" style="display:inline-block;background:#3434FF;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:14px;font-weight:bold">Join the session on Teams</a>
<p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#4E4E65">Meeting ID: <strong>${esc(join.id)}</strong><br>Passcode: <strong>${esc(join.passcode)}</strong></p>
</div>
<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#4E4E65"><strong>To get the most from it:</strong></p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.6;color:#4E4E65">
<li>Join from a laptop with Microsoft 365 Copilot if you have it, so you can follow along.</li>
<li>Bring an investigation you're working on (anonymised) for the Q&amp;A.</li>
<li>Join a few minutes early to check your audio.</li>
</ul>
</div>
<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#69697B;text-align:center">SafetyTech Academy · 20 Wenlock Rd, London N1 7GU<br>You're getting this email because you booked this session.</p>
</div></body></html>`;
  const res = await resendSend(key, {
    from: "SafetyTech Academy <hello@safetytech.academy>",
    reply_to: "hello@safetytech.academy",
    to: [to],
    subject: `Today at 3pm UK: ${ev.title} (your Teams link)`,
    html,
    text: htmlToText(html),
  });
  return res.ok ? null : `resend ${res.status}`;
}
