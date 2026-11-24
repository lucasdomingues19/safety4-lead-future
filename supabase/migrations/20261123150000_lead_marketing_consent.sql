-- Record whether a lead ticked "send me tips and course news" (UK GDPR / PECR consent record).
alter table public.leads add column if not exists marketing_consent boolean not null default false;
alter table public.leads add column if not exists marketing_consent_at timestamptz;
