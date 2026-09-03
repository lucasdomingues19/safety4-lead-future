const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BLOG_GENERATION_PROMPT = `You are an expert technical writer for SafetyTech Academy. Your task is to write a compelling, fact-based blog post for EHS (Environmental, Health & Safety) professionals.

## Critical Requirements
- Write ONLY about verifiable facts, real data, industry standards, and established best practices
- Do NOT fabricate statistics, case studies, or claims
- Cite real frameworks, regulations, or standards where relevant (e.g., ISO standards, OSHA, HSE guidance)
- Target audience: EHS Directors, VP Safety, Chief Safety Officers, Sustainability Leaders
- Focus areas: AI in safety, digital transformation, safety leadership, emerging technologies in EHS
- Write in British English
- Format: Markdown with clear sections (use ## for headings)

## Structure
1. **Hook/Opening** — Start with a relevant question, statistic, or insight that resonates with senior EHS leaders
2. **The Challenge** — Describe a real problem or gap EHS teams face
3. **Key Insights** — 2-3 sections exploring solutions, frameworks, or best practices (cite real sources where possible)
4. **Practical Takeaway** — Actionable advice EHS leaders can implement
5. **Call to action** — Subtly invite engagement (webinar, course, community) without being salesy

## Tone
- Professional, authoritative, thought-leadership
- Avoid hype or exaggeration
- Use real examples (named companies or sectors are OK if factually accurate)
- Respect the reader's expertise — they know their industry

## Guardrails
- Do NOT claim SafetyTech Academy courses are endorsed by regulators (only IOSH-approved Safety 4.0 eLearning course is certified)
- Do NOT invent case study results or customer outcomes
- If you're unsure about a fact, indicate uncertainty or avoid the claim
- Do NOT encourage unsafe practices or contradict established safety standards

Generate a well-researched, engaging blog post article (800-1500 words). Use Markdown formatting.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, category = "AI in EHS" } = await req.json();

    if (!title || typeof title !== "string" || title.trim().length === 0 || title.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid title" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Anthropic API with Opus 5
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-5",
        max_tokens: 3000,
        system: BLOG_GENERATION_PROMPT,
        messages: [
          {
            role: "user",
            content: `Write a blog post titled: "${title}"\n\nCategory: ${category}\n\nEnsure the content is factual, well-researched, and grounded in real industry knowledge.`,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Anthropic API error:", aiRes.status, errText);
      return new Response(
        JSON.stringify({
          error:
            aiRes.status === 401
              ? "API key invalid"
              : aiRes.status === 429
                ? "Rate limited. Please try again in a moment."
                : `AI service error: ${aiRes.status}`,
        }),
        { status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiData = await aiRes.json();
    console.log("Claude response model:", aiData.model, "stop_reason:", aiData.stop_reason);

    // Extract text content from response (handle both regular text and thinking blocks)
    let content = "";
    if (aiData.content && Array.isArray(aiData.content)) {
      for (const block of aiData.content) {
        if (block.type === "text" && block.text) {
          content = block.text;
          break;
        }
      }
    }

    if (!content) {
      console.error("No text content in response:", aiData);
      return new Response(
        JSON.stringify({ error: "Claude did not generate text output", debug: { stop_reason: aiData.stop_reason, content_types: aiData.content?.map((c: any) => c.type) } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog-content error:", e);
    return new Response(JSON.stringify({ error: "Generation failed. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
