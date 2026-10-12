import { useEffect } from 'react';
import { trackClick } from '@/utils/analytics';

/**
 * Component that automatically tracks clicks on important elements
 * Wrap this around sections you want to track
 */
export const AnalyticsTracker = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Elements tagged with data-track are recorded once, with their link (href or data-href) when they have one.
      const trackable = target.closest('[data-track]') as HTMLElement | null;
      if (trackable) {
        trackClick('cta', {
          name: trackable.getAttribute('data-track'),
          text: trackable.textContent?.trim(),
          href: trackable.dataset.href || trackable.closest('a')?.href || null,
        });
        return;
      }

      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        const buttonText = button?.textContent?.trim() || 'Unknown Button';
        trackClick('button', {
          text: buttonText,
          id: button?.id,
          className: button?.className
        });
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target as HTMLAnchorElement : target.closest('a');
        trackClick('link', {
          text: link?.textContent?.trim(),
          href: link?.href,
          id: link?.id
        });
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  return <>{children}</>;
};
