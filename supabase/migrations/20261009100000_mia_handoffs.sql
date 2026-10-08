-- Questions Mia couldn't answer, or that a learner asked to pass to the team. Written only by the
-- mia-help function (service role). Admins can read and update them; learners cannot see the table.
CREATE TABLE IF NOT EXISTS public.mia_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  question text NOT NULL CHECK (char_length(question) BETWEEN 1 AND 1500),
  mia_reply text,
  reason text NOT NULL CHECK (reason IN ('not_covered', 'asked_for_person')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mia_handoffs_status_idx ON public.mia_handoffs (status, created_at DESC);
ALTER TABLE public.mia_handoffs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read handoffs" ON public.mia_handoffs;
CREATE POLICY "Admins read handoffs" ON public.mia_handoffs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update handoffs" ON public.mia_handoffs;
CREATE POLICY "Admins update handoffs" ON public.mia_handoffs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
