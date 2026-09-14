import { supabase } from "@/integrations/supabase/client";

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  text: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: string[];
  correct_answer?: string;
  rubric?: string;
  position: number;
}

export interface Quiz {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  pass_mark: number;
  allow_retakes: boolean;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  submitted_at: string;
  created_at: string;
}

export interface GradingResult {
  score: number;
  passed: boolean;
  pass_mark: number;
  details: Array<{
    question_id: string;
    score: number;
    max_score: number;
    feedback: string;
    correct: boolean;
  }>;
  message: string;
}

export async function getQuiz(quizId: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching quiz:", error);
    return null;
  }

  return data as Quiz;
}

export async function getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position");

  if (error) {
    console.error("Error fetching quiz questions:", error);
    return [];
  }

  return (data || []) as QuizQuestion[];
}

export async function getUserQuizAttempts(
  userId: string,
  quizId: string,
): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Error fetching quiz attempts:", error);
    return [];
  }

  return (data || []) as QuizAttempt[];
}

export async function getLatestQuizAttempt(
  userId: string,
  quizId: string,
): Promise<QuizAttempt | null> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching latest attempt:", error);
    return null;
  }

  return data as QuizAttempt | null;
}

export async function submitQuizAttempt(
  quizId: string,
  userId: string,
  questions: QuizQuestion[],
  answers: Record<string, string>,
  passMark: number,
): Promise<GradingResult> {
  const { data, error } = await supabase.functions.invoke(
    "grade-quiz-attempt",
    {
      body: {
        quiz_id: quizId,
        user_id: userId,
        questions,
        answers,
        pass_mark: passMark,
      },
    },
  );

  if (error) {
    throw new Error(`Quiz grading failed: ${error.message}`);
  }

  return data as GradingResult;
}

export async function canRetakeQuiz(
  userId: string,
  quizId: string,
  allowRetakes: boolean,
): Promise<boolean> {
  if (!allowRetakes) {
    const attempts = await getUserQuizAttempts(userId, quizId);
    return attempts.length === 0;
  }
  return true;
}
