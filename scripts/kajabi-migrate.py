#!/usr/bin/env python3
"""Kajabi -> LMS migration. Reads the two Kajabi "Product progress" CSV exports from
~/kajabi-migration/ (customer data stays OUT of the repo) and carries learners over.

  python3 scripts/kajabi-migrate.py plan       dry run: prints the mapping, writes nothing
  python3 scripts/kajabi-migrate.py accounts   create confirmed accounts + enrolments (no emails)
  python3 scripts/kajabi-migrate.py progress   credit lessons, waive quizzes (no emails, no streaks)

Rules agreed with Lucas (2026-10-07):
  - Kajabi gives one overall % per learner per course, so the first N lessons (in course order) are credited.
  - Quizzes are waived for fully-credited modules: nobody retakes a quiz.
  - Nobody is emailed by this script. Welcome emails are a separate, rate-limited step.
"""
import csv, json, os, re, subprocess, sys, tempfile, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone

HOME = os.path.expanduser("~/kajabi-migration")
PROJECT = "yiqnwhxnbbtoxhysgteh"
SUPABASE_URL = f"https://{PROJECT}.supabase.co"
COURSES = {  # export file -> LMS course slug
    "iosh": "iosh-safety-4-0-leading-safety-in-the-digital-age",
    "ai-fundamentals": "fundamentals-of-ai-in-ehs",
}
TAG = "kajabi-migrated"


def sql(query: str):
    """Run SQL against the linked project; returns the rows of the LAST statement."""
    with tempfile.NamedTemporaryFile("w", suffix=".sql", delete=False) as f:
        f.write(query)
    out = subprocess.run(["supabase", "db", "query", "--linked", "--file", f.name], capture_output=True, text=True)
    os.unlink(f.name)
    text = out.stdout
    start = text.find("{")
    if start < 0 or out.returncode != 0:
        raise SystemExit(f"SQL failed:\n{(out.stdout + out.stderr)[-1500:]}")
    return json.JSONDecoder().raw_decode(text[start:])[0].get("rows", [])


def load_csv(key):
    path = f"{HOME}/kajabi-progress-{key}.csv"
    rows = []
    for r in csv.DictReader(open(path, encoding="utf-8-sig")):
        email = r["Email"].strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            continue
        try:
            pct = float(r["Product Progress"] or 0)
        except ValueError:
            pct = 0.0
        rows.append({
            "email": email, "name": r["Name"].strip(), "pct": pct,
            "logins": int(float(r["Logins"] or 0)),
            "start": (r["Start Date"] or "").strip() or None,
            "last": (r["Last Activity At"] or "").strip() or None,
        })
    return rows


def structure():
    """Course -> ordered lessons with their module and quiz."""
    rows = sql("""
      select c.id as course_id, c.slug, m.id as module_id, m.position as mpos, l.id as lesson_id, l.position as lpos,
             coalesce(l.video_duration_seconds, l.duration_minutes * 60, 0)::int as secs,
             (select q.id from quizzes q where q.module_id = m.id order by q.created_at limit 1) as quiz_id
        from courses c join modules m on m.course_id = c.id join lessons l on l.module_id = m.id
       order by c.slug, m.position, l.position, l.id;""")
    out = {}
    for r in rows:
        out.setdefault(r["slug"], {"course_id": r["course_id"], "lessons": []})["lessons"].append(r)
    return out


def credited(pct, total):
    """How many lessons to credit for an overall percentage. Never 100% unless Kajabi says 100."""
    if pct >= 100:
        return total
    n = round(pct / 100 * total)
    return min(n, total - 1)


def parse_day(s, fallback=None):
    if not s:
        return fallback
    try:
        return datetime.fromisoformat(s[:10]).replace(tzinfo=timezone.utc, hour=12)
    except ValueError:
        return fallback


def build_plan():
    struct = structure()
    plan, people = [], {}
    for key, slug in COURSES.items():
        course = struct[slug]
        lessons = course["lessons"]
        for r in load_csv(key):
            n = credited(r["pct"], len(lessons))
            people.setdefault(r["email"], r["name"])
            plan.append({**r, "course": slug, "course_id": course["course_id"], "n": n, "total": len(lessons)})
    return struct, plan, people


