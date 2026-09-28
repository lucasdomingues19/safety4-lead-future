-- Extends profiles with the fields the Settings screen and admin user
-- list actually need. LmsSettings.tsx previously showed hardcoded fake
-- profile data ("Sarah Chen", "HSE Manager"...) and its Save button had
-- no onClick handler at all.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS organisation TEXT,
  ADD COLUMN IF NOT EXISTS auto_advance BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS captions_default BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_reminders BOOLEAN NOT NULL DEFAULT false;
