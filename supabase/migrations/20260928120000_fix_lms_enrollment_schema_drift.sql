-- Fixes schema drift between competing enrollments/lesson_progress migrations.
--
-- Three separate migrations created `enrollments` with incompatible schemas
-- (20240101000000: BIGSERIAL id + payment_status; 20260626095240: UUID id +
-- status/enrolled_at/completed_at; 20260904: UUID id + status/expires_at/
-- stripe_subscription_id). Only the 20260626095240 shape actually applied to
-- the live database — the 20260904 migration's `CREATE TABLE IF NOT EXISTS`
-- silently no-op'd, so its new columns were never added.
--
-- src/lib/stripe.ts's verifyEnrollmentAccess() and getSubscriptionStatus()
-- query enrollments.expires_at and .stripe_subscription_id unconditionally.
-- Since those columns didn't exist, every call threw a Postgres error, which
-- src/pages/learn/CourseView.tsx caught and surfaced as "Could not load the
-- course" — breaking the course view/player page for every user.
--
-- Similarly, lesson_progress was missing is_completed/watch_duration_seconds,
-- which src/hooks/useLessonProgress.ts (used by the /phase2 prototype pages)
-- depends on.
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS watch_duration_seconds INTEGER DEFAULT 0;
