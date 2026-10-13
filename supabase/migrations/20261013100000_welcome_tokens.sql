-- Long-lived "set your password" links. Supabase's own one-time links die after 24 hours, which is too
-- short for people who open a migration email days later. This table holds our own token (stored as a
-- SHA-256 hash, never the token itself); the welcome-link function swaps a valid token for a fresh
-- one-time sign-in the moment the person presses the button. Service role only: RLS on, no policies.
CREATE TABLE IF NOT EXISTS public.welcome_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  uses integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS welcome_tokens_user_idx ON public.welcome_tokens (user_id);
ALTER TABLE public.welcome_tokens ENABLE ROW LEVEL SECURITY;

-- One reminder for people who still haven't signed in. Starts switched off.
ALTER TABLE public.migration_drip_config
  ADD COLUMN IF NOT EXISTS reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_deadline text;
