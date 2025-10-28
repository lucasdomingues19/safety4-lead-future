-- Create table for tracking user events (clicks, scrolls, etc.)
CREATE TABLE public.user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events
CREATE POLICY "Anyone can insert events"
  ON public.user_events FOR INSERT
  WITH CHECK (true);

-- Admins can view all events
CREATE POLICY "Admins can view all events"
  ON public.user_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_user_events_session_id ON public.user_events(session_id);
CREATE INDEX idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX idx_user_events_page_path ON public.user_events(page_path);

-- Add last_active column to page_views for session duration tracking
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;