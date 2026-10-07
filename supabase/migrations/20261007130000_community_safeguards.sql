-- Community safeguards for open sign-up:
--   1. Members must agree to the community guidelines before posting, replying or reacting.
--   2. Accounts younger than 24 hours cannot post links (spam control).
--   3. Sign-up records an (unticked-by-default) marketing opt-in, and an opted-in member
--      becomes a lead once their email is confirmed.
-- Reading the free Academy community stays open to every signed-in member.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS community_guidelines_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS community_guidelines_version text,
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_opt_in_at timestamptz;

-- ---------- 1. Guidelines agreement ----------
CREATE OR REPLACE FUNCTION public.has_accepted_guidelines(_user uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT CASE
    WHEN _user IS NULL THEN false
    WHEN has_role(_user, 'admin'::app_role) THEN true
    ELSE EXISTS (SELECT 1 FROM profiles p WHERE p.id = _user AND p.community_guidelines_accepted_at IS NOT NULL)
  END;
$$;
REVOKE EXECUTE ON FUNCTION public.has_accepted_guidelines(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_accepted_guidelines(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_community_guidelines(_version text DEFAULT 'v1')
RETURNS timestamptz
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE ts timestamptz := now();
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  UPDATE profiles
     SET community_guidelines_accepted_at = COALESCE(community_guidelines_accepted_at, ts),
         community_guidelines_version = _version
   WHERE id = auth.uid();
  RETURN ts;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.accept_community_guidelines(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_community_guidelines(text) TO authenticated;

ALTER POLICY "Auth insert own posts" ON public.community_posts
  WITH CHECK (
    auth.uid() = user_id
    AND has_community_access(auth.uid(), space)
    AND (pinned = false OR has_role(auth.uid(), 'admin'::app_role))
    AND has_accepted_guidelines(auth.uid())
  );

ALTER POLICY "Auth insert own comments" ON public.community_comments
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM community_posts p WHERE p.id = community_comments.post_id AND has_community_access(auth.uid(), p.space))
    AND has_accepted_guidelines(auth.uid())
  );

ALTER POLICY "Auth add own reactions" ON public.community_reactions
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM community_posts p WHERE p.id = community_reactions.post_id AND has_community_access(auth.uid(), p.space))
    AND has_accepted_guidelines(auth.uid())
  );

-- ---------- 2. No links in the first 24 hours ----------
CREATE OR REPLACE FUNCTION public.text_has_link(_t text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
AS $$
  SELECT COALESCE(_t, '') ~* '(https?://|hxxps?://|www\.|(^|[^a-z0-9@.-])[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|io|co|uk|ai|app|ly|me|info|biz|xyz|site|online|link|academy|dev|page|click|top|shop|store|live|tech|eu|nl|ru|cn)(/|[^a-z0-9-]|$))';
$$;

CREATE OR REPLACE FUNCTION public.guard_new_account_links()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE made timestamptz;
BEGIN
  IF NOT text_has_link(NEW.body) THEN RETURN NEW; END IF;
  IF has_role(NEW.user_id, 'admin'::app_role) THEN RETURN NEW; END IF;
  SELECT created_at INTO made FROM auth.users WHERE id = NEW.user_id;
  IF made IS NULL OR made > now() - interval '24 hours' THEN
    RAISE EXCEPTION 'NEW_ACCOUNT_LINKS: accounts under 24 hours old cannot post links'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_links_community_posts ON public.community_posts;
CREATE TRIGGER guard_links_community_posts BEFORE INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.guard_new_account_links();
DROP TRIGGER IF EXISTS guard_links_community_comments ON public.community_comments;
CREATE TRIGGER guard_links_community_comments BEFORE INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.guard_new_account_links();

-- ---------- 3. Marketing opt-in at sign-up ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE opted boolean := lower(COALESCE(NEW.raw_user_meta_data->>'marketing_opt_in', '')) = 'true';
BEGIN
  INSERT INTO public.profiles (id, email, full_name, marketing_opt_in, marketing_opt_in_at)
  VALUES (NEW.id, NEW.email, NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), opted, CASE WHEN opted THEN now() END)
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        marketing_opt_in = public.profiles.marketing_opt_in OR EXCLUDED.marketing_opt_in,
        marketing_opt_in_at = COALESCE(public.profiles.marketing_opt_in_at, EXCLUDED.marketing_opt_in_at);
  RETURN NEW;
END;
$$;

-- An opted-in member becomes a lead only once their email is confirmed, so nobody can
-- add someone else's address to the list.
CREATE OR REPLACE FUNCTION public.lms_signup_to_lead()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE p record;
BEGIN
  SELECT full_name, marketing_opt_in INTO p FROM profiles WHERE id = NEW.id;
  IF NOT FOUND OR NOT p.marketing_opt_in THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM leads WHERE lower(email) = lower(NEW.email)) THEN RETURN NEW; END IF;
  INSERT INTO leads (name, email, source, message)
  VALUES (COALESCE(p.full_name, split_part(NEW.email, '@', 1)), NEW.email, 'lms_signup',
          'Opted in to safety-tech tips and course news when creating a learning account.');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed_lead ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_lead AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.lms_signup_to_lead();
