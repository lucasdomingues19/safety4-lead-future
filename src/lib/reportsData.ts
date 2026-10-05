// Data for admin > Reports. Loads everything once (admins can read all of it
// under RLS), then the dashboard filters and aggregates in the browser.
// Admin accounts are excluded from every figure.
import { supabase } from "@/integrations/supabase/client";

const DAY = 86_400_000;
export const AT_RISK_DAYS = 14;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function all(table: string, cols: string): Promise<any[]> {
  const rows: any[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table as never).select(cols).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) return rows;
  }
}

export type LearnerState = "not_started" | "in_progress" | "completed" | "at_risk";

export interface LearnerRow {
  key: string;
  userId: string;
  name: string;
  email: string;
  organisation: string;
  courseId: string;
  course: string;
  enrolledAt: string;
  expiresAt: string | null;
  lessonsDone: number;
  lessonsTotal: number;
  pct: number;
  lastActive: string | null;
  quizAvg: number | null;
  final: "Passed" | "Failed" | "In progress" | "Not taken" | "—";
  certified: boolean;
  tags: string[];
  state: LearnerState;
}

export interface QuizRow {
  quizId: string;
  courseId: string;
  course: string;
  module: string;
  title: string;
  passMark: number;
  attempts: number;
  learners: number;
  passRate: number | null;
  avgScore: number | null;
  avgAttemptsToPass: number | null;
  questions: { id: string; prompt: string; answered: number; correctPct: number | null }[];
}

export interface ReportsData {
  courses: { id: string; title: string; slug: string }[];
  tags: string[];
  learners: LearnerRow[];
  lessonsByCourse: Map<string, { id: string; title: string; module: string }[]>;
  completions: { userId: string; lessonId: string; at: number }[];
  activity: { userId: string; day: string }[];
  attempts: { userId: string; quizId: string; score: number; passed: boolean; at: number; answers: Record<string, string> }[];
  certificates: { email: string; course: string; at: number }[];
  quizzes: QuizRow[];
}

