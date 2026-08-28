-- Storage RLS policies for blog-images bucket

-- Allow authenticated users to upload
DO $$
BEGIN
  CREATE POLICY "Allow authenticated upload to blog-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow public read
DO $$
BEGIN
  CREATE POLICY "Allow public read blog-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow delete
DO $$
BEGIN
  CREATE POLICY "Allow delete blog-images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
