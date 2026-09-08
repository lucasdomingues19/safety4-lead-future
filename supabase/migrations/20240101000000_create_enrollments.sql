-- Enrollments table for tracking course enrollments and payments
CREATE TABLE enrollments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10, 2),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, course_id)
);

-- Index for faster queries
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_payment_status ON enrollments(payment_status);

-- RLS Policies
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert enrollments
CREATE POLICY "Service role can insert enrollments" ON enrollments
  FOR INSERT
  WITH CHECK (true);

-- Service role can update enrollments
CREATE POLICY "Service role can update enrollments" ON enrollments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
