-- Team / company accounts: a company (organisation) buys seats for a course; a manager
-- assigns seats to people, sees their progress and can remove them. One seat = one
-- learner enrolment on that course. Money flows (card checkout, invoices) grant seats
-- through grant_team_seats(); everything else is plain data.

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  billing_email text,
  vat_id text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.organisation_members (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'manager', 'member')),
  created_at timestamptz not null default now(),
  primary key (organisation_id, user_id)
);
create index if not exists organisation_members_user_idx on public.organisation_members (user_id);

-- A ledger of seats bought or granted. Total seats for a course = the sum of its rows.
create table if not exists public.organisation_seats (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  seats int not null check (seats > 0),
  access_days int check (access_days is null or access_days > 0),   -- null = lifetime
  source text not null check (source in ('card', 'invoice', 'manual')),
  reference text unique,                                             -- Stripe session / invoice id (makes grants idempotent)
  amount_cents int,
  currency text not null default 'gbp',
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);
create index if not exists organisation_seats_org_idx on public.organisation_seats (organisation_id, course_id);

alter table public.enrollments add column if not exists organisation_id uuid references public.organisations(id) on delete set null;
create index if not exists enrollments_org_course_idx on public.enrollments (organisation_id, course_id) where organisation_id is not null;

-- Per-course team pricing: volume tiers (highest matching tier applies).
alter table public.courses add column if not exists team_enabled boolean not null default true;
alter table public.courses add column if not exists team_tiers jsonb not null default '[{"min":5,"pct":10},{"min":10,"pct":15},{"min":25,"pct":20}]'::jsonb;
alter table public.courses add column if not exists stripe_product_id text;

-- ---------- access rules ----------
create or replace function public.is_org_manager(_user uuid, _org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from organisation_members where organisation_id = _org and user_id = _user and role in ('owner', 'manager'));
$$;

create or replace function public.is_org_member(_user uuid, _org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from organisation_members where organisation_id = _org and user_id = _user);
$$;

alter table public.organisations enable row level security;
alter table public.organisation_members enable row level security;
alter table public.organisation_seats enable row level security;

drop policy if exists "Org members read their organisation" on public.organisations;
create policy "Org members read their organisation" on public.organisations for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'::app_role) or public.is_org_member((select auth.uid()), id));
drop policy if exists "Admins manage organisations" on public.organisations;
create policy "Admins manage organisations" on public.organisations for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'::app_role)) with check (public.has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Read own or managed memberships" on public.organisation_members;
create policy "Read own or managed memberships" on public.organisation_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_org_manager((select auth.uid()), organisation_id) or public.has_role((select auth.uid()), 'admin'::app_role));
drop policy if exists "Admins manage memberships" on public.organisation_members;
create policy "Admins manage memberships" on public.organisation_members for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'::app_role)) with check (public.has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Managers read seats" on public.organisation_seats;
create policy "Managers read seats" on public.organisation_seats for select to authenticated
  using (public.is_org_manager((select auth.uid()), organisation_id) or public.has_role((select auth.uid()), 'admin'::app_role));
drop policy if exists "Admins manage seats" on public.organisation_seats;
create policy "Admins manage seats" on public.organisation_seats for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'::app_role)) with check (public.has_role((select auth.uid()), 'admin'::app_role));

-- ---------- pricing ----------
-- Per-seat price after the volume discount. Prices are public; this just does the maths in one place.
create or replace function public.team_price(_course uuid, _seats int)
returns table (unit_cents int, discount_pct int, total_cents int, list_cents int, currency text)
language plpgsql stable security definer set search_path = public as $$
declare c record; pct int := 0; t jsonb;
begin
  select price_cents, courses.currency as cur, team_tiers into c from courses where id = _course;
  if c is null or coalesce(c.price_cents, 0) <= 0 or _seats < 1 then return; end if;
  for t in select * from jsonb_array_elements(coalesce(c.team_tiers, '[]'::jsonb)) loop
    if _seats >= (t->>'min')::int and (t->>'pct')::int > pct then pct := (t->>'pct')::int; end if;
  end loop;
  return query select (round(c.price_cents * (100 - pct) / 100.0))::int, pct, (round(c.price_cents * (100 - pct) / 100.0))::int * _seats, c.price_cents * _seats, coalesce(c.cur, 'GBP');
end $$;

