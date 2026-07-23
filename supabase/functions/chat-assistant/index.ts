import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are the Safety 4.0 Academy AI assistant. You help visitors on safetyacademy.tech understand our courses, pricing, curriculum, and how to enrol. Be concise, warm, and professional. Use British English.

## About Safety 4.0 Academy
The world's first IOSH-approved and CPD-accredited Safety 4.0 programme. We train senior EHS professionals (Managers, Heads of Safety, Directors, VPs, Consultants) on digital safety leadership — AI, IoT, data analytics, predictive analytics and smart tech for workplace safety. Founder: Lucas Domingues.

## Three offerings

**1. IOSH-approved Safety 4.0 (eLearning) — £497** (was £697)
- Self-paced online, 8 hours of content, 60+ video lessons
- 10 core modules, interactive assessments, case studies
- 90 days to complete, lifetime platform access
- IOSH & CPD certification, email support
- Best for: individuals

**2. Safety 4.0 Accelerator (Live Cohort) — £1,997 +VAT** (was £2,497)
- 6-week live cohort with Lucas Domingues
- 7 live sessions + everything in eLearning
- Peer group of 10-15 senior EHS professionals
- Group projects, direct expert access
- ~3-4 hours/week commitment (recorded if you miss)
- Next cohort: 2nd Sept – 14th Oct 2026 (monthly cohorts)
- Employer PO/invoice billing supported
- Best for: individuals wanting live guidance + network

**3. AI Fundamentals in EHS — £72** (was £97, founding price, first 100 spots only)
- Focused primer on AI for EHS professionals
- Enrol: https://learning.safetyacademy.tech/offers/osRfeBFj/checkout

**4. In-Company Training**
- Customised for your organisation and sector
- Flexible scheduling, sector-specific case studies
- Group discounts for 5+ employees
- Requires a 30-min discovery call → tailored proposal in 48h

## Curriculum highlights (Safety 4.0 core)
Digital transformation for EHS, AI & machine learning for safety, IoT & connected worker, predictive analytics, data-driven decision making, SafetyTech deployment, change leadership, ROI measurement.

## Key facts
- IOSH & CPD approved / accredited
- 14-day money-back guarantee
- 1,000+ HSE professionals trained
- Complements (not replaces) NEBOSH/IOSH qualifications — covers the digital/AI layer they don't
- Global recognition

## Escalation
If the visitor asks something you cannot answer confidently (custom pricing, specific enrolment questions, refunds, complex in-company scoping, personal advice, or asks to speak to a human/sales/Lucas), suggest they message the team on WhatsApp — reply naturally and end with: "You can chat directly with our team on WhatsApp for this — tap the WhatsApp button below." Do NOT invent facts. Never quote prices, dates or terms not listed above.

Keep replies short (2-4 short paragraphs max). Use bullet points for lists. Always end by asking a helpful follow-up question when appropriate.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { session_id, message, page_url } = await req.json();

    if (!session_id || typeof session_id !== "string" || session_id.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid session_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find or create conversation
    let { data: convo } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    if (!convo) {
      const { data: created, error: createErr } = await supabase
        .from("chat_conversations")
        .insert({
          session_id,
          page_url: page_url?.slice(0, 500) ?? null,
          user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
        })
        .select("id")
        .single();
      if (createErr) throw createErr;
      convo = created;
    }

    // Load recent history (last 20 messages)
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convo!.id)
      .order("created_at", { ascending: true })
      .limit(20);

    // Save user message
    await supabase.from("chat_messages").insert({
      conversation_id: convo!.id,
      role: "user",
      content: message,
    });

    // Call Lovable AI Gateway
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY")!,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...(history ?? []),
          { role: "user", content: message },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI Gateway error:", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Busy right now. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI service unavailable. Please contact us on WhatsApp." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await aiRes.json();
    const reply = aiData.choices?.[0]?.message?.content ?? "Sorry, I didn't catch that. Could you rephrase?";

    // Check for escalation signal
    const escalated = /whatsapp button below/i.test(reply);

    // Save assistant reply + update convo
    await supabase.from("chat_messages").insert({
      conversation_id: convo!.id,
      role: "assistant",
      content: reply,
    });
    await supabase
      .from("chat_conversations")
      .update({ last_message_at: new Date().toISOString(), ...(escalated ? { escalated: true } : {}) })
      .eq("id", convo!.id);

    return new Response(JSON.stringify({ reply, escalated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-assistant error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again or message us on WhatsApp." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
