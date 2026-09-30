-- Two community spaces:
--   'academy'         SafetyTech Academy — free, every signed-in member
--   'global-network'  SafetyTech Global Network — paid members (and admins)
-- Membership of the paid space lives in community_memberships (granted by an
-- admin today; a payment integration can write the same rows later).
-- Access is enforced in RLS for posts, replies, reactions and media.

CREATE TABLE IF NOT EXISTS public.community_memberships (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  space text NOT NULL CHECK (space IN ('global-network')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  source text NOT NULL DEFAULT 'admin' CHECK (source IN ('admin', 'stripe', 'import')),
  expires_at timestamptz,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, space)
);
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own memberships" ON public.community_memberships;
CREATE POLICY "Users read own memberships" ON public.community_memberships
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage memberships" ON public.community_memberships;
CREATE POLICY "Admins manage memberships" ON public.community_memberships
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.has_community_access(_user uuid, _space text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT CASE
    WHEN _user IS NULL THEN false
    WHEN _space = 'academy' THEN true
    ELSE has_role(_user, 'admin'::app_role) OR EXISTS (
      SELECT 1 FROM community_memberships m
       WHERE m.user_id = _user AND m.space = _space AND m.status = 'active'
         AND (m.expires_at IS NULL OR m.expires_at > now())
    )
  END;
$$;
GRANT EXECUTE ON FUNCTION public.has_community_access(uuid, text) TO authenticated;

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS space text NOT NULL DEFAULT 'academy' CHECK (space IN ('academy', 'global-network'));
CREATE INDEX IF NOT EXISTS community_posts_space_created_idx ON public.community_posts (space, created_at DESC);

-- Posts
DROP POLICY IF EXISTS "Auth read posts" ON public.community_posts;
CREATE POLICY "Auth read posts" ON public.community_posts
  FOR SELECT TO authenticated USING (has_community_access(auth.uid(), space));
DROP POLICY IF EXISTS "Auth insert own posts" ON public.community_posts;
CREATE POLICY "Auth insert own posts" ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND has_community_access(auth.uid(), space)
              AND (pinned = false OR has_role(auth.uid(), 'admin'::app_role)));

-- Replies
DROP POLICY IF EXISTS "Auth read comments" ON public.community_comments;
CREATE POLICY "Auth read comments" ON public.community_comments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM community_posts p WHERE p.id = post_id AND has_community_access(auth.uid(), p.space)));
DROP POLICY IF EXISTS "Auth insert own comments" ON public.community_comments;
CREATE POLICY "Auth insert own comments" ON public.community_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM community_posts p WHERE p.id = post_id AND has_community_access(auth.uid(), p.space)));

-- Reactions
DROP POLICY IF EXISTS "Auth read reactions" ON public.community_reactions;
CREATE POLICY "Auth read reactions" ON public.community_reactions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM community_posts p WHERE p.id = post_id AND has_community_access(auth.uid(), p.space)));
DROP POLICY IF EXISTS "Auth add own reactions" ON public.community_reactions;
CREATE POLICY "Auth add own reactions" ON public.community_reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM community_posts p WHERE p.id = post_id AND has_community_access(auth.uid(), p.space)));

-- Media: readable by its uploader, or by anyone who can see a post using it.
DROP POLICY IF EXISTS "Members read community media" ON storage.objects;
CREATE POLICY "Members read community media" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'community-media' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.community_posts p
         WHERE p.media @> jsonb_build_array(jsonb_build_object('path', name))
           AND public.has_community_access(auth.uid(), p.space)
      )
    )
  );
