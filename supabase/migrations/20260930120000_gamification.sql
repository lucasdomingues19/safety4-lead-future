-- Gamification: points, levels, learning streaks and badges.
-- Everything is DERIVED from authoritative activity (lessons completed via
-- complete_lesson, server-graded quizzes, Syngraph final assessments,
-- community activity) — there is no points ledger a client could write to.
-- Community points are capped per day so posting sprees don't pay.

-- Days with learning activity, recorded by triggers on the tables that only
-- server-side code (or the learner's own RLS-checked actions) can write.
CREATE TABLE IF NOT EXISTS public.learning_activity_days (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL,
  PRIMARY KEY (user_id, day)
);
ALTER TABLE public.learning_activity_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own activity days" ON public.learning_activity_days;
CREATE POLICY "Users read own activity days" ON public.learning_activity_days FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.record_learning_day()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO learning_activity_days (user_id, day) VALUES (NEW.user_id, (now() AT TIME ZONE 'utc')::date)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS learning_day_lesson ON public.lesson_progress;
CREATE TRIGGER learning_day_lesson AFTER INSERT OR UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.record_learning_day();
DROP TRIGGER IF EXISTS learning_day_watch ON public.lesson_watch;
CREATE TRIGGER learning_day_watch AFTER INSERT OR UPDATE ON public.lesson_watch FOR EACH ROW EXECUTE FUNCTION public.record_learning_day();
DROP TRIGGER IF EXISTS learning_day_quiz ON public.quiz_attempts;
CREATE TRIGGER learning_day_quiz AFTER INSERT ON public.quiz_attempts FOR EACH ROW EXECUTE FUNCTION public.record_learning_day();
DROP TRIGGER IF EXISTS learning_day_final ON public.final_assessment_attempts;
CREATE TRIGGER learning_day_final AFTER INSERT OR UPDATE ON public.final_assessment_attempts FOR EACH ROW EXECUTE FUNCTION public.record_learning_day();

-- Backfill from existing history.
INSERT INTO public.learning_activity_days (user_id, day)
SELECT user_id, completed_at::date FROM public.lesson_progress WHERE completed_at IS NOT NULL
UNION SELECT user_id, attempted_at::date FROM public.quiz_attempts
ON CONFLICT DO NOTHING;

-- Points breakdown for one user.
CREATE OR REPLACE FUNCTION public.user_points(_user uuid)
RETURNS TABLE(points bigint, lessons bigint, quizzes bigint, perfect_quizzes bigint, courses_completed bigint,
              finals_passed bigint, posts_counted bigint, replies_counted bigint, reactions_received bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH
    l AS (SELECT count(*) c FROM lesson_progress WHERE user_id = _user AND is_completed),
    q AS (SELECT count(DISTINCT quiz_id) c FROM quiz_attempts WHERE user_id = _user AND passed),
    pq AS (SELECT count(DISTINCT quiz_id) c FROM quiz_attempts WHERE user_id = _user AND passed AND score >= 100),
    cc AS (SELECT count(*) c FROM enrollments WHERE user_id = _user AND completed_at IS NOT NULL),
    fa AS (SELECT count(DISTINCT course_id) c FROM final_assessment_attempts WHERE user_id = _user AND status = 'passed'),
    po AS (SELECT coalesce(sum(least(n, 3)), 0) c FROM (SELECT count(*) n FROM community_posts WHERE user_id = _user GROUP BY created_at::date) x),
    re AS (SELECT coalesce(sum(least(n, 10)), 0) c FROM (SELECT count(*) n FROM community_comments WHERE user_id = _user GROUP BY created_at::date) x),
    rx AS (SELECT count(DISTINCT (r.post_id, r.user_id)) c FROM community_reactions r JOIN community_posts p ON p.id = r.post_id WHERE p.user_id = _user AND r.user_id <> _user)
  SELECT
    (l.c * 10 + q.c * 50 + pq.c * 25 + cc.c * 100 + fa.c * 200 + po.c * 5 + re.c * 2 + rx.c)::bigint,
    l.c, q.c, pq.c, cc.c, fa.c, po.c::bigint, re.c::bigint, rx.c
  FROM l, q, pq, cc, fa, po, re, rx
$$;
REVOKE ALL ON FUNCTION public.user_points(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.level_for(_points bigint)
RETURNS TABLE(level int, name text, floor_points int, next_points int)
LANGUAGE sql IMMUTABLE AS $$
  SELECT * FROM (VALUES
    (1, 'Observer', 0, 100),
    (2, 'Practitioner', 100, 300),
    (3, 'Specialist', 300, 750),
    (4, 'Champion', 750, 1500),
    (5, 'Leader', 1500, NULL::int)
  ) v(level, name, floor_points, next_points)
  WHERE _points >= v.floor_points
  ORDER BY v.level DESC
  LIMIT 1
$$;

-- Everything the learner's dashboard needs, for the signed-in user only.
CREATE OR REPLACE FUNCTION public.get_my_gamification()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  p record;
  lv record;
  cur_streak int;
  best_streak int;
  certs int;
  network boolean;
BEGIN
  IF uid IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO p FROM user_points(uid);
  SELECT * INTO lv FROM level_for(p.points);

  WITH d AS (SELECT day, day - (row_number() OVER (ORDER BY day))::int AS grp FROM learning_activity_days WHERE user_id = uid),
       islands AS (SELECT count(*) n, max(day) last_day FROM d GROUP BY grp)
  SELECT coalesce(max(n) FILTER (WHERE last_day >= (now() AT TIME ZONE 'utc')::date - 1), 0), coalesce(max(n), 0)
    INTO cur_streak, best_streak FROM islands;

  SELECT count(*) INTO certs FROM certificates WHERE lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', '')) AND status <> 'revoked';
  network := has_community_access(uid, 'global-network') AND NOT has_role(uid, 'admin'::app_role);

  RETURN jsonb_build_object(
    'points', p.points,
    'level', lv.level, 'level_name', lv.name, 'level_floor', lv.floor_points, 'next_level_points', lv.next_points,
    'streak', cur_streak, 'longest_streak', best_streak,
    'breakdown', jsonb_build_object('lessons', p.lessons, 'quizzes', p.quizzes, 'perfect_quizzes', p.perfect_quizzes,
      'courses_completed', p.courses_completed, 'finals_passed', p.finals_passed, 'posts', p.posts_counted,
      'replies', p.replies_counted, 'reactions_received', p.reactions_received),
    'badges', jsonb_build_object(
      'first-steps', p.lessons >= 1,
      'on-a-roll', best_streak >= 3,
      'unstoppable', best_streak >= 7,
      'quiz-ace', p.perfect_quizzes >= 1,
      'course-complete', p.courses_completed >= 1,
      'certified', certs >= 1,
      'community-voice', p.posts_counted >= 1,
      'helpful', p.reactions_received >= 10,
      'network-member', network
    )
  );
END $$;
REVOKE ALL ON FUNCTION public.get_my_gamification() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_gamification() TO authenticated;

-- Leaderboard on the same points model, with level names.
DROP FUNCTION IF EXISTS public.get_leaderboard(integer);
CREATE FUNCTION public.get_leaderboard(_limit integer DEFAULT 10)
RETURNS TABLE(user_id uuid, display_name text, points bigint, lessons bigint, level_name text, is_me boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pr.id, coalesce(nullif(trim(pr.full_name), ''), 'Anonymous learner'), up.points, up.lessons, lv.name, pr.id = auth.uid()
  FROM profiles pr
  CROSS JOIN LATERAL user_points(pr.id) up
  CROSS JOIN LATERAL level_for(up.points) lv
  WHERE pr.hide_from_leaderboard = false AND up.points > 0
  ORDER BY up.points DESC, up.lessons DESC
  LIMIT greatest(1, least(_limit, 50))
$$;
REVOKE ALL ON FUNCTION public.get_leaderboard(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO authenticated;

-- Public-facing badges for community authors: level + Global Network member.
CREATE OR REPLACE FUNCTION public.get_member_badges(_ids uuid[])
RETURNS TABLE(user_id uuid, level int, level_name text, network_member boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.id, lv.level, lv.name,
         EXISTS (SELECT 1 FROM community_memberships m WHERE m.user_id = u.id AND m.space = 'global-network' AND m.status = 'active' AND (m.expires_at IS NULL OR m.expires_at > now()))
  FROM unnest(_ids[1:200]) AS u(id)
  CROSS JOIN LATERAL user_points(u.id) up
  CROSS JOIN LATERAL level_for(up.points) lv
$$;
REVOKE ALL ON FUNCTION public.get_member_badges(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_member_badges(uuid[]) TO authenticated;
