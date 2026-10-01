-- Mia's HeyGen video clips (one per tour step, mia/<step>-<hash>.mp4) live
-- beside the voice clips in the public tour-audio bucket.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['audio/mpeg', 'video/mp4'], file_size_limit = 52428800
WHERE id = 'tour-audio';
