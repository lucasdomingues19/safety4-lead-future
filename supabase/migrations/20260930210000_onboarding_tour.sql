-- First-run onboarding tour: remember who has seen it, and store the
-- generated AI voiceover clips (one short MP3 per scene, public read,
-- written only by the admin-only tour-voiceover function).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tour_completed_at timestamptz;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tour-audio', 'tour-audio', true, 5242880, ARRAY['audio/mpeg'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['audio/mpeg'];

DROP POLICY IF EXISTS "Public read tour audio" ON storage.objects;
CREATE POLICY "Public read tour audio" ON storage.objects FOR SELECT USING (bucket_id = 'tour-audio');
