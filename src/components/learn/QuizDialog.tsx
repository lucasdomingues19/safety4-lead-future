import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Award } from "lucide-react";
import { toast } from "sonner";
import type { Quiz, QuizQuestion } from "@/lib/lms";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz;
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
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const reset = () => {
    setAnswers({});
    setResult(null);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer every question");
      return;
    }
    setSubmitting(true);
    try {
      const correct = questions.filter((q) => answers[q.id] === q.correct_index).length;
      const score = Math.round((correct / questions.length) * 100);
      const passed = score >= quiz.pass_threshold;

      await supabase.from("quiz_attempts").insert({
        user_id: userId,
        quiz_id: quiz.id,
        score,
        passed,
      });

      setResult({ score, passed });
      if (passed) {
        toast.success(`Passed with ${score}%`);
        onPassed();
      } else {
        toast.error(`Scored ${score}%. You need ${quiz.pass_threshold}% to pass.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not submit your quiz");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> {quiz.title}
          </DialogTitle>
          <DialogDescription>
            Pass mark: {quiz.pass_threshold}%. {questions.length} question
            {questions.length === 1 ? "" : "s"}.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="py-6 text-center">
            {result.passed ? (
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-primary" />
            ) : (
              <XCircle className="mx-auto mb-3 h-12 w-12 text-destructive" />
            )}
            <p className="text-2xl font-bold text-foreground">{result.score}%</p>
            <p className="mt-1 text-muted-foreground">
              {result.passed ? "You passed this quiz!" : "Not quite — try again."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {!result.passed && (
                <Button variant="outline" onClick={reset}>
                  Retry
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)}>
                {result.passed ? "Continue" : "Close"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, qi) => (
              <div key={q.id}>
                <p className="mb-2 font-medium text-foreground">
                  {qi + 1}. {q.prompt}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                        className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          selected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            selected ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        >
                          {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit quiz
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
