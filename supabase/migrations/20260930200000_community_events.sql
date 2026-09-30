-- Live events in the community (Zoom sessions, webinars, Q&As).
-- Each event belongs to one community space (free Academy or paid Global
-- Network) and is only visible to people with access to that space.
-- A session can carry a Zoom join link, an embeddable live-stream link
-- (YouTube Live / Vimeo / Loom) and, afterwards, a replay link.

CREATE TABLE IF NOT EXISTS public.community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space text NOT NULL DEFAULT 'academy' CHECK (space IN ('academy', 'global-network')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 140),
  description text CHECK (char_length(description) <= 4000),
  image_url text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  join_url text CHECK (join_url IS NULL OR join_url ~* '^https://'),
  stream_url text CHECK (stream_url IS NULL OR stream_url ~* '^https://'),
  replay_url text CHECK (replay_url IS NULL OR replay_url ~* '^https://'),
  live_now boolean NOT NULL DEFAULT false,      -- admin "Go live" switch (forces live even outside the schedule)
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS community_events_space_start_idx ON public.community_events (space, starts_at);
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read events" ON public.community_events;
CREATE POLICY "Members read events" ON public.community_events
  FOR SELECT TO authenticated USING (has_community_access(auth.uid(), space));
DROP POLICY IF EXISTS "Admins manage events" ON public.community_events;
CREATE POLICY "Admins manage events" ON public.community_events
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.community_event_rsvps (
  event_id uuid NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
ALTER TABLE public.community_event_rsvps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read own rsvps" ON public.community_event_rsvps;
CREATE POLICY "Read own rsvps" ON public.community_event_rsvps
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Add own rsvp" ON public.community_event_rsvps;
CREATE POLICY "Add own rsvp" ON public.community_event_rsvps
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.community_events e WHERE e.id = event_id AND has_community_access(auth.uid(), e.space)));
DROP POLICY IF EXISTS "Remove own rsvp" ON public.community_event_rsvps;
CREATE POLICY "Remove own rsvp" ON public.community_event_rsvps
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- "12 going" without exposing who.
CREATE OR REPLACE FUNCTION public.event_rsvp_counts(_ids uuid[])
RETURNS TABLE(event_id uuid, going bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.event_id, count(*)
  FROM community_event_rsvps r
  JOIN community_events e ON e.id = r.event_id
  WHERE r.event_id = ANY(_ids[1:100]) AND has_community_access(auth.uid(), e.space)
  GROUP BY r.event_id
$$;
REVOKE ALL ON FUNCTION public.event_rsvp_counts(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.event_rsvp_counts(uuid[]) TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'community_events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_events;
  END IF;
END $$;
