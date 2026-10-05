-- Personal lesson notes and reflection answers (2026-10-05). One private note
-- per learner per lesson; on reflection lessons the UI presents it as "Your
-- reflection". Included in the learner's data export; deleted with the account.
create table if not exists public.lesson_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  body text not null default '' check (length(body) <= 20000),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.lesson_notes enable row level security;

drop policy if exists "Own notes: read" on public.lesson_notes;
create policy "Own notes: read" on public.lesson_notes for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Own notes: write" on public.lesson_notes;
create policy "Own notes: write" on public.lesson_notes for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Own notes: update" on public.lesson_notes;
create policy "Own notes: update" on public.lesson_notes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "Own notes: delete" on public.lesson_notes;
create policy "Own notes: delete" on public.lesson_notes for delete to authenticated using (user_id = (select auth.uid()));
