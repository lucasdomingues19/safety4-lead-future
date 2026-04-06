import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Safety 4.0 Academy AI assistant. You help visitors learn about the academy's courses, pricing, and services. Be friendly, concise, and professional. Use bullet points for lists.

## About Safety 4.0 Academy
Safety 4.0 Academy is the world's first IOSH-approved and CPD-accredited training programme focused on digital safety leadership. It integrates technologies like AI, IoT, and data analytics into workplace safety management, using predictive analytics and smart technologies to prevent incidents before they occur.

Founded by Lucas Domingues, a senior safety professional with 18+ years of experience across energy, construction, and mining sectors.

## Courses & Pricing

### 1. eLearning (Self-Paced) — £497 (was £697)
- IOSH & CPD certification
- 10 core modules, 60+ video lessons
- Downloadable resources & interactive assessments
- Case studies
- 12-month access to materials
- Email support & mobile app
- Typically takes ~8 hours to complete

### 2. Safety 4.0 Accelerator (Live Cohort) — £997 +VAT (was £1,497)
- Everything in eLearning PLUS:
- 4-week live cohort programme (next: 5th May – 2nd June 2026)
- 5 live sessions led by Lucas Domingues
- Peer cohort of 10–15 professionals
- Group projects & discussions
- Live Q&A sessions
- Certificate of completion
- Employer PO/invoice billing supported
- 3–4 hours per week commitment

### 3. In-Company Training — Custom pricing
- Tailored for organisations (5+ employees)
- Core IOSH-approved curriculum with customised live sessions
- Sector-specific case studies (construction, manufacturing, energy, logistics)
- Flexible scheduling
- Book a 30-min discovery call for a free proposal

## Target Audience
Senior EHS professionals: Managers, Heads of Safety, Directors, VPs, Regional/Global Leads, and Consultants. No technical skills required — just basic computer literacy and safety knowledge.

## Key Differentiators
- IOSH & CPD certified
- Covers AI, IoT, data analytics, predictive safety
- Complements existing NEBOSH/IOSH qualifications
- 14-day money-back guarantee
- Graduates join Safety 4.0 Leaders Network (lifetime access)

## Important Links
- eLearning enrolment: https://safetyacademy.tech/elearning
- Accelerator cohort: https://safetyacademy.tech/accelerator
- In-Company training: https://safetyacademy.tech/in-company
- Free Scorecard assessment: https://safetyacademy.tech/scorecard
- FAQ: https://safetyacademy.tech/faq
- Contact: https://safetyacademy.tech/contact
- Book a call with Lucas: https://scheduler.zoom.us/lucas-domingues/30-mins-with-lucas-safety-4-0-academy

## Rules
- Only answer questions related to Safety 4.0 Academy, workplace safety, and digital safety leadership.
- If someone asks something you cannot answer or that requires personal attention, suggest they speak with Lucas directly and provide the Zoom scheduler link.
- Keep responses short (2-4 sentences max unless listing details).
- Use markdown formatting for clarity.
- Always be encouraging about their safety leadership journey.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm getting too many questions right now. Please try again in a moment!" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "The AI assistant is temporarily unavailable. Please contact us directly." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI assistant error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("academy-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
