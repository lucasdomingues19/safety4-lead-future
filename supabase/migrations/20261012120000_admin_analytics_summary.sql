-- One set of numbers for the admin analytics page, computed in the database from the raw tables.
-- Definitions (also returned in the "definitions" field so the page can show them):
--   visits            distinct sessions that loaded at least one page, excluding sessions that used /admin
--   page_views        page loads in the same sessions
--   checkout_clicks   clicks whose link goes to /student/checkout (sessions, and total clicks)
--   checkout_visits   sessions that loaded a /student/checkout page
--   purchases         paid course purchases (course_purchases.status = 'paid') in the window
--   leads             leads created in the window, by source
--   daily             one row per day (last 90 days of the window, UTC): visits, purchases, leads
-- Admins only: the function checks has_role itself, so it is safe to call from the browser.
CREATE OR REPLACE FUNCTION public.admin_analytics_summary(_since timestamptz, _until timestamptz DEFAULT now())
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  daily_from timestamptz := greatest(_since, _until - interval '90 days');
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admins only' USING ERRCODE = '42501';
  END IF;

  WITH admin_sess AS (
    SELECT DISTINCT session_id FROM page_views WHERE page_path LIKE '/admin%'
    UNION
    SELECT DISTINCT session_id FROM user_events WHERE page_path LIKE '/admin%'
  ),
  pv AS (
    SELECT p.session_id, p.page_path, p.visited_at
    FROM page_views p
    WHERE p.visited_at >= _since AND p.visited_at < _until
      AND NOT EXISTS (SELECT 1 FROM admin_sess a WHERE a.session_id = p.session_id)
  ),
  clicks AS (
    SELECT e.session_id, e.event_data->>'href' AS href, e.created_at
    FROM user_events e
    WHERE e.event_type = 'click' AND e.created_at >= _since AND e.created_at < _until
      AND NOT EXISTS (SELECT 1 FROM admin_sess a WHERE a.session_id = e.session_id)
  ),
  paid AS (
    SELECT amount_cents, purchased_at FROM course_purchases
    WHERE status = 'paid' AND purchased_at >= _since AND purchased_at < _until
  ),
  lds AS (
    SELECT source, created_at FROM leads WHERE created_at >= _since AND created_at < _until
  ),
  daily AS (
    SELECT to_char(d::date, 'YYYY-MM-DD') AS day,
      (SELECT count(DISTINCT session_id) FROM pv WHERE visited_at::date = d::date) AS visits,
      (SELECT count(*) FROM course_purchases c WHERE c.status = 'paid' AND c.purchased_at::date = d::date) AS purchases,
      (SELECT count(*) FROM leads l WHERE l.created_at::date = d::date) AS leads
    FROM generate_series(date_trunc('day', daily_from), date_trunc('day', _until - interval '1 second'), interval '1 day') AS d
  )
  SELECT jsonb_build_object(
    'window', jsonb_build_object('since', _since, 'until', _until),
    'visits', (SELECT count(DISTINCT session_id) FROM pv),
    'page_views', (SELECT count(*) FROM pv),
    'checkout_click_sessions', (SELECT count(DISTINCT session_id) FROM clicks WHERE href LIKE '%/student/checkout%'),
    'checkout_clicks', (SELECT count(*) FROM clicks WHERE href LIKE '%/student/checkout%'),
    'checkout_visits', (SELECT count(DISTINCT session_id) FROM pv WHERE page_path LIKE '/student/checkout%'),
    'purchases', (SELECT count(*) FROM paid),
    'revenue_gbp', (SELECT coalesce(sum(amount_cents), 0) / 100.0 FROM paid),
    'leads', (SELECT count(*) FROM lds),
    'leads_by_source', (SELECT coalesce(jsonb_object_agg(source, n), '{}'::jsonb) FROM (SELECT source, count(*) AS n FROM lds GROUP BY source) s),
    'clicks_without_link', (SELECT count(*) FROM clicks WHERE href IS NULL OR href = ''),
    'last_page_view_at', (SELECT max(visited_at) FROM page_views),
    'last_click_at', (SELECT max(created_at) FROM user_events WHERE event_type = 'click'),
    'daily', (SELECT coalesce(jsonb_agg(to_jsonb(daily) ORDER BY daily.day), '[]'::jsonb) FROM daily)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_analytics_summary(timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_analytics_summary(timestamptz, timestamptz) TO authenticated;
