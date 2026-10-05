-- On/off switch per lifecycle automation (2026-10-06), managed in
-- admin > Emails > Automations and respected by lifecycle-messages.
create table if not exists public.email_automations (
  kind text primary key,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.email_automations enable row level security;
drop policy if exists "Admins read automations" on public.email_automations;
create policy "Admins read automations" on public.email_automations
  for select to authenticated using (public.has_role((select auth.uid()), 'admin'::app_role));
drop policy if exists "Admins update automations" on public.email_automations;
create policy "Admins update automations" on public.email_automations
  for update to authenticated using (public.has_role((select auth.uid()), 'admin'::app_role))
  with check (public.has_role((select auth.uid()), 'admin'::app_role));

insert into public.email_automations (kind) values
  ('welcome_course'), ('onboarding_day1'), ('onboarding_day3'), ('module_complete'), ('final_ready'),
  ('course_complete'), ('nudge_7'), ('nudge_21'), ('access_expiring'), ('event_reminder')
on conflict (kind) do nothing;
