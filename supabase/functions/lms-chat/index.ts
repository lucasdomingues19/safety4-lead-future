import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  courseContext?: {
    courseId: string;
    courseName: string;
  };
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: ChatRequest = await req.json();

    // Build system context
    const systemPrompt = `You are SafetyTech Academy's AI Learning Assistant powered by Claude. You help students and staff with:
- Course navigation and content questions
- Learning paths and recommendations
- Account and enrollment support
- AI, EHS, and Safety 4.0 expertise questions
- Technical support for the learning platform

User Role: ${body.userRole || "student"}
${body.courseContext ? `Current Course: ${body.courseContext.courseName}` : ""}

Be helpful, professional, and encouraging. Keep responses concise but informative. If asked about billing or refunds, direct them to support@safetytech.com.`;

    // Build messages array
    const messages: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [
      ...(body.conversationHistory || []),
      {
        role: "user",
        content: body.message,
      },
    ];

    // Call Claude API
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage =
      data.content[0].type === "text" ? data.content[0].text : "";

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
