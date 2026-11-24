import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, CalendarPlus, CheckCircle2, Clock, Monitor } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { MarketingConsent } from "@/components/MarketingConsent";
import { INCIDENT_EVENT as EV, eventIsOver } from "@/data/events";
import { setPageSEO } from "@/utils/seo";
import { trackEvent, trackPageView } from "@/utils/analytics";

const icsStamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const calendarFile = () =>
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SafetyTech Academy//Events//EN",
    "BEGIN:VEVENT",
    `UID:${EV.slug}@safetytech.academy`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(EV.startsAt)}`,
    `DTEND:${icsStamp(EV.endsAt)}`,
    `SUMMARY:${EV.title} (SafetyTech Academy)`,
    "DESCRIPTION:Free live session with Lucas Domingues. Your joining link will be emailed before the session.",
    `URL:https://www.safetytech.academy${EV.path}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

const googleCalendarUrl = () =>
  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(EV.title)}` +
  `&dates=${icsStamp(EV.startsAt)}/${icsStamp(EV.endsAt)}` +
  `&details=${encodeURIComponent(`Free live session with Lucas Domingues. Joining link by email. https://www.safetytech.academy${EV.path}`)}`;

const RegistrationForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please add your name and a valid email address.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          source: "event_registration",
          inquiry_type: `Event: ${EV.title} (9 Dec 2026)`,
          event: EV.slug,
          marketing_consent: consent,
        }),
      });
      if (res.status === 429) { setError("Too many tries. Please wait a minute and try again."); return; }
      if (!res.ok) throw new Error(String(res.status));
      setDone(true);
      trackEvent("event_registered", { event: EV.slug, consent });
    } catch {
      setError("Something went wrong. Please try again, or email hello@safetytech.academy.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    const ics = URL.createObjectURL(new Blob([calendarFile()], { type: "text/calendar" }));
    return (
      <div className="space-y-4" role="status">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[#0b0b2c]">You're registered, {name.trim().split(" ")[0]}.</p>
            <p className="text-sm text-[#69697b]">We've emailed your confirmation. Your joining link will follow before the session.</p>
          </div>
        </div>
        <a href={ics} download="incident-investigations-with-copilot.ics"
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-4 text-sm font-medium uppercase tracking-[0.08em] text-white hover:bg-primary/90">
          <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to calendar
        </a>
        <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="block text-center text-sm font-semibold text-primary hover:underline">
          Add to Google Calendar
        </a>
      </div>
    );
  }

  const field = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none";
  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <label className="block text-sm font-medium text-slate-700">
        Full name
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Work email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={field} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Company <span className="font-normal text-slate-400">(optional)</span>
        <input value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" className={field} />
      </label>
      <MarketingConsent id="event-consent" checked={consent} onChange={setConsent} />
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={sending}
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-[18px] text-sm font-medium uppercase tracking-[0.08em] text-white hover:bg-primary/90 disabled:opacity-60">
        {sending ? "Registering…" : "Register free"}
        {!sending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
      <p className="text-xs text-slate-400">We use your details to send the joining link and reminders for this session.</p>
    </form>
  );
};

const IncidentInvestigationsEvent = () => {
  const over = eventIsOver(EV.endsAt);

  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: `${EV.title}: free live session | SafetyTech Academy`,
      description: `Free live session with Lucas Domingues on using Microsoft 365 Copilot for incident investigations. ${EV.dateLabel}, ${EV.timeLabel}, online.`,
      canonical: `https://www.safetytech.academy${EV.path}`,
    });
    if (window.location.hash === "#register") {
      setTimeout(() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <section className="bg-[#f7f8fc] pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_420px] lg:gap-16">
            <div>
              <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {over ? "Live session · Past event" : "Free live session"}
              </span>
              <h1 className="mb-5 leading-[1.05] text-[#0b0b2c]">
                Incident Investigations with <span className="text-primary">Copilot</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-[#69697b]">{EV.summary}</p>

              <h2 className="mb-5 mt-12 text-2xl text-[#0b0b2c]">What you'll cover</h2>
              <ul className="space-y-4">
                {EV.agenda.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#0b0b2c]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="mb-4 mt-12 text-2xl text-[#0b0b2c]">Who it's for</h2>
              <p className="max-w-xl leading-relaxed text-[#69697b]">{EV.audience}</p>
            </div>

            <div id="register" className="scroll-mt-28 lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-lg">
                <div className="p-6">
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-[#0b0b2c]">
                      <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="font-medium">{EV.dateLabel}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[#0b0b2c]">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        <span className="font-medium">{EV.timeLabel}</span>
                        <span className="block text-xs text-[#69697b]">{EV.otherZones}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#0b0b2c]">
                      <Monitor className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="font-medium">{EV.location}</span>
                    </div>
                  </div>
                  {over ? (
                    <div className="space-y-3">
                      <span className="inline-flex w-full items-center justify-center rounded bg-slate-100 px-6 py-[18px] text-sm font-medium uppercase tracking-[0.08em] text-[#69697b]">
                        This event has passed
                      </span>
                      <Link to="/events" className="block text-center text-sm font-semibold text-primary hover:underline">See upcoming events</Link>
                    </div>
                  ) : (
                    <RegistrationForm />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-white">Training a whole EHS team on Copilot?</h2>
            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/80">
              Copilot for EHS Professionals is group training built around your team's real work, aligned to the EU AI Act AI-literacy duty.
            </p>
            <Link to="/copilot-for-ehs"
              className="inline-flex items-center gap-2 rounded bg-white px-8 py-[22px] text-base font-medium uppercase tracking-[0.08em] text-primary transition-colors hover:bg-white/90">
              See the team training <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IncidentInvestigationsEvent;
