-- The bespoke proposal builder saves rich sections, the bespoke type and several recipients.
-- These columns were in an earlier migration that never reached the database.
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS proposal_type TEXT NOT NULL DEFAULT 'course',
  ADD COLUMN IF NOT EXISTS contact_emails_json JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$ BEGIN
  ALTER TABLE public.proposals ADD CONSTRAINT proposals_proposal_type_check CHECK (proposal_type IN ('course', 'bespoke'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
