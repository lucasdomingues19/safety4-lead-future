-- Morning-of reminder for paid live events: 09:00 UTC (9am UK in December) on 9 Dec.
-- The function only sends in the 8 hours before an event, so a yearly re-run is harmless;
-- unschedule after the event: select cron.unschedule('event-reminders-2026-12-09');
select cron.schedule(
  'event-reminders-2026-12-09',
  '0 9 9 12 *',
  $$
  select net.http_post(
    url := 'https://yiqnwhxnbbtoxhysgteh.supabase.co/functions/v1/event-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'lifecycle_cron_secret')),
    body := '{}'::jsonb
  );
  $$
);
