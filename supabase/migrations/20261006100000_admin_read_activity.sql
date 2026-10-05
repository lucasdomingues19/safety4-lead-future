-- Reports dashboards (2026-10-06): admins can read learners' activity days.
drop policy if exists "Admins read activity days" on public.learning_activity_days;
create policy "Admins read activity days" on public.learning_activity_days
  for select to authenticated using (public.has_role((select auth.uid()), 'admin'::app_role));
