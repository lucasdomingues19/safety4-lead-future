import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

// Admin-only AI helpers for the course builder:
//   quiz     { module_id, count?, replace? } -> writes multiple-choice questions
//            generated from the module's lesson transcripts/overviews into the
//            module quiz (creating the quiz if needed)
//   overview { lesson_id }                  -> returns a Markdown lesson
//            overview written from the lesson transcript
//   explain  { quiz_id, overwrite? }        -> drafts a short "why" explanation
//            for each question (from the module transcripts) and saves it to
//            questions that don't have one yet (or all, with overwrite)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "claude-sonnet-5-5";
const MAX_SOURCE_CHARS = 60000;

const callClaude = async (body: Record<string, unknown>) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`AI request failed (${res.status}): ${data?.error?.message ?? "unknown error"}`);
  return data as { content: Array<{ type: string; text?: string; name?: string; input?: unknown }> };
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: userData } = await db.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData?.user) return json({ error: "Unauthorized" }, 401);
    const { data: role } = await db.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Forbidden" }, 403);

    const body = await req.json() as { action?: string; module_id?: string; lesson_id?: string; quiz_id?: string; count?: number; replace?: boolean; overwrite?: boolean };

    // ---------- quiz ----------
    if (body.action === "quiz") {
      const count = Math.min(Math.max(Number(body.count) || 5, 1), 15);
      const { data: mod } = await db.from("modules").select("id, title, course_id").eq("id", body.module_id ?? "").maybeSingle();
      if (!mod) return json({ error: "Module not found" }, 404);
      const { data: course } = await db.from("courses").select("title").eq("id", mod.course_id).maybeSingle();
      const { data: lessons } = await db.from("lessons").select("title, body, transcript, position").eq("module_id", mod.id).order("position");

      let source = (lessons ?? [])
        .map((l) => [`## Lesson: ${l.title}`, l.body ?? "", l.transcript ? `Transcript:\n${l.transcript}` : ""].filter(Boolean).join("\n\n"))
        .join("\n\n");
      const substantive = source.replace(/## Lesson:.*$/gm, "").trim();
      if (substantive.length < 200) {
        return json({ error: "Not enough lesson content to write a quiz from. Add a transcript or overview to this module's lessons first." }, 400);
      }
      if (source.length > MAX_SOURCE_CHARS) source = source.slice(0, MAX_SOURCE_CHARS);

      const { data: existingQuiz } = await db.from("quizzes").select("id").eq("module_id", mod.id).maybeSingle();
      const { data: existingQs } = existingQuiz
        ? await db.from("quiz_questions").select("prompt, position").eq("quiz_id", existingQuiz.id).order("position")
        : { data: [] as { prompt: string; position: number }[] };
      const avoid = body.replace ? [] : (existingQs ?? []).map((q) => q.prompt);

      const ai = await callClaude({
        max_tokens: 4000,
        system:
          "You write assessment questions for professional health & safety training (IOSH-approved CPD courses). " +
          "Questions test understanding and application of the lesson material, not trivia or wording recall. " +
          "Each question has exactly 4 plausible options and one unambiguously correct answer that is supported by the source material. " +
          "Vary which option position is correct. Use British English. Never reference 'the video' or 'the transcript'.",
        tools: [{
          name: "save_quiz",
          description: "Save the generated multiple-choice questions.",
          input_schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    prompt: { type: "string" },
                    options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                    correct_index: { type: "integer", minimum: 0, maximum: 3 },
                  },
                  required: ["prompt", "options", "correct_index"],
                },
              },
            },
            required: ["questions"],
          },
        }],
        tool_choice: { type: "tool", name: "save_quiz" },
        messages: [{
          role: "user",
          content:
            `Course: ${course?.title ?? ""}\nModule: ${mod.title}\n\nWrite ${count} multiple-choice questions for this module's quiz, based only on the material below.` +
            (avoid.length ? `\n\nDo not repeat or closely paraphrase these existing questions:\n- ${avoid.join("\n- ")}` : "") +
            `\n\n<material>\n${source}\n</material>`,
        }],
      });

      const tool = ai.content.find((c) => c.type === "tool_use" && c.name === "save_quiz");
      const questions = ((tool?.input as { questions?: unknown[] })?.questions ?? []) as { prompt: string; options: string[]; correct_index: number }[];
      const valid = questions.filter((q) =>
        typeof q.prompt === "string" && q.prompt.trim() &&
        Array.isArray(q.options) && q.options.length >= 2 && q.options.every((o) => typeof o === "string" && o.trim()) &&
        Number.isInteger(q.correct_index) && q.correct_index >= 0 && q.correct_index < q.options.length,
      );
      if (!valid.length) return json({ error: "The AI didn't return usable questions. Try again." }, 502);

      let quizId = existingQuiz?.id as string | undefined;
      if (!quizId) {
        const { data: created, error } = await db.from("quizzes").insert({ module_id: mod.id, title: `${mod.title} quiz`, pass_threshold: 70 }).select("id").single();
        if (error || !created) return json({ error: "Could not create the quiz" }, 500);
        quizId = created.id;
      } else if (body.replace) {
        await db.from("quiz_questions").delete().eq("quiz_id", quizId);
      }
      const start = body.replace ? 0 : (existingQs ?? []).length;
      const { error: insErr } = await db.from("quiz_questions").insert(
        valid.map((q, i) => ({ quiz_id: quizId, prompt: q.prompt.trim(), options: q.options.map((o) => o.trim()), correct_index: q.correct_index, position: start + i })),
      );
      if (insErr) return json({ error: `Could not save questions: ${insErr.message}` }, 500);
      return json({ quiz_id: quizId, added: valid.length });
    }

    // ---------- overview ----------
    if (body.action === "overview") {
      const { data: lesson } = await db.from("lessons").select("title, transcript").eq("id", body.lesson_id ?? "").maybeSingle();
      if (!lesson) return json({ error: "Lesson not found" }, 404);
      if (!lesson.transcript || lesson.transcript.trim().length < 200) {
        return json({ error: "Add the lesson transcript first — the overview is written from it." }, 400);
      }
      const ai = await callClaude({
        max_tokens: 1500,
        system:
          "You write concise lesson overviews for a professional health & safety e-learning platform. " +
          "Output Markdown only: a 1–2 sentence introduction, then a '### Key takeaways' section with 3–6 bullet points, " +
          "then optionally a '### Put it into practice' section with 1–3 bullets. British English. No preamble, no headings above the intro.",
        messages: [{ role: "user", content: `Lesson title: ${lesson.title}\n\n<transcript>\n${lesson.transcript.slice(0, MAX_SOURCE_CHARS)}\n</transcript>` }],
      });
      const text = ai.content.filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
      if (!text) return json({ error: "The AI returned an empty overview. Try again." }, 502);
      return json({ overview: text });
    }

    // ---------- explain ----------
    if (body.action === "explain") {
      const { data: quiz } = await db.from("quizzes").select("id, module_id").eq("id", body.quiz_id ?? "").maybeSingle();
      if (!quiz) return json({ error: "Quiz not found" }, 404);
      const { data: qs } = await db.from("quiz_questions").select("id, prompt, options, correct_index, explanation").eq("quiz_id", quiz.id).order("position");
      const todo = (qs ?? []).filter((q) => body.overwrite || !q.explanation?.trim());
      if (!todo.length) return json({ updated: 0, total: qs?.length ?? 0 });
      const { data: lessons } = await db.from("lessons").select("title, body, transcript").eq("module_id", quiz.module_id).order("position");
      const source = (lessons ?? []).map((l) => `## ${l.title}\n${l.transcript || l.body || ""}`).join("\n\n").slice(0, MAX_SOURCE_CHARS);
      const list = todo.map((q) => ({ id: q.id, question: q.prompt, options: q.options, correct: (q.options as string[])[q.correct_index] }));
      const ai = await callClaude({
        max_tokens: 6000,
        system:
          "You write answer explanations for quiz questions on an IOSH-approved health & safety e-learning course. " +
          "For each question, write 1–2 sentences (max 45 words) explaining the underlying idea, grounded in the module material, so a learner who got it wrong understands why. " +
          "Do not quote the answer option, name an option letter, or start with 'The correct answer is'. British English. Plain text.",
        messages: [{ role: "user", content: `<module_material>\n${source}\n</module_material>\n\n<questions>\n${JSON.stringify(list)}\n</questions>` }],
        output_config: { format: { type: "json_schema", schema: {
          type: "object", additionalProperties: false, required: ["explanations"],
          properties: { explanations: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "explanation"], properties: { id: { type: "string" }, explanation: { type: "string" } } } } },
        } } },
      });
      const text = ai.content.filter((c) => c.type === "text").map((c) => c.text).join("");
      let parsed: { explanations: { id: string; explanation: string }[] };
      try { parsed = JSON.parse(text); } catch { return json({ error: "The AI returned an unreadable answer. Try again." }, 502); }
      let updated = 0;
      for (const e of parsed.explanations ?? []) {
        if (!todo.some((q) => q.id === e.id) || !e.explanation?.trim()) continue;
        const { error } = await db.from("quiz_questions").update({ explanation: e.explanation.trim().slice(0, 600) }).eq("id", e.id);
        if (!error) updated++;
      }
      return json({ updated, total: qs?.length ?? 0 });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("lms-ai error", err);
    return json({ error: err instanceof Error ? err.message : "Internal error" }, 500);
  }
});
