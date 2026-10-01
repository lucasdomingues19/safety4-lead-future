// A learner's courses with progress — shared by the dashboard and My Learning
// so both always agree on what "in progress" or "completed" means.
import { supabase } from "@/integrations/supabase/client";

export interface CourseProgress {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cpdHours: number | null;
  coverUrl: string | null;
  status: "in_progress" | "completed" | "not_started";
  progressPercent: number;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  nextModuleTitle: string | null;
  /** Access end date, if the enrolment expires. */
  expiresAt?: string | null;
  /** Most recent lesson completion in this course. */
  lastActivityAt?: string | null;
}

export interface CatalogCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_cents: number | null;
  currency: string;
  cpd_hours: number | null;
  cover_image_url: string | null;
}

export interface MyCertificate {
  id: string;
  certificate_number: string;
  course_name: string;
  issued_at: string;
  cpd_hours: number | null;
  status: string;
}

export async function loadMyCourses(userId: string, email: string | null | undefined) {
  const [enrRes, courseRes, progRes, certRes] = await Promise.all([
    supabase.from("enrollments").select("course_id, status, expires_at").eq("user_id", userId),
    supabase.from("courses").select("id, title, slug, description, price_cents, currency, cpd_hours, cover_image_url").eq("published", true),
    supabase.from("lesson_progress").select("lesson_id, completed_at").eq("user_id", userId).eq("is_completed", true),
    supabase.from("certificates").select("id, certificate_number, course_name, issued_at, cpd_hours, status").eq("recipient_email", (email ?? "").toLowerCase()).order("issued_at", { ascending: false }),
  ]);

  const now = Date.now();
  const active = new Map(
    (enrRes.data ?? [])
      .filter((e) => e.status === "active" && (!e.expires_at || new Date(e.expires_at).getTime() > now))
      .map((e) => [e.course_id, e.expires_at as string | null]),
  );
  const allCourses = (courseRes.data ?? []) as CatalogCourse[];
  const enrolled = allCourses.filter((c) => active.has(c.id));
  const completedAt = new Map((progRes.data ?? []).map((p) => [p.lesson_id, p.completed_at as string | null]));

  // One round trip for every enrolled course's modules and lessons.
  const courseIds = enrolled.map((c) => c.id);
  const { data: modules } = courseIds.length
    ? await supabase.from("modules").select("id, title, course_id, position").in("course_id", courseIds).order("position")
    : { data: [] as { id: string; title: string; course_id: string; position: number }[] };
  const moduleIds = (modules ?? []).map((m) => m.id);
  const { data: lessons } = moduleIds.length
    ? await supabase.from("lessons").select("id, title, module_id, position").in("module_id", moduleIds)
    : { data: [] as { id: string; title: string; module_id: string; position: number }[] };

  const courses: CourseProgress[] = enrolled.map((c) => {
    const mods = (modules ?? []).filter((m) => m.course_id === c.id);
    const order = new Map(mods.map((m, i) => [m.id, i]));
    const titleByModule = new Map(mods.map((m) => [m.id, m.title]));
    const ordered = (lessons ?? [])
      .filter((l) => order.has(l.module_id))
      .sort((a, b) => (order.get(a.module_id) ?? 0) - (order.get(b.module_id) ?? 0) || a.position - b.position);
    const doneLessons = ordered.filter((l) => completedAt.has(l.id));
    const done = doneLessons.length;
    const next = ordered.find((l) => !completedAt.has(l.id)) ?? ordered[0] ?? null;
    const last = doneLessons.map((l) => completedAt.get(l.id)).filter(Boolean).sort().pop() ?? null;
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      cpdHours: c.cpd_hours,
      coverUrl: c.cover_image_url ?? null,
      status: done === 0 ? "not_started" : done >= ordered.length && ordered.length > 0 ? "completed" : "in_progress",
      progressPercent: ordered.length ? Math.round((done / ordered.length) * 100) : 0,
      totalModules: mods.length,
      totalLessons: ordered.length,
      completedLessons: done,
      nextLessonId: next?.id ?? null,
      nextLessonTitle: next?.title ?? null,
      nextModuleTitle: next ? titleByModule.get(next.module_id) ?? null : null,
      expiresAt: active.get(c.id) ?? null,
      lastActivityAt: last,
    };
  });

  // Most recently studied first, then not-started, then completed.
  const rank = { in_progress: 0, not_started: 1, completed: 2 } as const;
  courses.sort((a, b) => rank[a.status] - rank[b.status] || (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? ""));

  return {
    courses,
    catalog: allCourses.filter((c) => !active.has(c.id)),
    certificates: ((certRes.data ?? []) as MyCertificate[]).filter((c) => c.status !== "revoked"),
  };
}
