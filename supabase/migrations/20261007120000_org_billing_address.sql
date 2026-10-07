-- Companies need a billing address so Stripe can work out VAT on invoices.
alter table public.organisations add column if not exists billing_address jsonb;
