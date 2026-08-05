import { blogPosts } from "../src/data/blogPosts";
import { guides } from "../src/data/guides";

const BASE = "https://safetytech.academy";
const DEFAULT_OG = `${BASE}/opengraph-image.png?v=3`;

export interface RouteSeo {
  /** Route path, e.g. "/elearning" (no trailing slash except "/") */
  path: string;
  title: string;
  description: string;
  /** Absolute canonical URL. Defaults to BASE + path. */
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  /**
   * JSON-LD blocks baked into the static HTML head at build time, so crawlers
   * and AI assistants that never execute JS still see the structured data.
   */
  jsonLd?: Record<string, unknown>[];
  /**
   * Plain-text content baked into a <noscript> block, so non-JS crawlers read
   * the actual answer rather than an empty shell.
   */
  noscriptContent?: { heading: string; paragraphs: string[] }[];
}


const staticRoutes: RouteSeo[] = [
  {
    path: "/elearning",
    title: "IOSH-approved Safety 4.0 — Leading Safety in the Digital Age",
    description:
      "Self-paced, IOSH-approved eLearning. Master AI, IoT, SafetyTech and digital leadership at your own pace. CPD accredited.",
  },
  {
    path: "/ai-fundamentals",
    title: "AI Fundamentals in EHS | SafetyTech Academy",
    description:
      "Learn the fundamentals of AI for environment, health and safety. A practical introduction to using AI in EHS workflows.",
  },
  {
    path: "/syllabus",
    title: "eLearning — IOSH-approved Safety 4.0 Course",
    description:
      "Self-paced, IOSH-approved eLearning. Master AI, IoT, SafetyTech and digital leadership at your own pace. CPD accredited.",
    canonical: `${BASE}/elearning`,
  },
  {
    path: "/accelerator",
    title:
      "Accelerator • Cohort — 6-Week IOSH Approved Live Programme | September 2026",
    description:
      "Join the Accelerator • Cohort: 6 weeks of live sessions with Lucas Domingues, peer learning, IOSH certification. Only 15 seats per cohort. Apply for September 2026.",
  },
  {
    path: "/enrol",
    title: "Enrol – Safety 4.0 Accelerator | SafetyTech Academy",
    description:
      "Apply to join the Safety 4.0 Accelerator programme. IOSH-approved, CPD-certified training for safety professionals.",
  },
  {
    path: "/certification",
    title: "IOSH & CPD Certification | SafetyTech Academy Accreditation",
    description:
      "Earn an IOSH-approved and CPD-certified Safety 4.0 leadership credential. Recognised globally by employers and professional bodies. 8+ CPD hours included.",
  },
  {
    path: "/case-studies",
    title: "Case Studies — SafetyTech Academy | Real Stories from Alumni",
    description:
      "Read how SafetyTech Academy alumni are transforming safety leadership with digital tools, AI, and data-driven strategies.",
  },
  {
    path: "/faq",
    title: "FAQ — SafetyTech Academy",
    description:
      "Answers on our eLearning, Accelerator cohort, In-Company training, IOSH certification and pricing.",
  },
  {
    path: "/governance-readiness",
    title: "AI in EHS Governance Readiness Review | SafetyTech Academy",
    description:
      "Free 3-minute AI governance readiness review for EHS leaders. Score your position across visibility, literacy, governance, assurance and records.",
  },
  {
    path: "/scorecard",
    title:
      "Free Safety 4.0 Scorecard & Digital Maturity | Assess Your Readiness",
    description:
      "Take the free Safety 4.0 Scorecard & Digital Maturity Pulse. Assess your personal readiness and your organisation's digital maturity across key categories. Get a personalised PDF report.",
  },
  {
    path: "/blog",
    title: "Safety 4.0 Blog — AI, EHS & SafetyTech Insights",
    description:
      "Expert articles on AI in workplace safety, SafetyTech trends and IOSH training. Stay ahead in safety leadership.",
  },
  {
    path: "/contact",
    title:
      "Contact SafetyTech Academy | Get in Touch for IOSH Training Enquiries",
    description:
      "Contact the SafetyTech Academy team for enrolment enquiries, corporate training, partnerships, or general questions about our IOSH-approved Safety 4.0 certification.",
  },
  {
    path: "/ebook",
    title: "Free Safety 4.0 eBook | Digital Safety Leadership Guide Download",
    description:
      "Download the free Safety 4.0 eBook — your guide to leading safety in the digital age. Learn about AI, IoT, and SafetyTech for modern workplace safety management.",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | SafetyTech Academy",
    description:
      "SafetyTech Academy's Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and international privacy standards.",
  },
  {
    path: "/terms-conditions",
    title: "Terms & Conditions | SafetyTech Academy",
    description:
      "Read the Terms and Conditions for SafetyTech Academy's IOSH-approved digital safety leadership training. Covers enrolment, payment, intellectual property, and refund policies.",
  },
  {
    path: "/cookies-policy",
    title: "Cookies Policy | SafetyTech Academy",
    description:
      "Learn how SafetyTech Academy uses cookies to improve your experience. Understand the types of cookies we use, how to manage them, and your consent options.",
  },
  {
    path: "/anti-piracy-policy",
    title: "Anti-Piracy Policy | SafetyTech Academy",
    description:
      "SafetyTech Academy's Anti-Piracy Policy. Learn about our intellectual property protection measures for IOSH-approved course materials and digital content.",
  },
];

