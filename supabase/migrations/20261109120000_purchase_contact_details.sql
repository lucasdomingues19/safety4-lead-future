-- Name, email and phone the buyer typed at checkout (needed for live-training joining details and follow-up).
ALTER TABLE public.course_purchases
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS customer_phone text;
