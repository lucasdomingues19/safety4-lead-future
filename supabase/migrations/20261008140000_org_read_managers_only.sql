-- Learners see only their own course, not their company's billing details.
-- Company rows are readable by admins and by the company's managers (owner/manager),
-- not by plain members. Learners still see their own enrolment and course.
DROP POLICY IF EXISTS "Org members read their organisation" ON public.organisations;
CREATE POLICY "Managers read their organisation" ON public.organisations
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_org_manager(auth.uid(), id));
