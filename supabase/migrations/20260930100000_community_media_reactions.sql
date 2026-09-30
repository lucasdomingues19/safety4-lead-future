-- Richer community: photos/video, link embeds, topics, pinned announcements,
-- emoji reactions and live updates.

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS media jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{ "type": "image"|"video", "path": "<user_id>/<file>" }]
  ADD COLUMN IF NOT EXISTS topic text NOT NULL DEFAULT 'general'
    CHECK (topic IN ('general', 'questions', 'wins', 'ai-in-ehs', 'resources')),
  ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;

-- Only admins may pin (on insert or later).
DROP POLICY IF EXISTS "Auth insert own posts" ON public.community_posts;
CREATE POLICY "Auth insert own posts" ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (pinned = false OR has_role(auth.uid(), 'admin'::app_role)));
DROP POLICY IF EXISTS "Admins update posts" ON public.community_posts;
CREATE POLICY "Admins update posts" ON public.community_posts
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Emoji reactions (replace the single "like"; existing likes become ❤️).
CREATE TABLE IF NOT EXISTS public.community_reactions (
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL CHECK (emoji IN ('👍', '❤️', '🎉', '💡', '😂', '🙌')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id, emoji)
);
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth read reactions" ON public.community_reactions;
CREATE POLICY "Auth read reactions" ON public.community_reactions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth add own reactions" ON public.community_reactions;
CREATE POLICY "Auth add own reactions" ON public.community_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Remove own reactions" ON public.community_reactions;
CREATE POLICY "Remove own reactions" ON public.community_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

INSERT INTO public.community_reactions (post_id, user_id, emoji, created_at)
SELECT post_id, user_id, '❤️', created_at FROM public.community_likes
ON CONFLICT DO NOTHING;

-- Private media bucket: members can see community media; each user writes
-- only inside their own folder; owners and admins can delete.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('community-media', 'community-media', false, 52428800,
        ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

DROP POLICY IF EXISTS "Members read community media" ON storage.objects;
CREATE POLICY "Members read community media" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'community-media');
DROP POLICY IF EXISTS "Members upload own community media" ON storage.objects;
CREATE POLICY "Members upload own community media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'community-media' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Owners or admins delete community media" ON storage.objects;
CREATE POLICY "Owners or admins delete community media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'community-media' AND ((storage.foldername(name))[1] = auth.uid()::text OR has_role(auth.uid(), 'admin'::app_role)));

-- Live feed updates.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'community_posts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'community_comments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
  END IF;
END $$;
