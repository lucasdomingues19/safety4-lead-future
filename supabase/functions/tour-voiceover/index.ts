import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { requireAdmin, AuthError } from "../_shared/auth.ts";

// Admin-only: turns the onboarding-tour narration into short MP3 clips with
// ElevenLabs and stores them in the public `tour-audio` bucket, one per scene.
// Clips are generated once and cached by a hash of the script text, so
// learners never trigger a paid call.
//   status   -> { configured }
//   generate -> { items: [{ id, hash, text }], force? }  -> { results: [{ id, ok, error? }] }

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json", ...cors } });

// A friendly stock voice; set ELEVENLABS_VOICE_ID to use your own (or a clone of yours).
const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    await requireAdmin(req);
    const key = Deno.env.get("ELEVENLABS_API_KEY");
    const body = await req.json().catch(() => ({})) as { action?: string; items?: { id: string; hash: string; text: string }[]; force?: boolean };

    if (body.action === "status") return json({ configured: !!key });
    if (body.action !== "generate") return json({ error: "Unknown action" }, 400);
    if (!key) return json({ error: "Voiceover isn't connected yet — add the ELEVENLABS_API_KEY secret first." }, 412);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const voice = Deno.env.get("ELEVENLABS_VOICE_ID") || DEFAULT_VOICE;
    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const item of (body.items ?? []).slice(0, 20)) {
      if (!/^[a-z0-9-]{1,40}$/.test(item.id) || !/^[a-f0-9]{10}$/.test(item.hash) || !item.text || item.text.length > 1500) {
        results.push({ id: item.id, ok: false, error: "Invalid item" });
        continue;
      }
      const path = `${item.id}-${item.hash}.mp3`;
      if (!body.force) {
        const { data: existing } = await db.storage.from("tour-audio").list("", { search: path, limit: 1 });
        if (existing?.some((f) => f.name === path)) { results.push({ id: item.id, ok: true }); continue; }
      }
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({
          text: item.text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        results.push({ id: item.id, ok: false, error: err?.detail?.message ?? `ElevenLabs error ${res.status}` });
        continue;
      }
      const { error } = await db.storage.from("tour-audio").upload(path, new Uint8Array(await res.arrayBuffer()), { contentType: "audio/mpeg", upsert: true, cacheControl: "3600" });
      results.push({ id: item.id, ok: !error, ...(error ? { error: error.message } : {}) });
    }
    return json({ results });
  } catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status);
    console.error("tour-voiceover", e);
    return json({ error: "Could not generate the voiceover" }, 500);
  }
});
