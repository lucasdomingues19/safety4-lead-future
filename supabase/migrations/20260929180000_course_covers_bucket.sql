-- Public bucket for course cover images (shown in the catalogue), admin-write only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('course-covers', 'course-covers', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

DROP POLICY IF EXISTS "Public read course covers" ON storage.objects;
CREATE POLICY "Public read course covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-covers');

DROP POLICY IF EXISTS "Admins upload course covers" ON storage.objects;
CREATE POLICY "Admins upload course covers" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-covers' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update course covers" ON storage.objects;
CREATE POLICY "Admins update course covers" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'course-covers' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete course covers" ON storage.objects;
CREATE POLICY "Admins delete course covers" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'course-covers' AND has_role(auth.uid(), 'admin'::app_role));
