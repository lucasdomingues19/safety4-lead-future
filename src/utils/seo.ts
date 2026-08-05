/**
 * SEO utility for dynamically setting per-page meta tags.
 * Call in useEffect on every page component.
 */
export const setPageSEO = ({
  title,
  description,
  canonical,
  ogImage = "https://safetytech.academy/opengraph-image.png?v=3",
  ogType = "website",
}: {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}) => {
  // Title
  document.title = title;

  // Helper to set or create a meta tag
  const setMeta = (attr: string, key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (el) {
      el.setAttribute("content", content);
    } else {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      el.setAttribute("content", content);
      document.head.appendChild(el);
    }
  };

  // Standard meta
  setMeta("name", "description", description);
  setMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

  // Open Graph
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:image", ogImage);
  setMeta("property", "og:type", ogType);
  if (canonical) {
    setMeta("property", "og:url", canonical);
  }

  // Twitter
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", ogImage);

  // Canonical link
  if (canonical) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (link) {
      link.href = canonical;
    } else {
      link = document.createElement("link");
      link.rel = "canonical";
      link.href = canonical;
      document.head.appendChild(link);
    }

    // hreflang alternates must self-reference the current page, otherwise
    // Google treats the page as an alternate of whatever they point to.
    const setAlternate = (lang: string) => {
      let alt = document.querySelector(
        `link[rel="alternate"][hreflang="${lang}"]`,
      ) as HTMLLinkElement | null;
      if (!alt) {
        alt = document.createElement("link");
        alt.rel = "alternate";
        alt.hreflang = lang;
        document.head.appendChild(alt);
      }
      alt.href = canonical;
    };
    setAlternate("en");
    setAlternate("x-default");
  }
};
