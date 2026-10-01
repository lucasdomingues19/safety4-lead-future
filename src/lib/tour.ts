// First-run onboarding tour, guided by Mia over the real LMS screens.
// The narration here is the single source of truth: captions are cut from it,
// the voiceover clips are generated from it, and Mia's HeyGen video follows it.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TourScreen = "dash" | "community" | "settings" | "support";

export interface TourStep {
  id: string;
  title: string;
  /** LMS screen to show while this step plays. */
  screen: TourScreen;
  /** `data-tour` anchors to spotlight, first one found wins; none = Mia centre stage. */
  targets: string[];
  /** Zoom the page around the spotlight (1 = none). */
  zoom?: number;
  /** Spoken by Mia and shown as captions, sentence by sentence. */
  narration: string;
}

export const STEPS: TourStep[] = [
  { id: "hello", title: "Meet Mia", screen: "dash", targets: [],
    narration: "Hi, I'm Mia, your guide here at SafetyTech Academy. Let me show you around. It only takes a couple of minutes." },
  { id: "menu", title: "Getting around", screen: "dash", targets: ["nav"],
    narration: "This menu takes you everywhere: your dashboard, the community, your settings and support. It's always here on the left." },
  { id: "continue", title: "Your next lesson", screen: "dash", targets: ["continue", "catalog"], zoom: 1.12,
    narration: "Your next lesson always waits for you at the top of your dashboard. One click, and you pick up exactly where you left off." },
  { id: "lessons", title: "Learning", screen: "dash", targets: ["tour-lesson", "my-courses", "catalog"], zoom: 1.12,
    narration: "Inside each course, lessons unlock in order. Watch the video or read the slides, then mark the lesson complete. We track what you actually watch, so skipping ahead won't count, and your progress is always saved." },
  { id: "certificate", title: "Quizzes & certificates", screen: "dash", targets: ["tour-certificate", "my-courses", "catalog"], zoom: 1.12,
    narration: "Short quizzes check your understanding along the way. Some courses end with a final assessment, and when you pass, you receive a verified digital certificate you can share on LinkedIn." },
  { id: "points", title: "Points & levels", screen: "dash", targets: ["progress"], zoom: 1.12,
    narration: "Every lesson, quiz and helpful post earns you points. Level up, keep your daily streak going, and collect badges as you learn." },
  { id: "leaderboard", title: "Leaderboard", screen: "dash", targets: ["leaderboard"], zoom: 1.1,
    narration: "This is where you see how you rank against other learners. Prefer to keep it private? You can hide yourself in settings." },
  { id: "community", title: "Community", screen: "community", targets: ["spaces"],
    narration: "Welcome to the community. SafetyTech Academy is open to every learner, and the Global Network is our members-only space." },
  { id: "post", title: "Join the conversation", screen: "community", targets: ["composer"], zoom: 1.1,
    narration: "Ask a question, share a win or a photo, and react to other people's posts. It's the best place to learn from your peers." },
  { id: "events", title: "Webinars & podcasts", screen: "community", targets: ["events-card", "events"], zoom: 1.1,
    narration: "This is where you can watch our live webinars, roundtables and podcast episodes. RSVP in one click, add them to your calendar, and join on Zoom or watch right here in the community. Replays are added afterwards." },
  { id: "settings", title: "Your settings", screen: "settings", targets: ["profile"], zoom: 1.08,
    narration: "In settings you can add your photo and check the name that's printed on your certificates. Your receipts and course access dates are here too." },
  { id: "support", title: "Help", screen: "support", targets: ["nav-support"],
    narration: "Need a hand? The support page has quick answers and a direct line to our team, and you can replay this tour from there anytime." },
  { id: "go", title: "Let's go", screen: "dash", targets: ["continue", "catalog"],
    narration: "That's it, you're all set. Let's start learning." },
];

export const sentences = (text: string) => text.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((s) => s.trim()) ?? [text];

/** Reading-pace fallback when a step has no voice clip. */
export const silentDurationMs = (s: TourStep) => Math.max(6000, Math.round((s.narration.split(/\s+/).length / 2.6) * 1000) + 1200);

// ---------- voice / video clips ----------
export const hashText = async (text: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).slice(0, 5).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const publicUrl = (path: string) => supabase.storage.from("tour-audio").getPublicUrl(path).data.publicUrl;

export interface StepMedia { audio?: string; video?: string }

/** Which steps have Mia's video (HeyGen) and/or a voice clip (ElevenLabs). Missing = captions only. */
export async function findMedia(): Promise<Record<string, StepMedia>> {
  const found: Record<string, StepMedia> = {};
  const exists = async (url: string, kind: string) => {
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      return res.ok && (res.headers.get("content-type") ?? "").includes(kind);
    } catch { return false; }
  };
  await Promise.all(STEPS.map(async (s) => {
    const h = await hashText(s.narration);
    const [video, audio] = await Promise.all([exists(publicUrl(`mia/${s.id}-${h}.mp4`), "video"), exists(publicUrl(`${s.id}-${h}.mp3`), "audio")]);
    found[s.id] = { ...(video ? { video: publicUrl(`mia/${s.id}-${h}.mp4`) } : {}), ...(audio ? { audio: publicUrl(`${s.id}-${h}.mp3`) } : {}) };
  }));
  return found;
}

export async function generateVoiceover(force = false) {
  const items = await Promise.all(STEPS.map(async (s) => ({ id: s.id, hash: await hashText(s.narration), text: s.narration })));
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

/** Records how far the learner got (shown in Admin > People). A finished tour is never downgraded by a later skipped replay. */
export async function markTourDone(userId: string, outcome: { completed: boolean; step: number }) {
  try { localStorage.setItem(LOCAL_KEY, "1"); } catch { /* private mode */ }
  const { data } = await supabase.from("profiles").select("tour_status").eq("id", userId).maybeSingle();
  if (data?.tour_status === "completed" && !outcome.completed) return;
  await supabase.from("profiles").update({
    tour_completed_at: new Date().toISOString(),
    tour_status: outcome.completed ? "completed" : "skipped",
    tour_last_step: outcome.step,
  }).eq("id", userId);
}

// ---------- tour mode for the screens underneath ----------
// Screens show labelled examples of anything Mia talks about that the
// learner doesn't have yet (no course yet, no certificate yet...).
const TOUR_EVENT = "mia-tour";
export const setTourActive = (on: boolean) => {
  document.documentElement.classList.toggle("mia-touring", on);
  window.dispatchEvent(new CustomEvent(TOUR_EVENT, { detail: on }));
};
export function useTourActive() {
  const [on, setOn] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("mia-touring"));
  useEffect(() => {
    const h = (e: Event) => setOn(!!(e as CustomEvent<boolean>).detail);
    window.addEventListener(TOUR_EVENT, h);
    return () => window.removeEventListener(TOUR_EVENT, h);
  }, []);
  return on;
}
