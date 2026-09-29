import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Award, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { submitQuizAttempt, type GradingResult, type Quiz, type QuizQuestion } from "@/lib/quiz";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz;
  questions: QuizQuestion[];
  userId: string;
  /** Called once when the learner passes. Resolves to the certificate URL, or null if issuing failed. */
  onPassed: () => Promise<string | null>;
}

export const QuizDialog = ({ open, onOpenChange, quiz, questions, userId, onPassed }: QuizDialogProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const [certFailed, setCertFailed] = useState(false);

  const reset = () => {
    setAnswers({});
    setResult(null);
    setCertUrl(null);
    setCertFailed(false);
  };

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error(`Please answer all ${questions.length} questions`);
      return;
    }
    setSubmitting(true);
    try {
      const grading = await submitQuizAttempt(quiz.id, answers);
      setResult(grading);
      if (grading.passed) {
        setIssuing(true);
        const url = await onPassed();
        setCertUrl(url);
        setCertFailed(!url);
        setIssuing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("We couldn't grade your quiz. Please try again.");
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
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> {quiz.title}
          </DialogTitle>
          <DialogDescription>
            Pass mark: {quiz.pass_threshold}% • {questions.length} question{questions.length === 1 ? "" : "s"}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-6 py-4">
            <div className="text-center">
              {result.passed ? <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-green-500" /> : <XCircle className="mx-auto mb-3 h-16 w-16 text-red-500" />}
              <p className="text-4xl font-bold text-white">{result.score}%</p>
              <p className="mt-2 text-lg text-white/70">{result.passed ? "You passed this quiz!" : "Not quite — have another go."}</p>
              {result.passed && (
                <p className="mt-3 text-sm text-white/70">
                  {issuing && (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Issuing your certificate...</span>)}
                  {!issuing && certUrl && (<>Your certificate has been emailed to you. <a href={certUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">View certificate</a></>)}
                  {!issuing && certFailed && "We couldn't issue your certificate automatically — please contact support and we'll sort it out."}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {result.details.map((detail, idx) => {
                const q = questions.find((x) => x.id === detail.question_id);
                return (
                  <div key={detail.question_id} className={`rounded-lg border-2 p-4 ${detail.correct ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-white">{idx + 1}. {q?.prompt}</p>
                        <p className="mt-2 text-sm text-white/70">Your answer: <span className="text-white">{answers[detail.question_id]}</span></p>
                      </div>
                      {detail.correct ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    {!detail.correct && <p className="mt-2 text-sm text-white/60">Review this topic and try again.</p>}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
              {!result.passed && <Button variant="outline" onClick={reset}>Try again</Button>}
              <Button onClick={() => onOpenChange(false)} disabled={issuing}>{result.passed ? "Done" : "Close"}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-2 border-b border-white/10 pb-6 last:border-b-0">
                <p className="font-semibold text-white">{idx + 1}. {q.prompt}</p>
                <div className="space-y-2">
                  {q.options.map((option, oi) => {
                    const selected = answers[q.id] === option;
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                        className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-all ${selected ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/70 hover:border-white/20 hover:bg-white/5"}`}
                      >
                        <span className={`mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? "border-primary bg-primary" : "border-white/40"}`}>
                          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex gap-2 border-t border-white/10 pt-4">
              {!allAnswered && (
                <div className="flex items-center gap-2 text-sm text-white/60"><AlertCircle className="h-4 w-4" /> Answer all questions to submit</div>
              )}
              <Button className="ml-auto" onClick={handleSubmit} disabled={submitting || !allAnswered}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "Grading..." : "Submit quiz"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
