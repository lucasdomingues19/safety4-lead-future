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
  },
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const ics = (slug: string, ev: LiveEvent) =>
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
    "DESCRIPTION:Live session with Lucas Domingues. Your joining link will be emailed before the session.",
    `URL:${ev.url}`,
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

  const html = `<!doctype html><html><body style="margin:0;background:#f7f8fc;font-family:Arial,Helvetica,sans-serif;color:#0b0b2c">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e5e7f0">
<p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#3434FF;font-weight:bold">You're booked</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25">${esc(ev.title)}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4E4E65">Hi ${first}, thanks for booking your place on this live session with Lucas Domingues. Your payment receipt comes separately from Stripe.</p>
<p style="margin:0 0 4px;font-size:15px;line-height:1.6"><strong>When:</strong> ${esc(ev.when)}</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6"><strong>Where:</strong> live online. We'll email your joining link before the session.</p>
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
    attachments: [{ filename: "invite.ics", content: btoa(ics(slug, ev)), content_type: "text/calendar" }],
  });
  return res.ok ? null : `resend ${res.status}`;
}
