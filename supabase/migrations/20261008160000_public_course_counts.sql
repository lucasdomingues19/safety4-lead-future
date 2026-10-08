-- Public course pages (before purchase) show how many modules and lessons a course has.
-- Only the two counts are exposed, not the lessons themselves.
CREATE OR REPLACE FUNCTION public.course_public_counts(_course uuid)
RETURNS TABLE(modules int, lessons int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    (SELECT count(*)::int FROM modules m JOIN courses c ON c.id = m.course_id WHERE m.course_id = _course AND c.published),
    (SELECT count(*)::int FROM lessons l JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id WHERE m.course_id = _course AND c.published)
$$;
GRANT EXECUTE ON FUNCTION public.course_public_counts(uuid) TO anon, authenticated;
