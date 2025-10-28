import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
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

// Track page view
export const trackPageView = async (pagePath: string) => {
  try {
    const sessionId = getSessionId();
    const userAgent = navigator.userAgent;
    const { deviceType, browser, browserVersion, os } = parseUserAgent(userAgent);

    const data = {
      session_id: sessionId,
      page_path: pagePath,
      referrer: document.referrer || null,
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

    const { error } = await supabase.from('page_views').insert(data);
    
    if (error) {
      console.error('Analytics tracking error:', error);
    }
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

// Hook to track page views automatically
export const usePageTracking = () => {
  const trackCurrentPage = () => {
    trackPageView(window.location.pathname);
  };

  return { trackCurrentPage };
};
