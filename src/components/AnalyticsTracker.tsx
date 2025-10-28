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
      
      // Track CTA clicks (elements with data-track attribute)
      const trackableElement = target.closest('[data-track]');
      if (trackableElement) {
        const trackName = trackableElement.getAttribute('data-track');
        trackClick('cta', { 
          name: trackName,
          text: trackableElement.textContent?.trim()
        });
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  return <>{children}</>;
};