const blogRoutes: RouteSeo[] = blogPosts.map((post) => ({
  path: `/blog/${post.slug}`,
  title: `${post.title} | SafetyTech Academy Blog`,
  description: post.metaDescription,
  ogImage: `${BASE}${post.featuredImage}`,
  ogType: "article",
}));

const guideRoutes: RouteSeo[] = [
  {
    path: "/guides",
    title: "Guides — AI, Safety 4.0 and IOSH Training Explained",
    description:
      "In-depth, practitioner-written guides on AI in health and safety, AI risk assessment, Safety 4.0 and IOSH-approved training. Free to read.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "SafetyTech Academy Guides",
        url: `${BASE}/guides`,
        hasPart: guides.map((g) => ({
          "@type": "Article",
          headline: g.title,
          abstract: g.summary,
          url: `${BASE}/guides/${g.slug}`,
        })),
      },
    ],
  },
  ...guides.map((guide): RouteSeo => {
    const url = `${BASE}/guides/${guide.slug}`;
    return {
      path: `/guides/${guide.slug}`,
      title: guide.metaTitle,
      description: guide.metaDescription,
      ogType: "article",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.metaDescription,
          abstract: guide.summary,
          inLanguage: "en-GB",
          datePublished: guide.updated,
          dateModified: guide.updated,
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          author: { "@type": "Organization", name: "SafetyTech Academy", url: BASE },
          publisher: {
            "@type": "EducationalOrganization",
            name: "SafetyTech Academy",
            url: BASE,
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE },
            { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides` },
            { "@type": "ListItem", position: 3, name: guide.shortLabel, item: url },
          ],
        },
      ],
      noscriptContent: [
        { heading: guide.title, paragraphs: [guide.summary] },
        { heading: "Key takeaways", paragraphs: guide.keyTakeaways },
        ...guide.sections.map((s) => ({
          heading: s.heading,
          paragraphs: [...(s.body ?? []), ...(s.bullets ?? [])],
        })),
        ...guide.faqs.map((f) => ({ heading: f.question, paragraphs: [f.answer] })),
      ],
    };
  }),
];

export const prerenderRoutes: RouteSeo[] = [
  ...staticRoutes,
  ...blogRoutes,
  ...guideRoutes,
];


/** Apply a route's SEO metadata to the built index.html template string. */
export function applyRouteSeo(template: string, route: RouteSeo): string {
  const canonical = route.canonical ?? `${BASE}${route.path}`;
  const ogImage = route.ogImage ?? DEFAULT_OG;
  const ogType = route.ogType ?? "website";
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const t = esc(route.title);
  const d = esc(route.description);

  let html = template;

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);

  // Simple meta by name/property
  const setAttr = (attr: "name" | "property", key: string, value: string) => {
    const re = new RegExp(
      `<meta ${attr}="${key.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}"[^>]*>`,
    );
    const tag = `<meta ${attr}="${key}" content="${value}" />`;
    if (re.test(html)) html = html.replace(re, tag);
    else html = html.replace(/<\/head>/, `    ${tag}\n  </head>`);
  };

  setAttr("name", "title", t);
  setAttr("name", "description", d);
  setAttr("property", "og:title", t);
  setAttr("property", "og:description", d);
  setAttr("property", "og:url", canonical);
  setAttr("property", "og:image", ogImage);
  setAttr("property", "og:type", ogType);
  setAttr("name", "twitter:title", t);
  setAttr("name", "twitter:description", d);
  setAttr("name", "twitter:url", canonical);
  setAttr("name", "twitter:image", ogImage);

  // Canonical link — replace existing or inject after <title>
  const canonicalTag = `<link rel="canonical" href="${canonical}" />`;
  if (/<link rel="canonical"[^>]*>/.test(html)) {
    html = html.replace(/<link rel="canonical"[^>]*>/, canonicalTag);
  } else {
    html = html.replace(/<\/title>/, `</title>\n    ${canonicalTag}`);
  }

  return html;
}
