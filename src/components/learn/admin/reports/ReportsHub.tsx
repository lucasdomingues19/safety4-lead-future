import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Download, Search } from "lucide-react";
import { AT_RISK_DAYS, courseOfLessonMap, loadReportsData, type LearnerRow, type LearnerState, type ReportsData } from "@/lib/reportsData";
import { Kpi, PanelHeader, Spinner, adminFont, downloadCsv, input, panel } from "../adminUi";
import { ReportsExports } from "../LmsAdminReports";

const DAY = 86_400_000;
const PERIODS = [
  { v: 7, label: "7 days" }, { v: 30, label: "30 days" }, { v: 90, label: "90 days" }, { v: 365, label: "12 months" }, { v: 0, label: "All time" },
];
const STATE_META: Record<LearnerState, { label: string; bg: string; fg: string }> = {
  not_started: { label: "Not started", bg: "#f1f5f9", fg: "#475569" },
  in_progress: { label: "In progress", bg: "#f5f7ff", fg: "#2c23d2" },
  completed: { label: "Completed", bg: "#f4fbe4", fg: "#3f6212" },
  at_risk: { label: "At risk", bg: "#fff4e5", fg: "#9a3412" },
};
const BLUE = "#3434ff";
const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—");

type Tab = "dashboard" | "learners" | "quizzes" | "exports";

