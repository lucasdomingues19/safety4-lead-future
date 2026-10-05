-- Quiz answer explanations (2026-10-05): shown to learners after they submit.
alter table public.quiz_questions add column if not exists explanation text;
