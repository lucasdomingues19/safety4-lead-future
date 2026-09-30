-- Security hardening from the Supabase security advisor (2026-09-30).

-- 1. CRITICAL: leads (website contact submissions: names, emails, companies)
--    had RLS disabled, so the public anon key could read all of them.
--    Policies already existed; enable RLS and add the admin UPDATE the admin
--    UI needs (status changes). capture-lead inserts with the service role.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads" ON public.leads
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Trigger functions must never be callable over the API.
REVOKE ALL ON FUNCTION public.record_learning_day() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_admin_roles() FROM PUBLIC, anon, authenticated;

-- 3. Helper lookups: signed-out visitors don't need them (they could probe
--    whether a given user id is enrolled). Signed-in users keep EXECUTE
--    because RLS policies call them.
REVOKE EXECUTE ON FUNCTION public.is_enrolled(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.course_of_lesson(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.course_of_module(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.course_of_quiz(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_community_access(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_enrolled(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.course_of_lesson(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.course_of_module(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.course_of_quiz(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_community_access(uuid, text) TO authenticated;

-- 4. Pin search_path.
ALTER FUNCTION public.level_for(bigint) SET search_path = public;

-- 5. Enrolled-learner read policies only ever match signed-in users; scope
--    them to `authenticated` so signed-out requests don't evaluate the
--    (now anon-revoked) helper functions and simply get no rows.
DROP POLICY IF EXISTS "Enrolled students view modules" ON public.modules;
CREATE POLICY "Enrolled students view modules" ON public.modules FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_enrolled(auth.uid(), course_id));
DROP POLICY IF EXISTS "Enrolled students view lessons" ON public.lessons;
CREATE POLICY "Enrolled students view lessons" ON public.lessons FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_enrolled(auth.uid(), course_of_module(module_id)));
DROP POLICY IF EXISTS "Enrolled students view quizzes" ON public.quizzes;
CREATE POLICY "Enrolled students view quizzes" ON public.quizzes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_enrolled(auth.uid(), course_of_module(module_id)));
DROP POLICY IF EXISTS "Enrolled students view quiz questions" ON public.quiz_questions;
CREATE POLICY "Enrolled students view quiz questions" ON public.quiz_questions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_enrolled(auth.uid(), course_of_quiz(quiz_id)));

-- 6. Event confirmations are sent once per registration (see
--    send-event-registration-email, no longer an open relay).
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;
