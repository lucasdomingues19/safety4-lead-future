import React from "react";

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
  intro_note?: string;
  sections: ProposalSection[];
  valid_until?: string;
  token: string;
  created_at: string;
}

export const BespokeProposalDocument: React.FC<BespokeProposalDocumentProps> = ({
  organisation,
  contact_name,
  intro_note,
  sections,
  valid_until,
  token,
  created_at,
}) => {
  const issuedDate = new Date(created_at).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const validUntilDate = valid_until
    ? new Date(
        Date.now() + parseInt(valid_until) * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-slate-900">
      {/* Header */}
      <div className="mb-12 pb-8 border-b">
        <h1 className="text-3xl font-bold mb-2">Proposal</h1>
        <h2 className="text-xl text-slate-600 mb-8">
          AI & Safety Technology Training for EHS & Sustainability Professionals
        </h2>

        <div className="grid md:grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-slate-500 mb-1">PREPARED FOR</p>
            <p className="font-semibold text-lg">{organisation}</p>
            {contact_name && <p className="text-slate-600">{contact_name}</p>}
          </div>
          <div>
            <p className="text-slate-500 mb-1">PREPARED BY</p>
            <p className="font-semibold">Lucas Domingues</p>
            <p className="text-slate-600">Founder, SafetyTech Academy</p>
            <p className="text-slate-600">lucas@safetytech.academy</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t text-xs text-slate-500">
          <p>Issued on {issuedDate}</p>
          {validUntilDate && <p>Valid until {validUntilDate}</p>}
          <p>Commercial in confidence</p>
        </div>
      </div>

      {/* Intro Note */}
      {intro_note && (
        <div className="mb-12 pb-8 border-b">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {intro_note}
          </p>
        </div>
      )}

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.id} className="mb-10 pb-8 border-b last:border-b-0">
          <h3 className="text-2xl font-bold mb-6">{section.title}</h3>

          {/* Text Section */}
          {section.type === "text" && (
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {section.content.body}
            </div>
          )}

          {/* Table Section */}
          {section.type === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    {section.content.headers?.map((header: string, i: number) => (
                      <th
                        key={i}
                        className="text-left py-3 px-4 font-semibold bg-slate-50"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.content.rows?.map((row: string[], ri: number) => (
                    <tr key={ri} className="border-b border-slate-200">
                      {row.map((cell: string, ci: number) => (
                        <td key={ci} className="py-3 px-4">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pricing Table */}
          {section.type === "pricing_table" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="text-left py-3 px-4 font-semibold bg-slate-50">
                      Enrolment
                    </th>
                    <th className="text-left py-3 px-4 font-semibold bg-slate-50">
                      Price per Seat
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {section.content.tiers?.map(
                    (tier: any, i: number) => (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="py-3 px-4">{tier.seats}</td>
                        <td className="py-3 px-4 font-semibold">
                          ${tier.price.toLocaleString()}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ROI Table */}
          {section.type === "roi_table" && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded">
                  <p className="text-slate-500 text-sm">Participants trained</p>
                  <p className="text-2xl font-bold">
                    {section.content.data?.participants}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded">
                  <p className="text-slate-500 text-sm">Time saved per week</p>
                  <p className="text-2xl font-bold">
                    {section.content.data?.timePerWeek} hour
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded">
                  <p className="text-slate-500 text-sm">
                    Hourly rate (loaded cost)
                  </p>
                  <p className="text-2xl font-bold">
                    ${section.content.data?.hourlyRate}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded">
                  <p className="text-slate-500 text-sm">Annual savings</p>
                  <p className="text-2xl font-bold">
                    $
                    {(
                      section.content.data?.participants *
                      section.content.data?.timePerWeek *
                      section.content.data?.hourlyRate *
                      52
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* List Section */}
          {section.type === "list" && (
            <ul className="space-y-2">
              {section.content.items?.map((item: string, i: number) => (
                <li key={i} className="flex gap-3 text-slate-700">
                  <span className="text-primary font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t text-sm text-slate-600">
        <p>
          To proceed or discuss any element of this proposal, contact Lucas
          Domingues
        </p>
        <p className="mt-2">
          lucas@safetytech.academy · safetytech.academy
        </p>
        <p className="mt-4 text-xs text-slate-500">
          This proposal is valid for {valid_until} days. Please confirm
          acceptance via email.
        </p>
      </div>
    </div>
  );
};

export default BespokeProposalDocument;
