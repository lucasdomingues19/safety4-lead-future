-- Fix profiles table: only admin can see all profiles, users can see their own
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create permissive policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create permissive policy for users to view only their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Fix leads table: ensure only admin can SELECT (the existing policy is restrictive, needs to be permissive)
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;

CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix page_views table: ensure only admin can view analytics
DROP POLICY IF EXISTS "Admins can view all page views" ON public.page_views;

CREATE POLICY "Admins can view all page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));