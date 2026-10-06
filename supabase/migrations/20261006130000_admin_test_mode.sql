-- Admin test mode: an enrolled admin can open every lesson straight away (no drip
-- wait, no lesson order, no minimum watch time) while progress, quizzes and the
-- certificate are still recorded for real. Learners are unaffected.

CREATE OR REPLACE FUNCTION public.lesson_lock_reason(_user uuid, _lesson uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  IF has_role(_user, 'admin') THEN RETURN NULL; END IF;
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
END $function$;

CREATE OR REPLACE FUNCTION public.complete_lesson(_lesson_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  IF l.enforce_progress AND is_video AND pct > 0 AND NOT has_role(uid, 'admin') THEN
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
END $function$;
