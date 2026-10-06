// Learner-level analytics for admin > Reports > Learning: where people drop off,
// time per lesson and the questions that trip people up. Pure functions over the
// data loaded by reportsData.ts so they are easy to test.
import type { LearnerRow, ReportsData } from "@/lib/reportsData";

export const MIN_WATCH_SECONDS = 5; // below this a lesson isn't counted as "started"
export const MIN_ANSWERS = 3;       // a question needs this many answers before it is ranked

export interface FunnelStep { label: string; count: number; pct: number }
export interface LessonStat {
  id: string; title: string; module: string; index: number;
  started: number; completed: number;
  /** Share of the people who started the previous lesson that started this one (null for the first). */
  retainedPct: number | null;
  /** Of those who started this lesson, how many finished it. */
  completionPct: number | null;
  avgWatchedSeconds: number | null; lessonSeconds: number; avgWatchPct: number | null;
  /** Learners whose next lesson is this one but who have gone quiet. */
  stuckHere: number;
  biggestDrop: boolean;
}
export interface HardQuestion { quizTitle: string; module: string; prompt: string; answered: number; correctPct: number; topWrong: { text: string; pct: number } | null }
export interface CourseInsights {
  courseId: string; course: string; learners: number;
  funnel: FunnelStep[]; lessons: LessonStat[]; hardest: HardQuestion[];
}

export function computeInsights(data: ReportsData, learners: LearnerRow[], courseId: string): CourseInsights | null {
  const course = data.courses.find((c) => c.id === courseId);
  const lessons = data.lessonsByCourse.get(courseId) ?? [];
  if (!course || !lessons.length) return null;
  const mine = learners.filter((l) => l.courseId === courseId);
  const users = new Set(mine.map((l) => l.userId));
  const lessonIdx = new Map(lessons.map((l, i) => [l.id, i]));

  // Who started / finished each lesson.
  const startedBy = lessons.map(() => new Set<string>());
  const doneBy = lessons.map(() => new Set<string>());
  const watchSum = lessons.map(() => ({ total: 0, n: 0 }));
  for (const w of data.watches) {
    const i = lessonIdx.get(w.lessonId);
    if (i === undefined || !users.has(w.userId) || w.watched < MIN_WATCH_SECONDS) continue;
    startedBy[i].add(w.userId);
    watchSum[i].total += w.watched; watchSum[i].n++;
  }
  for (const c of data.completions) {
    const i = lessonIdx.get(c.lessonId);
    if (i === undefined || !users.has(c.userId)) continue;
    doneBy[i].add(c.userId); startedBy[i].add(c.userId);
  }

  // Where each unfinished, quiet learner is stuck: their first lesson not yet completed.
  const stuck = lessons.map(() => 0);
  for (const l of mine) {
    if (l.state !== "at_risk") continue;
    const next = lessons.findIndex((x) => !doneBy[lessonIdx.get(x.id)!].has(l.userId));
    if (next >= 0) stuck[next]++;
  }

  const stats: LessonStat[] = lessons.map((l, i) => {
    const started = startedBy[i].size, completed = doneBy[i].size;
    const prev = i > 0 ? startedBy[i - 1].size : 0;
    const avg = watchSum[i].n ? watchSum[i].total / watchSum[i].n : null;
    return {
      id: l.id, title: l.title, module: l.module, index: i + 1, started, completed,
      retainedPct: i > 0 && prev > 0 ? Math.round((started / prev) * 100) : null,
      completionPct: started ? Math.round((completed / started) * 100) : null,
      avgWatchedSeconds: avg, lessonSeconds: l.seconds,
      avgWatchPct: avg !== null && l.seconds > 0 ? Math.min(100, Math.round((avg / l.seconds) * 100)) : null,
      stuckHere: stuck[i], biggestDrop: false,
    };
  });
  // Flag the lesson that loses the most people (needs at least two to count as a pattern).
  let worst = -1, worstLoss = 1;
  stats.forEach((s, i) => { const loss = i === 0 ? mine.length - s.started : stats[i - 1].started - s.started; if (loss > worstLoss) { worstLoss = loss; worst = i; } });
  if (worst >= 0) stats[worst].biggestDrop = true;

  const total = mine.length;
  const startedAny = mine.filter((l) => l.lessonsDone > 0 || lessons.some((x, i) => startedBy[i].has(l.userId))).length;
  const half = mine.filter((l) => l.pct >= 50).length;
  const done = mine.filter((l) => l.pct >= 100).length;
  const cert = mine.filter((l) => l.certified).length;
  const step = (label: string, count: number): FunnelStep => ({ label, count, pct: total ? Math.round((count / total) * 100) : 0 });

  const hardest: HardQuestion[] = data.quizzes
    .filter((q) => q.courseId === courseId)
    .flatMap((q) => q.questions.filter((x) => x.answered >= MIN_ANSWERS && x.correctPct !== null)
      .map((x) => ({ quizTitle: q.title, module: q.module, prompt: x.prompt, answered: x.answered, correctPct: x.correctPct as number, topWrong: x.topWrong })))
    .sort((a, b) => a.correctPct - b.correctPct || b.answered - a.answered)
    .slice(0, 8);

  return {
    courseId, course: course.title, learners: total,
    funnel: [step("Enrolled", total), step("Started", startedAny), step("Halfway", half), step("Completed", done), step("Certified", cert)],
    lessons: stats, hardest,
  };
}
