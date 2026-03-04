
-- Fix page_views: drop restrictive SELECT, add permissive admin-only SELECT
DROP POLICY IF EXISTS "Admins can view all page views" ON public.page_views;
CREATE POLICY "Admins can view all page views"
  ON public.page_views
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix leads: drop restrictive SELECT, add permissive admin-only SELECT
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix scorecard_results: drop restrictive SELECT, add permissive admin-only SELECT
DROP POLICY IF EXISTS "Admins can view all scorecard results" ON public.scorecard_results;
CREATE POLICY "Admins can view all scorecard results"
  ON public.scorecard_results
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
