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
      throw new Error("No file data provided");
    }

    // Determine media type
    let mediaType = "application/pdf";
    if (fileName.endsWith(".docx")) {
      mediaType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (fileName.endsWith(".doc")) {
      mediaType = "application/msword";
    }

    // Call Claude API with document
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
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
                text: `Extract the following information from this proposal document and return it as valid JSON:
{
  "organisation": "Company name",
  "contact_name": "Contact person name or null",
  "contact_email": "Contact email or null",
  "intro_note": "Opening paragraph or introduction text",
  "sections": [
    {
      "title": "Section title",
      "type": "text|table|list|pricing_table|roi_table",
      "content": {
        "body": "text content" (for text sections),
        "headers": ["col1", "col2"] (for tables),
        "rows": [["val1", "val2"]] (for tables),
        "items": ["item1", "item2"] (for lists),
        "tiers": [{"seats": "1-50", "price": 2000}] (for pricing),
        "data": {"participants": 60, "timePerWeek": 1, "hourlyRate": 75} (for ROI)
      }
    }
  ]
}

Extract all meaningful sections from the document. Be comprehensive. Return ONLY valid JSON, no markdown.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      throw new Error(`Claude API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("Claude returned error:", data.error);
      throw new Error(`Claude error: ${JSON.stringify(data.error)}`);
    }

    const content = data.content?.[0]?.text;

    if (!content) {
      console.error("No content in response:", JSON.stringify(data));
      throw new Error("No content extracted from document. Response: " + JSON.stringify(data));
    }

    // Clean JSON if it has markdown formatting
    let cleanJson = content.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const parsed = JSON.parse(cleanJson);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      }
    );
  }
});
