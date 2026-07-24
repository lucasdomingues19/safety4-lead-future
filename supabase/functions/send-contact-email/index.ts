import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// In-memory IP rate limiting: max 3 submissions per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 3;

const getClientIdentifier = (req: Request): string => {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
};

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const data = rateLimitMap.get(identifier);
  if (!data || now > data.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (data.count >= MAX_REQUESTS_PER_WINDOW) return false;
  data.count++;
  return true;
};

const isValidEmail = (email: string): boolean =>
  typeof email === "string" &&
  email.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  inquiryType: string;
  message: string;
}

const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();
    console.log("Received contact form submission:", { email: formData.email, inquiryType: formData.inquiryType });

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    if (!isValidEmail(formData.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Rate limit by source IP (anti-spam / quota protection)
    const identifier = getClientIdentifier(req);
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again in a minute." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }


    // Send email to hello@safetyacademy.tech
    console.log('Attempting to send email with Resend...');
    const emailResponse = await resend.emails.send({
      from: "SafetyTech Academy <noreply@safetyacademy.tech>",
      to: ["hello@safetyacademy.tech"],
      replyTo: formData.email,
      subject: `New Contact Form Submission - ${escapeHtml(formData.inquiryType)}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${escapeHtml(formData.firstName)} ${escapeHtml(formData.lastName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(formData.email)}</p>
        ${formData.phone ? `<p><strong>Phone:</strong> ${escapeHtml(formData.phone)}</p>` : ''}
        <p><strong>Role:</strong> ${escapeHtml(formData.role)}</p>
        <p><strong>Inquiry Type:</strong> ${escapeHtml(formData.inquiryType)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(formData.message).replace(/\n/g, '<br>')}</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};
serve(handler);
