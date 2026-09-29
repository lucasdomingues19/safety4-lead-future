-- LMS operational fixes (audit pass 2026-09-29)

-- 1. Signup trigger dropped the learner's name. Copy full_name from the
--    signup metadata into profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''))
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''))
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

  IF NEW.email = 'lucas.domingues1985@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill names for accounts created before this fix.
UPDATE public.profiles p
SET full_name = NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), '')
FROM auth.users u
WHERE u.id = p.id AND p.full_name IS NULL;

-- 2. Enrollment expiry was never enforced by RLS (30/90-day grants lived forever).
CREATE OR REPLACE FUNCTION public.is_enrolled(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = _user_id
      AND course_id = _course_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 3. Learners could not read their own certificates (admin-only SELECT).
DROP POLICY IF EXISTS "Learners can view own certificates" ON public.certificates;
CREATE POLICY "Learners can view own certificates"
ON public.certificates FOR SELECT
TO authenticated
USING (lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 4. Free courses: a learner may enrol themselves, but ONLY in a published
--    course that costs nothing. Paid enrolment goes through Stripe/admin.
DROP POLICY IF EXISTS "Users create own enrollments" ON public.enrollments;
CREATE POLICY "Users create own enrollments"
ON public.enrollments FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.published = true AND coalesce(c.price_cents, 0) = 0
    )
  )
);

-- Learners must not extend or re-activate their own enrolment.
DROP POLICY IF EXISTS "Users update own enrollments" ON public.enrollments;
CREATE POLICY "Admins update enrollments"
ON public.enrollments FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Community
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.community_likes (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments(post_id, created_at);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read posts" ON public.community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert own posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own or admin posts" ON public.community_posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth read comments" ON public.community_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert own comments" ON public.community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own or admin comments" ON public.community_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth read likes" ON public.community_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert own likes" ON public.community_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own likes" ON public.community_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admins can moderate lesson comments too.
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.lesson_comments;
CREATE POLICY "Delete own or admin lesson comments" ON public.lesson_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- 6. Admin email campaign history
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read campaigns" ON public.email_campaigns FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Admin needs to read every learner's progress / attempts for reports.
--    (lesson_progress + quiz_attempts already allow admin via "Users manage own" ALL policy.)