export async function loadReportsData(): Promise<ReportsData> {
  const [profiles, courses, modules, lessons, enrolls, progress, watches, days, attempts, quizzes, certs, finals, tags, admins] = await Promise.all([
    all("profiles", "id, full_name, email, organisation"),
    all("courses", "id, title, slug"),
    all("modules", "id, course_id, title, position"),
    all("lessons", "id, module_id, title, position"),
    all("enrollments", "id, user_id, course_id, status, enrolled_at, expires_at"),
    all("lesson_progress", "user_id, lesson_id, completed_at, is_completed"),
    all("lesson_watch", "user_id, last_heartbeat_at"),
    all("learning_activity_days", "user_id, day"),
    all("quiz_attempts", "user_id, quiz_id, score, passed, answers, attempted_at"),
    all("quizzes", "id, module_id, title, pass_threshold"),
    all("certificates", "recipient_email, course_name, issued_at, status"),
    all("final_assessment_attempts", "user_id, course_id, status, score, completed_at"),
    all("people_tags", "user_id, tag"),
    all("user_roles", "user_id, role"),
  ]);
  const adminIds = new Set(admins.filter((r) => r.role === "admin").map((r) => r.user_id));
  const prof = new Map(profiles.map((p) => [p.id, p]));
  const course = new Map(courses.map((c) => [c.id, c]));
  const modById = new Map(modules.map((m) => [m.id, m]));

  // Ordered lessons per course.
  const lessonsByCourse = new Map<string, { id: string; title: string; module: string }[]>();
  for (const c of courses) {
    const mods = modules.filter((m) => m.course_id === c.id).sort((a, b) => a.position - b.position);
    lessonsByCourse.set(c.id, mods.flatMap((m) => lessons.filter((l) => l.module_id === m.id).sort((a, b) => a.position - b.position).map((l) => ({ id: l.id, title: l.title, module: m.title }))));
  }
  const courseOfLesson = new Map<string, string>();
  for (const [cid, ls] of lessonsByCourse) for (const l of ls) courseOfLesson.set(l.id, cid);

  const completions = progress.filter((p) => p.is_completed && !adminIds.has(p.user_id))
    .map((p) => ({ userId: p.user_id, lessonId: p.lesson_id, at: p.completed_at ? new Date(p.completed_at).getTime() : 0 }));
  const done = new Map<string, Set<string>>();
  for (const c of completions) done.set(c.userId, (done.get(c.userId) ?? new Set()).add(c.lessonId));

  const lastActive = new Map<string, number>();
  const bump = (u: string, t: number) => { if (t && t > (lastActive.get(u) ?? 0)) lastActive.set(u, t); };
  for (const c of completions) bump(c.userId, c.at);
  for (const w of watches) bump(w.user_id, w.last_heartbeat_at ? new Date(w.last_heartbeat_at).getTime() : 0);
  for (const d of days) bump(d.user_id, new Date(`${d.day}T12:00:00Z`).getTime());

  const quizCourse = new Map<string, string>(quizzes.map((q) => [q.id, modById.get(q.module_id)?.course_id]));
  const tagsByUser = new Map<string, string[]>();
  for (const t of tags) tagsByUser.set(t.user_id, [...(tagsByUser.get(t.user_id) ?? []), t.tag]);

  const now = Date.now();
  const learners: LearnerRow[] = enrolls
    .filter((e) => !adminIds.has(e.user_id) && course.has(e.course_id) && e.status !== "cancelled")
    .map((e) => {
      const p = prof.get(e.user_id) ?? {};
      const c = course.get(e.course_id);
      const ls = lessonsByCourse.get(e.course_id) ?? [];
      const n = ls.filter((l) => done.get(e.user_id)?.has(l.id)).length;
      const pct = ls.length ? Math.round((n / ls.length) * 100) : 0;
      // Best score per quiz in this course, averaged.
      const best = new Map<string, number>();
      for (const a of attempts) if (a.user_id === e.user_id && quizCourse.get(a.quiz_id) === e.course_id) best.set(a.quiz_id, Math.max(best.get(a.quiz_id) ?? 0, Number(a.score) || 0));
      const quizAvg = best.size ? Math.round([...best.values()].reduce((s, x) => s + x, 0) / best.size) : null;
      const fa = finals.filter((f) => f.user_id === e.user_id && f.course_id === e.course_id);
      const final: LearnerRow["final"] = fa.some((f) => /pass/i.test(f.status)) ? "Passed" : fa.some((f) => /fail/i.test(f.status)) ? "Failed" : fa.length ? "In progress" : "Not taken";
      const certified = certs.some((x) => x.status !== "revoked" && (x.recipient_email ?? "").toLowerCase() === (p.email ?? "").toLowerCase() && x.course_name === c.title);
      const la = lastActive.get(e.user_id) ?? null;
      const quietFor = now - Math.max(la ?? 0, new Date(e.enrolled_at).getTime());
      const state: LearnerState = pct >= 100 ? "completed" : quietFor > AT_RISK_DAYS * DAY ? "at_risk" : n === 0 ? "not_started" : "in_progress";
      return {
        key: e.id, userId: e.user_id, name: p.full_name || (p.email ?? "").split("@")[0] || "Learner", email: p.email ?? "", organisation: p.organisation ?? "",
        courseId: e.course_id, course: c.title, enrolledAt: e.enrolled_at, expiresAt: e.expires_at, lessonsDone: n, lessonsTotal: ls.length, pct,
        lastActive: la ? new Date(la).toISOString() : null, quizAvg, final: ls.length ? final : "—", certified, tags: tagsByUser.get(e.user_id) ?? [], state,
      };
    });

  // Quiz analytics (correct answers come from the admin-only RPC).
  const keys = await Promise.all(quizzes.map((q) => supabase.rpc("admin_get_quiz_questions", { _quiz_id: q.id }).then(({ data }) => [q.id, data ?? []] as const)));
  const qById = new Map(keys);
  const realAttempts = attempts.filter((a) => !adminIds.has(a.user_id));
  const quizRows: QuizRow[] = quizzes.map((q) => {
    const mod = modById.get(q.module_id);
    const cid = mod?.course_id;
    const at = realAttempts.filter((a) => a.quiz_id === q.id);
    const learnersN = new Set(at.map((a) => a.user_id)).size;
    const passers = new Map<string, number>();
    const counts = new Map<string, number>();
    for (const a of [...at].sort((x, y) => new Date(x.attempted_at).getTime() - new Date(y.attempted_at).getTime())) {
      counts.set(a.user_id, (counts.get(a.user_id) ?? 0) + 1);
      if (a.passed && !passers.has(a.user_id)) passers.set(a.user_id, counts.get(a.user_id)!);
    }
    const qs = (qById.get(q.id) ?? []) as { id: string; prompt: string; options: string[]; correct_index: number }[];
    return {
      quizId: q.id, courseId: cid, course: course.get(cid)?.title ?? "", module: mod?.title ?? "", title: q.title, passMark: q.pass_threshold,
      attempts: at.length, learners: learnersN,
      passRate: at.length ? Math.round((at.filter((a) => a.passed).length / at.length) * 100) : null,
      avgScore: at.length ? Math.round(at.reduce((s, a) => s + (Number(a.score) || 0), 0) / at.length) : null,
      avgAttemptsToPass: passers.size ? Math.round(([...passers.values()].reduce((s, x) => s + x, 0) / passers.size) * 10) / 10 : null,
      questions: qs.map((qq) => {
        const answered = at.filter((a) => a.answers && qq.id in a.answers);
        const right = answered.filter((a) => a.answers[qq.id] === qq.options?.[qq.correct_index]).length;
        return { id: qq.id, prompt: qq.prompt, answered: answered.length, correctPct: answered.length ? Math.round((right / answered.length) * 100) : null };
      }),
    };
  });

  return {
    courses: courses.map((c) => ({ id: c.id, title: c.title, slug: c.slug })).sort((a, b) => a.title.localeCompare(b.title)),
    tags: [...new Set(tags.map((t) => t.tag))].sort(),
    learners,
    lessonsByCourse,
    completions: completions.filter((c) => courseOfLesson.has(c.lessonId)),
    activity: days.filter((d) => !adminIds.has(d.user_id)).map((d) => ({ userId: d.user_id, day: d.day })),
    attempts: realAttempts.map((a) => ({ userId: a.user_id, quizId: a.quiz_id, score: Number(a.score) || 0, passed: !!a.passed, at: new Date(a.attempted_at).getTime(), answers: a.answers ?? {} })),
    certificates: certs.filter((c) => c.status !== "revoked").map((c) => ({ email: (c.recipient_email ?? "").toLowerCase(), course: c.course_name, at: new Date(c.issued_at).getTime() })),
    quizzes: quizRows,
  };
}

export const courseOfLessonMap = (d: ReportsData) => {
  const m = new Map<string, string>();
  for (const [cid, ls] of d.lessonsByCourse) for (const l of ls) m.set(l.id, cid);
  return m;
};
