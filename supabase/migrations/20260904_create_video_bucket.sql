-- Create video-lessons storage bucket for LMS
-- Run this via Supabase dashboard if needed

-- The bucket is created via storage.buckets insert, which requires RLS disabled temporarily
-- This is typically done via the dashboard UI or with admin API access

-- Policy: Public read access to videos (anyone can view)
-- Policy: Authenticated instructors can upload/manage their course videos

-- Create the bucket (if using admin API):
-- POST https://[project].supabase.co/storage/v1/b
-- {
--   "name": "video-lessons",
--   "public": true,
--   "file_size_limit": 5368709120,
--   "allowed_mime_types": ["video/mp4", "video/webm", "video/ogg"]
-- }

-- For now, instructors will upload to this path: video-lessons/{course_id}/{lesson_id}.mp4
-- Public URL: https://[project].supabase.co/storage/v1/object/public/video-lessons/{course_id}/{lesson_id}.mp4
