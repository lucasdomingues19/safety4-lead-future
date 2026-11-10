/**
 * Single source of truth for the facts search engines and AI assistants read
 * about SafetyTech Academy: who we are, what we sell, what it costs.
 *
 * Used by:
 *  - scripts/prerender-routes.ts — JSON-LD baked into each page's static HTML
 *  - scripts/ai-search.ts       — /llms.txt and /llms-full.txt
 *  - src/components/SEOStructuredData.tsx — client-side fallback
 *
 * Every value here must match what the live pages say. Never add ratings,
 * review counts, phone numbers or claims that aren't real and on the site:
 * Google treats invented structured data as spam, and AI assistants repeat it.
 */

export const SITE = "https://www.safetytech.academy";

export const organization = {
  name: "SafetyTech Academy",
  /** Former brand name — lets search and AI connect old mentions to us. */
  alternateNames: ["Safety 4.0 Academy"],
  legalName: "Shield360 Ltd",
  companyNumber: "16266290",
  url: SITE,
  logo: `${SITE}/safety-academy-logo.png`,
  email: "hello@safetytech.academy",
  description:
    "SafetyTech Academy is the world's first IOSH-approved and CPD-accredited training provider for Safety 4.0: teaching EHS (environment, health and safety) professionals to use AI, data, IoT and digital tools to lead workplace safety.",
  address: {
    streetAddress: "20 Wenlock Road",
    addressLocality: "London",
    postalCode: "N1 7GU",
    addressCountry: "GB",
  },
  founder: {
    name: "Lucas Domingues",
    jobTitle: "Founder, SafetyTech Academy",
    honorificSuffix: "MSc, CMIOSH",
  },
  sameAs: ["https://www.linkedin.com/company/safety-40-academy"],
  accreditations: [
    "Institution of Occupational Safety and Health (IOSH)",
    "CPD Certification Service",
  ],
  knowsAbout: [
    "Safety 4.0",
    "AI in health and safety",
    "AI risk assessment",
    "Microsoft Copilot for EHS",
    "EU AI Act AI literacy (Article 4)",
    "SafetyTech",
    "IoT and wearables for workplace safety",
    "Predictive safety analytics",
    "Digital safety leadership",
  ],
};

export interface CourseFact {
  id: string;
  path: string;
  name: string;
  description: string;
  /** Who it is for, in one line. */
  audience: string;
  format: string;
  courseMode: "online" | "blended" | "onsite";
  /** ISO 8601 total study time, when the page states one. */
  workload?: string;
  /** Weekly live sessions (cohorts). */
  schedule?: { sessionDuration: string; frequency: "Weekly"; count: number };
  level: string;
  /** Price in GBP, excluding VAT. Omitted when only quoted on request. */
  priceGBP?: number;
  vatExtra?: boolean;
  priceNote: string;
  credential: string;
  recognizedBy: string[];
  teaches: string[];
  instructor?: string;
}

export const courses: CourseFact[] = [
  {
    id: "elearning",
    path: "/elearning",
    name: "IOSH-approved Safety 4.0 — Leading Safety in the Digital Age",
    description:
      "Self-paced online course for EHS leaders on applying AI, IoT, data analytics and SafetyTech to workplace safety. 10 modules and 60+ video lessons, about 8 hours of study, with an IOSH-approved and CPD-accredited certificate.",
    audience: "EHS managers, heads of safety, directors and consultants",
    format: "Self-paced online, 10 modules, 60+ video lessons, about 8 hours; 90 days to complete",
    courseMode: "online",
    workload: "PT8H",
    level: "Professional development",
    priceGBP: 597,
    vatExtra: true,
    priceNote: "£597 + VAT (reduced from £697); 7-day money-back guarantee",
    credential: "IOSH-approved, CPD-accredited Safety 4.0 certificate",
    recognizedBy: ["Institution of Occupational Safety and Health (IOSH)", "CPD Certification Service"],
    teaches: [
      "AI in workplace safety",
      "IoT sensors and wearables for safety monitoring",
      "Predictive safety analytics",
      "SafetyTech selection and implementation",
      "Digital safety leadership",
    ],
  },
  {
    id: "accelerator",
    path: "/accelerator",
    name: "Safety 4.0 Accelerator Cohort",
    description:
      "6-week live cohort programme: everything in the Safety 4.0 eLearning plus 7 live sessions led by Lucas Domingues (MSc, CMIOSH) and a peer cohort of 10–15 safety leaders. IOSH-approved, 10 CPD hours.",
    audience: "Senior EHS professionals leading safety strategy",
    format: "6 weeks, 7 live online sessions of 90 minutes (recorded), 3–4 hours a week, cohort of 10–15",
    courseMode: "online",
    schedule: { sessionDuration: "PT90M", frequency: "Weekly", count: 7 },
    level: "Senior / leadership",
    priceGBP: 1997,
    vatExtra: true,
    priceNote: "£1,997 + VAT per person (reduced from £2,497); employer PO/invoice billing available",
    credential: "IOSH-approved, CPD-accredited Safety 4.0 certificate (10 CPD hours)",
    recognizedBy: ["Institution of Occupational Safety and Health (IOSH)", "CPD Certification Service"],
    teaches: [
      "Building a Safety 4.0 strategy",
      "Governing AI in EHS",
      "Business cases for SafetyTech",
      "Leading digital change in safety teams",
    ],
    instructor: "Lucas Domingues",
  },
  {
    id: "ai-fundamentals",
    path: "/ai-fundamentals",
    name: "AI Fundamentals in EHS",
    description:
      "Beginner-friendly 90-minute online course on using AI in environment, health and safety work: 5 modules, a prompt library and a certificate of completion. No AI experience needed.",
    audience: "EHS professionals new to AI",
    format: "Self-paced online, 5 modules, 90 minutes; 365 days access",
    courseMode: "online",
    workload: "PT1H30M",
    level: "Beginner",
    priceGBP: 97,
    priceNote: "£97; 7-day money-back guarantee",
    credential: "Certificate of Completion from SafetyTech Academy, an IOSH-approved training provider",
    recognizedBy: [],
    teaches: ["What AI can and can't do in EHS", "Prompting for safety tasks", "Using AI safely and responsibly"],
  },
  {
    id: "copilot-for-ehs",
    path: "/copilot-for-ehs",
    name: "Microsoft Copilot for EHS Professionals",
    description:
      "Group training that turns Microsoft 365 Copilot licences into audit-ready AI competence for EHS and sustainability teams, aligned to the EU AI Act Article 4 AI-literacy obligation.",
    audience: "EHS and sustainability teams with Microsoft 365 Copilot",
    format: "Group training for teams, delivered live",
    courseMode: "online",
    level: "Team training",
    priceNote: "Priced per team on request",
    credential: "Certificate of completion",
    recognizedBy: [],
    teaches: ["Microsoft Copilot for EHS workflows", "EU AI Act Article 4 AI literacy", "Safe, auditable AI use"],
  },
];

