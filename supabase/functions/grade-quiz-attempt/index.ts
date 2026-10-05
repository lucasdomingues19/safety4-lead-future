import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Grades a multiple-choice quiz attempt. Correct answers are always looked
// up server-side from quiz_questions by quiz_id — never trusted from the
// request body — so a tampered client request can't force a pass.

interface DbQuestion {
  id: string;
  quiz_id: string;
  prompt: string;
  options: string[];
  correct_index: number;
  explanation?: string | null;
  position: number;
}

interface StudentAnswers {
  // question id -> the option TEXT the student selected
  [questionId: string]: string;
}

interface GradingRequest {
  quiz_id: string;
  answers: StudentAnswers;
}

interface QuestionScore {
  question_id: string;
  score: number;
  max_score: number;
  feedback: string;
  correct: boolean;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function gradeQuestion(question: DbQuestion, studentAnswer: string): QuestionScore {
  const correctOption = question.options?.[question.correct_index];
  const correct = studentAnswer === correctOption;
  return {
    question_id: question.id,
    score: correct ? 100 : 0,
    max_score: 100,
    feedback: correct ? "Correct!" : "Incorrect",
    correct,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Who is submitting comes from the JWT, never the body.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json", ...corsHeaders } });
    }
    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const userId = userData?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json", ...corsHeaders } });
    }

    const request: GradingRequest = await req.json();
    if (!request.quiz_id || typeof request.answers !== "object" || request.answers === null) {
      return new Response(JSON.stringify({ error: "quiz_id and answers are required" }), { status: 400, headers: { "content-type": "application/json", ...corsHeaders } });
    }

    // Pass mark and course come from the database, never the body.
    const { data: quiz } = await supabase.from("quizzes").select("id, module_id, pass_threshold").eq("id", request.quiz_id).maybeSingle();
    if (!quiz) {
      return new Response(JSON.stringify({ error: "Quiz not found" }), { status: 404, headers: { "content-type": "application/json", ...corsHeaders } });
    }
    const { data: mod } = await supabase.from("modules").select("course_id").eq("id", quiz.module_id).maybeSingle();
    const { data: enrolment } = await supabase
      .from("enrollments")
      .select("status, expires_at")
      .eq("user_id", userId)
      .eq("course_id", mod?.course_id ?? "")
      .maybeSingle();
    const active = enrolment && enrolment.status === "active" && (!enrolment.expires_at || new Date(enrolment.expires_at) > new Date());
    if (!active) {
      return new Response(JSON.stringify({ error: "Not enrolled in this course" }), { status: 403, headers: { "content-type": "application/json", ...corsHeaders } });
    }
    // The quiz unlocks only once every required lesson in its module is complete.
    const { data: modLessons } = await supabase.from("lessons").select("id").eq("module_id", quiz.module_id).neq("enforce_progress", false);
    const requiredIds = (modLessons ?? []).map((l) => l.id);
    if (requiredIds.length) {
      const { data: doneRows } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).eq("is_completed", true).in("lesson_id", requiredIds);
      if ((doneRows ?? []).length < requiredIds.length) {
        return new Response(JSON.stringify({ error: "Complete every lesson in this module before taking the quiz" }), { status: 403, headers: { "content-type": "application/json", ...corsHeaders } });
      }
    }

    const passThreshold = quiz.pass_threshold ?? 70;

    // Authoritative question set — fetched server-side, never trusted from client.
    const { data: questions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("id, quiz_id, prompt, options, correct_index, position, explanation")
      .eq("quiz_id", request.quiz_id)
      .order("position");

    if (questionsError || !questions || questions.length === 0) {
      return new Response(
        JSON.stringify({ error: "Quiz has no questions" }),
        { status: 404, headers: { "content-type": "application/json", ...corsHeaders } },
      );
    }

    const questionScores = questions.map((q: DbQuestion) =>
      gradeQuestion(q, request.answers[q.id] ?? ""),
    );

    const totalScore = questionScores.reduce((sum, q) => sum + q.score, 0);
    const totalMax = questionScores.reduce((sum, q) => sum + q.max_score, 0);
    const finalScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    const passed = finalScore >= passThreshold;

    const { error: insertError } = await supabase.from("quiz_attempts").insert({
      user_id: userId,
      quiz_id: request.quiz_id,
      score: finalScore,
      passed,
      answers: request.answers,
      attempted_at: new Date().toISOString(),
    });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        score: finalScore,
        passed,
        pass_threshold: passThreshold,
        // Explanations always; the correct option only once they've passed, so a
        // failed attempt teaches the idea without handing over the answer key.
        details: questionScores.map((d: QuestionScore) => {
          const q = questions.find((x: DbQuestion) => x.id === d.question_id);
          return { ...d, explanation: q?.explanation ?? null, correct_answer: passed ? q?.options?.[q.correct_index] ?? null : null };
        }),
        message: passed
          ? `Great job! You scored ${finalScore}% and passed! 🎉`
          : `You scored ${finalScore}%. You need ${passThreshold}% to pass. Try again!`,
      }),
      { headers: { "content-type": "application/json", ...corsHeaders }, status: 200 },
    );
  } catch (error) {
    console.error("Grading error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to grade quiz", details: String(error) }),
      { headers: { "content-type": "application/json", ...corsHeaders }, status: 500 },
    );
  }
});
