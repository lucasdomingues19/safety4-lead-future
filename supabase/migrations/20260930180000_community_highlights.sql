-- Community sidebar highlights: announcements, offers, promotions and events
-- that admins manage directly on the community page. A highlight can target
-- one space or both, and can be scheduled with start/end dates.
CREATE TABLE IF NOT EXISTS public.community_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'announcement' CHECK (kind IN ('announcement', 'offer', 'promotion', 'event')),
  space text NOT NULL DEFAULT 'all' CHECK (space IN ('all', 'academy', 'global-network')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  body text CHECK (char_length(body) <= 600),
  image_url text,
  cta_label text CHECK (char_length(cta_label) <= 40),
  cta_url text CHECK (cta_url IS NULL OR cta_url ~* '^(https://|mailto:|/)'),
  starts_at timestamptz,
  ends_at timestamptz,
  position int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read live highlights" ON public.community_highlights;
CREATE POLICY "Members read live highlights" ON public.community_highlights
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR ((space = 'all' OR has_community_access(auth.uid(), space))
        AND (starts_at IS NULL OR starts_at <= now())
        AND (ends_at IS NULL OR ends_at > now()))
  );
DROP POLICY IF EXISTS "Admins manage highlights" ON public.community_highlights;
CREATE POLICY "Admins manage highlights" ON public.community_highlights
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
