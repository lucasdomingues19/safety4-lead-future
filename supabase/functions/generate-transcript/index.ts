import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { videoUrl, lessonId } = await req.json();

  try {
    // Call OpenAI Whisper API (requires OPENAI_API_KEY env var)
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    // For now, return placeholder - integrate Whisper when ready
    const transcript = `[Transcript for ${lessonId}]\n\nThis is where the AI-generated transcript from your video will appear. The system will use OpenAI's Whisper API to automatically generate accurate transcripts from your uploaded videos.`;

    return new Response(
      JSON.stringify({ transcript }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
