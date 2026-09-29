-- Event registrations write the event onto the lead row.
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS event_title TEXT;

-- Admin event manager uploads cover images to an 'events' bucket.
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read event images" ON storage.objects;
CREATE POLICY "Public read event images" ON storage.objects FOR SELECT USING (bucket_id = 'events');
DROP POLICY IF EXISTS "Admins upload event images" ON storage.objects;
CREATE POLICY "Admins upload event images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'events' AND public.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins manage event images" ON storage.objects;
CREATE POLICY "Admins manage event images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'events' AND public.has_role(auth.uid(), 'admin'::app_role));
