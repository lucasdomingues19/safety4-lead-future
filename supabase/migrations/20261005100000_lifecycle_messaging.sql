-- Lifecycle messaging (2026-10-05): in-app notifications, an idempotent email
-- log, and the scheduler that runs the `lifecycle-messages` edge function.
--
-- Event-driven notifications (enrolment, certificate, reply to your post) are
-- written by triggers here. Time-based ones (onboarding, module complete,
-- nudges, expiring access, event reminders) and every email come from the
-- lifecycle-messages function, every 15 minutes.

-- ---------- notifications ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_user_created on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;

drop policy if exists "Own notifications are readable" on public.notifications;
create policy "Own notifications are readable" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Own notifications can be marked read" on public.notifications;
create policy "Own notifications can be marked read" on public.notifications
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- No insert/delete policies: only triggers and the service role write them.

-- Learners may only change read_at on their own rows.
create or replace function public.notifications_guard_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' and (
     new.user_id is distinct from old.user_id or new.kind is distinct from old.kind or
     new.title is distinct from old.title or new.body is distinct from old.body or
     new.link is distinct from old.link or new.created_at is distinct from old.created_at) then
    raise exception 'Only read_at can be changed';
  end if;
  return new;
end $$;
drop trigger if exists trg_notifications_guard on public.notifications;
create trigger trg_notifications_guard before update on public.notifications
  for each row execute function public.notifications_guard_update();

create or replace function public.notify(_user uuid, _kind text, _title text, _body text, _link text)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, kind, title, body, link) values (_user, _kind, _title, _body, _link);
$$;
revoke execute on function public.notify(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.notify(uuid, text, text, text, text) to service_role;

-- Someone replied to your community post.
create or replace function public.notify_comment_reply()
returns trigger language plpgsql security definer set search_path = public as $$
declare p record;
begin
  select user_id, left(regexp_replace(coalesce(body, ''), '\s+', ' ', 'g'), 60) as snippet into p
  from public.community_posts where id = new.post_id;
  if p.user_id is not null and p.user_id <> new.user_id then
    perform public.notify(p.user_id, 'community_reply',
      coalesce(nullif(new.author_name, ''), 'Someone') || ' replied to your post',
      left(regexp_replace(new.body, '\s+', ' ', 'g'), 140), '/learn?view=community');
  end if;
  return new;
end $$;
drop trigger if exists trg_notify_comment_reply on public.community_comments;
create trigger trg_notify_comment_reply after insert on public.community_comments
  for each row execute function public.notify_comment_reply();

-- You've been given access to a course (purchase, admin grant or import).
create or replace function public.notify_enrolment()
returns trigger language plpgsql security definer set search_path = public as $$
declare c record;
begin
  if new.status = 'active' and (tg_op = 'INSERT' or old.status is distinct from 'active') then
    select title, slug into c from public.courses where id = new.course_id;
    perform public.notify(new.user_id, 'enrolled', 'You now have access to ' || coalesce(c.title, 'a new course'),
      'Start with the first lesson whenever you are ready.', '/learn/' || coalesce(c.slug, ''));
  end if;
  return new;
end $$;
drop trigger if exists trg_notify_enrolment on public.enrollments;
create trigger trg_notify_enrolment after insert or update of status on public.enrollments
  for each row execute function public.notify_enrolment();

-- Your certificate was issued.
create or replace function public.notify_certificate()
returns trigger language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(new.recipient_email) limit 1;
  if uid is not null then
    perform public.notify(uid, 'certificate', 'Your certificate is ready',
      new.course_name || ' — verified and shareable.', '/verify/' || new.certificate_number);
  end if;
  return new;
end $$;
drop trigger if exists trg_notify_certificate on public.certificates;
create trigger trg_notify_certificate after insert on public.certificates
  for each row execute function public.notify_certificate();

-- ---------- email log (exactly-once sending) ----------
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  kind text not null,
  dedupe_key text not null default '',
  status text not null default 'sent',
  error text,
  sent_at timestamptz not null default now(),
  unique (user_id, kind, dedupe_key)
);
alter table public.email_log enable row level security;
drop policy if exists "Admins read the email log" on public.email_log;
create policy "Admins read the email log" on public.email_log
  for select to authenticated using (public.has_role((select auth.uid()), 'admin'::app_role));

-- Progress reminders are on by default (learners can switch them off in
-- Settings or with the unsubscribe link). Account and payment emails always send.
alter table public.profiles alter column email_reminders set default true;
update public.profiles set email_reminders = true where email_reminders = false;

-- ---------- scheduler ----------
create extension if not exists pg_net;

select cron.unschedule('lifecycle-messages')
where exists (select 1 from cron.job where jobname = 'lifecycle-messages');
select cron.schedule('lifecycle-messages', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://yiqnwhxnbbtoxhysgteh.supabase.co/functions/v1/lifecycle-messages',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'lifecycle_cron_secret')),
    body := '{"run":"scheduled"}'::jsonb,
    timeout_milliseconds := 60000)
$$);
