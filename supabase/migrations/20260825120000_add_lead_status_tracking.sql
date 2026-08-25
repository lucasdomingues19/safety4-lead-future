-- Add status and last_contacted_at columns to leads table for improved tracking

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE;

-- Add constraint to ensure status is one of the valid values
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected'));

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- Create index for sorting by last contact date
CREATE INDEX IF NOT EXISTS idx_leads_last_contacted ON public.leads(last_contacted_at DESC NULLS LAST);

-- Add comment documenting the status field
COMMENT ON COLUMN public.leads.status IS 'Lead status: new, contacted, qualified, converted, or rejected';
COMMENT ON COLUMN public.leads.last_contacted_at IS 'Timestamp of the last contact attempt or interaction with this lead';
