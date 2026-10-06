import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import type { LearnerRow, ReportsData } from "@/lib/reportsData";
import { MIN_ANSWERS, computeInsights, type CourseInsights } from "@/lib/learningAnalytics";
import { PanelHeader, panel } from "../adminUi";

const BLUE = "#3434ff";
const fmtMin = (s: number | null) => (s === null ? "—" : s < 90 ? `${Math.round(s)}s` : `${Math.round(s / 60)} min`);

/** Reports > Learning: where learners drop off, time per lesson, and the questions that trip people up. */
export function LearningInsights({ data, learners, courseId }: { data: ReportsData; learners: LearnerRow[]; courseId: string }) {
  const sections = useMemo(() => {
    const ids = courseId === "all" ? data.courses.map((c) => c.id) : [courseId];
    return ids.map((id) => computeInsights(data, learners, id)).filter((x): x is CourseInsights => !!x && x.learners > 0);
  }, [data, learners, courseId]);

  if (!sections.length) {
    return (
      <div style={{ ...panel, padding: 28 }}>
        <PanelHeader title="Learning insights" sub="Where people drop off, how long lessons really take, and which questions are hardest." />
        <p style={{ margin: "8px 28px 24px", fontSize: 14, color: "#69697b" }}>Nothing to show yet. This fills in as soon as learners enrol and start watching lessons.</p>
      </div>
    );
  }
  return <div style={{ display: "grid", gap: 20 }}>{sections.map((s) => <Course key={s.courseId} s={s} />)}</div>;
}

function Course({ s }: { s: CourseInsights }) {
  const started = s.funnel[1].count;
  const cliff = s.lessons.find((l) => l.biggestDrop);
  const stuckTotal = s.lessons.reduce((n, l) => n + l.stuckHere, 0);
  return (
    <div style={panel}>
      <PanelHeader title={s.course} sub={`${s.learners} learner${s.learners === 1 ? "" : "s"} · ${started} started`} />

      {(cliff || stuckTotal > 0) && (
        <div role="note" style={{ margin: "0 28px 18px", padding: "12px 14px", borderRadius: 12, background: "#fff7ed", border: "1px solid #fed7aa", display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.55, color: "#7c2d12" }}>
          <AlertTriangle size={17} style={{ flex: "none", marginTop: 2 }} />
          <span>
            {cliff && <>The biggest drop is at <strong>lesson {cliff.index}, “{cliff.title}”</strong>
              {cliff.retainedPct !== null ? <>: only {cliff.retainedPct}% of those who started the previous lesson went on to start it.</> : "."} </>}
            {stuckTotal > 0 && <>{stuckTotal} learner{stuckTotal === 1 ? " has" : "s have"} gone quiet part-way through; the “Quiet here” column shows where.</>}
          </span>
        </div>
      )}

      <div style={{ padding: "0 28px 8px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>Course funnel</div>
        <div style={{ display: "grid", gap: 8 }}>
          {s.funnel.map((f) => (
            <div key={f.label} style={{ display: "grid", gridTemplateColumns: "92px 1fr 88px", alignItems: "center", gap: 12, fontSize: 13.5 }}>
              <span style={{ fontWeight: 700 }}>{f.label}</span>
              <div style={{ height: 14, borderRadius: 7, background: "#eef0f6", overflow: "hidden" }} role="img" aria-label={`${f.label}: ${f.count} of ${s.learners}`}>
                <div style={{ width: `${f.pct}%`, height: "100%", background: BLUE, borderRadius: 7, minWidth: f.count ? 6 : 0 }} />
              </div>
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#475569" }}><strong style={{ color: "#0b0b2c" }}>{f.count}</strong> · {f.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "22px 28px 8px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>Lesson by lesson</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#69697b", fontSize: 12 }}>
                {["Lesson", "Started", "Finished", "Reached from previous", "Avg time spent", "Quiet here"].map((h, i) => (
                  <th key={h} style={{ padding: "8px 10px", fontWeight: 700, textAlign: i ? "right" : "left", whiteSpace: "nowrap", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.lessons.map((l) => (
                <tr key={l.id} style={{ background: l.biggestDrop ? "#fff7ed" : undefined, borderBottom: "1px solid #f1f4f8" }}>
                  <td style={{ padding: "10px", maxWidth: 320 }}>
                    <div style={{ fontWeight: 700 }}>{l.index}. {l.title}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{l.module}{l.biggestDrop ? " · biggest drop" : ""}</div>
                  </td>
                  <td style={cell}>{l.started}</td>
                  <td style={cell}>{l.completed}{l.completionPct !== null && <span style={{ color: "#94a3b8" }}> · {l.completionPct}%</span>}</td>
                  <td style={cell}>{l.retainedPct === null ? "—" : `${l.retainedPct}%`}</td>
                  <td style={cell}>
                    {fmtMin(l.avgWatchedSeconds)}
                    {l.lessonSeconds > 0 && <span style={{ color: "#94a3b8" }}> of {fmtMin(l.lessonSeconds)}{l.avgWatchPct !== null ? ` · ${l.avgWatchPct}%` : ""}</span>}
                  </td>
                  <td style={{ ...cell, color: l.stuckHere ? "#9a3412" : "#94a3b8", fontWeight: l.stuckHere ? 800 : 500 }}>{l.stuckHere || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "#94a3b8" }}>“Started” means watched at least 5 seconds. “Quiet here” counts learners with no activity for 14+ days whose next lesson is this one.</p>
      </div>

      <div style={{ padding: "22px 28px 26px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>Questions that trip people up</div>
        {s.hardest.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13.5, color: "#69697b" }}>Needs at least {MIN_ANSWERS} answers to a question before it is ranked.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {s.hardest.map((q, i) => (
              <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.45 }}>{q.prompt}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{q.module} · {q.answered} answers</div>
                  </div>
                  <span style={{ flex: "none", fontSize: 13, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: q.correctPct < 50 ? "#fee2e2" : "#fff4e5", color: q.correctPct < 50 ? "#b91c1c" : "#9a3412", fontVariantNumeric: "tabular-nums" }}>{q.correctPct}% right</span>
                </div>
                {q.topWrong && <div style={{ fontSize: 13, color: "#475569", marginTop: 8 }}>Most common wrong answer ({q.topWrong.pct}%): <em>“{q.topWrong.text}”</em></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const cell: React.CSSProperties = { padding: "10px", textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
