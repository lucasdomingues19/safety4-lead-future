-- People admin: track when a welcome (set-your-password) email was last sent,
-- so imported learners who haven't been invited yet can be found and batched.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcomed_at timestamptz;
