/**
 * Builds /llms.txt and /llms-full.txt at build time (see vite.config.ts).
 *
 * llms.txt is the short index AI assistants read first (https://llmstxt.org);
 * llms-full.txt carries the full text of our reference content so an assistant
 * can answer from it without crawling the JS app. Both are generated from the
 * same data as the pages and structured data (src/data/siteFacts.ts, guides,
 * FAQs, route bodies), so they can't drift out of date.
 */
import { guides, type Guide } from "../src/data/guides";
import { organization, courses, SITE } from "../src/data/siteFacts";
import { faqCategories } from "../src/data/faqs";
import type { RouteBody } from "./route-bodies";
import type { RouteSeo } from "./prerender-routes";

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE}${path === "/" ? "/" : path}`);
const isTimeBound = (q: string) => /next cohort/i.test(q);

const LEGAL = ["/privacy-policy", "/terms-conditions", "/cookies-policy", "/anti-piracy-policy"];
/** Routes that exist for flows, not for answering questions. */
const SKIP = new Set(["/enrol", "/offer", "/verify", "/syllabus", "/assess-readiness"]);

function keyFacts(): string[] {
  const o = organization;
  return [
    `- Name: ${o.name} (formerly ${o.alternateNames.join(", ")}); a trading name of ${o.legalName}, company no. ${o.companyNumber}, ${o.address.streetAddress}, ${o.address.addressLocality} ${o.address.postalCode}, UK.`,
    `- Accreditation: IOSH-approved training provider; courses CPD-accredited.`,
    `- Founder and lead trainer: ${o.founder.name}, ${o.founder.honorificSuffix}.`,
    `- Audience: EHS (environment, health and safety) professionals and leaders.`,
    `- Contact: ${o.email} · ${SITE}/contact`,
  ];
}

function courseLine(c: (typeof courses)[number]): string {
  return `- [${c.name}](${abs(c.path)}): ${c.format}. ${c.priceNote}. ${c.credential}.`;
}

export function buildLlmsTxt(routes: RouteSeo[]): string {
  const lines: string[] = [];
  lines.push(`# ${organization.name}`, "");
  lines.push(`> ${organization.description}`, "");
  lines.push(...keyFacts(), "");
  lines.push(`Full text of our guides, courses and FAQs: ${SITE}/llms-full.txt`, "");

  lines.push("## Courses", "", ...courses.map(courseLine), "");

  lines.push("## Guides", "");
  for (const g of guides) lines.push(`- [${g.title}](${abs(`/guides/${g.slug}`)}): ${g.summary}`);
  lines.push("");

  const courseOrGuide = new Set([...courses.map((c) => c.path), "/guides", ...guides.map((g) => `/guides/${g.slug}`)]);
  const posts = routes.filter((r) => r.path.startsWith("/blog/"));
  const pages = routes.filter(
    (r) => !courseOrGuide.has(r.path) && !r.path.startsWith("/blog/") && !LEGAL.includes(r.path) && !SKIP.has(r.path) && !r.canonical,
  );
  lines.push("## Pages", "", `- [Home](${SITE}/): Overview of the academy, courses and certifications.`);
  for (const r of pages) lines.push(`- [${r.title}](${abs(r.path)}): ${r.description}`);
  lines.push("");

  if (posts.length) {
    lines.push("## Articles", "");
    for (const r of posts) lines.push(`- [${r.title.replace(/ \| SafetyTech Academy Blog$/, "")}](${abs(r.path)}): ${r.description}`);
    lines.push("");
  }

  lines.push("## Optional", "");
  for (const p of LEGAL) {
    const r = routes.find((x) => x.path === p);
    if (r) lines.push(`- [${r.title}](${abs(p)})`);
  }
  return lines.join("\n") + "\n";
}

function guideMarkdown(g: Guide): string {
  const out: string[] = [`## ${g.title}`, "", `Source: ${abs(`/guides/${g.slug}`)} · Updated ${g.updated}`, "", g.summary, ""];
  if (g.keyTakeaways.length) out.push("Key takeaways:", ...g.keyTakeaways.map((t) => `- ${t}`), "");
  for (const s of g.sections) {
    out.push(`### ${s.heading}`, "");
    for (const p of s.body ?? []) out.push(p, "");
    if (s.bullets?.length) out.push(...s.bullets.map((b) => `- ${b}`), "");
    if (s.table) {
      out.push(`| ${s.table.headers.join(" | ")} |`, `| ${s.table.headers.map(() => "---").join(" | ")} |`);
      for (const row of s.table.rows) out.push(`| ${row.join(" | ")} |`);
      out.push("");
    }
  }
  if (g.faqs.length) {
    out.push("### Questions and answers", "");
    for (const f of g.faqs) out.push(`**${f.question}**`, "", f.answer, "");
  }
  return out.join("\n");
}

function bodyMarkdown(path: string, body: RouteBody): string {
  const out: string[] = [`## ${body.h1}`, "", `Source: ${abs(path)}`, ""];
  for (const s of body.sections) {
    if (s.heading) out.push(`${s.level === 3 ? "####" : "###"} ${s.heading}`, "");
    for (const p of s.paragraphs ?? []) out.push(p, "");
    if (s.bullets?.length) out.push(...s.bullets.map((b) => `- ${b}`), "");
    if (s.links?.length) out.push(...s.links.map((l) => `- [${l.label}](${abs(l.href)})${l.text ? `: ${l.text}` : ""}`), "");
  }
  return out.join("\n");
}

export function buildLlmsFull(routes: RouteSeo[]): string {
  const out: string[] = [];
  out.push(`# ${organization.name} — full reference`, "");
  out.push(`> ${organization.description}`, "");
  out.push(...keyFacts(), "");

  out.push("# Courses", "");
  for (const c of courses) {
    out.push(`## ${c.name}`, "", `Source: ${abs(c.path)}`, "", c.description, "");
    out.push(`- For: ${c.audience}`, `- Format: ${c.format}`, `- Level: ${c.level}`, `- Price: ${c.priceNote}`, `- Credential: ${c.credential}`);
    out.push(`- Covers: ${c.teaches.join("; ")}`, "");
  }

  out.push("# Guides", "");
  for (const g of guides) out.push(guideMarkdown(g));

  out.push("# Frequently asked questions", "", `Source: ${SITE}/faq`, "");
  for (const cat of faqCategories) {
    out.push(`## ${cat.title}`, "");
    for (const f of cat.faqs) if (!isTimeBound(f.question)) out.push(`**${f.question}**`, "", f.answer, "");
  }

  out.push("# About and other pages", "");
  const covered = new Set([...courses.map((c) => c.path), "/faq", "/guides", ...guides.map((g) => `/guides/${g.slug}`)]);
  for (const r of routes) {
    if (covered.has(r.path) || LEGAL.includes(r.path) || SKIP.has(r.path) || r.canonical || r.path.startsWith("/blog/") || !r.body) continue;
    out.push(bodyMarkdown(r.path, r.body));
  }

  const posts = routes.filter((r) => r.path.startsWith("/blog/"));
  if (posts.length) {
    out.push("# Articles", "");
    for (const r of posts) out.push(`- [${r.title.replace(/ \| SafetyTech Academy Blog$/, "")}](${abs(r.path)}): ${r.description}`);
    out.push("");
  }
  return out.join("\n") + "\n";
}
