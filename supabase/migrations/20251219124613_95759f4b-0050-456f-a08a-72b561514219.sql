-- Add INSERT policy that blocks direct client inserts
-- The edge function uses service_role which bypasses RLS, so it will still work
CREATE POLICY "Only service role can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (false);