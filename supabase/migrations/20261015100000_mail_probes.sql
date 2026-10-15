-- Daily self-test of our own inbox: a message is sent to hello@ and what the receiving server said is stored here,
-- so a broken mailbox shows on the admin Health page the same day. Service role only (RLS on, no policies).
CREATE TABLE IF NOT EXISTS public.mail_probes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  resend_id text,
  last_event text,
  ok boolean NOT NULL DEFAULT false,
  detail text
);
CREATE INDEX IF NOT EXISTS mail_probes_sent_idx ON public.mail_probes (sent_at DESC);
ALTER TABLE public.mail_probes ENABLE ROW LEVEL SECURITY;
