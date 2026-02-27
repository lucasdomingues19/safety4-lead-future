
-- Create scorecard_results table to store assessment outcomes
CREATE TABLE public.scorecard_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  rank_number INTEGER NOT NULL,
  rank_label TEXT NOT NULL,
  category_scores JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scorecard_results ENABLE ROW LEVEL SECURITY;

-- Only admins can read results
CREATE POLICY "Admins can view all scorecard results"
ON public.scorecard_results
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Block direct inserts (edge function uses service role)
CREATE POLICY "No direct inserts"
ON public.scorecard_results
FOR INSERT
WITH CHECK (false);

-- Create index on email for quick lookups
CREATE INDEX idx_scorecard_results_email ON public.scorecard_results(email);
