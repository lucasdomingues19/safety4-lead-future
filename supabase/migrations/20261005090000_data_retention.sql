-- GDPR storage limitation (2026-10-05): personal data is deleted once it is
-- no longer needed, on the schedule stated in the Privacy Policy
-- (/privacy-policy, "How long we keep your data"). Runs daily via pg_cron.
--
--   website analytics (page_views, user_events)      26 months
--   website chat assistant conversations             24 months after last message
--   app error reports (client_errors)                90 days
--   leads + readiness-scorecard results              3 years after last contact
--
-- Learner accounts, enrolments, progress and certificates are kept while the
-- account exists; learners delete them from Settings (delete-account).

create extension if not exists pg_cron;

create or replace function public.purge_expired_personal_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  n_views int; n_events int; n_chats int; n_errors int; n_leads int; n_scores int;
begin
  delete from public.page_views where visited_at < now() - interval '26 months';
  get diagnostics n_views = row_count;
  delete from public.user_events where created_at < now() - interval '26 months';
  get diagnostics n_events = row_count;
  delete from public.chat_conversations where coalesce(last_message_at, created_at) < now() - interval '24 months';
  get diagnostics n_chats = row_count;
  delete from public.client_errors where created_at < now() - interval '90 days';
  get diagnostics n_errors = row_count;
  delete from public.leads where coalesce(last_contacted_at, created_at) < now() - interval '3 years';
  get diagnostics n_leads = row_count;
  delete from public.scorecard_results where created_at < now() - interval '3 years';
  get diagnostics n_scores = row_count;
  return jsonb_build_object('page_views', n_views, 'user_events', n_events, 'chat_conversations', n_chats,
                            'client_errors', n_errors, 'leads', n_leads, 'scorecard_results', n_scores);
end $$;

revoke execute on function public.purge_expired_personal_data() from public, anon, authenticated;
grant execute on function public.purge_expired_personal_data() to service_role;

select cron.unschedule('purge-expired-personal-data')
where exists (select 1 from cron.job where jobname = 'purge-expired-personal-data');
select cron.schedule('purge-expired-personal-data', '15 3 * * *', $$select public.purge_expired_personal_data()$$);
