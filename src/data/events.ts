// Upcoming live events. The page, the Events list and the site banner all read from here.
// The confirmation email (supabase/functions/capture-lead) keeps its own copy of the
// date and time for the event slug, so update both if the date ever changes.
export const INCIDENT_EVENT = {
  slug: "incident-investigations-copilot-2026-12-09",
  path: "/events/incident-investigations-copilot",
  title: "Incident Investigations with Copilot",
  startsAt: "2026-12-09T15:00:00Z", // Wed 9 Dec 2026, 3:00 PM UK time (GMT in December)
  endsAt: "2026-12-09T16:00:00Z",
  dateLabel: "Wednesday 9 December 2026",
  dateShort: "Wed 9 Dec",
  timeLabel: "3:00 PM UK time (GMT)",
  otherZones: "10:00 AM New York · 4:00 PM Berlin · 7:00 PM Dubai",
  location: "Live online · joining link sent by email",
  summary:
    "A free live session on using Microsoft 365 Copilot to run better incident investigations: from rough notes and witness statements to a clear timeline, a root-cause analysis and a report you can stand behind. Led by Lucas Domingues, founder of SafetyTech Academy.",
  agenda: [
    "Turn rough notes, witness statements and photos into a clear, dated timeline",
    "Use Copilot as a thinking partner for root-cause analysis (5 Whys, fishbone), while the investigator decides the cause",
    "Draft the investigation report and SMART corrective actions in Word, in your own company format",
    "Keep it audit-ready: checking AI output, protecting personal data and who signs off",
    "Q&A: bring an investigation you are working on (anonymised)",
  ],
  audience:
    "EHS professionals who lead or review incident investigations and have, or will soon have, Microsoft 365 Copilot. You do not need a technical background.",
};

export const eventIsOver = (endsAt: string) => Date.now() >= Date.parse(endsAt);
