-- Add UPDATE and DELETE policies to page_views table restricted to admins
-- This ensures visitor privacy data cannot be modified or deleted except by admins

CREATE POLICY "Admins can update page views"
ON public.page_views
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete page views"
ON public.page_views
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));