-- The 20260904_create_lms_schema.sql migration's CREATE TABLE IF NOT EXISTS
-- silently no-op'd for lessons (table already existed from an earlier
-- migration), so its `content` column (rich text/markdown for the lesson
-- overview tab) was never added. src/pages/learn/LessonView.tsx reads
-- lesson.content unconditionally.
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS content TEXT;
