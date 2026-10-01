-- Lightweight client error log: when an LMS screen crashes, the error
-- boundary records what happened so admins (and Claude) can see the cause.
CREATE TABLE IF NOT EXISTS public.client_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  screen text CHECK (char_length(screen) <= 60),
  message text NOT NULL CHECK (char_length(message) <= 1000),
  stack text CHECK (char_length(stack) <= 4000),
  url text CHECK (char_length(url) <= 500),
  user_agent text CHECK (char_length(user_agent) <= 300),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Log own client errors" ON public.client_errors;
CREATE POLICY "Log own client errors" ON public.client_errors FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins read client errors" ON public.client_errors;
CREATE POLICY "Admins read client errors" ON public.client_errors FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS client_errors_created_idx ON public.client_errors (created_at DESC);
