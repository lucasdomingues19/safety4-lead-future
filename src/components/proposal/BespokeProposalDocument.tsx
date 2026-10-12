import React from "react";
import logo from "@/assets/brand-logo.png";

interface ProposalSection {
  id: string;
  title: string;
  type: "text" | "table" | "list" | "roi_table" | "pricing_table";
  content: Record<string, any>;
  order: number;
}

interface BespokeProposalDocumentProps {
  organisation: string;
  contact_name?: string;
  contact_role?: string;
  intro_note?: string;
  sections: ProposalSection[];
  valid_until?: string;
  token: string;
  created_at: string;
  title?: string;
}

const isCurriculum = (s: ProposalSection) =>
  s.type === "list" && /module|curriculum|programme|program/i.test(s.title);

const firstNumber = (text: string) => {
  const m = text.match(/\d[\d,]*/);
  return m ? Number(m[0].replace(/,/g, "")) : null;
};

const money = (n: number) => `£${n.toLocaleString("en-GB")}`;

export const BespokeProposalDocument: React.FC<BespokeProposalDocumentProps> = ({
  organisation,
  contact_name,
  contact_role,
  intro_note,
  sections,
  valid_until,
  created_at,
  title = "AI & Safety Technology Training",
}) => {
  const issued = new Date(created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const validUntil = valid_until
    ? new Date(valid_until).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const ordered = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-4xl bg-white text-[#0b0b2c]">
      {/* Cover */}
      <header className="px-8 pt-12 pb-10 md:px-14">
        <img src={logo} alt="SafetyTech Academy" className="h-10 w-auto" />
        <p className="mt-14 text-xs font-bold uppercase tracking-[0.2em] text-[#3434ff]">Proposal</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">{title}</h1>
        <div className="mt-8 grid gap-8 border-t border-slate-200 pt-6 text-sm md:grid-cols-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Prepared for</p>
            <p className="mt-1 text-lg font-bold">{organisation}</p>
            {contact_name && <p className="text-slate-600">{contact_name}</p>}
            {contact_role && <p className="text-slate-500">{contact_role}</p>}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Prepared by</p>
            <p className="mt-1 font-bold">Lucas Domingues</p>
            <p className="text-slate-600">Founder, SafetyTech Academy</p>
            <p className="text-slate-600">hello@safetytech.academy</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Dates</p>
            <p className="mt-1">Issued {issued}</p>
            {validUntil && <p className="text-slate-600">Valid until {validUntil}</p>}
          </div>
        </div>
      </header>

      <div className="h-1.5 bg-gradient-to-r from-[#3434ff] via-[#2c23d2] to-[#9eff1f]" />

      <div className="space-y-12 px-8 py-12 md:px-14">
        {intro_note && (
          <section className="rounded-2xl bg-[#f5f7ff] p-6 text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap">
            {intro_note}
          </section>
        )}

        {ordered.map((section, index) => (
          <section key={section.id} className="scroll-mt-8">
            <div className="mb-5 flex items-baseline gap-3">
              <span className="text-xs font-bold tabular-nums text-[#3434ff]">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="text-2xl font-bold">{section.title}</h2>
            </div>

            {section.type === "text" && (
              <p className="whitespace-pre-wrap border-l-4 border-[#3434ff] pl-5 text-[15px] leading-relaxed text-slate-700">
                {section.content.body}
              </p>
            )}

            {isCurriculum(section) && (
              <ol className="grid gap-3 md:grid-cols-2">
                {(section.content.items ?? []).map((item: string, i: number) => (
                  <li key={i} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3434ff] text-sm font-extrabold text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="pt-1 text-[15px] font-semibold leading-snug">{item}</span>
                  </li>
                ))}
              </ol>
            )}

            {section.type === "list" && !isCurriculum(section) && (
              <ul className="space-y-3">
                {(section.content.items ?? []).map((item: string, i: number) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#9eff1f] ring-1 ring-[#3434ff]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.type === "table" && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#0b0b2c] text-left text-white">
                    <tr>
                      {section.content.headers?.map((h: string, i: number) => (
                        <th key={i} className="px-4 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.content.rows?.map((row: string[], ri: number) => (
                      <tr key={ri} className="border-t border-slate-200">
                        {row.map((cell: string, ci: number) => (
                          <td key={ci} className="px-4 py-3">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section.type === "pricing_table" && (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-[15px]">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Enrolment</th>
                      <th className="px-5 py-3 text-right font-semibold">Price per seat</th>
                      <th className="px-5 py-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(section.content.tiers ?? []).map((tier: any, i: number) => {
                      const seats = firstNumber(String(tier.seats ?? ""));
                      return (
                        <tr key={i} className="border-t border-slate-200">
                          <td className="px-5 py-4">{tier.seats}</td>
                          <td className="px-5 py-4 text-right font-semibold">{money(Number(tier.price))}</td>
                          <td className="px-5 py-4 text-right font-extrabold text-[#3434ff]">
                            {seats ? money(seats * Number(tier.price)) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        <footer className="border-t border-slate-200 pt-8 text-sm text-slate-600">
          <p className="font-bold text-[#0b0b2c]">Lucas Domingues</p>
          <p>MSc, CMIOSH · Founder, SafetyTech Academy</p>
          <p className="mt-4 text-xs text-slate-500">
            Commercial in confidence. Prices are in pounds sterling. Any VAT is shown in the total line.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default BespokeProposalDocument;
