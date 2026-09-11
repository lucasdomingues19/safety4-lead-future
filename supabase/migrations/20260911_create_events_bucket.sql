-- Create events storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for events bucket
-- Allow public read access to event images
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'events');

-- Allow authenticated users to upload to events bucket
CREATE POLICY "Authenticated Upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'events'
  AND auth.role() = 'authenticated'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update/delete event images
CREATE POLICY "Admin Update/Delete"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'events'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admin Delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'events'
  AND has_role(auth.uid(), 'admin'::app_role)
);
