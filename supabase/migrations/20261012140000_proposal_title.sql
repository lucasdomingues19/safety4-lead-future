-- A proposal's own title (shown on its cover), separate from the organisation.
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS title TEXT;
