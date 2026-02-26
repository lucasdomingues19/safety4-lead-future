import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const MAX_REQUESTS_PER_WINDOW = 20; // Max 20 events per 10 seconds per session

// Known bot user agent patterns
const BOT_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /curl/i, /wget/i, /python/i, /java\//i,
  /headless/i, /phantom/i, /selenium/i,
  /puppeteer/i, /playwright/i
];

// Validate honeypot + JS challenge fields
const validateBotChallenge = (data: any): boolean => {
  if (data._hp !== undefined && data._hp !== '') {
    console.log('Honeypot triggered, ignoring request');
    return false;
  }
  if (data._ts) {
    const elapsed = Date.now() - Number(data._ts);
    if (elapsed < 1000 || elapsed > 86400000) {
      console.log('Timing challenge failed:', elapsed, 'ms');
      return false;
    }
  } else {
    console.log('Missing timing challenge');
    return false;
  }
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

interface UserEventData {
  session_id: string;
  event_type: string;
  page_path: string;
  event_data?: Record<string, unknown>;
}

const validateEventData = (data: unknown): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (typeof data !== 'object' || data === null) {
    errors.push('Data must be an object');
    return { valid: false, errors };
  }
  
  const d = data as Record<string, unknown>;

  // Required: session_id
  if (!d.session_id || typeof d.session_id !== 'string') {
    errors.push('session_id is required and must be a string');
  } else if (d.session_id.length > 100) {
    errors.push('session_id must be less than 100 characters');
  }

  // Required: event_type
  if (!d.event_type || typeof d.event_type !== 'string') {
    errors.push('event_type is required and must be a string');
  } else if (d.event_type.length > 50) {
    errors.push('event_type must be less than 50 characters');
  }

  // Required: page_path
  if (!d.page_path || typeof d.page_path !== 'string') {
    errors.push('page_path is required and must be a string');
  } else if (d.page_path.length > 500) {
    errors.push('page_path must be less than 500 characters');
  }

  // Optional: event_data (must be object if provided)
  if (d.event_data !== undefined && d.event_data !== null) {
    if (typeof d.event_data !== 'object') {
      errors.push('event_data must be an object');
    } else {
      // Check size limit (prevent large payloads)
      const dataStr = JSON.stringify(d.event_data);
      if (dataStr.length > 10000) {
        errors.push('event_data must be less than 10KB');
      }
    }
  }

  return { valid: errors.length === 0, errors };
};

const checkRateLimit = (sessionId: string): boolean => {
  const now = Date.now();
  const rateLimitData = rateLimitMap.get(sessionId);

  if (!rateLimitData || now > rateLimitData.resetTime) {
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
    const data = await req.json();

    // Bot challenge validation (honeypot + timing + JS proof)
    if (!validateBotChallenge(data)) {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Bot detection: Check user agent
    const userAgent = req.headers.get('user-agent') || '';
    const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgent));
    if (isBot) {
      console.log('Bot detected, ignoring event');
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const validation = validateEventData(data);
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert validated data
    const eventData: UserEventData = {
      session_id: data.session_id,
      event_type: data.event_type,
      page_path: data.page_path,
      event_data: data.event_data || null,
    };

    const { error } = await supabase.from('user_events').insert(eventData);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error tracking event:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
