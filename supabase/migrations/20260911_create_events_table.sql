-- Create events table for managing webinars and masterclasses
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  zoom_link TEXT,
  capacity INTEGER NOT NULL DEFAULT 100,
  registered INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events table
-- Anyone can view published events
CREATE POLICY "Anyone can view published events"
ON public.events
FOR SELECT
USING (published = true);

-- Admins can view all events
CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can create events
CREATE POLICY "Admins can create events"
ON public.events
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update events
CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete events
CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for faster queries
CREATE INDEX idx_events_published ON public.events(published);
CREATE INDEX idx_events_created_at ON public.events(created_at DESC);
