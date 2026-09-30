// First-run onboarding tour: the script, timing and voiceover lookups.
// The narration here is the single source of truth: captions are cut from it
// and the AI voiceover clips are generated from it (see tour-voiceover).
import { supabase } from "@/integrations/supabase/client";

export type SceneId = "welcome" | "dashboard" | "learning" | "assess" | "points" | "community" | "events" | "settings" | "go";

export interface Scene {
  id: SceneId;
  title: string;
  /** Spoken aloud and shown as captions, sentence by sentence. */
  narration: string;
  /** Minimum on-screen time (ms) so the animation can finish. */
  minMs: number;
}

export const SCENES: Scene[] = [
  { id: "welcome", title: "Welcome", minMs: 9000, narration: "Welcome to SafetyTech Academy. I'm your guide, and in the next couple of minutes I'll show you where everything lives, so you can start learning with confidence." },
  { id: "dashboard", title: "Your dashboard", minMs: 14000, narration: "This is your dashboard. Your next lesson is always front and centre, with one click to pick up exactly where you left off. Below it you'll find your courses, your progress, your level and your learning streak." },
  { id: "learning", title: "Learning", minMs: 16000, narration: "Inside a course, lessons unlock in order. Watch the video, or read the slides, then mark the lesson complete to move on. For videos we track what you actually watch, so skipping ahead won't count. Your progress is always saved." },
  { id: "assess", title: "Quizzes & certificates", minMs: 18000, narration: "After each module there's a short quiz. Pass them all, then take the final assessment. When you pass, you receive a verified digital certificate, signed and tamper-proof, that employers and clients can check. You can add it to LinkedIn in one click." },
  { id: "points", title: "Points & badges", minMs: 14000, narration: "Every lesson, quiz and contribution earns points. Climb from Observer to Leader, keep your daily streak alive, collect badges, and see how you rank on the leaderboard. It's optional, and you can hide yourself in settings at any time." },
  { id: "community", title: "Community", minMs: 16000, narration: "The community is where you learn together. SafetyTech Academy is open to every learner, and the Global Network is our members-only space. Ask questions, share photos and wins, react with emoji, and follow the topics you care about." },
  { id: "events", title: "Live events", minMs: 12000, narration: "Watch for live sessions with Lucas. RSVP with one click, add them to your calendar, and join on Zoom, or watch right here in the community. Missed one? The replay will be waiting." },
  { id: "settings", title: "Settings & support", minMs: 12000, narration: "In settings you can add a profile photo, update the name that appears on your certificates, change your password, and find your receipts and course access dates. If you ever need help, the support page has answers and a direct line to the team." },
  { id: "go", title: "Let's go", minMs: 8000, narration: "That's everything you need. Your first lesson is ready whenever you are. Let's get started." },
];

export const sentences = (text: string) => text.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((s) => s.trim()) ?? [text];

/** Reading-pace fallback when a scene has no voiceover clip. */
export const silentDurationMs = (s: Scene) => Math.max(s.minMs, Math.round((s.narration.split(/\s+/).length / 2.5) * 1000) + 1500);

// ---------- voiceover clips ----------
export const hashText = async (text: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).slice(0, 5).map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const audioUrl = (id: string, hash: string) => supabase.storage.from("tour-audio").getPublicUrl(`${id}-${hash}.mp3`).data.publicUrl;

/** Which scenes have a generated voiceover clip right now. */
export async function findVoiceover(): Promise<Record<string, string>> {
  const found: Record<string, string> = {};
  await Promise.all(SCENES.map(async (s) => {
    const url = audioUrl(s.id, await hashText(s.narration));
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (res.ok && (res.headers.get("content-type") ?? "").includes("audio")) found[s.id] = url;
    } catch { /* offline or blocked: captions only */ }
  }));
  return found;
}

export async function generateVoiceover(force = false) {
  const items = await Promise.all(SCENES.map(async (s) => ({ id: s.id, hash: await hashText(s.narration), text: s.narration })));
  const { data, error } = await supabase.functions.invoke("tour-voiceover", { body: { action: "generate", items, force } });
  if (data?.error) throw new Error(data.error);
  if (error) {
    const ctx = (error as { context?: Response }).context;
    const msg = ctx ? await ctx.json().then((j) => j?.error).catch(() => null) : null;
    throw new Error(msg || error.message);
  }
  return data.results as { id: string; ok: boolean; error?: string }[];
}

export async function voiceoverConfigured(): Promise<boolean> {
  const { data } = await supabase.functions.invoke("tour-voiceover", { body: { action: "status" } });
  return !!data?.configured;
}

// ---------- who has seen it ----------
const LOCAL_KEY = "lms-tour-done";
export const tourSeenLocally = () => { try { return localStorage.getItem(LOCAL_KEY) === "1"; } catch { return false; } };

export async function markTourDone(userId: string) {
  try { localStorage.setItem(LOCAL_KEY, "1"); } catch { /* private mode */ }
  await supabase.from("profiles").update({ tour_completed_at: new Date().toISOString() }).eq("id", userId);
}
