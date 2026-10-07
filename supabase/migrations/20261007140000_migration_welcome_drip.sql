-- Rate-limited welcome emails for learners moved over from Kajabi.
-- The queue is filled by scripts/kajabi-migrate.py; a scheduled function sends a few per run,
-- in priority order, inside the shared daily email budget (email_log), and only while enabled.
-- Both tables are service-role only (RLS on, no policies).

CREATE TABLE IF NOT EXISTS public.migration_welcome_queue (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  priority int NOT NULL DEFAULT 2,          -- 1 = learning in progress, 2 = finished, 3 = not started
  last_active date,
  queued_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  error text
);
ALTER TABLE public.migration_welcome_queue ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.migration_drip_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT false,   -- OFF until Lucas has announced the move
  daily_cap int NOT NULL DEFAULT 60 CHECK (daily_cap BETWEEN 1 AND 90),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.migration_drip_config ENABLE ROW LEVEL SECURITY;
INSERT INTO public.migration_drip_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Every 30 minutes during UK working hours. Spreading the sends is kinder to inbox providers than one burst.
SELECT cron.schedule('migration-welcome-drip', '*/30 8-16 * * *', $$
  select net.http_post(
    url := 'https://yiqnwhxnbbtoxhysgteh.supabase.co/functions/v1/migration-welcome-drip',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'lifecycle_cron_secret')),
    body := '{"action":"run"}'::jsonb,
    timeout_milliseconds := 60000)
$$);
