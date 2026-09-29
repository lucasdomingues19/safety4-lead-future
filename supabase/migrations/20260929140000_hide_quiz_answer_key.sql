-- Learners must not be able to read the quiz answer key from the API.
-- Grading happens server-side (grade-quiz-attempt uses the service role).
-- Column-level privileges: authenticated users can read everything EXCEPT correct_index.
REVOKE SELECT ON public.quiz_questions FROM authenticated, anon;
GRANT SELECT (id, quiz_id, prompt, options, position, created_at) ON public.quiz_questions TO authenticated;

-- Admins (course editor) still need the full rows including the answer key.
CREATE OR REPLACE FUNCTION public.admin_get_quiz_questions(_quiz_id uuid)
RETURNS SETOF public.quiz_questions
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;
  RETURN QUERY SELECT * FROM public.quiz_questions WHERE quiz_id = _quiz_id ORDER BY position;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_get_quiz_questions(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_quiz_questions(uuid) TO authenticated;
