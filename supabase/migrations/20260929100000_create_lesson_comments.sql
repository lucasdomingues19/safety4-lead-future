-- Lesson comments (student discussion on the lesson player's Comments tab).
-- author_name is denormalized at post time (from the poster's own auth
-- metadata/email) rather than joined from profiles/auth.users at read
-- time, since the public client can't read other users' auth records.
CREATE TABLE public.lesson_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lesson comments"
ON public.lesson_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can post their own comments"
ON public.lesson_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.lesson_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_lesson_comments_lesson_id ON public.lesson_comments(lesson_id, created_at);
