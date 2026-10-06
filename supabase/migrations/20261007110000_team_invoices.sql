-- Invoices raised from admin for a company's seats. Seats are granted when Stripe says
-- the invoice is paid (webhook invoice.paid, or "Check payment" in admin).
create table if not exists public.team_invoices (
  stripe_invoice_id text primary key,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  seats int not null check (seats > 0),
  access_days int,
  amount_cents int not null,
  currency text not null default 'GBP',
  status text not null default 'open' check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')),
  number text,
  hosted_url text,
  pdf_url text,
  due_date date,
  po_number text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  paid_at timestamptz
);
create index if not exists team_invoices_org_idx on public.team_invoices (organisation_id, created_at desc);
alter table public.team_invoices enable row level security;
drop policy if exists "Admins manage team invoices" on public.team_invoices;
create policy "Admins manage team invoices" on public.team_invoices for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'::app_role)) with check (public.has_role((select auth.uid()), 'admin'::app_role));
drop policy if exists "Managers read their invoices" on public.team_invoices;
create policy "Managers read their invoices" on public.team_invoices for select to authenticated
  using (public.is_org_manager((select auth.uid()), organisation_id));