export function LmsAdminReports() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [courseId, setCourseId] = useState("all");
  const [period, setPeriod] = useState(30);
  const [tag, setTag] = useState("");

  useEffect(() => { loadReportsData().then(setData).catch((e) => setError(e instanceof Error ? e.message : "Couldn't load reports")); }, []);

  const since = period ? Date.now() - period * DAY : 0;
  const learners = useMemo(() => (data?.learners ?? []).filter((l) => (courseId === "all" || l.courseId === courseId) && (!tag || l.tags.includes(tag))), [data, courseId, tag]);

  if (error) return <div style={{ ...panel, marginTop: 28, padding: 28, color: "#c93636" }}>{error}</div>;
  if (!data) return <Spinner />;

  return (
    <div style={{ marginTop: 28, fontFamily: adminFont, display: "grid", gap: 20 }}>
      {/* Filters: one row, apply to every tab */}
      <div style={{ ...panel, padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", overflow: "visible" }}>
        <select aria-label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)} style={{ ...input, width: "auto", minWidth: 220, padding: "9px 12px" }}>
          <option value="all">All courses</option>
          {data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <div role="group" aria-label="Period" style={{ display: "inline-flex", gap: 4, padding: 3, border: "1px solid #e2e8f0", borderRadius: 10 }}>
          {PERIODS.map((p) => (
            <button key={p.v} type="button" aria-pressed={period === p.v} onClick={() => setPeriod(p.v)}
              style={{ border: 0, borderRadius: 7, padding: "7px 11px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", background: period === p.v ? "#0b0b2c" : "transparent", color: period === p.v ? "#fff" : "#69697b" }}>{p.label}</button>
          ))}
        </div>
        {data.tags.length > 0 && (
          <select aria-label="Tag" value={tag} onChange={(e) => setTag(e.target.value)} style={{ ...input, width: "auto", minWidth: 160, padding: "9px 12px" }}>
            <option value="">All tags</option>
            {data.tags.map((t) => <option key={t} value={t}>Tagged: {t}</option>)}
          </select>
        )}
        <div role="tablist" style={{ marginLeft: "auto", display: "inline-flex", gap: 4 }}>
          {(["dashboard", "learners", "quizzes", "exports"] as Tab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              style={{ border: 0, borderBottom: `2px solid ${tab === t ? BLUE : "transparent"}`, background: "none", padding: "8px 10px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: tab === t ? BLUE : "#69697b", cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>
      </div>

      {tab === "dashboard" && <Dashboard data={data} learners={learners} courseId={courseId} since={since} period={period} />}
      {tab === "learners" && <Learners learners={learners} />}
      {tab === "quizzes" && <Quizzes data={data} courseId={courseId} learners={learners} since={since} />}
      {tab === "exports" && <ReportsExports />}
    </div>
  );
}

/* ============================== Dashboard ============================== */

function Dashboard({ data, learners, courseId, since, period }: { data: ReportsData; learners: LearnerRow[]; courseId: string; since: number; period: number }) {
  const users = new Set(learners.map((l) => l.userId));
  const emails = new Set(learners.map((l) => l.email.toLowerCase()));
  const courseIds = new Set(courseId === "all" ? data.courses.map((c) => c.id) : [courseId]);
  const courseTitles = new Set(data.courses.filter((c) => courseIds.has(c.id)).map((c) => c.title));
  const lessonCourse = courseOfLessonMap(data);

  const completions = data.completions.filter((c) => users.has(c.userId) && courseIds.has(lessonCourse.get(c.lessonId) ?? ""));
  const inPeriod = (t: number) => t >= since;
  const lessonsDone = completions.filter((c) => inPeriod(c.at)).length;
  const activeUsers = new Set([
    ...data.activity.filter((a) => users.has(a.userId) && inPeriod(new Date(`${a.day}T12:00:00Z`).getTime())).map((a) => a.userId),
    ...completions.filter((c) => inPeriod(c.at)).map((c) => c.userId),
  ]);
  const newEnrols = learners.filter((l) => inPeriod(new Date(l.enrolledAt).getTime())).length;
  const certs = data.certificates.filter((c) => emails.has(c.email) && courseTitles.has(c.course));
  const quizIds = new Set(data.quizzes.filter((q) => courseIds.has(q.courseId)).map((q) => q.quizId));
  const attempts = data.attempts.filter((a) => users.has(a.userId) && quizIds.has(a.quizId) && inPeriod(a.at));
  const avgProgress = learners.length ? Math.round(learners.reduce((s, l) => s + l.pct, 0) / learners.length) : 0;
  const periodLabel = period ? `last ${PERIODS.find((p) => p.v === period)?.label}` : "all time";

  // Activity over time: days for short periods, weeks otherwise.
  const daily = period > 0 && period <= 30;
  const span = period || 182;
  const buckets = daily ? period : Math.ceil(span / 7);
  const size = daily ? DAY : 7 * DAY;
  const end = Date.now();
  const series = Array.from({ length: buckets }, (_, i) => {
    const from = end - (buckets - i) * size;
    const to = from + size;
    const act = new Set([
      ...data.activity.filter((a) => users.has(a.userId)).filter((a) => { const t = new Date(`${a.day}T12:00:00Z`).getTime(); return t >= from && t < to; }).map((a) => a.userId),
      ...completions.filter((c) => c.at >= from && c.at < to).map((c) => c.userId),
    ]).size;
    const done = completions.filter((c) => c.at >= from && c.at < to).length;
    const label = new Date(from).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return { label, value: act, tip: `${daily ? label : `Week of ${label}`}: ${act} active learner${act === 1 ? "" : "s"} · ${done} lesson${done === 1 ? "" : "s"} completed` };
  });

  const n = learners.length;
  const funnel = [
    { label: "Enrolled", value: n },
    { label: "Started", value: learners.filter((l) => l.lessonsDone > 0).length },
    { label: "Halfway", value: learners.filter((l) => l.pct >= 50).length },
    { label: "Completed", value: learners.filter((l) => l.pct >= 100).length },
    { label: "Certified", value: learners.filter((l) => l.certified).length },
  ];

  const lessons = courseId === "all" ? [] : data.lessonsByCourse.get(courseId) ?? [];
  const doneByLesson = new Map<string, number>();
  for (const c of completions) doneByLesson.set(c.lessonId, (doneByLesson.get(c.lessonId) ?? 0) + 1);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(190px, 100%), 1fr))", gap: 16 }}>
        <Kpi label="Learners" value={n} sub={`${newEnrols} new · ${periodLabel}`} />
        <Kpi label="Active learners" value={activeUsers.size} sub={periodLabel} tone={activeUsers.size ? "good" : "default"} />
        <Kpi label="Lessons completed" value={lessonsDone} sub={periodLabel} />
        <Kpi label="Average progress" value={`${avgProgress}%`} sub="across enrolments" />
        <Kpi label="Certificates" value={certs.filter((c) => inPeriod(c.at)).length} sub={`${certs.length} in total`} />
        <Kpi label="Quiz pass rate" value={attempts.length ? `${Math.round((attempts.filter((a) => a.passed).length / attempts.length) * 100)}%` : "—"} sub={`${attempts.length} attempt${attempts.length === 1 ? "" : "s"} · ${periodLabel}`} />
      </div>

      <div style={panel}>
        <PanelHeader title="Active learners" sub={`Learners who watched, completed or studied a lesson, ${daily ? "per day" : "per week"} · ${periodLabel}`} />
        <div style={{ padding: "18px 24px 22px" }}><ColumnChart data={series} /></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))", gap: 20 }}>
        <div style={panel}>
          <PanelHeader title="Course funnel" sub="How far enrolled learners have got" />
          <div style={{ padding: "18px 24px 24px" }}>
            <BarList rows={funnel.map((f) => ({ label: f.label, value: f.value, note: n ? `${Math.round((f.value / n) * 100)}%` : "—", tip: `${f.label}: ${f.value} of ${n} learners` }))} max={Math.max(n, 1)} />
          </div>
        </div>
        <div style={panel}>
          <PanelHeader title="Lesson drop-off" sub={courseId === "all" ? "Choose a course above to see where learners stop" : "Learners who completed each lesson, in course order"} />
          <div style={{ padding: "18px 24px 24px", maxHeight: 460, overflowY: "auto" }}>
            {courseId === "all" ? <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Pick a single course in the filter.</p>
              : lessons.length === 0 ? <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>This course has no lessons yet.</p>
              : <BarList rows={lessons.map((l, i) => ({ label: `${i + 1}. ${l.title}`, value: doneByLesson.get(l.id) ?? 0, note: n ? `${Math.round(((doneByLesson.get(l.id) ?? 0) / n) * 100)}%` : "—", tip: `${l.module} › ${l.title}: ${doneByLesson.get(l.id) ?? 0} of ${n} learners` }))} max={Math.max(n, 1)} compact />}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Single-series column chart with a hover tooltip on every column. */
function ColumnChart({ data }: { data: { label: string; value: number; tip: string }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const ticks = [max, Math.round(max / 2), 0];
  const every = Math.ceil(data.length / 8);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 180, fontSize: 11, color: "#94a3b8", fontVariantNumeric: "tabular-nums", textAlign: "right", minWidth: 18 }}>
          {ticks.map((t, i) => <span key={i}>{t}</span>)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ position: "relative", height: 180, display: "flex", alignItems: "flex-end", gap: 2, borderBottom: "1px solid #e2e8f0", backgroundImage: "linear-gradient(#f1f4f8 1px, transparent 1px)", backgroundSize: "100% 50%" }}>
            {data.map((d, i) => (
              <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={d.tip}
                style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", cursor: "default", outline: "none" }}>
                <div style={{ width: "100%", height: `${(d.value / max) * 100}%`, minHeight: d.value ? 3 : 0, background: BLUE, opacity: hover === null || hover === i ? 1 : 0.45, borderRadius: "4px 4px 0 0", transition: "opacity .15s" }} />
              </div>
            ))}
            {hover !== null && (
              <div role="tooltip" style={{ position: "absolute", bottom: "100%", left: `${((hover + 0.5) / data.length) * 100}%`, transform: "translate(-50%, -6px)", background: "#0b0b2c", color: "#fff", fontSize: 12, padding: "6px 10px", borderRadius: 8, whiteSpace: "nowrap", pointerEvents: "none", boxShadow: "0 6px 16px rgba(11,11,44,.2)", zIndex: 2 }}>
                {data[hover].tip}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
            {data.map((d, i) => <div key={i} style={{ flex: 1, fontSize: 10.5, color: "#94a3b8", textAlign: "center", whiteSpace: "nowrap", overflow: "visible" }}>{i % every === 0 ? d.label : ""}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Horizontal bars (one series) with value + share at the end of each row. */
function BarList({ rows, max, compact }: { rows: { label: string; value: number; note: string; tip: string; valueLabel?: string }[]; max: number; compact?: boolean }) {
  return (
    <div style={{ display: "grid", gap: compact ? 8 : 12 }}>
      {rows.map((r, i) => (
        <div key={i} title={r.tip} style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0, 1.4fr) minmax(0, 1fr) 64px" : "96px minmax(0, 1fr) 72px", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: compact ? 12.5 : 13.5, fontWeight: compact ? 500 : 700, color: "#0b0b2c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
          <div style={{ height: compact ? 10 : 14, background: "#f1f4f8", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (r.value / max) * 100)}%`, height: "100%", background: BLUE, borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12.5, color: "#69697b", textAlign: "right", fontVariantNumeric: "tabular-nums" }}><strong style={{ color: "#0b0b2c" }}>{r.valueLabel ?? r.value}</strong> · {r.note}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================== Learners ============================== */

type SortKey = "name" | "course" | "pct" | "lastActive" | "quizAvg" | "enrolledAt";

function Learners({ learners }: { learners: LearnerRow[] }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState<LearnerState | "all">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "lastActive", dir: -1 });

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: learners.length };
    for (const l of learners) c[l.state] = (c[l.state] ?? 0) + 1;
    return c;
  }, [learners]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return learners
      .filter((l) => (state === "all" || l.state === state) && (!needle || [l.name, l.email, l.organisation, l.course].some((x) => x.toLowerCase().includes(needle))))
      .sort((a, b) => {
        const av = a[sort.key] ?? (sort.key === "quizAvg" || sort.key === "pct" ? -1 : "");
        const bv = b[sort.key] ?? (sort.key === "quizAvg" || sort.key === "pct" ? -1 : "");
        return (av < bv ? -1 : av > bv ? 1 : 0) * sort.dir;
      });
  }, [learners, q, state, sort]);

  const exportView = () => downloadCsv(`learners-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((l) => ({
    Learner: l.name, Email: l.email, Company: l.organisation, Course: l.course, Status: STATE_META[l.state].label, "Progress %": l.pct,
    "Lessons completed": l.lessonsDone, "Total lessons": l.lessonsTotal, "Quiz average %": l.quizAvg ?? "", "Final assessment": l.final,
    Certified: l.certified ? "Yes" : "No", "Last active": l.lastActive?.slice(0, 10) ?? "", Enrolled: l.enrolledAt.slice(0, 10), "Access until": l.expiresAt?.slice(0, 10) ?? "No expiry", Tags: l.tags.join(", "),
  })));

  const Th = ({ k, children, align = "left" }: { k: SortKey; children: string; align?: "left" | "right" }) => (
    <th style={{ padding: "10px 12px", textAlign: align, fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#94a3b8", whiteSpace: "nowrap" }}>
      <button type="button" onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : -1 }))} style={{ border: 0, background: "none", padding: 0, font: "inherit", color: "inherit", letterSpacing: "inherit", textTransform: "inherit", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 }}>
        {children}{sort.key === k && (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
      </button>
    </th>
  );

  return (
    <div style={panel}>
      <div style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 360 }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, company or course" aria-label="Search learners" style={{ ...input, paddingLeft: 32 }} />
        </div>
        {(["all", "in_progress", "at_risk", "not_started", "completed"] as const).map((s) => (
          <button key={s} type="button" aria-pressed={state === s} onClick={() => setState(s)}
            style={{ border: `1px solid ${state === s ? "#0b0b2c" : "#e2e8f0"}`, background: state === s ? "#0b0b2c" : "#fff", color: state === s ? "#fff" : "#0b0b2c", borderRadius: 999, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {s === "all" ? "All" : STATE_META[s].label} {counts[s] ?? 0}
          </button>
        ))}
        <button type="button" onClick={exportView} disabled={!rows.length} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#0b0b2c" }}>
          <Download size={14} /> Export this view
        </button>
      </div>
      <p style={{ margin: 0, padding: "8px 20px 0", fontSize: 12, color: "#94a3b8" }}>“At risk” = no activity for {AT_RISK_DAYS}+ days and not finished.</p>
      <div className="relative" style={{ overflowX: "auto", position: "relative" }}>
        <table style={{ width: "100%", minWidth: 920, borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead><tr style={{ borderBottom: "1px solid #eef1f6" }}>
            <Th k="name">Learner</Th><Th k="course">Course</Th>
            <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#94a3b8" }}>Status</th>
            <Th k="pct">Progress</Th><Th k="quizAvg" align="right">Quizzes</Th>
            <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#94a3b8" }}>Final</th>
            <Th k="lastActive">Last active</Th><Th k="enrolledAt">Enrolled</Th>
          </tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} style={{ padding: 28, textAlign: "center", color: "#94a3b8" }}>No learners match these filters.</td></tr>}
            {rows.map((l) => (
              <tr key={l.key} style={{ borderBottom: "1px solid #f5f7fa" }}>
                <td style={{ padding: "11px 12px" }}><div style={{ fontWeight: 700 }}>{l.name}</div><div data-private style={{ fontSize: 12, color: "#94a3b8" }}>{l.email}</div></td>
                <td style={{ padding: "11px 12px", maxWidth: 240 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={l.course}>{l.course}</div></td>
                <td style={{ padding: "11px 12px" }}><span style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: STATE_META[l.state].bg, color: STATE_META[l.state].fg, whiteSpace: "nowrap" }}>{STATE_META[l.state].label}</span></td>
                <td style={{ padding: "11px 12px", minWidth: 150 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "#eef1f6", borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${l.pct}%`, height: "100%", background: BLUE }} /></div>
                    <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "#69697b", minWidth: 34, textAlign: "right" }}>{l.pct}%</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{l.lessonsDone}/{l.lessonsTotal} lessons</div>
                </td>
                <td style={{ padding: "11px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{l.quizAvg === null ? "—" : `${l.quizAvg}%`}</td>
                <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>{l.certified ? "Certified" : l.final}</td>
                <td style={{ padding: "11px 12px", whiteSpace: "nowrap", color: "#69697b" }}>{fmtDate(l.lastActive)}</td>
                <td style={{ padding: "11px 12px", whiteSpace: "nowrap", color: "#69697b" }}>{fmtDate(l.enrolledAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================== Quizzes ============================== */

function Quizzes({ data, courseId, learners, since }: { data: ReportsData; courseId: string; learners: LearnerRow[]; since: number }) {
  const [open, setOpen] = useState<string | null>(null);
  const users = new Set(learners.map((l) => l.userId));
  const quizzes = data.quizzes.filter((q) => (courseId === "all" || q.courseId === courseId) && !/test/i.test(q.course));
  const rows = quizzes.map((q) => {
    const at = data.attempts.filter((a) => a.quizId === q.quizId && users.has(a.userId) && a.at >= since);
    return { ...q, pAttempts: at.length, pLearners: new Set(at.map((a) => a.userId)).size, pPass: at.length ? Math.round((at.filter((a) => a.passed).length / at.length) * 100) : null, pAvg: at.length ? Math.round(at.reduce((s, a) => s + a.score, 0) / at.length) : null };
  });
  return (
    <div style={panel}>
      <PanelHeader title="Quiz performance" sub="Click a quiz to see which questions learners get wrong. Question figures cover all attempts." />
      {rows.length === 0 && <div style={{ padding: 28, color: "#94a3b8", fontSize: 13 }}>No quizzes for this course.</div>}
      {rows.map((q) => {
        const hardest = [...q.questions].filter((x) => x.correctPct !== null).sort((a, b) => (a.correctPct ?? 0) - (b.correctPct ?? 0))[0];
        const isOpen = open === q.quizId;
        return (
          <div key={q.quizId} style={{ borderTop: "1px solid #f1f4f8" }}>
            <button type="button" onClick={() => setOpen(isOpen ? null : q.quizId)} aria-expanded={isOpen}
              style={{ width: "100%", textAlign: "left", border: 0, background: "none", padding: "14px 24px", cursor: "pointer", fontFamily: "inherit", color: "#0b0b2c", display: "grid", gridTemplateColumns: "20px minmax(0, 2fr) repeat(4, minmax(70px, 1fr))", gap: 12, alignItems: "center" }}>
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.title}</span><span style={{ display: "block", fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.course}</span></span>
              <Stat label="Attempts" value={q.pAttempts} />
              <Stat label="Learners" value={q.pLearners} />
              <Stat label="Pass rate" value={q.pPass === null ? "—" : `${q.pPass}%`} />
              <Stat label="Avg score" value={q.pAvg === null ? "—" : `${q.pAvg}%`} />
            </button>
            {isOpen && (
              <div style={{ padding: "4px 24px 20px 56px" }}>
                <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#69697b" }}>
                  Pass mark {q.passMark}% · {q.avgAttemptsToPass === null ? "nobody has passed yet" : `${q.avgAttemptsToPass} attempts on average to pass`}
                  {hardest ? ` · hardest: “${hardest.prompt.slice(0, 70)}${hardest.prompt.length > 70 ? "…" : ""}” (${hardest.correctPct}% right)` : ""}
                </p>
                {q.questions.length === 0 ? <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>No questions.</p> :
                  <BarList compact max={100} rows={q.questions.map((x, i) => ({ label: `${i + 1}. ${x.prompt}`, value: x.correctPct ?? 0, valueLabel: x.correctPct === null ? "—" : `${x.correctPct}% right`, note: `${x.answered} answer${x.answered === 1 ? "" : "s"}`, tip: `${x.prompt} — ${x.correctPct === null ? "not answered yet" : `${x.correctPct}% answered correctly`}` }))} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <span style={{ textAlign: "right" }}><span style={{ display: "block", fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{value}</span><span style={{ display: "block", fontSize: 11, color: "#94a3b8" }}>{label}</span></span>
);
