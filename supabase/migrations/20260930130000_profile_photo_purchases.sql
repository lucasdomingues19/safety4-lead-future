-- Profile photos + purchase history.

-- Profile photos: public bucket (shown next to names), each user writes only
-- inside their own folder.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 2097152, allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Purchases: written only by the Stripe functions (service role); learners
-- read their own, admins read all.
CREATE TABLE IF NOT EXISTS public.course_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  course_title text NOT NULL,
  stripe_session_id text NOT NULL UNIQUE,
  stripe_payment_intent text,
  amount_cents integer NOT NULL,
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded')),
  receipt_url text,
  purchased_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_purchases_user_idx ON public.course_purchases (user_id, purchased_at DESC);
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own purchases" ON public.course_purchases;
CREATE POLICY "Users read own purchases" ON public.course_purchases FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins read purchases" ON public.course_purchases;
CREATE POLICY "Admins read purchases" ON public.course_purchases FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Community author badges also carry the profile photo.
DROP FUNCTION IF EXISTS public.get_member_badges(uuid[]);
CREATE FUNCTION public.get_member_badges(_ids uuid[])
RETURNS TABLE(user_id uuid, level int, level_name text, network_member boolean, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.id, lv.level, lv.name,
         EXISTS (SELECT 1 FROM community_memberships m WHERE m.user_id = u.id AND m.space = 'global-network' AND m.status = 'active' AND (m.expires_at IS NULL OR m.expires_at > now())),
         (SELECT pr.avatar_url FROM profiles pr WHERE pr.id = u.id)
  FROM unnest(_ids[1:200]) AS u(id)
  CROSS JOIN LATERAL user_points(u.id) up
  CROSS JOIN LATERAL level_for(up.points) lv
$$;
REVOKE ALL ON FUNCTION public.get_member_badges(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_member_badges(uuid[]) TO authenticated;
