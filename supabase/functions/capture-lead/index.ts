import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 lead submissions per minute per IP

interface LeadData {
  name: string;
  email: string;
  phone?: string | null;
  source: string;
  message?: string;
  role?: string;
  inquiry_type?: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateLeadData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required: name
  if (!data.name || typeof data.name !== 'string') {
    errors.push('name is required and must be a string');
  } else if (data.name.trim().length === 0) {
    errors.push('name cannot be empty');
  } else if (data.name.length > 200) {
    errors.push('name must be less than 200 characters');
  }

  // Required: email
  if (!data.email || typeof data.email !== 'string') {
    errors.push('email is required and must be a string');
  } else if (!validateEmail(data.email)) {
    errors.push('email must be a valid email address');
  } else if (data.email.length > 255) {
    errors.push('email must be less than 255 characters');
  }

  // Optional: phone
  if (data.phone !== undefined && data.phone !== null) {
    if (typeof data.phone !== 'string') {
      errors.push('phone must be a string');
    } else if (data.phone.length > 50) {
      errors.push('phone must be less than 50 characters');
    }
  }

  // Optional: message
  if (data.message !== undefined && data.message !== null) {
    if (typeof data.message !== 'string') {
      errors.push('message must be a string');
    } else if (data.message.length > 5000) {
      errors.push('message must be less than 5000 characters');
    }
  }

  // Optional: role
  if (data.role !== undefined && data.role !== null) {
    if (typeof data.role !== 'string') {
      errors.push('role must be a string');
    } else if (data.role.length > 200) {
      errors.push('role must be less than 200 characters');
    }
  }

  // Optional: inquiry_type
  if (data.inquiry_type !== undefined && data.inquiry_type !== null) {
    if (typeof data.inquiry_type !== 'string') {
      errors.push('inquiry_type must be a string');
    } else if (data.inquiry_type.length > 100) {
      errors.push('inquiry_type must be less than 100 characters');
    }
  }

  // Required: source
  if (!data.source || typeof data.source !== 'string') {
    errors.push('source is required and must be a string');
  } else if (!['assessment', 'contact_form', 'cohort-pre-enrollment', 'ebook_download', 'newsletter_popup'].includes(data.source)) {
    errors.push('source must be one of: "assessment", "contact_form", "cohort-pre-enrollment", "ebook_download", or "newsletter_popup"');
  }

  return { valid: errors.length === 0, errors };
};

const getClientIdentifier = (req: Request): string => {
  // Use IP address for rate limiting
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
};

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const rateLimitData = rateLimitMap.get(identifier);

  if (!rateLimitData || now > rateLimitData.resetTime) {
    // New window
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
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
    const data: LeadData = await req.json();

    // Validate input
    const validation = validateLeadData(data);
    if (!validation.valid) {
      console.warn('Invalid lead data:', validation.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid data', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting by IP
    const clientId = getClientIdentifier(req);
    if (!checkRateLimit(clientId)) {
      console.warn('Rate limit exceeded for:', clientId);
      return new Response(
        JSON.stringify({ error: 'Too many submissions. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Sanitize and insert validated data
    const sanitizedData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      source: data.source,
      message: data.message?.trim() || null,
      role: data.role?.trim() || null,
      inquiry_type: data.inquiry_type?.trim() || null,
    };

    const { error } = await supabase.from('leads').insert(sanitizedData);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Lead captured successfully:', { email: sanitizedData.email, source: sanitizedData.source });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error capturing lead:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