def cmd_plan():
    struct, plan, people = build_plan()
    emails = sorted(people)
    existing = {r["email"].lower(): r for r in sql("select email from auth.users;")}
    certs = {}
    for r in sql("select lower(recipient_email) as e, course_name, completion_date from certificates where status is distinct from 'revoked';"):
        certs.setdefault(r["e"], []).append(r["course_name"])
    new = [e for e in emails if e not in existing]
    print(f"people: {len(emails)} unique | already have an LMS account: {len(emails) - len(new)} | new accounts: {len(new)}")
    for slug, c in struct.items():
        if slug not in COURSES.values():
            continue
        rows = [p for p in plan if p["course"] == slug]
        mods = {}
        for l in c["lessons"]:
            mods.setdefault(l["module_id"], []).append(l)
        waived = sum(1 for p in rows for m in mods.values() if m[0]["quiz_id"] and all(l in c["lessons"][: p["n"]] for l in m))
        print(f"\n{slug}: {len(rows)} learners, {len(c['lessons'])} lessons, {len(mods)} modules")
        print("  lessons to credit (sum):", sum(p["n"] for p in rows), "| quiz waivers:", waived)
        print("  100% finishers:", sum(1 for p in rows if p["n"] == p["total"]),
              "| started but not finished:", sum(1 for p in rows if 0 < p["n"] < p["total"]),
              "| not started:", sum(1 for p in rows if p["n"] == 0))
        done = [p for p in rows if p["n"] == p["total"]]
        have = [p for p in done if certs.get(p["email"])]
        print(f"  finishers who already have a certificate in the LMS: {len(have)} of {len(done)}")
        print("  finishers WITHOUT a certificate (need your call):", len(done) - len(have))
    # priority for the welcome drip: active learners first, most recent first
    def prio(e):
        rs = [p for p in plan if p["email"] == e]
        best = max(rs, key=lambda p: (0 < p["n"] < p["total"], p["pct"]))
        return (-(best["n"] > 0), best["last"] or "")
    print("\nwelcome order (first 5 groups):",
          {"in progress": sum(1 for e in emails if any(0 < p["n"] < p["total"] for p in plan if p["email"] == e)),
           "finished only": sum(1 for e in emails if all(p["n"] == p["total"] for p in plan if p["email"] == e)),
           "not started": sum(1 for e in emails if all(p["n"] == 0 for p in plan if p["email"] == e))})
    json.dump({"plan": plan, "people": people}, open(f"{HOME}/plan.json", "w"), indent=1)
    print(f"\nwrote {HOME}/plan.json (private, not in the repo). Nothing was written to the LMS.")


def service_key():
    out = subprocess.run(["supabase", "projects", "api-keys", "--project-ref", PROJECT, "-o", "json"], capture_output=True, text=True)
    for k in json.loads(out.stdout[out.stdout.find("["):]):
        if k.get("name") == "service_role":
            return k["api_key"]
    raise SystemExit("could not read the service key")


def auth_create(key, email, name):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/auth/v1/admin/users", method="POST",
        headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        data=json.dumps({"email": email, "email_confirm": True, "user_metadata": {"full_name": name} if name else {}}).encode())
    try:
        urllib.request.urlopen(req, timeout=30).read()
        return None
    except urllib.error.HTTPError as e:
        return f"{e.code} {e.read().decode()[:160]}"


def values(rows):
    esc = lambda v: "null" if v is None else "'" + str(v).replace("'", "''") + "'"
    return ",\n".join("(" + ", ".join(esc(x) for x in r) + ")" for r in rows)


def cmd_accounts(apply):
    _, plan, people = build_plan()
    existing = {r["email"].lower() for r in sql("select email from auth.users;")}
    todo = [e for e in sorted(people) if e not in existing]
    print(f"accounts to create: {len(todo)} (no emails are sent)")
    if apply:
        key = service_key()
        for e in todo:
            err = auth_create(key, e, people[e])
            if err:
                print("  FAILED", e, err)
        del key
    rows = [(p["email"], p["course_id"]) for p in plan]
    q = f"""
    {'' if apply else 'begin;'}
    with p(email, course_id) as (values {values(rows)}),
    ins as (
      insert into enrollments (user_id, course_id, status, enrolled_at)
      select u.id, p.course_id::uuid, 'active', now() from p join auth.users u on lower(u.email) = p.email
       where not exists (select 1 from enrollments e where e.user_id = u.id and e.course_id = p.course_id::uuid)
      returning 1)
    select (select count(*) from ins) as enrolments_created;
    """
    if apply:
        print("enrolments:", sql(q))
        sql(f"""insert into people_tags (user_id, tag) select u.id, '{TAG}' from auth.users u
                where lower(u.email) in ({",".join("'" + e.replace("'", "''") + "'" for e in people)}) on conflict do nothing;""")
        print("tagged:", TAG)
    else:
        print("(dry run) enrolments that would be created for the accounts that exist:", len(rows))


