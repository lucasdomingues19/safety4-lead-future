-- Quiz attempts are graded and written only by the grade-quiz-attempt edge
-- function (service role). Learners could previously insert their own
-- "passed" attempts directly. Learners now read their own; admins manage.
DROP POLICY IF EXISTS "Users manage own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Learners read own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admins manage quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Learners read own quiz attempts" ON public.quiz_attempts
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage quiz attempts" ON public.quiz_attempts
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
