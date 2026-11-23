-- People who asked to stop receiving marketing email (newsletters, promotions).
-- Keyed by email so it covers subscribers without a course account. Service role only.
create table if not exists public.marketing_unsubscribes (
  email text primary key check (email = lower(email)),
  unsubscribed_at timestamptz not null default now(),
  source text
);
alter table public.marketing_unsubscribes enable row level security;
revoke all on public.marketing_unsubscribes from anon, authenticated;
