import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Award, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { submitQuizAttempt, type GradingResult } from "@/lib/quiz";
import type { Quiz as DbQuiz, QuizQuestion } from "@/lib/lms";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: DbQuiz;
  questions: QuizQuestion[];
  userId: string;
  onPassed: () => void;
}

export const QuizDialog = ({
  open,
  onOpenChange,
  quiz,
  questions,
  userId,
  onPassed,
}: QuizDialogProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);

  const reset = () => {
    setAnswers({});
    setResult(null);
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      toast.error(`Please answer all ${questions.length} questions`);
      return;
    }

    setSubmitting(true);
    try {
      const gradingResult = await submitQuizAttempt(
        quiz.id,
        userId,
        questions,
        answers,
        quiz.pass_mark,
      );

      setResult(gradingResult);

      if (gradingResult.passed) {
        toast.success(gradingResult.message);
        setTimeout(() => {
          onPassed();
        }, 2000);
      } else {
        toast.error(gradingResult.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to grade quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> {quiz.title}
          </DialogTitle>
          <DialogDescription>
            Pass mark: {quiz.pass_mark}% • {questions.length} question
            {questions.length === 1 ? "" : "s"}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-6 py-6">
            {/* Score Display */}
            <div className="text-center">
              {result.passed ? (
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
              )}
              <p className="text-4xl font-bold text-white">{result.score}%</p>
              <p className="mt-2 text-lg text-white/70">
                {result.passed ? "🎉 You passed this quiz!" : "Not quite — try again."}
              </p>
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Your Answers:</h3>
              {result.details.map((detail, idx) => {
                const question = questions.find((q) => q.id === detail.question_id);
                return (
                  <div
                    key={detail.question_id}
                    className={`rounded-lg border-2 p-4 ${
                      detail.correct
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-red-500/20 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {idx + 1}. {question?.text}
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                          Your answer: <span className="text-white">{answers[detail.question_id]}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        {detail.correct ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-white/60">{detail.feedback}</p>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
              {!result.passed && (
                <Button variant="outline" onClick={reset}>
                  Try Again
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)}>
                {result.passed ? "Continue to next lesson" : "Close"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Questions */}
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-2 border-b border-white/10 pb-6 last:border-b-0">
                <p className="font-semibold text-white">
                  {idx + 1}. {q.text}
                  {q.type !== "multiple_choice" && q.type !== "true_false" && (
                    <span className="ml-2 text-xs font-normal text-white/60">
                      ({q.type === "short_answer" ? "Short answer" : "Essay"})
                    </span>
                  )}
                </p>

                {/* Multiple Choice */}
                {q.type === "multiple_choice" && q.options && (
                  <div className="space-y-2">
                    {q.options.map((option, oi) => (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                        className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-all ${
                          answers[q.id] === option
                            ? "border-primary bg-primary/10 text-white"
                            : "border-white/10 text-white/70 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 mr-3 ${
                            answers[q.id] === option
                              ? "border-primary bg-primary"
                              : "border-white/40"
                          }`}
                        >
                          {answers[q.id] === option && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {q.type === "true_false" && (
                  <div className="flex gap-3">
                    {["True", "False"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                        className={`flex-1 rounded-lg border-2 px-4 py-2 font-medium transition-all ${
                          answers[q.id] === option
                            ? "border-primary bg-primary/10 text-white"
                            : "border-white/10 text-white/70 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* Short Answer */}
                {q.type === "short_answer" && (
                  <Input
                    placeholder="Type your answer..."
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/40"
                  />
                )}

                {/* Essay */}
                {q.type === "essay" && (
                  <textarea
                    placeholder="Write your response here..."
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    className="mt-2 w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-primary focus:outline-none"
                    rows={4}
                  />
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex gap-2 border-t border-white/10 pt-4">
              {!allAnswered && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <AlertCircle className="h-4 w-4" />
                  Answer all questions to submit
                </div>
              )}
              <Button
                className="ml-auto"
                onClick={handleSubmit}
                disabled={submitting || !allAnswered}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "Grading..." : "Submit Quiz"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
