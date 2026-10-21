-- The last notice before Kajabi closes. Starts switched off; the deadline text goes into the email.
ALTER TABLE public.migration_drip_config
  ADD COLUMN IF NOT EXISTS final_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS final_deadline text;
