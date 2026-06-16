ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS viewed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS engaged_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS linkedin_added_at timestamp with time zone;