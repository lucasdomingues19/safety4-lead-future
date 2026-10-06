-- Lesson comment reactions (2026-10-06) + comments limited to enrolled learners.
--
-- Before: any signed-in person could read AND post comments on any lesson,
-- including paid courses they weren't enrolled in. Now only learners enrolled
-- in the lesson's course (and admins) can; admins can still remove any comment.

create table if not exists public.lesson_comment_reactions (
  comment_id uuid not null references public.lesson_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('like', 'love', 'support', 'insightful', 'celebrate')),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id, kind)
);
create index if not exists lesson_comment_reactions_comment on public.lesson_comment_reactions (comment_id);
alter table public.lesson_comment_reactions enable row level security;

create or replace function public.can_use_lesson_comments(_user uuid, _lesson uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select _user is not null and (
    public.has_role(_user, 'admin'::app_role)
    or public.is_enrolled(_user, public.course_of_lesson(_lesson))
  )
$$;
revoke execute on function public.can_use_lesson_comments(uuid, uuid) from public, anon;
grant execute on function public.can_use_lesson_comments(uuid, uuid) to authenticated, service_role;

drop policy if exists "Authenticated users can view lesson comments" on public.lesson_comments;
create policy "Enrolled learners view lesson comments" on public.lesson_comments
  for select to authenticated using (public.can_use_lesson_comments((select auth.uid()), lesson_id));
drop policy if exists "Users can post their own comments" on public.lesson_comments;
create policy "Enrolled learners post their own comments" on public.lesson_comments
  for insert to authenticated with check ((select auth.uid()) = user_id and public.can_use_lesson_comments((select auth.uid()), lesson_id));

create policy "Enrolled learners view reactions" on public.lesson_comment_reactions
  for select to authenticated using (exists (select 1 from public.lesson_comments c where c.id = comment_id and public.can_use_lesson_comments((select auth.uid()), c.lesson_id)));
create policy "Enrolled learners add own reactions" on public.lesson_comment_reactions
  for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.lesson_comments c where c.id = comment_id and public.can_use_lesson_comments((select auth.uid()), c.lesson_id)));
create policy "Remove own reactions" on public.lesson_comment_reactions
  for delete to authenticated using ((select auth.uid()) = user_id);
