import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
// import { componentTagger } from "lovable-tagger"; // Lovable dev tool, not needed for production build
import { getPrerenderRoutes, applyRouteSeo } from "./scripts/prerender-routes";
import { buildLlmsTxt, buildLlmsFull } from "./scripts/ai-search";
import { organizationLd, websiteLd, courseListLd } from "./src/data/siteFacts";

/** JSON-LD <script> tags for the static HTML, tagged so the client fallback can tell they're there. */
const ldTags = (tag: string, blocks: object[]) =>
  blocks
    .map((b) => `    <script type="application/ld+json" data-prerendered="${tag}">${JSON.stringify(b).replace(/</g, "\\u003c")}</script>`)
    .join("\n");

// Emits a static HTML file per route with unique title/description/canonical/
// og:url baked in, so crawlers get self-canonicalising pages before any JS runs.
// Fixes "Alternate page with proper canonical tag" indexing issues on the SPA.
function seoPrerenderPlugin(supabaseUrl: string, supabaseKey: string): Plugin {
  return {
    name: "seo-prerender-html",
    apply: "build",
    async closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      const templatePath = path.join(dist, "index.html");
      if (!fs.existsSync(templatePath)) return;
      // Organisation + website schema on every page; the homepage also lists the courses.
      const template = fs
        .readFileSync(templatePath, "utf-8")
        .replace(/<\/head>/, `${ldTags("site", [organizationLd(), websiteLd()])}\n  </head>`);
      fs.writeFileSync(templatePath, template.replace(/<\/head>/, `${ldTags("/", [courseListLd()])}\n  </head>`));

      const routes = await getPrerenderRoutes(supabaseUrl, supabaseKey);

      for (const route of routes) {
        const html = applyRouteSeo(template, route);
        const outDir = path.join(dist, route.path.replace(/^\//, ""));
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, "index.html"), html);
      }
      console.log(`seo-prerender: wrote ${routes.length} route pages`);

      // AI-assistant index and full-text reference, generated from the same data.
      fs.writeFileSync(path.join(dist, "llms.txt"), buildLlmsTxt(routes));
      fs.writeFileSync(path.join(dist, "llms-full.txt"), buildLlmsFull(routes));
      console.log("seo-prerender: wrote llms.txt and llms-full.txt");
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Lovable Assets are served from the edge in production/preview.
        // Proxy them locally so dev previews render uploaded images correctly.
        "/__l5e/assets-v1": {
          target: "https://www.safetytech.academy",
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      // mode === "development" && componentTagger(), // Lovable dev tool
      seoPrerenderPlugin(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
