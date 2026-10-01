-- Onboarding tracking for Admin > People: how far each learner got in Mia's
-- tour, plus when they first completed a lesson.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tour_status text CHECK (tour_status IN ('completed', 'skipped')),
  ADD COLUMN IF NOT EXISTS tour_last_step smallint;

UPDATE public.profiles SET tour_status = 'completed' WHERE tour_completed_at IS NOT NULL AND tour_status IS NULL;

-- One row per learner who has completed at least one lesson (admins only).
CREATE OR REPLACE FUNCTION public.admin_first_lessons()
RETURNS TABLE (user_id uuid, first_lesson_at timestamptz, lessons_done integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lp.user_id, min(lp.completed_at), count(*)::int
  FROM public.lesson_progress lp
  WHERE lp.is_completed AND public.has_role(auth.uid(), 'admin')
  GROUP BY lp.user_id
$$;
REVOKE ALL ON FUNCTION public.admin_first_lessons() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_first_lessons() TO authenticated;