-- ---------- manager screens ----------
create or replace function public.org_seat_summary(_org uuid)
returns table (course_id uuid, course_title text, course_slug text, seats int, used int, free int, access_days int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (is_org_manager(auth.uid(), _org) or has_role(auth.uid(), 'admin')) then raise exception 'not allowed'; end if;
  return query
  select c.id, c.title, c.slug,
         s.total::int,
         coalesce((select count(*) from enrollments e where e.organisation_id = _org and e.course_id = c.id), 0)::int,
         (s.total - coalesce((select count(*) from enrollments e where e.organisation_id = _org and e.course_id = c.id), 0))::int,
         (select os.access_days from organisation_seats os where os.organisation_id = _org and os.course_id = c.id order by os.created_at desc limit 1)
    from (select os.course_id cid, sum(os.seats) total from organisation_seats os where os.organisation_id = _org group by os.course_id) s
    join courses c on c.id = s.cid
   order by c.title;
end $$;

create or replace function public.org_team(_org uuid)
returns table (user_id uuid, name text, email text, role text, course_id uuid, course_title text, status text,
               lessons_done int, lessons_total int, last_active timestamptz, certified boolean, enrolled_at timestamptz, expires_at timestamptz, signed_in boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (is_org_manager(auth.uid(), _org) or has_role(auth.uid(), 'admin')) then raise exception 'not allowed'; end if;
  return query
  select m.user_id, coalesce(p.full_name, split_part(p.email, '@', 1)), p.email, m.role,
         e.course_id, c.title, coalesce(e.status, 'none'),
         coalesce(d.done, 0)::int, coalesce(t.total, 0)::int,
         greatest(d.last_done, w.last_watch, a.last_day),
         exists (select 1 from certificates ce where lower(ce.recipient_email) = lower(p.email) and ce.course_name = c.title and ce.status <> 'revoked'),
         e.enrolled_at, e.expires_at,
         (u.last_sign_in_at is not null)
    from organisation_members m
    join profiles p on p.id = m.user_id
    join auth.users u on u.id = m.user_id
    left join enrollments e on e.user_id = m.user_id and e.organisation_id = _org
    left join courses c on c.id = e.course_id
    left join lateral (select count(*) total from lessons l join modules mo on mo.id = l.module_id where mo.course_id = e.course_id) t on true
    left join lateral (select count(*) done, max(lp.completed_at) last_done from lesson_progress lp join lessons l on l.id = lp.lesson_id join modules mo on mo.id = l.module_id
                        where lp.user_id = m.user_id and mo.course_id = e.course_id and lp.is_completed) d on true
    left join lateral (select max(lw.last_heartbeat_at) last_watch from lesson_watch lw join lessons l on l.id = lw.lesson_id join modules mo on mo.id = l.module_id
                        where lw.user_id = m.user_id and mo.course_id = e.course_id) w on true
    left join lateral (select max((ad.day::text || 'T12:00:00Z')::timestamptz) last_day from learning_activity_days ad where ad.user_id = m.user_id) a on true
   where m.organisation_id = _org
   order by p.full_name nulls last, p.email, c.title;
end $$;

-- ---------- seat operations (called by the server with the service role) ----------
create or replace function public.grant_team_seats(_org uuid, _course uuid, _seats int, _access_days int, _source text, _ref text, _amount int, _by uuid, _note text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  insert into organisation_seats (organisation_id, course_id, seats, access_days, source, reference, amount_cents, created_by, note)
  values (_org, _course, _seats, _access_days, _source, _ref, _amount, _by, _note)
  on conflict (reference) do nothing;
  return found;
end $$;

create or replace function public.team_assign_seat(_org uuid, _course uuid, _user uuid)
returns text language plpgsql security definer set search_path = public as $$
declare total int; used int; days int; ex record; has_row boolean;
begin
  perform 1 from organisations where id = _org for update;
  select coalesce(sum(seats), 0) into total from organisation_seats where organisation_id = _org and course_id = _course;
  select os.access_days into days from organisation_seats os where os.organisation_id = _org and os.course_id = _course order by os.created_at desc limit 1;
  select * into ex from enrollments where user_id = _user and course_id = _course;
  has_row := found;
  if has_row and ex.organisation_id = _org and ex.status = 'active' then return 'already_assigned'; end if;
  if has_row and ex.organisation_id is distinct from _org and ex.status = 'active' and (ex.expires_at is null or ex.expires_at > now()) then return 'already_has_access'; end if;
  select count(*) into used from enrollments where organisation_id = _org and course_id = _course and not (user_id = _user);
  if used >= total then return 'no_seats'; end if;
  if not has_row then
    insert into enrollments (user_id, course_id, status, expires_at, organisation_id)
    values (_user, _course, 'active', case when days is null then null else now() + make_interval(days => days) end, _org);
  else
    update enrollments set status = 'active', organisation_id = _org, enrolled_at = now(),
           expires_at = case when days is null then null else now() + make_interval(days => days) end
     where id = ex.id;
  end if;
  insert into organisation_members (organisation_id, user_id, role) values (_org, _user, 'member') on conflict do nothing;
  return 'ok';
end $$;

-- Remove someone from a seat. Unstarted: the seat is freed. Started: access ends but the seat stays used.
create or replace function public.team_remove_seat(_org uuid, _course uuid, _user uuid)
returns text language plpgsql security definer set search_path = public as $$
declare ex record; started boolean;
begin
  select * into ex from enrollments where user_id = _user and course_id = _course and organisation_id = _org;
  if not found then return 'not_found'; end if;
  select exists (select 1 from lesson_progress lp join lessons l on l.id = lp.lesson_id join modules m on m.id = l.module_id where lp.user_id = _user and m.course_id = _course and lp.is_completed)
      or exists (select 1 from lesson_watch lw join lessons l on l.id = lw.lesson_id join modules m on m.id = l.module_id where lw.user_id = _user and m.course_id = _course and lw.watched_seconds > 5)
    into started;
  if started then
    update enrollments set status = 'cancelled' where id = ex.id;
    return 'kept_used';
  end if;
  delete from enrollments where id = ex.id;
  if not exists (select 1 from enrollments where user_id = _user and organisation_id = _org)
     and exists (select 1 from organisation_members where organisation_id = _org and user_id = _user and role = 'member') then
    delete from organisation_members where organisation_id = _org and user_id = _user;
  end if;
  return 'freed';
end $$;

revoke all on function public.grant_team_seats(uuid, uuid, int, int, text, text, int, uuid, text) from public, anon, authenticated;
revoke all on function public.team_assign_seat(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.team_remove_seat(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.grant_team_seats(uuid, uuid, int, int, text, text, int, uuid, text) to service_role;
grant execute on function public.team_assign_seat(uuid, uuid, uuid) to service_role;
grant execute on function public.team_remove_seat(uuid, uuid, uuid) to service_role;
revoke all on function public.org_seat_summary(uuid), public.org_team(uuid), public.team_price(uuid, int) from public, anon;
grant execute on function public.org_seat_summary(uuid), public.org_team(uuid), public.team_price(uuid, int) to authenticated;
