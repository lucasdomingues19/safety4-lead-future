-- Admin tags on people (e.g. "Kajabi import", "Cohort Oct 2026", "VIP"),
-- used to filter the People list and target announcements. Admin-only.
CREATE TABLE IF NOT EXISTS public.people_tags (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag text NOT NULL CHECK (char_length(tag) BETWEEN 1 AND 40),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tag)
);
CREATE INDEX IF NOT EXISTS people_tags_tag_idx ON public.people_tags (tag);
ALTER TABLE public.people_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage people tags" ON public.people_tags;
CREATE POLICY "Admins manage people tags" ON public.people_tags
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
