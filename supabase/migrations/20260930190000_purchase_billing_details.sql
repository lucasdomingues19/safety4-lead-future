-- Billing details captured at checkout (for invoices, VAT and reports).
ALTER TABLE public.course_purchases
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_business text,
  ADD COLUMN IF NOT EXISTS customer_country text,
  ADD COLUMN IF NOT EXISTS customer_vat_id text,
  ADD COLUMN IF NOT EXISTS tax_cents integer NOT NULL DEFAULT 0;
