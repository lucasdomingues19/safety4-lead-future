-- Bundles (several courses for one price), richer purchase records (invoice links, discount,
-- team quantity) and a guard so only the server can attach an enrolment to a company seat.

create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  title text not null check (length(trim(title)) between 2 and 140),
  description text,
  cover_image_url text,
  price_cents int not null check (price_cents > 0),
  currency text not null default 'GBP',
  published boolean not null default false,
  stripe_product_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.bundle_courses (
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  position int not null default 0,
  primary key (bundle_id, course_id)
);

alter table public.bundles enable row level security;
alter table public.bundle_courses enable row level security;
drop policy if exists "Signed-in users see published bundles" on public.bundles;
create policy "Signed-in users see published bundles" on public.bundles for select to authenticated
  using (published or public.has_role((select auth.uid()), 'admin'::app_role));
drop policy if exists "Admins manage bundles" on public.bundles;
create policy "Admins manage bundles" on public.bundles for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'::app_role)) with check (public.has_role((select auth.uid()), 'admin'::app_role));
drop policy if exists "Signed-in users see bundle contents" on public.bundle_courses;
create policy "Signed-in users see bundle contents" on public.bundle_courses for select to authenticated
  using (exists (select 1 from public.bundles b where b.id = bundle_id and (b.published or public.has_role((select auth.uid()), 'admin'::app_role))));
drop policy if exists "Admins manage bundle contents" on public.bundle_courses;
create policy "Admins manage bundle contents" on public.bundle_courses for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'::app_role)) with check (public.has_role((select auth.uid()), 'admin'::app_role));

alter table public.course_purchases add column if not exists bundle_id uuid references public.bundles(id) on delete set null;
alter table public.course_purchases add column if not exists organisation_id uuid references public.organisations(id) on delete set null;
alter table public.course_purchases add column if not exists quantity int not null default 1;
alter table public.course_purchases add column if not exists invoice_url text;
alter table public.course_purchases add column if not exists invoice_pdf text;
alter table public.course_purchases add column if not exists discount_cents int not null default 0;
alter table public.course_purchases add column if not exists promo_code text;

-- Only the server (service role / admin) may put an enrolment on a company seat.
create or replace function public.guard_enrollment_org()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') = 'authenticated' and not has_role(auth.uid(), 'admin') then
    new.organisation_id := case when tg_op = 'UPDATE' then old.organisation_id else null end;
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_enrollment_org on public.enrollments;
create trigger trg_guard_enrollment_org before insert or update on public.enrollments
  for each row execute function public.guard_enrollment_org();

-- Spans for the bundle storefront: the list price of the courses inside, to show the saving.
create or replace function public.bundle_list_price(_bundle uuid)
returns int language sql stable security definer set search_path = public as $$
  select coalesce(sum(c.price_cents), 0)::int from bundle_courses bc join courses c on c.id = bc.course_id where bc.bundle_id = _bundle;
$$;
revoke all on function public.bundle_list_price(uuid) from public, anon;
grant execute on function public.bundle_list_price(uuid) to authenticated;
