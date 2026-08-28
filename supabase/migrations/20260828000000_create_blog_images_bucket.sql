-- Create blog-images storage bucket for blog post featured images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to blog-images
CREATE POLICY "Allow authenticated users to upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
  OR auth.jwt() ->> 'role' = 'admin'
);

-- Allow public read access to blog images
CREATE POLICY "Allow public read access to blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Allow admins to delete blog images
CREATE POLICY "Allow admins to delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND auth.jwt() ->> 'role' = 'admin'
);
