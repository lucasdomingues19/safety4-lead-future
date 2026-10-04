import AudienceNav from "@/components/AudienceNav";
import { Link } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { setPageSEO } from "@/utils/seo";
import { openCookieSettings } from "@/lib/consent";

const UPDATED = "4 October 2026";
const EMAIL = "hello@safetytech.academy";

const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="mb-3 text-2xl font-semibold text-slate-900">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const Table = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <tr>{head.map((h) => <th key={h} className="px-4 py-3 align-bottom">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r, i) => (
          <tr key={i} className="align-top">
            {r.map((c, j) => <td key={j} className={`px-4 py-3 ${j === 0 ? "font-medium text-slate-900" : ""}`}>{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Mail = () => <a href={`mailto:${EMAIL}`} className="font-medium text-primary hover:text-primary/80">{EMAIL}</a>;

export default function PrivacyPolicy() {
  useEffect(() => {
    setPageSEO({
      title: "Privacy Policy | SafetyTech Academy",
      description: "How Shield360 Ltd (SafetyTech Academy) collects, uses and protects your personal data under UK and EU GDPR, who we share it with, how long we keep it and your rights.",
      canonical: "https://safetytech.academy/privacy-policy",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-12">
          <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {UPDATED}</p>

          <div className="mt-8 space-y-10 leading-relaxed text-slate-700">
            <Section id="who-we-are" title="Who we are">
              <p>
                SafetyTech Academy is a trading name of <strong>Shield360 Ltd</strong>, a company registered in England and
                Wales (company number 16266290), registered office 20 Wenlock Road, London, N1 7GU. We are the data
                controller for the personal data described in this policy and are registered with the UK Information
                Commissioner's Office (registration ZC036763).
              </p>
              <p>
                This policy covers our website (safetytech.academy), our learning platform, our live events and our
                emails. Final assessments and digital credentials are delivered through Syngraph (syngraph.ai), which is
                also operated by Shield360 Ltd.
              </p>
              <p>Questions or requests about your data: <Mail />. We don't have a formal Data Protection Officer; our founder is responsible for data protection.</p>
            </Section>

            <Section id="what-we-collect" title="What we collect, why, and our lawful basis">
              <Table
                head={["Data", "What it's used for", "Lawful basis"]}
                rows={[
                  ["Account: name, email, password (stored only as a secure hash), profile photo, job title and company if you add them", "Creating and running your account; printing your name on certificates", "Contract"],
                  ["Learning records: enrolments, lesson progress and watch time, quiz and assessment results, certificates", "Delivering courses, tracking completion, issuing and verifying certificates", "Contract"],
                  ["Payments: course, amount, date, Stripe receipt link (we never see or store your card details)", "Selling courses, receipts, refunds, accounting", "Contract; legal obligation (tax records)"],
                  ["Certificates: your name, course, completion date and certificate number, shown on a public verification page", "Letting you and employers check your certificate is genuine", "Contract; legitimate interest"],
                  ["Community and events: posts, comments, reactions, event registrations", "Running the learner community and live sessions", "Contract"],
                  ["What you type to our AI tutor or website assistant", "Answering your question", "Contract / legitimate interest"],
                  ["Enquiries and free assessments: name, email, phone, company, role and your answers", "Replying to you and preparing proposals", "Legitimate interest"],
                  ["Marketing emails: name and email", "Sending our newsletter and course news. You can unsubscribe at any time", "Consent (or, for customers, our legitimate interest in telling you about similar courses)"],
                  ["Analytics and advertising cookies", "Understanding how the site is used and measuring our ads", "Consent (see our Cookies Policy)"],
                  ["Security and error logs: IP address, browser and device details, error reports", "Keeping the service secure and fixing problems", "Legitimate interest"],
                ]}
              />
              <p>We don't sell your personal data, and we don't use it for decisions that have legal or similarly significant effects on you.</p>
            </Section>

            <Section id="who-we-share-with" title="Who we share it with">
              <p>We use trusted providers ("processors") who handle data for us under contract and only on our instructions:</p>
              <Table
                head={["Provider", "Purpose", "Where data is held"]}
                rows={[
                  ["Supabase", "Database, sign-in and file storage", "EU (Ireland) and UK (London)"],
                  ["Vercel", "Website and app hosting", "Global edge network (US company)"],
                  ["Amazon Web Services", "Lesson video storage", "EU (Stockholm)"],
                  ["Stripe", "Payments", "EU and US"],
                  ["Resend", "Account and course emails (sign-in links, receipts, certificates)", "US"],
                  ["Microsoft 365", "Our email inbox", "UK / EU"],
                  ["Anthropic", "AI tutor and website assistant (your messages are not used to train its models)", "US"],
                  ["Syngraph (Shield360 Ltd)", "Final assessments and digital credentials", "UK (London)"],
                  ["Kajabi, moving to Kit", "Newsletter and marketing emails", "US"],
                  ["Zoom", "Live webinars and roundtables, if you join one", "US"],
                  ["Google, LinkedIn, Meta, OpenAI", "Analytics and ad measurement, only if you accept these cookies", "US / EU"],
                  ["Trustpilot, YouTube, Vimeo", "Review widget and embedded videos", "EU / US"],
                ]}
              />
              <p>
                If you choose to add a certificate to LinkedIn, we send LinkedIn the certificate details you approve. We
                may also share data where the law requires it, or with professional advisers under confidentiality.
              </p>
            </Section>

            <Section id="transfers" title="International transfers">
              <p>
                Some providers are based in, or access data from, the United States. Where that happens we rely on the
                UK–US Data Bridge (for certified companies) or on the UK International Data Transfer Addendum to the EU
                Standard Contractual Clauses, which require the provider to protect your data to UK standards.
              </p>
            </Section>

            <Section id="retention" title="How long we keep your data">
              <Table
                head={["Data", "How long"]}
                rows={[
                  ["Your account, learning records and community content", "While your account is open. Deleted when you delete your account"],
                  ["Certificates", "Kept so they stay verifiable, even after you delete your account, unless you ask us to remove them"],
                  ["Payment records", "6 years, as required by UK tax law"],
                  ["Enquiries and free-assessment results", "3 years after our last contact"],
                  ["Website assistant conversations", "24 months after the last message"],
                  ["Website analytics", "26 months"],
                  ["Error reports", "90 days"],
                  ["Encrypted backups", "Up to 14 days, then overwritten"],
                ]}
              />
            </Section>

            <Section id="your-rights" title="Your rights">
              <p>Under UK and EU GDPR you can:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>get a copy of your data, and receive it in a portable format</li>
                <li>correct anything that's wrong</li>
                <li>have your data deleted</li>
                <li>restrict or object to how we use it, including for marketing</li>
                <li>withdraw consent at any time (for example, via <button type="button" onClick={openCookieSettings} className="font-medium text-primary hover:text-primary/80">Cookie settings</button> or the unsubscribe link in any email)</li>
                <li>ask for a person to review an assessment result that was scored automatically</li>
              </ul>
              <p>
                <strong>Learners can do the most common requests themselves:</strong> in the learning platform, go to
                Settings, then <em>Your data</em>, to download everything we hold about you or to delete your account. For
                anything else, email <Mail />. We'll reply within one month.
              </p>
              <p>
                If you're unhappy with how we've handled your data, please tell us first. You also have the right to
                complain to the Information Commissioner's Office:{" "}
                <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:text-primary/80">ico.org.uk/make-a-complaint</a>{" "}
                or 0303 123 1113.
              </p>
            </Section>

            <Section id="security" title="How we protect it">
              <p>
                Data is encrypted in transit, access to the database is restricted row by row so learners can only reach
                their own records, administrative access is limited to the academy's administrators, payments are handled
                entirely by Stripe, and backups are encrypted. No system is perfectly secure, but if a breach ever
                affected your data, we would tell you and the ICO where the law requires.
              </p>
            </Section>

            <Section id="cookies" title="Cookies">
              <p>
                We only use analytics and advertising cookies if you agree. See our{" "}
                <Link to="/cookies-policy" className="font-medium text-primary hover:text-primary/80">Cookies Policy</Link>{" "}
                for the full list, and change your choice at any time with{" "}
                <button type="button" onClick={openCookieSettings} className="font-medium text-primary hover:text-primary/80">Cookie settings</button>.
              </p>
            </Section>

            <Section id="children" title="Children">
              <p>Our courses are for working professionals. We don't knowingly collect data from anyone under 18.</p>
            </Section>

            <Section id="changes" title="Changes to this policy">
              <p>
                We'll update this page when our practices change and change the date at the top. If a change is
                significant, we'll let account holders know by email.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
