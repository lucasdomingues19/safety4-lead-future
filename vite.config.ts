import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { prerenderRoutes, applyRouteSeo } from "./scripts/prerender-routes";

// Emits a static HTML file per route with unique title/description/canonical/
// og:url baked in, so crawlers get self-canonicalising pages before any JS runs.
// Fixes "Alternate page with proper canonical tag" indexing issues on the SPA.
function seoPrerenderPlugin(): Plugin {
  return {
    name: "seo-prerender-html",
    apply: "build",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      const templatePath = path.join(dist, "index.html");
      if (!fs.existsSync(templatePath)) return;
      const template = fs.readFileSync(templatePath, "utf-8");

      for (const route of prerenderRoutes) {
        const html = applyRouteSeo(template, route);
        const outDir = path.join(dist, route.path.replace(/^\//, ""));
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, "index.html"), html);
      }
      console.log(`seo-prerender: wrote ${prerenderRoutes.length} route pages`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    seoPrerenderPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
