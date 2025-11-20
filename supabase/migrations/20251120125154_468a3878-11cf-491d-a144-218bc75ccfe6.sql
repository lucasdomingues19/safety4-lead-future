-- Remove public insert policy on page_views table
-- All page view insertions must now go through the validated track-page-view edge function
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;