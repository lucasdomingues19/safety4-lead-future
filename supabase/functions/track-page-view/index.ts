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
    const data: PageViewData = await req.json();

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

    // Get geolocation from IP address
    let country: string | undefined = undefined;
    let city: string | undefined = undefined;
    
    // Extract IP address from headers
    const ip = req.headers.get('cf-connecting-ip') || 
               req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip');
    
    // Try Cloudflare headers first (may not be available in all environments)
    const cfCountry = req.headers.get('cf-ipcountry');
    const cfCity = req.headers.get('cf-ipcity');
    
    if (cfCountry && cfCountry !== 'XX') {
      try {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        country = regionNames.of(cfCountry) || cfCountry;
      } catch {
        country = cfCountry;
      }
      city = cfCity || undefined;
      console.log('Geolocation from CF headers:', { country, city });
    } else if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      // Fallback to ip-api.com (free, 45 req/min limit for non-commercial)
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === 'success') {
            country = geoData.country || undefined;
            city = geoData.city || undefined;
            console.log('Geolocation from IP lookup:', { ip, country, city });
          }
        }
      } catch (error) {
        console.error('Geolocation lookup failed:', error);
      }
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Merge location data with submitted data
    const pageViewData = {
      ...data,
      country,
      city,
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
