-- Uploaded lesson media (video, slides, documents) + captions.
-- Files are never public: paths are stored here and the lesson-media edge
-- function signs short-lived URLs for admins and enrolled learners only.
-- Path format: "s3:<key>" (AWS bucket) or "sb:<key>" (Supabase bucket video-lessons).

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS media_kind text CHECK (media_kind IN ('video', 'slides', 'document')),
  ADD COLUMN IF NOT EXISTS media_path text,
  ADD COLUMN IF NOT EXISTS media_name text,
  ADD COLUMN IF NOT EXISTS media_mime text,
  ADD COLUMN IF NOT EXISTS media_size bigint,
  ADD COLUMN IF NOT EXISTS captions_path text;

-- Defence in depth on the private bucket: size cap (free-plan max) and a
-- content-type allowlist. There are deliberately no storage.objects policies
-- for this bucket; only the service role (edge function) can touch it.
UPDATE storage.buckets
SET public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/vtt', 'text/plain', 'text/csv',
      'image/png', 'image/jpeg', 'image/webp',
      'application/zip'
    ]
WHERE id = 'video-lessons';
