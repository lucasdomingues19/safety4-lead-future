import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
}

export async function generateQuizWithAI(
  courseTitle: string,
  courseDescription: string,
  modules: Array<{ title: string; description?: string }>,
  lessons: Array<{ title: string; content?: string }>,
  numQuestions: number = 20
): Promise<GeneratedQuiz> {
  const courseContext = `
Course: ${courseTitle}
Description: ${courseDescription}

Modules:
${modules.map((m) => `- ${m.title}: ${m.description || ""}`).join("\n")}

Lessons:
${lessons.map((l) => `- ${l.title}: ${l.content || ""}`).join("\n")}
  `;

  const prompt = `Generate a comprehensive quiz with ${numQuestions} multiple choice questions for the following course:

${courseContext}

Requirements:
1. Questions should test understanding of key concepts from modules and lessons
2. Each question must have 4 options (A, B, C, D)
3. Questions should vary in difficulty (mix easy, medium, hard)
4. Include practical application questions
5. Ensure questions cover all major topics

Return the quiz ONLY as valid JSON (no markdown, no extra text) in this exact format:
{
  "title": "Quiz title",
  "description": "Brief quiz description",
  "questions": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct..."
    }
  ],
  "passingScore": 70,
  "timeLimit": 60
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Claude response");
    }

    const quiz = JSON.parse(jsonMatch[0]) as GeneratedQuiz;

    // Validate quiz structure
    if (!quiz.questions || quiz.questions.length === 0) {
      throw new Error("Generated quiz has no questions");
    }

    return quiz;
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate quiz"
    );
  }
}

export function calculateScore(
  answers: Record<string, number>,
  questions: QuizQuestion[]
): { score: number; percentage: number; passed: boolean } {
  let correctCount = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  const score = correctCount;
  const passed = percentage >= 70;

  return { score, percentage, passed };
}
