import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, BookOpen, CheckCircle2, Clock, ExternalLink, ListChecks, Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { courseMeta, linkedInPostText, linkedInPostUrl } from "@/lib/courseMeta";
import { useAuthUser } from "@/hooks/useAuthUser";
import { loadMyCourses, type CatalogCourse, type CourseProgress, type MyCertificate } from "@/lib/myCourses";

// My Learning: every course the learner has, filterable by status, with the
// next lesson, progress, access dates and certificates in one place.

type Filter = "all" | "in_progress" | "not_started" | "completed";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In progress" },
  { id: "not_started", label: "Not started" },
  { id: "completed", label: "Completed" },
];
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const STATUS = {
  in_progress: { label: "In progress", cls: "bg-[#eef1ff] text-[#3434ff]" },
  not_started: { label: "Not started", cls: "bg-[#f1f5f9] text-[#69697b]" },
  completed: { label: "Completed", cls: "bg-[#ecffd1] text-[#3f6212]" },
} as const;

export function LmsMyLearning({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [catalog, setCatalog] = useState<CatalogCourse[]>([]);
  const [certs, setCerts] = useState<MyCertificate[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const mine = await loadMyCourses(user.id, user.email);
      setCourses(mine.courses);
      setCatalog(mine.catalog);
      setCerts(mine.certificates);
    } catch (e) {
      console.error(e);
      toast.error("Could not load your courses");
    } finally {
      setLoading(false);
    }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => ({
    all: courses.length,
    in_progress: courses.filter((c) => c.status === "in_progress").length,
    not_started: courses.filter((c) => c.status === "not_started").length,
    completed: courses.filter((c) => c.status === "completed").length,
  }), [courses]);
  const shown = filter === "all" ? courses : courses.filter((c) => c.status === filter);
  const certFor = (c: CourseProgress) => certs.find((x) => x.course_name.trim().toLowerCase() === c.title.trim().toLowerCase());
  const cpdEarned = certs.reduce((n, c) => n + (c.cpd_hours ?? 0), 0);
  const open = (c: CourseProgress) => navigate(c.nextLessonId && c.status !== "completed" ? `/learn/${c.slug}/lesson/${c.nextLessonId}` : `/learn/${c.slug}`);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 size={30} className="animate-spin text-[#3434ff]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#eef1f6] px-4 pb-20 pt-10 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c] md:px-7">
      <div className="mx-auto max-w-[1100px]">
        <p className="text-[13px] font-extrabold tracking-[0.12em] text-[#8ab815]">MY LEARNING</p>
        <h1 className="mt-3 text-[34px] font-bold leading-tight md:text-[38px]">Your courses</h1>
        <p className="mt-2 text-[16px] text-[#69697b]">
          {courses.length === 0 ? "You're not enrolled in a course yet." : `${counts.in_progress} in progress · ${counts.completed} completed${cpdEarned ? ` · ${cpdEarned} CPD hours earned` : ""}`}
        </p>

        {courses.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter courses">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-2 text-[13.5px] font-bold transition ${filter === f.id ? "bg-[#0b0b2c] text-white" : "bg-white text-[#69697b] hover:text-[#0b0b2c]"}`}
              >
                {f.label} <span className={filter === f.id ? "text-white/60" : "text-[#94a3b8]"}>{counts[f.id]}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 space-y-4">
          {shown.map((c) => {
            const cert = certFor(c);
            const st = STATUS[c.status];
            return (
              <article key={c.id} className="flex flex-col overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white md:flex-row">
                <button onClick={() => open(c)} className="relative block w-full shrink-0 bg-gradient-to-br from-[#17176e] to-[#05051e] md:w-[280px]" aria-label={`Open ${c.title}`}>
                  {c.coverUrl ? <img src={c.coverUrl} alt="" className="aspect-video h-full w-full object-cover" /> : <div className="flex aspect-video items-center justify-center"><BookOpen size={34} className="text-white/60" /></div>}
                </button>
                <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${st.cls}`}>{st.label}</span>
                    {c.cpdHours ? <span className="rounded-full bg-[#f7fde8] px-2.5 py-1 text-[11.5px] font-bold text-[#5e7f0f]">{c.cpdHours} CPD hours</span> : null}
                    {c.expiresAt && <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#b45309]"><Clock size={12} /> Access until {fmtDate(c.expiresAt)}</span>}
                  </div>
                  <h2 className="mt-2.5 text-[19px] font-bold leading-snug">{c.title}</h2>
                  <p className="mt-1 text-[13.5px] text-[#69697b]">
                    {c.totalModules} module{c.totalModules === 1 ? "" : "s"} · {c.completedLessons} of {c.totalLessons} lessons
                    {c.lastActivityAt ? ` · last studied ${fmtDate(c.lastActivityAt)}` : ""}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eef1f6]"><div className={`h-full rounded-full ${c.status === "completed" ? "bg-[#84cc16]" : "bg-[#3434ff]"}`} style={{ width: `${c.progressPercent}%` }} /></div>
                    <span className="text-[13px] font-bold tabular-nums text-[#69697b]">{c.progressPercent}%</span>
                  </div>
                  {c.status !== "completed" && c.nextLessonTitle && (
                    <p className="mt-3 truncate text-[13px] text-[#69697b]"><span className="font-semibold text-[#0b0b2c]">Up next:</span> {c.nextModuleTitle ? `${c.nextModuleTitle} · ` : ""}{c.nextLessonTitle}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => open(c)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#3434ff] px-4 py-2.5 text-[13.5px] font-bold text-white hover:bg-[#2a2ad6]">
                      {c.status === "completed" ? <><CheckCircle2 size={15} /> Review course</> : <><PlayCircle size={15} /> {c.status === "not_started" ? "Start course" : "Resume course"}</>}
                    </button>
                    <button onClick={() => navigate(`/learn/${c.slug}`)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-[13.5px] font-bold hover:border-[#c7cdf9]"><ListChecks size={15} /> Curriculum</button>
                    {cert && (
                      <a href={linkedInPostUrl(linkedInPostText(c.title, `https://www.safetytech.academy/verify/${encodeURIComponent(cert.certificate_number)}`, courseMeta(c.title, c.slug).landing))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#c9d8f0] bg-[#f3f8ff] px-4 py-2.5 text-[13.5px] font-bold text-[#0A66C2] hover:border-[#0A66C2]">Share on LinkedIn</a>
                    )}
                    {cert && (
                      <a href={`/verify/${encodeURIComponent(cert.certificate_number)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#d9f09a] bg-[#f7fde8] px-4 py-2.5 text-[13.5px] font-bold text-[#3f6212] hover:border-[#a6e21a]"><Award size={15} /> Certificate</a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          {courses.length > 0 && shown.length === 0 && (
            <div className="rounded-[20px] border border-dashed border-[#cfd6e4] bg-white p-10 text-center text-[14px] text-[#69697b]">No courses here yet.</div>
          )}
        </div>

        {courses.length === 0 && (
          <div className="mt-6 rounded-[20px] border border-dashed border-[#cfd6e4] bg-white p-10 text-center">
            <BookOpen size={32} className="mx-auto text-[#3434ff]" />
            <p className="mt-3 text-[16px] font-bold">Start your first course</p>
            <p className="mt-1 text-[14px] text-[#69697b]">{catalog.length ? "Browse the courses available to you on your dashboard." : "New courses are on their way. Check back soon."}</p>
            {catalog.length > 0 && <button onClick={() => onNavigate?.("dash")} className="mt-5 rounded-lg bg-[#3434ff] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-[#2a2ad6]">Browse courses</button>}
          </div>
        )}

        {certs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-[22px] font-bold">Certificates</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {certs.map((c) => (
                <a key={c.id} href={`/verify/${encodeURIComponent(c.certificate_number)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-[16px] border border-[#e2e8f0] bg-white p-4 transition hover:border-[#a6e21a]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ecffd1] text-[#3f6212]"><Award size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-bold">{c.course_name}</span>
                    <span className="block text-[12.5px] text-[#69697b]">Issued {fmtDate(c.issued_at)}{c.cpd_hours ? ` · ${c.cpd_hours} CPD hours` : ""}</span>
                  </span>
                  <ExternalLink size={15} className="shrink-0 text-[#94a3b8]" />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
