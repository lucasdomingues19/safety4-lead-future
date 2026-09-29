import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { PanelHeader, adminFont, downloadCsv, panel, primaryBtn } from "./adminUi";

type Row = Record<string, string | number | null | undefined>;
const stamp = () => new Date().toISOString().slice(0, 10);

async function learnerProgress(): Promise<Row[]> {
  const [profiles, courses, enrollments, modules, lessons, progress] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, organisation"),
    supabase.from("courses").select("id, title"),
    supabase.from("enrollments").select("user_id, course_id, status, enrolled_at, completed_at"),
    supabase.from("modules").select("id, course_id"),
    supabase.from("lessons").select("id, module_id"),
    supabase.from("lesson_progress").select("user_id, lesson_id"),
  ]);
  const pById = new Map((profiles.data ?? []).map((p) => [p.id, p]));
  const cById = new Map((courses.data ?? []).map((c) => [c.id, c.title]));
  const courseOfModule = new Map((modules.data ?? []).map((m) => [m.id, m.course_id]));
  const lessonsByCourse = new Map<string, string[]>();
  for (const l of lessons.data ?? []) {
    const cid = courseOfModule.get(l.module_id);
    if (cid) lessonsByCourse.set(cid, [...(lessonsByCourse.get(cid) ?? []), l.id]);
  }
  const done = new Map<string, Set<string>>();
  for (const p of progress.data ?? []) done.set(p.user_id, (done.get(p.user_id) ?? new Set()).add(p.lesson_id));
  return (enrollments.data ?? []).map((e) => {
    const p = pById.get(e.user_id);
    const ls = lessonsByCourse.get(e.course_id) ?? [];
    const n = ls.filter((id) => done.get(e.user_id)?.has(id)).length;
    return {
      Learner: p?.full_name ?? "", Email: p?.email ?? "", Organisation: p?.organisation ?? "", Course: cById.get(e.course_id) ?? "",
      Status: e.status, "Lessons completed": n, "Total lessons": ls.length, "Progress %": ls.length ? Math.round((n / ls.length) * 100) : 0,
      Enrolled: e.enrolled_at?.slice(0, 10), Completed: e.completed_at?.slice(0, 10) ?? "",
    };
  });
}

async function enrolments(): Promise<Row[]> {
  const [profiles, courses, enr] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name"),
    supabase.from("courses").select("id, title"),
    supabase.from("enrollments").select("user_id, course_id, status, enrolled_at, expires_at, stripe_subscription_id"),
  ]);
  const pById = new Map((profiles.data ?? []).map((p) => [p.id, p]));
  const cById = new Map((courses.data ?? []).map((c) => [c.id, c.title]));
  return (enr.data ?? []).map((e) => ({
    Learner: pById.get(e.user_id)?.full_name ?? "", Email: pById.get(e.user_id)?.email ?? "", Course: cById.get(e.course_id) ?? "",
    Status: e.status, Enrolled: e.enrolled_at?.slice(0, 10), Expires: e.expires_at?.slice(0, 10) ?? "Never", "Paid via Stripe": e.stripe_subscription_id ? "Yes" : "No",
  }));
}

async function quizResults(): Promise<Row[]> {
  const [profiles, quizzes, attempts] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name"),
    supabase.from("quizzes").select("id, title, pass_threshold"),
    supabase.from("quiz_attempts").select("user_id, quiz_id, score, passed, attempted_at").order("attempted_at", { ascending: false }),
  ]);
  const pById = new Map((profiles.data ?? []).map((p) => [p.id, p]));
  const qById = new Map((quizzes.data ?? []).map((q) => [q.id, q]));
  return (attempts.data ?? []).map((a) => ({
    Learner: pById.get(a.user_id)?.full_name ?? "", Email: pById.get(a.user_id)?.email ?? "", Quiz: qById.get(a.quiz_id)?.title ?? "",
    "Score %": a.score, "Pass mark %": qById.get(a.quiz_id)?.pass_threshold ?? "", Result: a.passed ? "Passed" : "Failed", Date: a.attempted_at?.slice(0, 16).replace("T", " "),
  }));
}

async function certificateAudit(): Promise<Row[]> {
  const { data } = await supabase.from("certificates").select("certificate_number, recipient_name, recipient_email, course_name, completion_date, cpd_hours, status, issued_at").order("issued_at", { ascending: false });
  return (data ?? []).map((c) => ({
    Number: c.certificate_number, Name: c.recipient_name, Email: c.recipient_email, Course: c.course_name, "Completion date": c.completion_date,
    "CPD hours": c.cpd_hours, Status: c.status, Issued: c.issued_at?.slice(0, 10),
  }));
}

const REPORTS = [
  { key: "progress", title: "Learner progress", desc: "Every enrolment with lessons completed and percentage done.", run: learnerProgress },
  { key: "enrol", title: "Enrolments & access", desc: "Who has access to what, when it started and when it expires.", run: enrolments },
  { key: "quiz", title: "Quiz results", desc: "Every quiz attempt with score, pass mark and outcome.", run: quizResults },
  { key: "certs", title: "Certificate audit", desc: "All issued certificates with numbers, CPD hours and status.", run: certificateAudit },
];

export function LmsAdminReports() {
  const [busy, setBusy] = useState<string | null>(null);

  const download = async (r: (typeof REPORTS)[number]) => {
    setBusy(r.key);
    try {
      const rows = await r.run();
      if (rows.length === 0) { toast.info("Nothing to export yet — this report has no rows."); return; }
      downloadCsv(`safetytech-${r.key}-${stamp()}.csv`, rows);
      toast.success(`${rows.length} rows exported`);
    } catch (e) {
      console.error(e);
      toast.error("Could not build this report");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ marginTop: 28, fontFamily: adminFont }}>
      <div style={panel}>
        <PanelHeader title="Reports" sub="Live data, exported as CSV for Excel or Google Sheets." />
        {REPORTS.map((r, i) => (
          <div key={r.key} style={{ padding: "22px 28px", borderBottom: i < REPORTS.length - 1 ? "1px solid #f1f4f8" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: "#69697b", marginTop: 4 }}>{r.desc}</div>
            </div>
            <button onClick={() => download(r)} disabled={busy !== null} style={{ ...primaryBtn, display: "flex", alignItems: "center", gap: 8, opacity: busy && busy !== r.key ? 0.5 : 1 }}>
              {busy === r.key ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Download CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
