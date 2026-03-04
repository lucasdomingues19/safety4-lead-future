
-- 1. Lock down user_events INSERT (block direct client inserts)
DROP POLICY IF EXISTS "Anyone can insert events" ON public.user_events;
CREATE POLICY "Only service role can insert events"
  ON public.user_events FOR INSERT WITH CHECK (false);

-- 2. Ensure leads SELECT is admin-only (drop any public/anon SELECT)
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads"
  ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Ensure scorecard_results SELECT is admin-only
DROP POLICY IF EXISTS "Admins can view all scorecard results" ON public.scorecard_results;
CREATE POLICY "Admins can view all scorecard results"
  ON public.scorecard_results FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Ensure page_views SELECT is admin-only
DROP POLICY IF EXISTS "Admins can view all page views" ON public.page_views;
CREATE POLICY "Admins can view all page views"
  ON public.page_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
