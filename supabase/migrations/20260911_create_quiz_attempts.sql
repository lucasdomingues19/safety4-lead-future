-- Quiz Attempts Tracking
-- Track student quiz submissions, scores, and answers

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}', -- {question_id: answer_text}
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_submitted_at ON public.quiz_attempts(submitted_at);

-- Unique constraint: one user can have multiple attempts per quiz
-- (allows retakes, but prevents duplicate submission in same second)
CREATE UNIQUE INDEX idx_quiz_attempts_unique ON public.quiz_attempts(user_id, quiz_id, submitted_at);

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
-- Users can view only their own quiz attempts
CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own quiz attempts
CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all quiz attempts (for analytics)
-- Instructors can view attempts on their courses
-- This is handled in application layer for now

-- Comments
COMMENT ON TABLE public.quiz_attempts IS 'Track student quiz submissions, scores, and answers for grading and analytics';
COMMENT ON COLUMN public.quiz_attempts.answers IS 'JSON object mapping question_id to student answer text';
COMMENT ON COLUMN public.quiz_attempts.score IS 'Percentage score (0-100)';
COMMENT ON COLUMN public.quiz_attempts.passed IS 'Whether student met passing threshold';
