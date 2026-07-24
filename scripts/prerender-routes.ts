import { blogPosts } from "../src/data/blogPosts";

const BASE = "https://safetytech.academy";
const DEFAULT_OG = `${BASE}/opengraph-image.png`;

export interface RouteSeo {
  /** Route path, e.g. "/elearning" (no trailing slash except "/") */
  path: string;
  title: string;
  description: string;
  /** Absolute canonical URL. Defaults to BASE + path. */
  canonical?: string;
  ogImage?: string;
  ogType?: string;
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
    title: "AI Fundamentals in EHS | Safety 4.0 Academy",
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
    title: "Enrol – Safety 4.0 Accelerator | Safety 4.0 Academy",
    description:
      "Apply to join the Safety 4.0 Accelerator programme. IOSH-approved, CPD-certified training for safety professionals.",
  },
  {
    path: "/certification",
    title: "IOSH & CPD Certification | Safety 4.0 Academy Accreditation",
    description:
      "Earn an IOSH-approved and CPD-certified Safety 4.0 leadership credential. Recognised globally by employers and professional bodies. 8+ CPD hours included.",
  },
  {
    path: "/case-studies",
    title: "Case Studies — Safety 4.0 Academy | Real Stories from Alumni",
    description:
      "Read how Safety 4.0 Academy alumni are transforming safety leadership with digital tools, AI, and data-driven strategies.",
  },
  {
    path: "/faq",
    title: "FAQ — Safety 4.0 Academy",
    description:
      "Answers on our eLearning, Accelerator cohort, In-Company training, IOSH certification and pricing.",
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
      "Contact Safety 4.0 Academy | Get in Touch for IOSH Training Enquiries",
    description:
      "Contact the Safety 4.0 Academy team for enrolment enquiries, corporate training, partnerships, or general questions about our IOSH-approved Safety 4.0 certification.",
  },
  {
    path: "/ebook",
    title: "Free Safety 4.0 eBook | Digital Safety Leadership Guide Download",
    description:
      "Download the free Safety 4.0 eBook — your guide to leading safety in the digital age. Learn about AI, IoT, and SafetyTech for modern workplace safety management.",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | Safety 4.0 Academy",
    description:
      "Safety 4.0 Academy's Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and international privacy standards.",
  },
  {
    path: "/terms-conditions",
    title: "Terms & Conditions | Safety 4.0 Academy",
    description:
      "Read the Terms and Conditions for Safety 4.0 Academy's IOSH-approved digital safety leadership training. Covers enrolment, payment, intellectual property, and refund policies.",
  },
  {
    path: "/cookies-policy",
    title: "Cookies Policy | Safety 4.0 Academy",
    description:
      "Learn how Safety 4.0 Academy uses cookies to improve your experience. Understand the types of cookies we use, how to manage them, and your consent options.",
  },
  {
    path: "/anti-piracy-policy",
    title: "Anti-Piracy Policy | Safety 4.0 Academy",
    description:
      "Safety 4.0 Academy's Anti-Piracy Policy. Learn about our intellectual property protection measures for IOSH-approved course materials and digital content.",
  },
];

const blogRoutes: RouteSeo[] = blogPosts.map((post) => ({
  path: `/blog/${post.slug}`,
  title: `${post.title} | Safety 4.0 Academy Blog`,
  description: post.metaDescription,
  ogImage: `${BASE}${post.featuredImage}`,
  ogType: "article",
}));

export const prerenderRoutes: RouteSeo[] = [...staticRoutes, ...blogRoutes];

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
