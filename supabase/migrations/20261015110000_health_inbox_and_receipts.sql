-- Adds 'inbox' (daily self-test of hello@), purchases missing an invoice link and purchase-email failures to the snapshot.
-- Numbers for the admin Health page, computed in the database. Read-only. No personal data is returned
-- (no names, emails or user ids): counts, timestamps, job names and short error text only.
-- Admins only: the function checks has_role itself, so it is safe to call from the browser.
CREATE OR REPLACE FUNCTION public.admin_health_snapshot()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admins only' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'generated_at', now(),

    'database', jsonb_build_object(
      'size_bytes', pg_database_size(current_database()),
      'connections', (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()),
      'max_connections', current_setting('max_connections')::int,
      'tables_without_rls', (SELECT coalesce(jsonb_agg(tablename ORDER BY tablename), '[]'::jsonb) FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity),
      'accounts_without_profile', (SELECT count(*) FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE p.id IS NULL)
    ),

    'cron', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'name', j.jobname,
        'schedule', j.schedule,
        'active', j.active,
        'last_run_at', l.start_time,
        'last_status', l.status,
        'last_message', left(coalesce(l.return_message, ''), 160),
        -- how long a gap is normal for this job; null = no rule
        'max_gap_minutes', CASE j.jobname
          WHEN 'lifecycle-messages' THEN 45
          WHEN 'migration-welcome-drip' THEN 75
          WHEN 'community-post-email-drain' THEN 75
          WHEN 'purge-expired-personal-data' THEN 26 * 60
        END,
        -- jobs that only run in a daily window
        'window_utc', CASE WHEN j.jobname IN ('migration-welcome-drip', 'community-post-email-drain') THEN '08:00 to 16:30' END
      ) ORDER BY j.jobid), '[]'::jsonb)
      FROM cron.job j
      LEFT JOIN LATERAL (
        SELECT d.status, d.start_time, d.return_message FROM cron.job_run_details d WHERE d.jobid = j.jobid ORDER BY d.start_time DESC LIMIT 1
      ) l ON true
    ),

    'email', jsonb_build_object(
      'sent_24h', (SELECT count(*) FROM email_log WHERE status = 'sent' AND sent_at > now() - interval '24 hours'),
      'failed_48h', (SELECT count(*) FROM email_log WHERE status = 'failed' AND sent_at > now() - interval '48 hours'),
      'stuck_sending', (SELECT count(*) FROM email_log WHERE status = 'sending' AND sent_at < now() - interval '30 minutes'),
      'last_sent_at', (SELECT max(sent_at) FROM email_log WHERE status = 'sent'),
      'purchase_emails_failed_7d', (SELECT count(*) FROM email_log WHERE kind IN ('purchase', 'purchase_resend') AND status = 'failed' AND sent_at > now() - interval '7 days'),
      'automations_off', (SELECT coalesce(jsonb_agg(kind ORDER BY kind), '[]'::jsonb) FROM email_automations WHERE NOT enabled),
      'recent_failures', (SELECT coalesce(jsonb_agg(jsonb_build_object('kind', kind, 'error', left(coalesce(error, ''), 140), 'at', sent_at) ORDER BY sent_at DESC), '[]'::jsonb)
                          FROM (SELECT kind, error, sent_at FROM email_log WHERE status = 'failed' ORDER BY sent_at DESC LIMIT 5) f)
    ),

    'migration', jsonb_build_object(
      'queued', (SELECT count(*) FROM migration_welcome_queue),
      'welcomed', (SELECT count(*) FROM migration_welcome_queue WHERE sent_at IS NOT NULL),
      'failed', (SELECT count(*) FROM migration_welcome_queue WHERE error IS NOT NULL AND sent_at IS NULL),
      'signed_in', (SELECT count(*) FROM migration_welcome_queue q JOIN auth.users u ON u.id = q.user_id WHERE u.last_sign_in_at IS NOT NULL),
      'course_learners', (SELECT count(*) FROM migration_welcome_queue WHERE priority <= 3),
      'course_learners_signed_in', (SELECT count(*) FROM migration_welcome_queue q JOIN auth.users u ON u.id = q.user_id WHERE q.priority <= 3 AND u.last_sign_in_at IS NOT NULL),
      'reminders_sent', (SELECT count(*) FROM email_log WHERE kind = 'migration_reminder' AND status = 'sent'),
      'reminders_failed', (SELECT count(*) FROM email_log WHERE kind = 'migration_reminder' AND status = 'failed'),
      'drip_enabled', (SELECT enabled FROM migration_drip_config WHERE id = 1),
      'reminder_enabled', (SELECT reminder_enabled FROM migration_drip_config WHERE id = 1)
    ),

    'learning', jsonb_build_object(
      'accounts', (SELECT count(*) FROM auth.users),
      'new_accounts_24h', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '24 hours'),
      'active_24h', (SELECT count(*) FROM auth.users WHERE last_sign_in_at > now() - interval '24 hours'),
      'active_7d', (SELECT count(*) FROM auth.users WHERE last_sign_in_at > now() - interval '7 days'),
      'active_enrolments', (SELECT count(*) FROM enrollments WHERE status = 'active'),
      'expiring_7d', (SELECT count(*) FROM enrollments WHERE status = 'active' AND expires_at BETWEEN now() AND now() + interval '7 days'),
      'lessons_done_24h', (SELECT count(*) FROM lesson_progress WHERE completed_at > now() - interval '24 hours'),
      'quiz_attempts_24h', (SELECT count(*) FROM quiz_attempts WHERE attempted_at > now() - interval '24 hours'),
      'certificates_7d', (SELECT count(*) FROM certificates WHERE issued_at > now() - interval '7 days'),
      'last_certificate_at', (SELECT max(issued_at) FROM certificates),
      'courses_published', (SELECT count(*) FROM courses WHERE published),
      'courses_unpublished', (SELECT count(*) FROM courses WHERE NOT published),
      'mia_handoffs_7d', (SELECT count(*) FROM mia_handoffs WHERE created_at > now() - interval '7 days')
    ),

    'errors', jsonb_build_object(
      'last_24h', (SELECT count(*) FROM client_errors WHERE created_at > now() - interval '24 hours'),
      'last_7d', (SELECT count(*) FROM client_errors WHERE created_at > now() - interval '7 days'),
      'recent', (SELECT coalesce(jsonb_agg(jsonb_build_object('screen', screen, 'message', left(coalesce(message, ''), 140), 'at', created_at) ORDER BY created_at DESC), '[]'::jsonb)
                 FROM (SELECT screen, message, created_at FROM client_errors ORDER BY created_at DESC LIMIT 5) e)
    ),

    'inbox', jsonb_build_object(
      'last_probe_at', (SELECT max(sent_at) FROM mail_probes),
      'last_ok', (SELECT ok FROM mail_probes ORDER BY sent_at DESC LIMIT 1),
      'last_event', (SELECT last_event FROM mail_probes ORDER BY sent_at DESC LIMIT 1),
      'last_detail', (SELECT detail FROM mail_probes ORDER BY sent_at DESC LIMIT 1),
      'failed_7d', (SELECT count(*) FROM mail_probes WHERE NOT ok AND sent_at > now() - interval '7 days')
    ),

    'content', jsonb_build_object(
      'lessons_with_media', (SELECT count(*) FROM lessons WHERE coalesce(media_path, '') <> '' OR coalesce(video_url, '') <> ''),
      'missing_transcript', (SELECT count(*) FROM lessons WHERE (coalesce(media_path, '') <> '' OR coalesce(video_url, '') <> '') AND coalesce(transcript, '') = ''),
      'missing_captions', (SELECT count(*) FROM lessons WHERE coalesce(media_path, '') <> '' AND coalesce(captions_path, '') = '')
    ),

    'payments', jsonb_build_object(
      'last_purchase_at', (SELECT max(purchased_at) FROM course_purchases WHERE status = 'paid'),
      'paid_30d', (SELECT count(*) FROM course_purchases WHERE status = 'paid' AND purchased_at > now() - interval '30 days'),
      'refunded_30d', (SELECT count(*) FROM course_purchases WHERE status = 'refunded' AND purchased_at > now() - interval '30 days'),
      'missing_invoice', (SELECT count(*) FROM course_purchases WHERE status = 'paid' AND amount_cents > 0 AND invoice_url IS NULL AND purchased_at < now() - interval '1 hour')
    )
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_health_snapshot() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_health_snapshot() TO authenticated;

-- Daily check that hello@ can receive mail (07:05 UTC).
SELECT cron.schedule('inbox-probe', '5 7 * * *', $cron$
  select net.http_post(
    url := 'https://yiqnwhxnbbtoxhysgteh.supabase.co/functions/v1/admin-purchase-tools',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'lifecycle_cron_secret')),
    body := '{"action":"probe_inbox"}'::jsonb,
    timeout_milliseconds := 60000)
$cron$);
