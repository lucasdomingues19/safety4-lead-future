import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// One person's record for an admin: what they enrolled in, how far they got, quizzes, final assessments and certificates.
const fmt = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

interface CourseRow { courseId: string; title: string; status: string; enrolledAt: string | null; completedAt: string | null; expiresAt: string | null; done: number; total: number }
interface QuizRow { title: string; score: number; passed: boolean; at: string }
interface FinalRow { courseTitle: string; status: string; score: number | null; completedAt: string | null }
interface CertRow { number: string; course: string; issued: string; status: string; revokedAt: string | null; viewedAt: string | null; linkedinAt: string | null }

export function PersonRecord({ personId, name, email, onClose }: { personId: string; name: string; email: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [finals, setFinals] = useState<FinalRow[]>([]);
  const [certs, setCerts] = useState<CertRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [enr, prog, lessons, quizAtt, finalAtt, certRes] = await Promise.all([
          supabase.from("enrollments").select("course_id, status, enrolled_at, completed_at, expires_at, courses(title)").eq("user_id", personId),
          supabase.from("lesson_progress").select("lesson_id").eq("user_id", personId).eq("is_completed", true),
          supabase.from("lessons").select("id, modules(course_id)"),
          supabase.from("quiz_attempts").select("score, passed, attempted_at, quizzes(title)").eq("user_id", personId).order("attempted_at", { ascending: false }),
          supabase.from("final_assessment_attempts").select("course_id, status, score, completed_at, courses(title)").eq("user_id", personId),
          supabase.from("certificates").select("certificate_number, course_name, issued_at, status, revoked_at, viewed_at, linkedin_added_at").ilike("recipient_email", email),
        ]);
        const firstErr = enr.error || prog.error || lessons.error || quizAtt.error || finalAtt.error || certRes.error;
        if (firstErr) throw firstErr;

        // lesson progress per course
        const courseOf = new Map<string, string>();
        const totalPerCourse = new Map<string, number>();
        for (const l of (lessons.data ?? []) as { id: string; modules: { course_id: string } | null }[]) {
          const cid = l.modules?.course_id;
          if (!cid) continue;
          courseOf.set(l.id, cid);
          totalPerCourse.set(cid, (totalPerCourse.get(cid) ?? 0) + 1);
        }
        const donePerCourse = new Map<string, number>();
        for (const p of (prog.data ?? []) as { lesson_id: string }[]) {
          const cid = courseOf.get(p.lesson_id);
          if (cid) donePerCourse.set(cid, (donePerCourse.get(cid) ?? 0) + 1);
        }

        const courseRows: CourseRow[] = ((enr.data ?? []) as any[]).map((e) => ({
          courseId: e.course_id,
          title: e.courses?.title ?? "Course",
          status: e.status,
          enrolledAt: e.enrolled_at,
          completedAt: e.completed_at,
          expiresAt: e.expires_at,
          done: donePerCourse.get(e.course_id) ?? 0,
          total: totalPerCourse.get(e.course_id) ?? 0,
        })).sort((a, b) => a.title.localeCompare(b.title));

        if (!cancelled) {
          setCourses(courseRows);
          setQuizzes(((quizAtt.data ?? []) as any[]).map((q) => ({ title: q.quizzes?.title ?? "Quiz", score: Number(q.score), passed: q.passed, at: q.attempted_at })));
          setFinals(((finalAtt.data ?? []) as any[]).map((f) => ({ courseTitle: f.courses?.title ?? "Course", status: f.status, score: f.score, completedAt: f.completed_at })));
          setCerts(((certRes.data ?? []) as any[]).map((c) => ({ number: c.certificate_number, course: c.course_name, issued: c.issued_at, status: c.status, revokedAt: c.revoked_at, viewedAt: c.viewed_at, linkedinAt: c.linkedin_added_at })));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load this record");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [personId, email]);

  const section = (title: string, children: React.ReactNode) => (
    <section className="mt-6">
      <h3 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-[#69697b]">{title}</h3>
      {children}
    </section>
  );
  const empty = <p className="text-sm text-[#69697b]">Nothing yet.</p>;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto bg-white p-6 text-[#0b0b2c] font-['Plus_Jakarta_Sans',sans-serif]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-[#0b0b2c]">{name}</DialogTitle>
          <DialogDescription className="text-sm text-[#69697b]">{email}</DialogDescription>
        </DialogHeader>
        {!loading && !error && (
          <p className="mt-3 rounded-xl bg-[#f5f7ff] px-4 py-3 text-sm font-semibold text-[#0b0b2c]">
            {courses.length === 0
              ? "No courses yet."
              : `${courses.filter((c) => c.completedAt).length} of ${courses.length} course${courses.length === 1 ? "" : "s"} finished · ${certs.length} certificate${certs.length === 1 ? "" : "s"} issued`}
          </p>
        )}

        {loading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#3434ff]" /></div>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">{error}</p>}

        {!loading && !error && (
          <>
            {section("Courses",
              courses.length === 0 ? empty : (
                <ul className="space-y-2">
                  {courses.map((c) => {
                    const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
                    return (
                      <li key={c.courseId} className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold">{c.title}</span>
                          <span className={`text-xs font-bold ${c.status === "active" ? "text-[#3f6212]" : "text-[#94a3b8]"}`}>{c.status}</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef1f6]"><div className="h-full rounded-full bg-[#3434ff]" style={{ width: `${pct}%` }} /></div>
                        <div className="mt-1 text-xs text-[#69697b]">
                          {c.done} of {c.total} lessons complete ({pct}%) · enrolled {fmt(c.enrolledAt)}
                          {c.completedAt ? ` · finished ${fmt(c.completedAt)}` : " · not finished"}
                          {c.expiresAt ? ` · access ends ${fmt(c.expiresAt)}` : ""}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )
            )}

            {section("Quizzes",
              quizzes.length === 0 ? empty : (
                <ul className="space-y-1 text-sm">
                  {quizzes.map((q, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span>{q.title}</span>
                      <span className={q.passed ? "font-semibold text-[#3f6212]" : "text-[#9a3412]"}>{q.passed ? "Passed" : "Not passed"} · {Math.round(q.score)}% · {fmt(q.at)}</span>
                    </li>
                  ))}
                </ul>
              )
            )}

            {section("Final assessment",
              finals.length === 0 ? empty : (
                <ul className="space-y-1 text-sm">
                  {finals.map((f, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span>{f.courseTitle}</span>
                      <span>{f.status}{f.score != null ? ` · ${Math.round(f.score)}%` : ""}{f.completedAt ? ` · ${fmt(f.completedAt)}` : ""}</span>
                    </li>
                  ))}
                </ul>
              )
            )}

            {section("Certificates",
              certs.length === 0 ? <p className="text-sm font-semibold text-[#9a3412]">No certificate issued yet.</p> : (
                <ul className="space-y-2">
                  {certs.map((c) => (
                    <li key={c.number} className="rounded-xl border border-[#e2e8f0] bg-white p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold">{c.course}</span>
                        <span className={c.revokedAt || c.status !== "issued" ? "font-bold text-[#b91c1c]" : "font-bold text-[#3f6212]"}>{c.revokedAt ? "Revoked" : c.status}</span>
                      </div>
                      <div className="mt-1 text-xs text-[#69697b]">
                        No. {c.number} · issued {fmt(c.issued)}
                        {c.viewedAt ? ` · first viewed ${fmt(c.viewedAt)}` : " · not yet viewed"}
                        {c.linkedinAt ? ` · added to LinkedIn ${fmt(c.linkedinAt)}` : ""}
                      </div>
                      <a href={`/verify/${c.number}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-bold text-[#3434ff] hover:underline">Open certificate page</a>
                    </li>
                  ))}
                </ul>
              )
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PersonRecord;
