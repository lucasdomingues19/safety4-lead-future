// Skip tracking in development/preview environments
const isDevEnvironment = () => {
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname.includes('lovableproject.com') ||
    hostname.includes('lovable.app') === false && hostname.includes('lovable') ||
    hostname.includes('id-preview--')
  );
};

// Page load timestamp for bot detection timing challenge
const PAGE_LOAD_TIME = Date.now();

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Generate bot-detection challenge fields
const getBotChallengeFields = () => {
  const ts = PAGE_LOAD_TIME;
  // Simple JS proof: XOR timestamp digits to prove JS executed
  const jsProof = String(ts).split('').reduce((acc, d) => acc ^ parseInt(d, 10), 0);
  return {
    _hp: '',       // honeypot — must stay empty
    _ts: ts,       // page load timestamp
    _js: jsProof,  // JS execution proof
  };
};

// Track custom events via secure edge function (clicks, form submissions, etc.)
export const trackEvent = async (eventType: string, eventData?: Record<string, unknown>) => {
  if (isDevEnvironment()) return;
  try {
    const sessionId = getSessionId();
    
    // Use validated edge function instead of direct insert
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-user-event`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          session_id: sessionId,
          event_type: eventType,
          event_data: eventData || {},
          page_path: window.location.pathname,
          ...getBotChallengeFields(),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Event tracking error:', errorData);
    }
  } catch (error) {
    console.error('Event tracking failed:', error);
  }
};

// Track button/link clicks
export const trackClick = (elementName: string, additionalData?: Record<string, any>) => {
  trackEvent('click', { 
    element: elementName, 
    ...additionalData 
  });
};

// Track scroll depth
let maxScrollDepth = 0;
export const initScrollTracking = () => {
  const trackScroll = () => {
    const scrollPercentage = Math.round(
      (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
    );
    
    if (scrollPercentage > maxScrollDepth) {
      maxScrollDepth = scrollPercentage;
      
      // Track at 25%, 50%, 75%, 100% milestones
      if ([25, 50, 75, 100].includes(scrollPercentage)) {
        trackEvent('scroll', { depth: scrollPercentage });
      }
    }
  };
  
  window.addEventListener('scroll', trackScroll, { passive: true });
  
  return () => window.removeEventListener('scroll', trackScroll);
};

// Track time on page
let pageStartTime: number;
let pageViewId: string | null = null;

export const startTimeTracking = () => {
  pageStartTime = Date.now();
};

export const updateTimeOnPage = async () => {
  if (!pageStartTime) return;
  
  const timeSpent = Math.floor((Date.now() - pageStartTime) / 1000); // in seconds
  
  try {
    // Update the duration in page_views if we have the ID
    trackEvent('time_on_page', { duration: timeSpent });
  } catch (error) {
    console.error('Time tracking update failed:', error);
  }
};

// Parse user agent to extract device info
const parseUserAgent = (ua: string) => {
  const isMobile = /Mobile|Android|iPhone/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  
  let deviceType = 'desktop';
  if (isMobile) deviceType = 'mobile';
  else if (isTablet) deviceType = 'tablet';

  let browser = 'Unknown';
  let browserVersion = '';
  
  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    browserVersion = ua.split('Firefox/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Chrome/') && !ua.includes('Edg')) {
    browser = 'Chrome';
    browserVersion = ua.split('Chrome/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = ua.split('Version/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    browserVersion = ua.split('Edg/')[1]?.split(' ')[0] || '';
  }

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  return { deviceType, browser, browserVersion, os };
};

// Track page view with validation and rate limiting
export const trackPageView = async (pagePath: string) => {
  if (isDevEnvironment()) return;
  try {
    const sessionId = getSessionId();
    const userAgent = navigator.userAgent;
    const { deviceType, browser, browserVersion, os } = parseUserAgent(userAgent);

    const data = {
      session_id: sessionId,
      page_path: pagePath,
      referrer: (document.referrer || '').substring(0, 999) || null,
      user_agent: userAgent,
      device_type: deviceType,
      browser,
      browser_version: browserVersion,
      os,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Use validated edge function instead of direct insert
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-page-view`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ ...data, ...getBotChallengeFields() }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Analytics tracking error:', errorData);
    }
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

// Hook to track page views automatically with enhanced tracking
export const usePageTracking = () => {
  const trackCurrentPage = () => {
    trackPageView(window.location.pathname);
    startTimeTracking();
    
    // Initialize scroll tracking
    const cleanup = initScrollTracking();
    
    // Track time on page when user leaves
    const handleBeforeUnload = () => {
      updateTimeOnPage();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateTimeOnPage();
    };
  };

  return { trackCurrentPage };
};