def progress_sql(plan, commit):
    rows = [(p["email"], p["course_id"], p["n"], p["start"], p["last"], p["pct"]) for p in plan if p["n"] > 0]
    head = """
    alter table lesson_progress disable trigger learning_day_lesson;
    alter table quiz_attempts disable trigger learning_day_quiz;
    alter table quiz_attempts disable trigger trg_notify_quiz_passed;
    create temp table r(k text, v text);
    create temp table mig as
      with p(email, course_id, n, start_d, last_d, pct) as (values %s),
      ord as (
        select l.id as lesson_id, m.id as module_id, m.course_id, coalesce(l.video_duration_seconds, l.duration_minutes * 60, 0)::int as secs,
               row_number() over (partition by m.course_id order by m.position, l.position, l.id) as rn,
               count(*) over (partition by m.id) as mod_lessons
          from lessons l join modules m on m.id = l.module_id)
      select u.id as user_id, o.lesson_id, o.module_id, o.course_id, o.rn, o.secs, p.n::int as n,
             least(coalesce(p.start_d, p.last_d, now()::date::text)::date, coalesce(p.last_d, p.start_d, now()::date::text)::date) as d0,
             greatest(coalesce(p.start_d, p.last_d, now()::date::text)::date, coalesce(p.last_d, p.start_d, now()::date::text)::date) as d1
        from p join auth.users u on lower(u.email) = p.email
        join ord o on o.course_id = p.course_id::uuid and o.rn <= p.n::int;
    insert into lesson_progress (user_id, lesson_id, is_completed, completed_at, watch_duration_seconds)
      select m.user_id, m.lesson_id, true, (m.d0 + floor((m.d1 - m.d0) * m.rn::numeric / m.n)::int)::timestamp + interval '12 hours', m.secs
        from mig m
       where not exists (select 1 from lesson_progress x where x.user_id = m.user_id and x.lesson_id = m.lesson_id);
    insert into r select 'lessons credited', count(*)::text from mig;
    insert into quiz_attempts (user_id, quiz_id, score, passed, attempted_at, answers)
      select m.user_id, q.id, 100, true, max((m.d0 + floor((m.d1 - m.d0) * m.rn::numeric / m.n)::int)::timestamp + interval '12 hours'), '{"migrated_from":"kajabi"}'::jsonb
        from mig m join quizzes q on q.module_id = m.module_id
       group by m.user_id, q.id, m.module_id
      having count(*) = (select count(*) from lessons x where x.module_id = m.module_id)
         and not exists (select 1 from quiz_attempts a where a.user_id = m.user_id and a.quiz_id = q.id and a.passed);
    insert into r select 'quizzes waived', count(*)::text from quiz_attempts where answers->>'migrated_from' = 'kajabi';
    update enrollments e set completed_at = coalesce(e.completed_at, (select max(m.d1) from mig m where m.user_id = e.user_id and m.course_id = e.course_id)::timestamp + interval '12 hours')
     where e.completed_at is null
       and (select max(m.n) from mig m where m.user_id = e.user_id and m.course_id = e.course_id) = (select count(*) from lessons l join modules mm on mm.id = l.module_id where mm.course_id = e.course_id);
    insert into r select 'enrolments marked complete', count(*)::text from enrollments where completed_at is not null and user_id in (select user_id from mig);
    alter table lesson_progress enable trigger learning_day_lesson;
    alter table quiz_attempts enable trigger learning_day_quiz;
    alter table quiz_attempts enable trigger trg_notify_quiz_passed;
    """ % values(rows)
    tail = "select * from r;" if commit else "do $$ begin raise exception 'DRYRUN %', (select json_agg(r) from r); end $$;"
    return head + tail


def cmd_progress(apply):
    _, plan, _ = build_plan()
    q = progress_sql(plan, apply)
    if apply:
        for r in sql(q):
            print(r["k"], "=>", r["v"])
    else:
        with tempfile.NamedTemporaryFile("w", suffix=".sql", delete=False) as f:
            f.write(q)
        out = subprocess.run(["supabase", "db", "query", "--linked", "--file", f.name], capture_output=True, text=True)
        os.unlink(f.name)
        m = re.search(r"DRYRUN (\[.*?\])", (out.stdout + out.stderr).replace("\\", ""), re.S)
        print("(dry run, rolled back)", m.group(1) if m else (out.stdout + out.stderr)[-1500:])


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "plan"
    if cmd == "plan":
        cmd_plan()
    elif cmd == "accounts":
        cmd_accounts("--apply" in sys.argv)
    elif cmd == "progress":
        cmd_progress("--apply" in sys.argv)
    else:
        raise SystemExit("usage: kajabi-migrate.py plan | accounts [--apply] | progress [--apply]")
