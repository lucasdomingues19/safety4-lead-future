-- Storage hardening (found in the full test, 2026-10-01).
-- 1) Blog images: only admins may upload/delete (any signed-in user could before).
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete blog images" ON storage.objects;
CREATE POLICY "Admins upload blog images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete blog images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));

-- 2) Public buckets serve files by public URL without any SELECT policy; the
--    SELECT policies only enabled anonymous *listing* (which exposed user ids
--    via avatar folder names). Server code lists with the service role.
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read course covers" ON storage.objects;
DROP POLICY IF EXISTS "Public read event images" ON storage.objects;
DROP POLICY IF EXISTS "Public read tour audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

-- 3) Image buckets accept images only.
UPDATE storage.buckets SET allowed_mime_types = ARRAY['image/png','image/jpeg','image/webp','image/gif']
WHERE id IN ('avatars','course-covers','events','blog-images');
