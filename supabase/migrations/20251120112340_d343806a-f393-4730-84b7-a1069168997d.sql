-- Remove public insert policy on leads table
-- All lead insertions must now go through the validated capture-lead edge function
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;