// ---------------------------------------------------------------------------
// JSON-LD builders
// ---------------------------------------------------------------------------

type Ld = Record<string, unknown>;
const ORG_ID = `${SITE}/#organization`;

export function organizationLd(): Ld {
  const o = organization;
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: o.name,
    alternateName: o.alternateNames,
    legalName: o.legalName,
    url: o.url,
    logo: o.logo,
    email: o.email,
    description: o.description,
    address: { "@type": "PostalAddress", ...o.address },
    founder: { "@type": "Person", ...o.founder },
    sameAs: o.sameAs,
    knowsAbout: o.knowsAbout,
    hasCredential: o.accreditations.map((a) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "accreditation",
      recognizedBy: { "@type": "Organization", name: a },
    })),
  };
}

export function websiteLd(): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    name: organization.name,
    url: SITE,
    inLanguage: "en-GB",
    publisher: { "@id": ORG_ID },
  };
}

function courseNode(c: CourseFact): Ld {
  const instance: Ld = { "@type": "CourseInstance", courseMode: c.courseMode };
  if (c.workload) instance.courseWorkload = c.workload;
  if (c.schedule) {
    instance.courseSchedule = {
      "@type": "Schedule",
      duration: c.schedule.sessionDuration,
      repeatFrequency: c.schedule.frequency,
      repeatCount: c.schedule.count,
    };
  }
  if (c.instructor) instance.instructor = { "@type": "Person", name: c.instructor };

  const node: Ld = {
    "@type": "Course",
    "@id": `${SITE}${c.path}#course`,
    name: c.name,
    description: c.description,
    url: `${SITE}${c.path}`,
    provider: { "@id": ORG_ID, "@type": "EducationalOrganization", name: organization.name, url: SITE },
    inLanguage: "en-GB",
    educationalLevel: c.level,
    audience: { "@type": "EducationalAudience", audienceType: c.audience },
    teaches: c.teaches,
    hasCourseInstance: instance,
    educationalCredentialAwarded: c.credential,
  };
  if (c.recognizedBy.length) {
    node.occupationalCredentialAwarded = {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certificate",
      name: c.credential,
      recognizedBy: c.recognizedBy.map((name) => ({ "@type": "Organization", name })),
    };
  }
  if (c.priceGBP !== undefined) {
    node.offers = {
      "@type": "Offer",
      category: "Paid",
      price: c.priceGBP,
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      url: `${SITE}${c.path}`,
      priceSpecification: {
        "@type": "PriceSpecification",
        price: c.priceGBP,
        priceCurrency: "GBP",
        valueAddedTaxIncluded: !c.vatExtra,
      },
    };
  }
  return node;
}

export function courseLd(id: string): Ld {
  const c = courses.find((x) => x.id === id);
  if (!c) throw new Error(`siteFacts: unknown course "${id}"`);
  return { "@context": "https://schema.org", ...courseNode(c) };
}

export function courseListLd(): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SafetyTech Academy courses",
    itemListElement: courses.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: courseNode(c) })),
  };
}

export function faqLd(items: { question: string; answer: string }[]): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function aboutPageLd(): Ld {
  const f = organization.founder;
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${SITE}/about-us`,
    about: { "@id": ORG_ID },
    mainEntity: {
      "@type": "Person",
      name: f.name,
      jobTitle: f.jobTitle,
      honorificSuffix: f.honorificSuffix,
      worksFor: { "@id": ORG_ID },
      knowsAbout: organization.knowsAbout,
    },
  };
}
