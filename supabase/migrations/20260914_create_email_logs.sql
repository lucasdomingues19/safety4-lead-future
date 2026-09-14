-- Email logs table for tracking email notifications
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('enrollment', 'completion', 'certificate')),
  message_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  data JSONB,
  sent_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient);
CREATE INDEX idx_email_logs_type ON public.email_logs(email_type);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at);

-- Comments
COMMENT ON TABLE public.email_logs IS 'Track all email notifications sent to students';
COMMENT ON COLUMN public.email_logs.email_type IS 'Type of email: enrollment confirmation, course completion, or certificate delivery';
COMMENT ON COLUMN public.email_logs.message_id IS 'Resend API message ID for tracking and support';
COMMENT ON COLUMN public.email_logs.data IS 'Email content metadata (student name, course title, CPD hours, etc)';
