import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

// Generates a lesson transcript for free wherever possible:
// 1. YouTube videos: pulls YouTube's own auto-generated captions (no API
//    key, no cost).
// 2. Anything else (uploaded files on S3/Supabase, direct MP4 links):
//    ElevenLabs Scribe speech-to-text, which fetches the file itself from
//    the (signed) URL — no download into this function, so large videos work.
//    Uses the ELEVENLABS_API_KEY already set for the onboarding voiceover.
// 3. Fallback if ElevenLabs isn't configured: Groq's hosted Whisper
//    (needs a GROQ_API_KEY secret; downloads the file, so small files only).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

async function getYouTubeTranscript(videoId: string): Promise<string | null> {
  // The watch page embeds a JSON blob (ytInitialPlayerResponse) that lists
  // available caption tracks, including YouTube's auto-generated ones.
  const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SafetyTechAcademyBot/1.0)" },
  });
  if (!watchRes.ok) return null;
  const html = await watchRes.text();

  const match = html.match(/"captionTracks":(\[.*?\])/);
  if (!match) return null;

  let tracks: Array<{ baseUrl: string; languageCode: string; kind?: string }>;
  try {
    tracks = JSON.parse(match[1]);
  } catch {
    return null;
  }
  if (!tracks.length) return null;

  // Prefer an English track (manual over auto-generated), else the first available.
  const track =
    tracks.find((t) => t.languageCode?.startsWith("en") && t.kind !== "asr") ??
    tracks.find((t) => t.languageCode?.startsWith("en")) ??
    tracks[0];

  const captionRes = await fetch(track.baseUrl.replace(/\\u0026/g, "&"));
  if (!captionRes.ok) return null;
  const xml = await captionRes.text();

  const lines = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((m) =>
    decodeHtmlEntities(m[1].replace(/<[^>]+>/g, "")).trim(),
  );
  const transcript = lines.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  return transcript || null;
}

async function getElevenLabsTranscript(videoUrl: string): Promise<string | null> {
  const key = Deno.env.get("ELEVENLABS_API_KEY");
  if (!key) return null;
  const form = new FormData();
  form.append("model_id", "scribe_v1");
  form.append("cloud_storage_url", videoUrl);
  form.append("tag_audio_events", "false");
  form.append("diarize", "false");
  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`ElevenLabs transcription failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  const data = await res.json() as { text?: string };
  return data.text?.trim() || null;
}

async function getGroqTranscript(videoUrl: string): Promise<string | null> {
  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (!groqKey) {
    throw new Error(
      "No GROQ_API_KEY configured — required to transcribe non-YouTube video sources. " +
        "Get a free key at console.groq.com and set it as a Supabase secret.",
    );
  }

  const fileRes = await fetch(videoUrl);
  if (!fileRes.ok) throw new Error(`Could not download video file (${fileRes.status})`);
  const blob = await fileRes.blob();

  const form = new FormData();
  form.append("file", blob, "lesson-video");
  form.append("model", "whisper-large-v3");
  form.append("response_format", "text");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${groqKey}` },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Groq transcription failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  const text = await res.text();
  return text.trim() || null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin privileges required" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { videoUrl } = await req.json();
    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "videoUrl is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const youTubeId = extractYouTubeId(videoUrl);

    let transcript: string | null = null;
    let source: string;

    if (youTubeId) {
      transcript = await getYouTubeTranscript(youTubeId);
      source = "youtube_captions";
      if (!transcript) {
        return new Response(
          JSON.stringify({
            error:
              "Couldn't automatically pull a transcript for this YouTube video — YouTube's caption access has gotten harder to reach without a signed-in session, so this doesn't work for every video. For reliable transcription, upload the video file directly instead of linking YouTube, or paste the transcript in manually below.",
          }),
          { status: 422, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }
    } else {
      if (Deno.env.get("ELEVENLABS_API_KEY")) {
        transcript = await getElevenLabsTranscript(videoUrl);
        source = "elevenlabs_scribe";
      } else {
        transcript = await getGroqTranscript(videoUrl);
        source = "groq_whisper";
      }
      if (!transcript) {
        return new Response(JSON.stringify({ error: "Transcription returned no text" }), {
          status: 422, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    return new Response(JSON.stringify({ transcript, source }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("generate-transcript error:", error);
    return new Response(JSON.stringify({ error: String(error instanceof Error ? error.message : error) }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
