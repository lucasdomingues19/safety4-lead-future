-- Server-enforced progression rules, set per lesson by the admin.
--   lessons.enforce_progress (default true): the lesson must be completed
--     before any later lesson in the course can be opened/completed, and if it
--     is a video it can only be completed after the learner has actually
--     played courses.playback_settings.min_watch_percent (default 90) of it.
--     When false the lesson is optional and never blocks progress.
-- Watch time is reported by the player through record_lesson_watch(), which
-- is rate-limited against wall-clock time, and lessons are completed only
-- through complete_lesson(). Learners lose direct write access to
-- lesson_progress so neither rule can be skipped from the browser.

ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_duration_seconds numeric;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS enforce_progress boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.lesson_watch (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  watched_seconds numeric NOT NULL DEFAULT 0,
  duration_seconds numeric,
  last_heartbeat_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
ALTER TABLE public.lesson_watch ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own watch time" ON public.lesson_watch;
CREATE POLICY "Users read own watch time" ON public.lesson_watch
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins read watch time" ON public.lesson_watch;
CREATE POLICY "Admins read watch time" ON public.lesson_watch
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Learners may read their progress but no longer write it directly.
DROP POLICY IF EXISTS "Users manage own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users read own progress" ON public.lesson_progress;
CREATE POLICY "Users read own progress" ON public.lesson_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage progress" ON public.lesson_progress;
CREATE POLICY "Admins manage progress" ON public.lesson_progress
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Why a user may not open/complete a lesson yet (NULL = allowed).
CREATE OR REPLACE FUNCTION public.lesson_lock_reason(_user uuid, _lesson uuid)
RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  cur record;
  enr record;
  missing int;
BEGIN
  SELECT l.id, l.position AS lpos, m.id AS module_id, m.position AS mpos, m.drip_days, m.course_id
    INTO cur
    FROM lessons l JOIN modules m ON m.id = l.module_id
   WHERE l.id = _lesson;
  IF cur IS NULL THEN RETURN 'not_found'; END IF;

  SELECT status, expires_at, enrolled_at INTO enr FROM enrollments WHERE user_id = _user AND course_id = cur.course_id;
  IF enr IS NULL OR enr.status <> 'active' OR (enr.expires_at IS NOT NULL AND enr.expires_at < now()) THEN
    RETURN 'not_enrolled';
  END IF;
  IF coalesce(cur.drip_days, 0) > 0 AND enr.enrolled_at + make_interval(days => cur.drip_days) > now() THEN
    RETURN 'drip';
  END IF;

  SELECT count(*) INTO missing
    FROM lessons l JOIN modules m ON m.id = l.module_id
   WHERE m.course_id = cur.course_id
     AND l.enforce_progress
     AND (m.position, l.position, l.id) < (cur.mpos, cur.lpos, cur.id)
     AND NOT EXISTS (SELECT 1 FROM lesson_progress p WHERE p.user_id = _user AND p.lesson_id = l.id AND p.is_completed);
  IF missing > 0 THEN RETURN 'previous_incomplete'; END IF;
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.lesson_lock_reason(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lesson_lock_reason(uuid, uuid) TO service_role;

-- Player heartbeat: credit played seconds, never faster than 2x wall-clock.
CREATE OR REPLACE FUNCTION public.record_lesson_watch(_lesson_id uuid, _watched numeric, _duration numeric)
RETURNS numeric
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cur record;
  dur numeric := least(greatest(coalesce(_duration, 0), 0), 86400);
  claimed numeric := greatest(coalesce(_watched, 0), 0);
  newv numeric;
  lock text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  lock := lesson_lock_reason(uid, _lesson_id);
  IF lock IS NOT NULL THEN RAISE EXCEPTION 'lesson locked: %', lock; END IF;

  SELECT * INTO cur FROM lesson_watch WHERE user_id = uid AND lesson_id = _lesson_id FOR UPDATE;
  IF cur IS NULL THEN
    newv := least(claimed, 30);
    INSERT INTO lesson_watch (user_id, lesson_id, watched_seconds, duration_seconds)
    VALUES (uid, _lesson_id, newv, nullif(dur, 0));
    RETURN newv;
  END IF;

  newv := greatest(cur.watched_seconds,
                   least(claimed, cur.watched_seconds + extract(epoch FROM now() - cur.last_heartbeat_at) * 2 + 5));
  IF greatest(coalesce(cur.duration_seconds, 0), dur) > 0 THEN
    newv := least(newv, greatest(coalesce(cur.duration_seconds, 0), dur));
  END IF;
  UPDATE lesson_watch
     SET watched_seconds = newv,
         duration_seconds = nullif(greatest(coalesce(duration_seconds, 0), dur), 0),
         last_heartbeat_at = now()
   WHERE user_id = uid AND lesson_id = _lesson_id;
  RETURN newv;
END $$;
REVOKE ALL ON FUNCTION public.record_lesson_watch(uuid, numeric, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_lesson_watch(uuid, numeric, numeric) TO authenticated;

-- The only way a learner can complete a lesson.
CREATE OR REPLACE FUNCTION public.complete_lesson(_lesson_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  lock text;
  l record;
  pct int;
  is_video boolean;
  w record;
  needed numeric;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated'); END IF;
  lock := lesson_lock_reason(uid, _lesson_id);
  IF lock IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', lock); END IF;

  SELECT les.media_kind, les.media_path, les.video_url, les.video_duration_seconds, les.duration_minutes, les.enforce_progress, c.playback_settings
    INTO l
    FROM lessons les JOIN modules m ON m.id = les.module_id JOIN courses c ON c.id = m.course_id
   WHERE les.id = _lesson_id;

  pct := least(greatest(coalesce((l.playback_settings->>'min_watch_percent')::int, 90), 0), 100);
  is_video := l.media_kind = 'video'
    OR (l.media_path IS NULL AND coalesce(l.video_url, '') ~* '(youtube\.com|youtu\.be|vimeo\.com|\.(mp4|webm|mov|m4v)(\?|#|$))');

  IF l.enforce_progress AND is_video AND pct > 0 THEN
    SELECT watched_seconds, duration_seconds INTO w FROM lesson_watch WHERE user_id = uid AND lesson_id = _lesson_id;
    needed := coalesce(nullif(l.video_duration_seconds, 0), nullif(w.duration_seconds, 0), l.duration_minutes * 60);
    -- No known duration and no watch data means the player never reported: block.
    IF (coalesce(needed, 0) <= 0 AND w IS NULL)
       OR (coalesce(needed, 0) > 0 AND coalesce(w.watched_seconds, 0) < needed * pct / 100.0 - 1) THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'watch', 'watched', coalesce(w.watched_seconds, 0), 'required', round(needed * pct / 100.0));
    END IF;
  END IF;

  INSERT INTO lesson_progress (user_id, lesson_id, is_completed, completed_at)
  VALUES (uid, _lesson_id, true, now())
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET is_completed = true, completed_at = coalesce(lesson_progress.completed_at, now());
  RETURN jsonb_build_object('ok', true);
END $$;
REVOKE ALL ON FUNCTION public.complete_lesson(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_lesson(uuid) TO authenticated;
