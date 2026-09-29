-- Final assessment + certificate through Syngraph AI (syngraph.ai).
--   courses.final_assessment_ref: the Syngraph assessment code (ASS-XXXXXXXX).
--     When set, the course certificate is the Syngraph signed credential, issued
--     only when the learner passes that assessment (the LMS no longer issues its
--     own certificate for the course).
--   final_assessment_attempts: one row per launch; written only by the
--     final-assessment / syngraph-webhook edge functions (service role).
--   certificates.external_url: for credentials issued elsewhere (Syngraph), the
--     public verification page. The row mirrors the credential so dashboards,
--     CPD totals and reports keep working unchanged.

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS final_assessment_ref text;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS external_url text;

CREATE TABLE IF NOT EXISTS public.final_assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  assessment_ref text NOT NULL,
  syngraph_launch_id uuid,
  syngraph_attempt_id uuid,
  status text NOT NULL DEFAULT 'launched' CHECK (status IN ('launched', 'passed', 'failed')),
  score numeric,
  credential_public_id text,
  credential_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS final_assessment_attempts_user_course_idx ON public.final_assessment_attempts (user_id, course_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS final_assessment_attempts_launch_idx ON public.final_assessment_attempts (syngraph_launch_id) WHERE syngraph_launch_id IS NOT NULL;

ALTER TABLE public.final_assessment_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own final assessment attempts" ON public.final_assessment_attempts;
CREATE POLICY "Users read own final assessment attempts" ON public.final_assessment_attempts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins read final assessment attempts" ON public.final_assessment_attempts;
CREATE POLICY "Admins read final assessment attempts" ON public.final_assessment_attempts
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Public certificate lookup also returns external_url (the /verify page
-- redirects Syngraph-issued credentials to syngraph.ai) and matches ids
-- case-insensitively (Syngraph ids are lowercase UUIDs).
DROP FUNCTION IF EXISTS public.verify_certificate(text);
CREATE FUNCTION public.verify_certificate(_certificate_number text)
RETURNS TABLE(certificate_number text, recipient_name text, course_name text, completion_date date, issued_at timestamptz, status text, credential_level text, cpd_hours numeric, revoked_at timestamptz, external_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT certificate_number, recipient_name, course_name, completion_date,
         issued_at, status, credential_level, cpd_hours, revoked_at, external_url
  FROM public.certificates
  WHERE upper(certificate_number) = upper(trim(_certificate_number))
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
