// "Ask Mia" — an AI tutor inside each lesson, grounded in that lesson's
// transcript and notes. Only enrolled learners (or admins) can ask about a
// lesson. The lesson context sits in a cached system block, so follow-up
// questions on the same lesson reuse it instead of paying for it again.
//
// POST { lessonId, messages: [{ role: "user" | "assistant", content }] }
//   -> streamed plain text (errors before streaming are JSON { error })
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, allow, requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

const INSTRUCTIONS = `You are Mia, the learning guide at SafetyTech Academy, helping an EHS (environment, health and safety) professional with the lesson they are studying right now.

How to answer:
- Base your answer on the lesson material below. When you use it, say so naturally ("In this lesson, Lucas explains…").
- If the lesson doesn't cover the question, say that briefly, then give a short, practical answer from general EHS and AI good practice, clearly marked as going beyond the lesson.
- Never invent facts about the course, its assessments, certification or SafetyTech Academy itself. For questions about access, payments or certificates, point them to hello@safetytech.academy.
- If they ask for quiz or assessment answers, help them reason it through instead of giving the answer.
- Be warm and concise: usually 2–5 short paragraphs or a short list. UK English. Use workplace examples (construction, energy, manufacturing, logistics) where they help.
- Plain text with light Markdown (bold, short lists). No headings.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let user;
  try { user = await requireUser(req); } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }
  if (!allow(`tutor:${user.id}`, 20, 10 * 60_000)) return json({ error: "You've asked a lot of questions in a short time — try again in a few minutes." }, 429);

  const body = await req.json().catch(() => ({}));
  const lessonId = String(body.lessonId ?? "");
  const history = Array.isArray(body.messages) ? body.messages : [];
  const turns = history
    .filter((m: { role?: string; content?: unknown }) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-10)
    .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!lessonId || !turns.length || turns[turns.length - 1].role !== "user") return json({ error: "Ask a question about this lesson." }, 400);
  while (turns.length && turns[0].role !== "user") turns.shift();

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: lesson } = await db.from("lessons").select("id, title, body, transcript, module_id").eq("id", lessonId).maybeSingle();
  if (!lesson) return json({ error: "Lesson not found" }, 404);
  const { data: mod } = await db.from("modules").select("id, title, course_id").eq("id", lesson.module_id).maybeSingle();
  const { data: course } = await db.from("courses").select("id, title").eq("id", mod?.course_id ?? "").maybeSingle();
  if (!mod || !course) return json({ error: "Lesson not found" }, 404);

  // Enrolled learners and admins only.
  const [{ data: enrol }, { data: admin }] = await Promise.all([
    db.from("enrollments").select("id, expires_at").eq("user_id", user.id).eq("course_id", course.id).eq("status", "active").maybeSingle(),
    db.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
  ]);
  const enrolled = !!enrol && (!enrol.expires_at || new Date(enrol.expires_at).getTime() > Date.now());
  if (!enrolled && !admin) return json({ error: "Enrol in this course to ask about its lessons." }, 403);

  const { data: siblings } = await db.from("lessons").select("title, position").eq("module_id", mod.id).order("position");
  const context = [
    `COURSE: ${course.title}`,
    `MODULE: ${mod.title}`,
    `LESSONS IN THIS MODULE: ${(siblings ?? []).map((s) => s.title).join(" · ")}`,
    `CURRENT LESSON: ${lesson.title}`,
    lesson.body ? `LESSON NOTES:\n${lesson.body}` : "",
    lesson.transcript ? `LESSON TRANSCRIPT:\n${lesson.transcript}` : "LESSON TRANSCRIPT: (none for this lesson)",
  ].filter(Boolean).join("\n\n");

  // Stream the answer as plain text so words appear as they're written.
  const stream = anthropic.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: [
      { type: "text", text: INSTRUCTIONS },
      { type: "text", text: context, cache_control: { type: "ephemeral" } },
    ],
    messages: turns,
  });
  const enc = new TextEncoder();
  const body$ = new ReadableStream({
    async start(controller) {
      let wrote = false;
      try {
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            controller.enqueue(enc.encode(ev.delta.text));
            wrote = true;
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(enc.encode(`${wrote ? "\n\n" : ""}I can't help with that one. Try asking about the lesson content, or email hello@safetytech.academy.`));
        } else if (!wrote) {
          controller.enqueue(enc.encode("Sorry — I couldn't put an answer together. Try rephrasing the question."));
        }
        console.log("[lesson-tutor]", { lesson: lesson.id, in: final.usage.input_tokens, cached: final.usage.cache_read_input_tokens, out: final.usage.output_tokens, stop: final.stop_reason });
      } catch (e) {
        const msg = e instanceof Anthropic.RateLimitError ? "Mia is very busy right now — try again in a minute." : "Mia couldn't finish that answer. Try again shortly.";
        console.error("[lesson-tutor] failed", e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e);
        controller.enqueue(enc.encode(`${wrote ? "\n\n" : ""}${msg}`));
      } finally {
        controller.close();
      }
    },
    cancel() { stream.abort(); },
  });
  return new Response(body$, { headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
});
