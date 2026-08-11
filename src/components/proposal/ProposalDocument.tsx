import {
  Award,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  Globe,
  ShieldCheck,
  Users,
  ExternalLink,
} from "lucide-react";
import logo from "@/assets/safety-academy-logo.png";
import founderPhoto from "@/assets/founder-cutout.png";
import { formatMoney, proposalTotals, SITE_URL, type Proposal } from "@/lib/proposals";

interface Props {
  proposal: Proposal;
  /** Rendered inside the admin preview dialog (slightly tighter, no live links). */
  preview?: boolean;
}

const Page = ({
  children,
  first,
}: {
  children: React.ReactNode;
  first?: boolean;
}) => (
  <section
    className={`bg-white ${first ? "" : "break-before-page mt-10 print:mt-0 border-t border-slate-200 pt-10 print:border-0 print:pt-0"}`}
  >
    {children}
  </section>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block bg-primary text-primary-foreground text-[11px] font-mono uppercase tracking-[0.25em] px-3 py-1 rounded-md">
    {children}
  </span>
);

export const ProposalDocument = ({ proposal, preview }: Props) => {
  const { subtotal, discount, total } = proposalTotals(proposal.items, proposal.discount_pct);
  const ref = (proposal.token || "DRAFT").slice(0, 8).toUpperCase();
  const issued = proposal.created_at ? new Date(proposal.created_at) : new Date();

  return (
    <div className="proposal-doc bg-white text-slate-900">
      {/* ---------------- Header ---------------- */}
      <header className="bg-background text-white">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <img src={logo} alt="SafetyTech Academy" className="h-10" />
          <div className="text-right text-xs">
            <p className="font-mono uppercase tracking-[0.25em] text-primary">
              {preview ? "Preview — not sent" : "Private proposal"}
            </p>
            <p className="text-white/70 mt-1">
              Ref {ref} · {issued.toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* ================= PAGE 1 — About the Academy & Founder ================= */}
        <Page first>
          <Eyebrow>Page 1 · About us</Eyebrow>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05]">
            Training proposal for{" "}
            <span className="text-primary">{proposal.organisation || "your organisation"}</span>
          </h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Prepared for {proposal.contact_name || "your team"}
            {proposal.contact_role ? `, ${proposal.contact_role}` : ""} — by Lucas Domingues,
            Founder, SafetyTech Academy.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">About SafetyTech Academy</h2>
          <p className="mt-2 text-slate-600 leading-relaxed">
            SafetyTech Academy is an approved training provider by IOSH, helping EHS teams lead
            safety in the digital age. Our programmes translate AI, data and digital governance
            into practical capability that safety professionals can apply the week they finish —
            not abstract theory. Every learner earns a verifiable, CPD-accredited digital
            certificate.
          </p>

          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Award,
                title: "IOSH approved",
                body: "Approved training provider by IOSH with CPD-accredited certification.",
              },
              {
                icon: ShieldCheck,
                title: "Governance-ready",
                body: "AI and digital safety governance skills mapped to real EHS decisions.",
              },
              {
                icon: Users,
                title: "Global cohort",
                body: "Learners and faculty from energy, construction, manufacturing and utilities.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 p-5">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center mb-3">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-base font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-bold text-slate-900">About the founder</h2>
          <div className="mt-3 grid sm:grid-cols-[160px_1fr] gap-5 items-start">
            <div
              className="rounded-2xl overflow-hidden aspect-square"
              style={{ backgroundColor: "#0a1530" }}
            >
              <img
                src={founderPhoto}
                alt="Lucas Domingues, MSc, CMIOSH"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Lucas Domingues</p>
              <p className="text-primary font-medium text-sm">MSc, CMIOSH — Founder</p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Lucas brings over 15 years of occupational health and safety experience across
                energy, offshore, manufacturing and construction, specialising in digital
                transformation and modern safety leadership. He has supported hundreds of safety
                professionals in moving from traditional methods to data-driven, technology-enabled
                practice — with measurable improvements in safety performance and culture.
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                He designs and leads every SafetyTech Academy programme personally, so what your
                team learns reflects current practice, current regulation and current technology.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900 mb-1">Why organisations choose us</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Recognised credentials your regulator, client and board understand.</li>
              <li>Rollout handled for you: seat allocation, progress tracking, completion reports.</li>
              <li>14-day money-back guarantee on every programme.</li>
            </ul>
          </div>
        </Page>

        {/* ================= PAGE 2 — Proposal terms & acceptance ================= */}
        <Page>
          <Eyebrow>Page 2 · Your proposal</Eyebrow>
          <h2 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight">
            Recommended programme
          </h2>

          <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wide">Prepared for</p>
              <p className="font-semibold">{proposal.contact_name || proposal.organisation}</p>
              {proposal.contact_role && <p className="text-slate-600">{proposal.contact_role}</p>}
              {proposal.contact_email && <p className="text-slate-600">{proposal.contact_email}</p>}
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wide">Organisation</p>
              <p className="font-semibold">{proposal.organisation}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wide">Valid until</p>
              <p className="font-semibold">
                {proposal.valid_until
                  ? new Date(proposal.valid_until).toLocaleDateString("en-GB")
                  : "30 days from issue"}
              </p>
            </div>
          </div>

          {proposal.intro_note && (
            <p className="mt-5 text-slate-600 leading-relaxed whitespace-pre-line">
              {proposal.intro_note}
            </p>
          )}

          <div className="mt-6 rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Programme</th>
                  <th className="text-right px-4 py-3 w-20">Seats</th>
                  <th className="text-right px-4 py-3 w-28">Per seat</th>
                  <th className="text-right px-4 py-3 w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {proposal.items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      {item.description && (
                        <p className="text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                      )}
                      {item.url && (
                        <a
                          href={
                            item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-primary font-medium text-xs hover:underline"
                        >
                          View programme page <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">{item.seats}</td>
                    <td className="px-4 py-4 text-right">
                      {item.unitPrice ? formatMoney(item.unitPrice, proposal.currency) : "On request"}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold">
                      {item.unitPrice
                        ? formatMoney(item.unitPrice * item.seats, proposal.currency)
                        : "—"}
                    </td>
                  </tr>
                ))}
                {proposal.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500 text-sm">
                      No programmes added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal, proposal.currency)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Partnership discount ({proposal.discount_pct}%)</span>
                  <span>-{formatMoney(discount, proposal.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-2">
                <span>Total investment</span>
                <span>{formatMoney(total, proposal.currency)}</span>
              </div>
              <p className="text-xs text-slate-500 pt-1">Prices exclude VAT.</p>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> What's included
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Full access to the programmes listed above for the seats stated.</li>
                <li>IOSH-approved and CPD-accredited digital certificates on completion.</li>
                <li>Progress tracking and a completion report for your organisation.</li>
                <li>Email support throughout the learning period.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Next steps
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Approve this proposal at the bottom of this page.</li>
                <li>We issue the invoice and confirm your start date.</li>
                <li>Learner access is provisioned within one working day.</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-5 text-sm">
            <p className="font-semibold text-slate-900 mb-2">Commercial terms</p>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-slate-600">
              <div>
                <dt className="font-medium text-slate-900">Validity</dt>
                <dd>
                  {proposal.valid_until
                    ? `This proposal is valid until ${new Date(proposal.valid_until).toLocaleDateString("en-GB")}.`
                    : "This proposal is valid for 30 days from the issue date."}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">Payment</dt>
                <dd>Invoiced on approval, payable within 30 days. Bank transfer or card.</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">VAT</dt>
                <dd>All prices exclude VAT, which is added where applicable.</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">Guarantee</dt>
                <dd>14-day money-back guarantee from the date access is provisioned.</dd>
              </div>
            </dl>
          </div>
        </Page>

        {/* ================= PAGE 3 — Terms and conditions ================= */}
        <Page>
          <Eyebrow>Page 3 · Terms &amp; conditions</Eyebrow>
          <h2 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight">
            Terms and conditions
          </h2>
          <div className="mt-5 space-y-4 text-sm text-slate-600 leading-relaxed">
            {[
              {
                t: "1. Agreement",
                b: "Approving this proposal — electronically via the link or in writing — forms an agreement between the client organisation named above and SafetyTech Academy for the programmes, seats and prices set out on page 2.",
              },
              {
                t: "2. Fees, invoicing and VAT",
                b: "All fees are quoted in GBP and exclude VAT, which is added where applicable. An invoice is issued on approval and is payable within 30 days of the invoice date unless otherwise agreed in writing. Access may be suspended on overdue accounts.",
              },
              {
                t: "3. Access and completion",
                b: "Learner access is provisioned within one working day of approval. Self-paced eLearning carries a 90-day completion window from the date access is granted; platform access to completed course materials continues thereafter. Cohort programmes run to the published schedule.",
              },
              {
                t: "4. Seats, substitution and transfers",
                b: "Seats are allocated to named learners. A named learner may be substituted for another employee of the client at no charge before that learner starts the programme. Seats are not transferable outside the client organisation and cannot be shared between individuals.",
              },
              {
                t: "5. Refunds and cancellation",
                b: "A 14-day money-back guarantee applies from the date access is provisioned. Requests after 14 days, or after a certificate has been issued, are not eligible for refund. Cohort places cancelled more than 14 days before the start date may be deferred to the next cohort at no charge.",
              },
              {
                t: "6. Certification",
                b: "Certificates are issued on successful completion of the required modules and assessments. SafetyTech Academy is an approved training provider by IOSH and issues CPD-accredited digital certificates with a unique, publicly verifiable certificate number.",
              },
              {
                t: "7. Intellectual property and acceptable use",
                b: "All course content, materials and assessments remain the intellectual property of SafetyTech Academy. Content may be used by enrolled learners for their own professional development only, and may not be recorded, copied, redistributed, resold or used to train any automated system.",
              },
              {
                t: "8. Data protection",
                b: "Personal data is processed in line with UK GDPR and our privacy policy. Learner progress and completion data is shared with the client organisation for the purpose of training records and compliance reporting.",
              },
              {
                t: "9. Changes to content",
                b: "Programmes are updated regularly to reflect current regulation, technology and practice. SafetyTech Academy may improve or substitute content and faculty provided that learning outcomes and certification are not diminished.",
              },
              {
                t: "10. Liability",
                b: "Training is provided for professional development purposes and does not constitute legal or regulatory advice. To the fullest extent permitted by law, SafetyTech Academy's total liability under this agreement is limited to the fees paid by the client.",
              },
              {
                t: "11. Governing law",
                b: "This agreement is governed by the laws of England and Wales and subject to the exclusive jurisdiction of its courts.",
              },
            ].map((c) => (
              <div key={c.t}>
                <p className="font-semibold text-slate-900">{c.t}</p>
                <p>{c.b}</p>
              </div>
            ))}
            <p className="text-xs text-slate-500">
              Full policies, including the privacy, cookies, refund and anti-piracy policies, are
              available at {SITE_URL.replace("https://", "")}/terms-conditions.
            </p>
          </div>
        </Page>
      </div>

      <footer className="bg-background text-white/60 text-xs print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-wrap gap-4 justify-between">
          <span>SafetyTech Academy — approved training provider by IOSH</span>
          <span className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" /> safetytech.academy
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> hello@safetyacademy.tech
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> +44 7983 819437
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default ProposalDocument;
