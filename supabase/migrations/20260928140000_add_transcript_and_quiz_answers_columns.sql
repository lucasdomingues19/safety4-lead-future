-- Same CREATE TABLE IF NOT EXISTS schema-drift pattern as prior fixes.
-- lessons.transcript: read by the Transcript tab in LessonView.tsx.
-- quiz_attempts.answers: the grade-quiz-attempt edge function inserts this
-- on every graded attempt; it was missing, so every quiz submission was
-- failing with a "column does not exist" error before this fix.
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS transcript TEXT;

ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS answers JSONB;
