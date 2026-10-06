-- Search across the lessons a learner can open: titles, overview text, transcripts and
-- the learner's own notes. Learners only ever see their own enrolled courses (admins
-- see every course); notes are always the caller's own. Returns the best match per
-- lesson and kind, with a short snippet around the first hit.
create or replace function public.search_learning(_q text, _limit int default 30)
returns table (
  lesson_id uuid,
  course_slug text,
  course_title text,
  module_title text,
  lesson_title text,
  kind text,
  snippet text,
  score int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  q text := lower(trim(coalesce(_q, '')));
  words text[];
begin
  if uid is null or length(q) < 2 then return; end if;
  words := array(select w from unnest(regexp_split_to_array(q, '\s+')) w where length(w) >= 2 limit 6);
  if coalesce(array_length(words, 1), 0) = 0 then return; end if;

  return query
  with allowed as (
    select c.id course_id, c.slug, c.title ctitle
      from courses c
     where has_role(uid, 'admin')
        or exists (select 1 from enrollments e where e.user_id = uid and e.course_id = c.id and e.status = 'active'
                   and (e.expires_at is null or e.expires_at > now()))
  ), base as (
    select l.id lid, a.slug, a.ctitle, m.title mtitle, l.title ltitle, m.position mpos, l.position lpos,
           l.title t_title, coalesce(l.body, l.content, '') t_over, coalesce(l.transcript, '') t_tr,
           coalesce((select n.body from lesson_notes n where n.user_id = uid and n.lesson_id = l.id), '') t_note
      from lessons l join modules m on m.id = l.module_id join allowed a on a.course_id = m.course_id
  ), hits as (
    select b.*, f.kind, f.txt,
           (select bool_and(position(w in lower(f.txt)) > 0) from unnest(words) w) as ok
      from base b
      cross join lateral (values ('title', b.t_title), ('overview', b.t_over), ('transcript', b.t_tr), ('note', b.t_note)) as f(kind, txt)
     where f.txt <> ''
  )
  select h.lid, h.slug, h.ctitle, h.mtitle, h.ltitle, h.kind,
         case when h.kind = 'title' then h.ltitle
              else (case when position(words[1] in lower(h.txt)) > 80 then '…' else '' end)
                   || regexp_replace(substr(h.txt, greatest(position(words[1] in lower(h.txt)) - 80, 1), 220), '\s+', ' ', 'g')
                   || (case when length(h.txt) > position(words[1] in lower(h.txt)) + 140 then '…' else '' end)
         end,
         case h.kind when 'title' then 100 when 'note' then 80 when 'overview' then 60 else 40 end
  from hits h
  where h.ok
  order by 8 desc, h.mpos, h.lpos
  limit least(greatest(_limit, 1), 60);
end;
$$;

revoke all on function public.search_learning(text, int) from public, anon;
grant execute on function public.search_learning(text, int) to authenticated;
