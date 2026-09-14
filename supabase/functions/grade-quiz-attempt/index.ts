import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface QuizQuestion {
  id: string;
  text: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: string[];
  correct_answer?: string;
  rubric?: string;
  position: number;
}

interface StudentAnswers {
  [questionId: string]: string;
}

interface GradingRequest {
  quiz_id: string;
  user_id: string;
  questions: QuizQuestion[];
  answers: StudentAnswers;
  pass_mark: number;
}

interface QuestionScore {
  question_id: string;
  score: number;
  max_score: number;
  feedback: string;
  correct: boolean;
}

// Initialize Supabase client with service role
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function gradeQuestion(
  question: QuizQuestion,
  studentAnswer: string,
): Promise<QuestionScore> {
  const maxScore = 100;

  // Multiple choice questions - check if answer matches
  if (question.type === "multiple_choice") {
    const correct = studentAnswer === question.correct_answer;
    return {
      question_id: question.id,
      score: correct ? maxScore : 0,
      max_score: maxScore,
      feedback: correct
        ? "Correct!"
        : `The correct answer is: ${question.correct_answer}`,
      correct,
    };
  }

  // True/False questions
  if (question.type === "true_false") {
    const correct = studentAnswer.toLowerCase() === question.correct_answer?.toLowerCase();
    return {
      question_id: question.id,
      score: correct ? maxScore : 0,
      max_score: maxScore,
      feedback: correct
        ? "Correct!"
        : `The correct answer is: ${question.correct_answer}`,
      correct,
    };
  }

  // Short answer and essay - use Claude for grading
  if (question.type === "short_answer" || question.type === "essay") {
    try {
      const gradingPrompt = `You are an expert educational assessor. Grade the following student answer to a quiz question.

Question: ${question.text}
${question.rubric ? `Rubric: ${question.rubric}` : ""}
Expected Answer: ${question.correct_answer || "Open-ended answer"}

Student's Answer: "${studentAnswer}"

Provide:
1. Score (0-100)
2. Brief feedback (1-2 sentences)

Format your response as JSON:
{
  "score": <number>,
  "feedback": "<feedback string>"
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: gradingPrompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseText =
        data.content?.[0]?.type === "text" ? data.content[0].text : "";

      // Parse JSON response from Claude
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const gradingResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 0, feedback: "Could not grade answer" };

      return {
        question_id: question.id,
        score: Math.min(Math.max(gradingResult.score || 0, 0), maxScore),
        max_score: maxScore,
        feedback: gradingResult.feedback || "Response received",
        correct: (gradingResult.score || 0) >= 70,
      };
    } catch (error) {
      console.error("Error grading with Claude:", error);
      return {
        question_id: question.id,
        score: 0,
        max_score: maxScore,
        feedback: "Could not grade this answer. Please try again.",
        correct: false,
      };
    }
  }

  return {
    question_id: question.id,
    score: 0,
    max_score: maxScore,
    feedback: "Unknown question type",
    correct: false,
  };
}

async function calculateFinalScore(
  questionScores: QuestionScore[],
): Promise<number> {
  if (questionScores.length === 0) return 0;
  const totalScore = questionScores.reduce((sum, q) => sum + q.score, 0);
  const totalMax = questionScores.reduce((sum, q) => sum + q.max_score, 0);
  return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const request: GradingRequest = await req.json();

    // Grade all questions
    const questionScores = await Promise.all(
      request.questions.map((question) =>
        gradeQuestion(question, request.answers[question.id] || ""),
      ),
    );

    // Calculate final score
    const finalScore = await calculateFinalScore(questionScores);
    const passed = finalScore >= request.pass_mark;

    // Store attempt in database
    const { error: insertError } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: request.user_id,
        quiz_id: request.quiz_id,
        score: finalScore,
        passed,
        answers: request.answers,
        submitted_at: new Date().toISOString(),
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        score: finalScore,
        passed,
        pass_mark: request.pass_mark,
        details: questionScores,
        message: passed
          ? `Great job! You scored ${finalScore}% and passed! 🎉`
          : `You scored ${finalScore}%. You need ${request.pass_mark}% to pass. Try again!`,
      }),
      {
        headers: { "content-type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Grading error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to grade quiz",
        details: String(error),
      }),
      {
        headers: { "content-type": "application/json" },
        status: 500,
      },
    );
  }
});
