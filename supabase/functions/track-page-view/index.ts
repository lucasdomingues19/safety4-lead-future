import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 page views per 5 seconds per session

// Known bot user agent patterns
const BOT_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /curl/i, /wget/i, /python/i, /java\//i,
  /headless/i, /phantom/i, /selenium/i,
  /puppeteer/i, /playwright/i, /slurp/i,
  /googlebot/i, /bingbot/i, /yandex/i,
  /baidu/i, /duckduckbot/i, /facebookexternalhit/i
];

// Suspicious referrer patterns (known fake referrers)
const SUSPICIOUS_REFERRERS = [
  /gigablast\.com/i, /hakia\.com/i, /cpanel\.net/i,
  /semalt\.com/i, /buttons-for-website\.com/i
];

// Validate honeypot + JS challenge fields
const validateBotChallenge = (data: any): boolean => {
  // Honeypot must be empty
  if (data._hp !== undefined && data._hp !== '') {
    console.log('Honeypot triggered, ignoring request');
    return false;
  }
  // Timing: page must have loaded at least 1 second ago
  if (data._ts) {
    const elapsed = Date.now() - Number(data._ts);
    if (elapsed < 1000 || elapsed > 86400000) { // < 1s or > 24h
      console.log('Timing challenge failed:', elapsed, 'ms');
      return false;
    }
  } else {
    // No timestamp = likely not a real browser
    console.log('Missing timing challenge');
    return false;
  }
  // JS proof validation
  if (data._js === undefined || data._js === null) {
    console.log('Missing JS proof');
    return false;
  }
  const expectedProof = String(data._ts).split('').reduce((acc: number, d: string) => acc ^ parseInt(d, 10), 0);
  if (Number(data._js) !== expectedProof) {
    console.log('JS proof mismatch');
    return false;
  }
  return true;
};

interface PageViewData {
  session_id: string;
  page_path: string;
  referrer?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  browser_version?: string;
  os?: string;
  screen_width?: number;
  screen_height?: number;
  viewport_width?: number;
  viewport_height?: number;
  language?: string;
  timezone?: string;
  country?: string;
  city?: string;
}

