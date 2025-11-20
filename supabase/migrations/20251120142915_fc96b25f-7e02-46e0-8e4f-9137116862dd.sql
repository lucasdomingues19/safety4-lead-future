-- Ensure the leads table has RLS enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive INSERT policies that might allow public access
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.leads;

-- The leads table should now have NO INSERT policy for regular users
-- All inserts must go through the capture-lead edge function which uses the service role key
-- This bypasses RLS and includes proper validation and rate limiting