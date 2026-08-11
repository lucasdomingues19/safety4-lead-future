// Shared catalogue + types for client proposals.

export const SITE_URL = "https://safetytech.academy";

export interface ProposalItem {
  id: string;
  name: string;
  description: string;
  seats: number;
  unitPrice: number; // in whole currency units
  /** Path or absolute URL of the programme page on the website. */
  url?: string;
}

export interface Proposal {
  id: string;
  token: string;
  organisation: string;
  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  intro_note: string | null;
  items: ProposalItem[];
  discount_pct: number;
  currency: string;
  valid_until: string | null;
  status: string;
  approver_name: string | null;
  approver_note: string | null;
  responded_at: string | null;
  view_count: number;
  created_at: string;
}

export const COURSE_CATALOGUE: Omit<ProposalItem, "id" | "seats">[] = [
  {
    name: "AI Fundamentals in EHS",
    description:
      "90-minute eLearning primer: digital literacy, AI in EHS, risks and governance basics.",
    unitPrice: 97,
    url: "/ai-fundamentals",
  },
  {
    name: "IOSH-approved Safety 4.0 — Leading Safety in the Digital Age",
    description:
      "Self-paced eLearning: 10 modules, 60+ video lessons, assessments, IOSH & CPD certification, 90-day completion window.",
    unitPrice: 497,
    url: "/elearning",
  },
  {
    name: "Safety 4.0 Accelerator Cohort",
    description:
      "Live 6-week cohort with global faculty, group projects, live Q&A, priority support and community access — includes the eLearning.",
    unitPrice: 1997,
    url: "/accelerator",
  },
  {
    name: "In-Company Programme (bespoke)",
    description:
      "Tailored delivery for your teams: bespoke case studies, dedicated cohort scheduling and organisational reporting.",
    unitPrice: 0,
    url: "/contact",
  },
];


export const formatMoney = (amount: number, currency = "GBP") => {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `£${amount.toLocaleString("en-GB")}`;
  }
};

export const proposalTotals = (
  items: ProposalItem[],
  discountPct: number,
) => {
  const subtotal = items.reduce(
    (sum, i) => sum + (Number(i.unitPrice) || 0) * (Number(i.seats) || 0),
    0,
  );
  const discount = Math.round((subtotal * (Number(discountPct) || 0)) / 100);
  return { subtotal, discount, total: subtotal - discount };
};

export const asProposal = (row: Record<string, unknown>): Proposal => ({
  ...(row as unknown as Proposal),
  items: Array.isArray(row.items) ? (row.items as ProposalItem[]) : [],
  discount_pct: Number(row.discount_pct ?? 0),
});
