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
  position: number;
}

interface StudentAnswers {
  // question id -> the option TEXT the student selected
  [questionId: string]: string;
}

interface GradingRequest {
  quiz_id: string;
  user_id: string;
  answers: StudentAnswers;
  pass_threshold: number;
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
    feedback: correct ? "Correct!" : `The correct answer is: ${correctOption ?? "n/a"}`,
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
    const request: GradingRequest = await req.json();

    if (!request.quiz_id || !request.user_id) {
      return new Response(
        JSON.stringify({ error: "quiz_id and user_id are required" }),
        { status: 400, headers: { "content-type": "application/json", ...corsHeaders } },
      );
    }

    // Authoritative question set — fetched server-side, never trusted from client.
    const { data: questions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("id, quiz_id, prompt, options, correct_index, position")
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
    const passed = finalScore >= request.pass_threshold;

    const { error: insertError } = await supabase.from("quiz_attempts").insert({
      user_id: request.user_id,
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
        pass_threshold: request.pass_threshold,
        details: questionScores,
        message: passed
          ? `Great job! You scored ${finalScore}% and passed! 🎉`
          : `You scored ${finalScore}%. You need ${request.pass_threshold}% to pass. Try again!`,
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
