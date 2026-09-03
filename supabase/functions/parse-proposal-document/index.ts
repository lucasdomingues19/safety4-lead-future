const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { fileData, fileName } = body;

    if (!fileData) {
      return new Response(
        JSON.stringify({ error: "No file data provided" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 }
      );
    }

    // Determine media type
    let mediaType = "application/pdf";
    if (fileName.endsWith(".docx")) {
      mediaType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (fileName.endsWith(".doc")) {
      mediaType = "application/msword";
    }

    // Call Claude API with document
    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-5",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: fileData,
                },
              },
              {
                type: "text",
                text: `Extract proposal information from this document and return ONLY valid JSON (no markdown, no code blocks):
{
  "organisation": "company name",
  "contact_name": "contact name or null",
  "contact_email": "email or null",
  "intro_note": "introduction text",
  "sections": [
    {"title": "section title", "type": "text", "content": {"body": "text content"}},
    {"title": "section title", "type": "table", "content": {"headers": ["col1"], "rows": [["val1"]]}}
  ]
}`,
              },
            ],
          },
        ],
      }),
    });

    const aiData = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error("Claude API error:", aiData);
      return new Response(
        JSON.stringify({ error: `Claude API error: ${aiData.error?.message || aiResponse.statusText}` }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
      );
    }

    let responseText = aiData.content?.[0]?.text || "";

    if (!responseText) {
      return new Response(
        JSON.stringify({ error: "No response from Claude" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
      );
    }

    // Clean markdown formatting if present
    responseText = responseText.replace(/^```json\n?/, "").replace(/\n?```$/, "");

    // Parse JSON
    const parsed = JSON.parse(responseText);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
    );
  }
});