const validatePageViewData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!data.session_id || typeof data.session_id !== 'string') {
    errors.push('session_id is required and must be a string');
  } else if (data.session_id.length > 100) {
    errors.push('session_id must be less than 100 characters');
  }

  if (!data.page_path || typeof data.page_path !== 'string') {
    errors.push('page_path is required and must be a string');
  } else if (data.page_path.length > 500) {
    errors.push('page_path must be less than 500 characters');
  }

  // Optional string fields with length limits
  if (data.referrer && (typeof data.referrer !== 'string' || data.referrer.length > 1000)) {
    errors.push('referrer must be a string less than 1000 characters');
  }
  
  if (data.user_agent && (typeof data.user_agent !== 'string' || data.user_agent.length > 500)) {
    errors.push('user_agent must be a string less than 500 characters');
  }

  if (data.device_type && (typeof data.device_type !== 'string' || data.device_type.length > 50)) {
    errors.push('device_type must be a string less than 50 characters');
  }

  if (data.browser && (typeof data.browser !== 'string' || data.browser.length > 50)) {
    errors.push('browser must be a string less than 50 characters');
  }

  if (data.browser_version && (typeof data.browser_version !== 'string' || data.browser_version.length > 50)) {
    errors.push('browser_version must be a string less than 50 characters');
  }

  if (data.os && (typeof data.os !== 'string' || data.os.length > 50)) {
    errors.push('os must be a string less than 50 characters');
  }

  if (data.language && (typeof data.language !== 'string' || data.language.length > 20)) {
    errors.push('language must be a string less than 20 characters');
  }

  if (data.timezone && (typeof data.timezone !== 'string' || data.timezone.length > 100)) {
    errors.push('timezone must be a string less than 100 characters');
  }

  if (data.country && (typeof data.country !== 'string' || data.country.length > 100)) {
    errors.push('country must be a string less than 100 characters');
  }

  if (data.city && (typeof data.city !== 'string' || data.city.length > 100)) {
    errors.push('city must be a string less than 100 characters');
  }

  // Numeric fields with reasonable limits
  const numericFields = ['screen_width', 'screen_height', 'viewport_width', 'viewport_height'];
  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      const value = Number(data[field]);
      if (isNaN(value) || value < 0 || value > 10000) {
        errors.push(`${field} must be a number between 0 and 10000`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
};

const checkRateLimit = (sessionId: string): boolean => {
  const now = Date.now();
  const rateLimitData = rateLimitMap.get(sessionId);

  if (!rateLimitData || now > rateLimitData.resetTime) {
    // New window
    rateLimitMap.set(sessionId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (rateLimitData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  rateLimitData.count++;
  return true;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: PageViewData & { _hp?: string; _ts?: number; _js?: number } = await req.json();

    // Bot challenge validation (honeypot + timing + JS proof)
    if (!validateBotChallenge(data)) {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Bot detection: Check user agent
    const userAgent = data.user_agent || '';
    const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgent));
    if (isBot) {
      console.log('Bot detected via user agent, ignoring page view');
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Bot detection: Check suspicious referrer
    const referrer = data.referrer || '';
    const isSuspiciousReferrer = SUSPICIOUS_REFERRERS.some(pattern => pattern.test(referrer));
    if (isSuspiciousReferrer) {
      console.log('Suspicious referrer detected, ignoring page view:', referrer);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const validation = validatePageViewData(data);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid data', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    if (!checkRateLimit(data.session_id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get geolocation + company/ISP from IP address (ip-api.com free tier: 45 req/min)
    let country: string | undefined = undefined;
    let city: string | undefined = undefined;
    let company: string | undefined = undefined;
    let isp: string | undefined = undefined;

    const ip = req.headers.get('cf-connecting-ip') ||
               req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip');

    // Consumer/residential ISP keywords — if org matches these, don't treat as a company
    const CONSUMER_ISP_PATTERNS = [
      /comcast/i, /verizon/i, /at&t\s*mobility/i, /t-mobile/i, /sprint/i, /charter/i,
      /spectrum/i, /cox\s*communications/i, /centurylink/i, /frontier/i,
      /vodafone/i, /\bbt\b/i, /british\s*telecom/i, /sky\s*(uk|broadband)/i, /virgin\s*media/i,
      /talktalk/i, /plusnet/i, /ee\s*limited/i, /three\s*uk/i, /o2/i,
      /orange/i, /telefonica/i, /movistar/i, /deutsche\s*telekom/i, /telecom\s*italia/i,
      /jio/i, /airtel/i, /bsnl/i, /rogers/i, /bell\s*canada/i, /telus/i, /shaw/i,
      /telstra/i, /optus/i, /tpg/i,
      /residential/i, /broadband/i, /wireless/i, /mobile/i, /cellular/i, /cable/i,
      /hosting/i, /cloudflare/i, /amazon\.com/i, /google\s*llc/i, /microsoft/i,
    ];

    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp,org,as`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === 'success') {
            country = geoData.country || undefined;
            city = geoData.city || undefined;
            isp = geoData.isp || undefined;
            // Prefer `org` (typically the AS holder / employer network) if it looks corporate
            const orgCandidate: string | undefined = geoData.org || geoData.isp;
            if (orgCandidate) {
              const isConsumer = CONSUMER_ISP_PATTERNS.some((p) => p.test(orgCandidate));
              if (!isConsumer) {
                // Clean common suffixes
                company = orgCandidate
                  .replace(/,?\s*(Inc\.?|LLC|Ltd\.?|Limited|GmbH|S\.A\.?|B\.V\.?|Corp\.?|Corporation|Co\.?)$/i, '')
                  .trim();
              }
            }
            console.log('IP lookup:', { ip, country, city, isp, company });
          }
        }
      } catch (error) {
        console.error('IP lookup failed:', error);
      }
    } else {
      // Fallback to Cloudflare header for country only
      const cfCountry = req.headers.get('cf-ipcountry');
      if (cfCountry && cfCountry !== 'XX') {
        try {
          const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
          country = regionNames.of(cfCountry) || cfCountry;
        } catch {
          country = cfCountry;
        }
      }
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Strip challenge fields before insert
    const { _hp, _ts, _js, ...cleanData } = data;

    const pageViewData = {
      ...cleanData,
      country,
      city,
      company,
      isp,
    };

    // Insert validated data
    const { error } = await supabase.from('page_views').insert(pageViewData);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error tracking page view:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
