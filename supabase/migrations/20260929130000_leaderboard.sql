-- Real leaderboard. Learners can only read their own progress under RLS, so
-- the ranking is computed by a SECURITY DEFINER function that exposes only a
-- display name and a points total (never emails or raw activity).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hide_from_leaderboard BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit integer DEFAULT 10)
RETURNS TABLE(user_id uuid, display_name text, points bigint, lessons bigint, is_me boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    coalesce(nullif(p.full_name, ''), split_part(p.email, '@', 1)),
    (coalesce(lp.c, 0) * 10 + coalesce(qa.c, 0) * 50 + coalesce(cp.c, 0) * 5)::bigint,
    coalesce(lp.c, 0)::bigint,
    (p.id = auth.uid())
  FROM public.profiles p
  LEFT JOIN (SELECT l.user_id, count(*) c FROM public.lesson_progress l GROUP BY l.user_id) lp ON lp.user_id = p.id
  LEFT JOIN (SELECT q.user_id, count(DISTINCT q.quiz_id) c FROM public.quiz_attempts q WHERE q.passed GROUP BY q.user_id) qa ON qa.user_id = p.id
  LEFT JOIN (SELECT c.user_id, count(*) c FROM public.community_posts c GROUP BY c.user_id) cp ON cp.user_id = p.id
  WHERE p.hide_from_leaderboard = false
    AND coalesce(lp.c, 0) + coalesce(qa.c, 0) + coalesce(cp.c, 0) > 0
  ORDER BY 3 DESC, 4 DESC
  LIMIT greatest(1, least(_limit, 50))
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO authenticated;

-- LmsAdminCourses inserts/updates courses.playback_settings, which never existed
-- (creating a course from the admin tab always failed).
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS playback_settings JSONB;
