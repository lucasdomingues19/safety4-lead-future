-- 1) Instant in-app notification the first time a learner passes a quiz.
create or replace function public.notify_quiz_passed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  q record;
begin
  if not coalesce(new.passed, false) then return new; end if;
  -- Only the first pass of each quiz (retakes after passing stay quiet).
  if exists (select 1 from quiz_attempts a where a.user_id = new.user_id and a.quiz_id = new.quiz_id and a.passed and a.id <> new.id) then
    return new;
  end if;
  select qz.title as quiz_title, m.title as module_title, c.slug, c.title as course_title
    into q
    from quizzes qz join modules m on m.id = qz.module_id join courses c on c.id = m.course_id
   where qz.id = new.quiz_id;
  if q is null then return new; end if;
  perform notify(new.user_id, 'quiz_passed',
    'Quiz passed: ' || q.quiz_title || ' (' || new.score || '%)',
    'Well done. ' || q.module_title || ' is complete.',
    '/learn/' || q.slug);
  return new;
end;
$$;

drop trigger if exists trg_notify_quiz_passed on public.quiz_attempts;
create trigger trg_notify_quiz_passed
  after insert on public.quiz_attempts
  for each row execute function public.notify_quiz_passed();

-- 2) Inactivity reminders move from 7 + 21 days to 7, 14, 30, 60 and 90 days.
insert into public.email_automations (kind, enabled)
select k, coalesce((select enabled from public.email_automations where kind = 'nudge_21'), true)
  from unnest(array['nudge_14', 'nudge_30', 'nudge_60', 'nudge_90']) k
on conflict (kind) do nothing;
delete from public.email_automations where kind = 'nudge_21';
