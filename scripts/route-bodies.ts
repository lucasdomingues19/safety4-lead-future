/**
 * Per-route H1 and main text baked into each prerendered page's static HTML
 * (see seoPrerenderPlugin in vite.config.ts and applyRouteSeo in
 * prerender-routes.ts).
 *
 * Why: the site is a client-rendered SPA. Without this, every route's raw HTML
 * carried the homepage's fallback text, so Google and AI crawlers that don't
 * run JS saw dozens of near-identical pages and left them out of the index.
 *
 * The text here is copied from what each page actually renders — when you
 * change a page's headline or key copy, update its entry here too. The build
 * fails if a prerendered route has no entry.
 */

export interface RouteBodyLink {
  href: string;
  label: string;
  text?: string;
}

export interface RouteBodySection {
  /** Section heading. Empty string = intro paragraphs directly under the H1. */
  heading: string;
  /** Heading level; defaults to 2. */
  level?: 2 | 3;
  paragraphs?: string[];
  bullets?: string[];
  links?: RouteBodyLink[];
}

export interface RouteBody {
  /** The page's H1, exactly as the page renders it. */
  h1: string;
  sections: RouteBodySection[];
  /** Pre-rendered, trusted HTML appended after the sections (blog posts). */
  html?: string;
}

/** A RouteBody keyed by its route path (used by the per-area content files). */
export type RouteBodyEntry = RouteBody & { path: string };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Site-wide links, so non-JS crawlers can still follow the site's structure. */
const SITE_LINKS: RouteBodyLink[] = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "All courses" },
  { href: "/elearning", label: "IOSH-approved Safety 4.0 eLearning" },
  { href: "/ai-fundamentals", label: "AI Fundamentals in EHS" },
  { href: "/copilot-for-ehs", label: "Microsoft Copilot for EHS" },
  { href: "/accelerator", label: "Safety 4.0 Accelerator Cohort" },
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Blog" },
  { href: "/governance-readiness", label: "AI governance readiness review" },
  { href: "/scorecard", label: "Safety 4.0 Scorecard" },
  { href: "/faq", label: "FAQ" },
  { href: "/about-us", label: "About us" },
  { href: "/contact", label: "Contact" },
];

function renderSection(s: RouteBodySection): string {
  const out: string[] = [];
  const level = s.level ?? 2;
  if (s.heading) out.push(`<h${level}>${esc(s.heading)}</h${level}>`);
  for (const p of s.paragraphs ?? []) out.push(`<p>${esc(p)}</p>`);
  if (s.bullets?.length) {
    out.push(`<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`);
  }
  if (s.links?.length) {
    out.push(
      `<ul>${s.links
        .map(
          (l) =>
            `<li><a href="${esc(l.href)}">${esc(l.label)}</a>${l.text ? ` — ${esc(l.text)}` : ""}</li>`,
        )
        .join("")}</ul>`,
    );
  }
  return out.join("\n");
}

/** The HTML that goes inside the route's <noscript> block. */
export function renderBodyHtml(body: RouteBody): string {
  const main = [
    `<h1>${esc(body.h1)}</h1>`,
    ...body.sections.map(renderSection),
    body.html ?? "",
  ]
    .filter(Boolean)
    .join("\n");
  const nav = SITE_LINKS.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("");
  return (
    `<div style="max-width:900px;margin:0 auto;padding:40px 20px;font-family:sans-serif;color:#222;">\n` +
    `<main>\n${main}\n</main>\n` +
    `<nav aria-label="Site"><h2>Explore SafetyTech Academy</h2><ul>${nav}</ul></nav>\n` +
    `</div>`
  );
}

import { bodies as coursePages } from "./route-bodies/courses";
import { bodies as marketingPages } from "./route-bodies/marketing";
import { bodies as policyPages } from "./route-bodies/policies";

const extracted = Object.fromEntries(
  [...coursePages, ...marketingPages, ...policyPages].map(({ path, ...body }) => [path, body]),
) as Record<string, RouteBody>;

export const routeBodies: Record<string, RouteBody> = {
  ...extracted,

  // /syllabus renders the same page as /elearning and canonicalises to it.
  "/syllabus": extracted["/elearning"],
  // /assess-readiness renders the same page as /scorecard and canonicalises to it.
  "/assess-readiness": extracted["/scorecard"],

  "/blog": {
    h1: "Safety 4.0 Insights",
    sections: [
      {
        heading: "",
        paragraphs: ["Expert insights on AI, digital transformation, and the future of workplace safety"],
      },
    ],
  },

  "/guides": {
    h1: "Straight answers on AI, data and modern safety practice",
    sections: [
      {
        heading: "",
        paragraphs: [
          "Written by practitioners for practitioners. No vendor pitches, no invented statistics — just what the technology does, what it does not, and how to apply it responsibly.",
        ],
      },
    ],
  },

  "/governance-readiness": {
    h1: "AI in EHS Governance Readiness",
    sections: [
      {
        heading: "",
        paragraphs: [
          "Ten questions, three minutes. You get a scored position across five domains — visibility, literacy, governance, assurance and records — and the three things to fix first.",
        ],
      },
      {
        heading: "The five domains",
        bullets: ["Visibility", "Literacy", "Governance", "Assurance", "Records"],
      },
    ],
  },
};
