import { Link } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { setPageSEO } from "@/utils/seo";
import { openCookieSettings } from "@/lib/consent";

const UPDATED = "4 October 2026";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section>
    <h2 className="mb-3 text-2xl font-semibold text-slate-900">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const CookieTable = ({ rows }: { rows: [string, string, string, string][] }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Purpose</th><th className="px-4 py-3">Lasts</th></tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map(([name, provider, purpose, lasts]) => (
          <tr key={name} className="align-top">
            <td className="px-4 py-3 font-mono text-xs text-slate-900">{name}</td>
            <td className="px-4 py-3">{provider}</td>
            <td className="px-4 py-3">{purpose}</td>
            <td className="px-4 py-3 whitespace-nowrap">{lasts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function CookiesPolicy() {
  useEffect(() => {
    setPageSEO({
      title: "Cookies Policy | SafetyTech Academy",
      description: "The cookies and similar technologies SafetyTech Academy uses, why, how long they last, and how to change your choice at any time.",
      canonical: "https://safetytech.academy/cookies-policy",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-12">
          <h1 className="text-4xl font-bold text-slate-900">Cookies Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {UPDATED}</p>

          <div className="mt-8 space-y-10 leading-relaxed text-slate-700">
            <Section title="The short version">
              <p>
                Cookies are small files a website stores in your browser; "local storage" works in a similar way. We use
                the ones needed to run the site, and we only use analytics and advertising cookies if you say yes in our
                cookie banner. Inside the learning platform we use no analytics or advertising trackers at all.
              </p>
              <p>
                <button type="button" onClick={openCookieSettings} className="rounded-lg bg-[#3434ff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2c23d2]">
                  Change my cookie settings
                </button>
              </p>
              <p>
                This policy is part of our <Link to="/privacy-policy" className="font-medium text-primary hover:text-primary/80">Privacy Policy</Link>.
                SafetyTech Academy is a trading name of Shield360 Ltd.
              </p>
            </Section>

            <Section title="Essential (always on)">
              <p>Needed for sign-in, security and remembering your cookie choice. These can't be switched off. Payments happen on Stripe's own secure page, which has its own cookie policy.</p>
              <CookieTable rows={[
                ["sb-…-auth-token", "SafetyTech Academy (Supabase)", "Keeps you signed in to the learning platform (local storage)", "Until you sign out"],
                ["stc-consent-v1", "SafetyTech Academy", "Remembers your cookie choice (local storage)", "Until you change it"],
                ["_vcrcs", "Vercel", "Security check that protects the site from automated attacks", "Up to 1 hour"],
              ]} />
            </Section>

            <Section title="Analytics (only with your consent)">
              <p>Help us understand which pages are useful. Turned on only if you choose Accept all, or Analytics in Customise.</p>
              <CookieTable rows={[
                ["_ga, _ga_*", "Google Analytics (via Google Tag Manager)", "Counts visits and how the site is used", "2 years"],
                ["analytics_session_id", "SafetyTech Academy", "Groups page views in one visit for our own statistics (session storage)", "Until you close the tab"],
              ]} />
            </Section>

            <Section title="Marketing (only with your consent)">
              <p>Measure whether our adverts work and show relevant ads on other sites. Turned on only if you choose Accept all, or Marketing in Customise.</p>
              <CookieTable rows={[
                ["li_sugr, bcookie, lidc, UserMatchHistory, AnalyticsSyncHistory", "LinkedIn Insight Tag", "Ad measurement and retargeting on LinkedIn", "Up to 1 year"],
                ["_fbp", "Meta Pixel", "Ad measurement and retargeting on Facebook and Instagram", "3 months"],
                ["_gcl_*", "Google Ads (via Google Tag Manager)", "Ad conversion measurement, when a Google Ads campaign is running", "3 months"],
                ["oaiq identifiers", "OpenAI conversion pixel", "Measures sign-ups and purchases from our ads", "Up to 1 year"],
              ]} />
            </Section>

            <Section title="Embedded content">
              <ul className="list-disc space-y-1 pl-5">
                <li><strong>YouTube</strong> videos use YouTube's privacy-enhanced mode: nothing is stored until you press play, after which YouTube may set its own cookies.</li>
                <li><strong>Vimeo</strong> lesson videos may set a cookie needed for playback.</li>
                <li><strong>Trustpilot</strong> loads our reviews widget from Trustpilot's servers.</li>
              </ul>
            </Section>

            <Section title="Changing your mind">
              <p>
                Use <button type="button" onClick={openCookieSettings} className="font-medium text-primary hover:text-primary/80">Cookie settings</button>{" "}
                (also in the footer of every page) to change your choice at any time. If you switch something off, we
                reload the page so it stops straight away. You can also delete cookies in your browser settings.
              </p>
              <p>Questions: <a href="mailto:hello@safetytech.academy" className="font-medium text-primary hover:text-primary/80">hello@safetytech.academy</a>.</p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
