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

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not set");
    }

    // Determine media type
    let mediaType = "application/pdf";
    if (fileName.endsWith(".docx")) {
      mediaType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (fileName.endsWith(".doc")) {
      mediaType = "application/msword";
    }

    console.log("Parsing document:", fileName, "media type:", mediaType);

    // Call Claude API with document using pdf_base64 format
    const requestBody = {
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
              text: `You are a proposal extraction expert. Extract information from this proposal document.

Return a JSON object with this exact structure:
{
  "organisation": "string",
  "contact_name": "string or null",
  "contact_email": "string or null",
  "intro_note": "string",
  "sections": [
    {
      "title": "string",
      "type": "text",
      "content": {"body": "string"}
    }
  ]
}

For sections: identify text blocks, tables, lists, pricing info, and ROI data.
Set type to: text, table, list, pricing_table, or roi_table

Return ONLY valid JSON, nothing else.`,
            },
          ],
        },
      ],
    };

    console.log("Calling Claude API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
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
