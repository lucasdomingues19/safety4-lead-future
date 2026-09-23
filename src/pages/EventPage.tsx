import { useEffect } from "react";
import { ArrowRight, Calendar, Clock, Monitor } from "lucide-react";
import AudienceNav from "@/components/AudienceNav";
import { Footer } from "@/components/Footer";
import { setPageSEO } from "@/utils/seo";
import { trackPageView } from "@/utils/analytics";
import eventImage from "@/assets/event-copilot-hse-card.webp";

const ZOOM_REGISTRATION_URL = "https://us06web.zoom.us/meeting/register/qqHLqHeBSvmxb0yo_u1Z8w";

const agenda = [
  "Where Copilot fits across Word, Excel, Outlook, Teams and PowerPoint for EHS work",
  "Live demo: drafting a policy, structuring incident data and summarising a safety meeting",
  "Prompt techniques that keep AI output audit-ready and source-grounded",
  "Q&A — bring your own EHS use cases",
];

const EventPage = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Copilot in HSE — Live Crash Course | SafetyTech Academy",
      description:
        "Join Lucas Domingues for a live hands-on crash course on Microsoft 365 Copilot for HSE. Wednesday 30 September 2026, 3:00 PM UK time on Zoom.",
      canonical: "https://safetytech.academy/events/copilot-hse",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-32 md:pb-20 bg-[#f7f8fc]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 max-w-6xl mx-auto items-start">
            {/* Left — title, description, CTA */}
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4 block">
                Live Crash Course · Free
              </span>
              <h1 className="mb-5 leading-[1.05] text-[#0b0b2c]">
                <span className="text-primary">Copilot</span> in HSE
              </h1>
              <p className="text-lg text-[#69697b] leading-relaxed mb-10 max-w-xl">
                A live, hands-on session on using Microsoft 365 Copilot for real EHS work — drafting
                policies, structuring incident data and summarising safety meetings. Led by Lucas
                Domingues, founder of SafetyTech Academy.
              </p>
              <a
                href={ZOOM_REGISTRATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-[22px] bg-primary text-white font-medium text-base uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
              >
                Register now
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Right — event card */}
            <div className="lg:sticky lg:top-28">
              <div className="rounded-[20px] border border-slate-200 shadow-lg overflow-hidden bg-white">
                <img
                  src={eventImage}
                  alt="Copilot in HSE — Live Crash Course with Lucas Domingues"
                  className="w-full aspect-square object-cover"
                />
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-[#0b0b2c]">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium">Wednesday 30 September 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#0b0b2c]">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium">3:00 PM UK time (BST)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#0b0b2c]">
                      <Monitor className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium">Live online · Zoom</span>
                    </div>
                  </div>
                  <a
                    href={ZOOM_REGISTRATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-[18px] bg-primary text-white font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
                  >
                    Register now
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the event */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[#0b0b2c] mb-6">About the event</h2>
            <p className="text-[#69697b] leading-relaxed mb-6">
              Your team already has Microsoft 365 Copilot. Most EHS professionals haven't been shown
              how to actually use it on safety-critical work. This live crash course closes that gap
              in one session — practical, hands-on, and specific to EHS: drafting policies in Word,
              structuring incident data in Excel, summarising safety conversations in Teams, and
              building presentations in PowerPoint.
            </p>
            <p className="text-[#69697b] leading-relaxed mb-12">
              Hosted live on Zoom by Lucas Domingues (MSc, CMIOSH), founder of SafetyTech Academy.
              Spaces are limited — register to save your seat and receive the Zoom link by email.
            </p>

            <h2 className="text-[#0b0b2c] mb-6">What you'll cover</h2>
            <ul className="space-y-4">
              {agenda.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#0b0b2c]">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventPage;
