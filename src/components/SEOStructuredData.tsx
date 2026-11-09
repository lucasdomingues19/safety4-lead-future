import { useEffect } from 'react';
import { organizationLd, websiteLd, courseLd, courseListLd, faqLd, courses } from '@/data/siteFacts';

interface StructuredDataProps {
  type?: 'course' | 'organization' | 'faq';
  faqItems?: Array<{ question: string; answer: string }>;
}

/**
 * Client-side fallback for structured data.
 *
 * Every public route already ships its JSON-LD in the static HTML (baked at
 * build time by vite.config.ts + scripts/prerender-routes.ts, tagged
 * data-prerendered="<path>"). That is what Google and AI crawlers read. This
 * component only adds schema after an in-app navigation to a page whose
 * prerendered blocks aren't in the head. All facts come from
 * src/data/siteFacts.ts; never hard-code schema here.
 */
export const SEOStructuredData = ({ type = 'course', faqItems }: StructuredDataProps) => {
  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (document.querySelector(`script[type="application/ld+json"][data-prerendered="${path}"]`)) return;

    const blocks: object[] = [];
    if (!document.querySelector('script[type="application/ld+json"][data-prerendered="site"]')) {
      blocks.push(organizationLd(), websiteLd());
    }
    if (type === 'course') blocks.push(path === '/' ? courseListLd() : courseLd(courses.find((c) => c.path === path)?.id ?? 'elearning'));
    if (type === 'faq' && faqItems?.length) blocks.push(faqLd(faqItems));

    const inserted = blocks.map((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.client = 'true';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
      return script;
    });

    return () => inserted.forEach((s) => s.remove());
  }, [type, faqItems]);

  return null;
};
