-- Add event registration fields to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS event_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS event_title TEXT;

-- Create index for event_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_leads_event_id ON public.leads(event_id);
