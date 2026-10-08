-- Admin posts can be emailed to members, one tick box per post (default off).
-- Recipients are queued here and drained within the shared daily email budget,
-- so a big community never breaks Resend's 100/day limit.

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS email_requested boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.community_email_queue (
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  queued_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  error text,
  PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS community_email_queue_status_idx ON public.community_email_queue (status, queued_at);
ALTER TABLE public.community_email_queue ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (edge functions) reads or writes this table.

-- Drain every 30 minutes during UK working hours, same pattern as the welcome drip.
SELECT cron.schedule('community-post-email-drain', '*/30 8-16 * * *', $$
  select net.http_post(
    url := 'https://yiqnwhxnbbtoxhysgteh.supabase.co/functions/v1/community-post-email',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'lifecycle_cron_secret')),
    body := '{"action":"drain"}'::jsonb,
    timeout_milliseconds := 60000)
$$);
