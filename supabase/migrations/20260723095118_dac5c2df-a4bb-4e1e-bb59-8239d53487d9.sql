ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS isp text;
CREATE INDEX IF NOT EXISTS page_views_company_idx ON public.page_views (company) WHERE company IS NOT NULL;