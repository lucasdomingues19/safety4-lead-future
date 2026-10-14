import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle2, Info, RefreshCw, TriangleAlert, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/invoke";
import { PanelHeader, Spinner, ghostBtn, panel } from "./adminUi";

// One page that says whether the platform is healthy. Two sources, both admin-only and read-only:
//   admin_health_snapshot()  database numbers: scheduled jobs, email, errors, learners, payments
//   admin-health function    the outside world: website, edge functions, Stripe, Resend, secrets set

type Level = "ok" | "warn" | "bad" | "info";
interface Row { label: string; value?: string; level: Level; detail?: string }
interface Section { title: string; rows: Row[] }
// deno-lint-ignore no-explicit-any
type Json = any;

const TONE: Record<Level, { fg: string; bg: string; border: string; label: string }> = {
  ok: { fg: "#3f6212", bg: "#f4fbe4", border: "#d9f09a", label: "OK" },
  warn: { fg: "#b45309", bg: "#fff7e6", border: "#fed7aa", label: "Check" },
  bad: { fg: "#b91c1c", bg: "#fef2f2", border: "#fecaca", label: "Problem" },
  info: { fg: "#3434ff", bg: "#f1f4ff", border: "#dfe3ff", label: "Info" },
};
const RANK: Record<Level, number> = { ok: 0, info: 0, warn: 1, bad: 2 };
const worst = (rows: Row[]): Level => rows.reduce<Level>((w, r) => (RANK[r.level] > RANK[w] ? r.level : w), "ok");

const ago = (iso?: string | null) => {
  if (!iso) return "never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
};
const mb = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(2)} GB` : `${Math.round(b / 1e6)} MB`);
const n = (v: unknown) => Number(v ?? 0);

function build(snap: Json | null, ext: Json | null, snapError: string | null, extError: string | null): Section[] {
  const sections: Section[] = [];

  // ---- website and app ----
  const site: Row[] = [];
  if (ext) {
    for (const p of ext.site as Json[]) {
      const ok = p.status >= 200 && p.status < 400;
      site.push({ label: p.path === "/" ? "Home page" : p.path, value: ok ? `${p.ms} ms` : (p.error ?? `HTTP ${p.status}`), level: !ok ? "bad" : p.ms > 2500 ? "warn" : "ok", detail: ok && p.ms > 2500 ? "Slower than usual" : undefined });
    }
    const fns = ext.functions as Json[];
    const down = fns.filter((f) => f.status === 0 || f.status === 404 || f.status >= 500);
    site.push({ label: "Back-end functions", value: `${fns.length - down.length} of ${fns.length} answering`, level: down.length ? "bad" : "ok", detail: down.length ? `Not answering: ${down.map((f) => f.name).join(", ")}` : undefined });
  } else {
    site.push({ label: "Website and functions", value: "Couldn't check", level: "bad", detail: extError ?? undefined });
  }
  sections.push({ title: "Website and app", rows: site });

  // ---- scheduled jobs ----
  const jobs: Row[] = [];
  if (snap) {
    const hour = new Date().getUTCHours();
    for (const j of snap.cron as Json[]) {
      const mins = j.last_run_at ? (Date.now() - new Date(j.last_run_at).getTime()) / 60000 : Infinity;
      const inWindow = !j.window_utc || (hour >= 8 && hour < 17);
      const stale = j.max_gap_minutes != null && inWindow && mins > j.max_gap_minutes;
      const failed = j.last_status === "failed";
      jobs.push({
        label: j.name, value: j.last_run_at ? `ran ${ago(j.last_run_at)}` : "never ran",
        level: !j.active || failed || stale ? "bad" : "ok",
        detail: !j.active ? "Switched off" : failed ? `Last run failed: ${j.last_message}` : stale ? "Hasn't run when it should have" : j.window_utc ? `Runs ${j.window_utc} UTC` : undefined,
      });
    }
    jobs.push({ label: "What “ran” means", level: "info", detail: "A run shows the job fired on time, not that it did its work. The email and error checks show whether it did." });
  } else jobs.push({ label: "Scheduled jobs", value: "Couldn't check", level: "bad", detail: snapError ?? undefined });
  sections.push({ title: "Scheduled jobs", rows: jobs });

  // ---- email ----
  const email: Row[] = [];
  if (snap) {
    const e = snap.email;
    email.push({ label: "Sent in the last 24 hours", value: `${n(e.sent_24h)} of 90`, level: n(e.sent_24h) >= 80 ? "warn" : "ok", detail: n(e.sent_24h) >= 80 ? "Close to the daily sending limit" : `Last sent ${ago(e.last_sent_at)}` });
    email.push({ label: "Failed in the last 48 hours", value: String(n(e.failed_48h)), level: n(e.failed_48h) >= 5 ? "bad" : n(e.failed_48h) > 0 ? "warn" : "ok", detail: n(e.failed_48h) > 0 && e.recent_failures?.[0] ? `${e.recent_failures[0].kind}: ${e.recent_failures[0].error}` : undefined });
    email.push({ label: "Stuck mid-send", value: String(n(e.stuck_sending)), level: n(e.stuck_sending) > 0 ? "warn" : "ok", detail: n(e.stuck_sending) > 0 ? "Started but never finished; these emails may not have gone out" : undefined });
    if ((e.automations_off as string[]).length) email.push({ label: "Automations switched off", value: String((e.automations_off as string[]).length), level: "info", detail: (e.automations_off as string[]).join(", ") });
  }
  if (ext) {
    const r = ext.resend;
    if (!r.configured) email.push({ label: "Email provider (Resend)", value: "Not set up", level: "bad" });
    else if (r.error) email.push({ label: "Email provider (Resend)", value: "Couldn't reach", level: "warn", detail: r.error });
    else {
      const bad = (r.domains as Json[]).filter((d) => d.status !== "verified");
      email.push({ label: "Sending domains verified", value: `${(r.domains as Json[]).length - bad.length} of ${(r.domains as Json[]).length}`, level: bad.length || !(r.domains as Json[]).length ? "bad" : "ok", detail: bad.length ? `Not verified: ${bad.map((d) => d.name).join(", ")}` : (r.domains as Json[]).map((d) => d.name).join(", ") });
    }
  }
  if (!snap && !ext) email.push({ label: "Email", value: "Couldn't check", level: "bad" });
  sections.push({ title: "Email", rows: email });

  // ---- payments ----
  const pay: Row[] = [];
  if (ext) {
    const s = ext.stripe;
    if (!s.configured) pay.push({ label: "Stripe", value: "Not set up", level: "bad" });
    else if (s.error) pay.push({ label: "Stripe", value: "Couldn't reach", level: "warn", detail: s.error });
    else {
      const live = (s.webhooks as Json[]).filter((w) => w.status === "enabled");
      const good = live.some((w) => w.has_checkout_completed && w.has_refunds);
      pay.push({ label: "Stripe mode", value: s.mode === "live" ? "Live" : "Test", level: s.mode === "live" ? "ok" : "warn", detail: s.mode === "live" ? undefined : "Real payments will not be taken" });
      pay.push({ label: "Payment webhook", value: live.length ? `${live.length} enabled` : "None enabled", level: !live.length ? "bad" : good ? "ok" : "warn", detail: !live.length ? "Paid courses would not unlock" : good ? live.map((w) => w.host).join(", ") : "Missing the payment or refund event" });
    }
  }
  if (snap) {
    const p = snap.payments;
    pay.push({ label: "Last payment", value: ago(p.last_purchase_at), level: "info", detail: `${n(p.paid_30d)} paid and ${n(p.refunded_30d)} refunded in 30 days` });
  }
  if (!pay.length) pay.push({ label: "Payments", value: "Couldn't check", level: "bad" });
  sections.push({ title: "Payments", rows: pay });

  // ---- errors ----
  const errs: Row[] = [];
  if (snap) {
    const e = snap.errors;
    errs.push({ label: "Screen errors, last 24 hours", value: String(n(e.last_24h)), level: n(e.last_24h) > 5 ? "bad" : n(e.last_24h) > 0 ? "warn" : "ok", detail: n(e.last_24h) > 0 && e.recent?.[0] ? `${e.recent[0].screen || "unknown screen"}: ${e.recent[0].message}` : `${n(e.last_7d)} in the last 7 days` });
  } else errs.push({ label: "Errors", value: "Couldn't check", level: "bad" });
  sections.push({ title: "Errors learners hit", rows: errs });

  // ---- learners and migration ----
  const learn: Row[] = [];
  if (snap) {
    const l = snap.learning, m = snap.migration;
    learn.push({ label: "Active in 24 hours / 7 days", value: `${n(l.active_24h)} / ${n(l.active_7d)}`, level: "info", detail: `${n(l.accounts)} accounts, ${n(l.new_accounts_24h)} new today` });
    learn.push({ label: "Lessons completed, 24 hours", value: String(n(l.lessons_done_24h)), level: "info", detail: `${n(l.quiz_attempts_24h)} quiz attempts` });
    learn.push({ label: "Certificates, 7 days", value: String(n(l.certificates_7d)), level: "info", detail: `Last issued ${ago(l.last_certificate_at)}` });
    learn.push({ label: "Active course enrolments", value: String(n(l.active_enrolments)), level: "info", detail: n(l.expiring_7d) ? `${n(l.expiring_7d)} end within 7 days` : undefined });
    learn.push({ label: "Kajabi learners who have signed in", value: `${n(m.course_learners_signed_in)} of ${n(m.course_learners)}`, level: n(m.course_learners) && n(m.course_learners_signed_in) / n(m.course_learners) < 0.5 ? "warn" : "ok", detail: `Everyone migrated: ${n(m.signed_in)} of ${n(m.queued)}. Reminders sent: ${n(m.reminders_sent)}${n(m.reminders_failed) ? `, ${n(m.reminders_failed)} failed` : ""}` });
    if (n(m.failed) > 0) learn.push({ label: "Welcome emails failed", value: String(n(m.failed)), level: "warn" });
    const c = snap.content;
    if (c) learn.push({ label: "Video lessons with a transcript", value: `${n(c.lessons_with_media) - n(c.missing_transcript)} of ${n(c.lessons_with_media)}`, level: n(c.missing_transcript) ? "warn" : "ok", detail: n(c.missing_transcript) ? `${n(c.missing_transcript)} lesson${n(c.missing_transcript) === 1 ? "" : "s"} without one. Mia and search can't use them` : n(c.missing_captions) ? `${n(c.missing_captions)} without captions` : "Captions are in place too" });
    if (n(l.mia_handoffs_7d) > 0) learn.push({ label: "Mia asked for a person, 7 days", value: String(n(l.mia_handoffs_7d)), level: "info" });
  } else learn.push({ label: "Learners", value: "Couldn't check", level: "bad" });
  sections.push({ title: "Learners and migration", rows: learn });

  // ---- database and security ----
  const db: Row[] = [];
  if (snap) {
    const d = snap.database;
    db.push({ label: "Database size", value: mb(n(d.size_bytes)), level: n(d.size_bytes) > 6e9 ? "warn" : "ok", detail: "Pro plan includes 8 GB before extra charges" });
    db.push({ label: "Connections in use", value: `${n(d.connections)} of ${n(d.max_connections)}`, level: n(d.connections) > n(d.max_connections) * 0.7 ? "warn" : "ok" });
    const noRls = d.tables_without_rls as string[];
    db.push({ label: "Tables open to everyone (no row security)", value: String(noRls.length), level: noRls.length ? "bad" : "ok", detail: noRls.length ? noRls.slice(0, 8).join(", ") : undefined });
    db.push({ label: "Accounts missing a profile", value: String(n(d.accounts_without_profile)), level: n(d.accounts_without_profile) ? "warn" : "ok" });
  } else db.push({ label: "Database", value: "Couldn't check", level: "bad" });
  db.push({ label: "Backups", value: "Daily, by Supabase", level: "info", detail: "Kept 7 days. Not visible from here: check Supabase → Database → Backups." });
  sections.push({ title: "Database and security", rows: db });

  // ---- integrations ----
  if (ext) {
    const secrets = ext.secrets as Json[];
    const missing = secrets.filter((s) => !s.set);
    const crit = missing.filter((s) => s.critical);
    const el = ext.elevenlabs as Json | undefined;
    const voice: Row[] = [];
    if (el) {
      if (!el.configured) voice.push({ label: "Transcripts and tour voice (ElevenLabs)", value: "Not set up", level: "warn", detail: "New videos can't be transcribed automatically" });
      else if (el.error) voice.push({ label: "Transcripts and tour voice (ElevenLabs)", value: "Couldn't reach", level: "warn", detail: el.error });
      else if (el.limit) {
        const pct = n(el.used) / n(el.limit);
        const inactive = el.status && !["active", "trialing"].includes(String(el.status));
        voice.push({ label: "Transcripts and tour voice (ElevenLabs)", value: `${Math.round(pct * 100)}% of credits used`, level: inactive || pct >= 0.95 ? "bad" : pct >= 0.8 ? "warn" : "ok", detail: `${n(el.used).toLocaleString("en-GB")} of ${n(el.limit).toLocaleString("en-GB")}${el.tier ? `, ${el.tier} plan` : ""}${el.resets_at ? `. Resets ${new Date(el.resets_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}${inactive ? `. Plan status: ${el.status}` : ""}` });
      } else voice.push({ label: "Transcripts and tour voice (ElevenLabs)", value: "Key set", level: "ok", detail: el.note ?? undefined });
    }
    sections.push({
      title: "Connections and keys",
      rows: [...voice, {
        label: "Keys and secrets set", value: `${secrets.length - missing.length} of ${secrets.length}`,
        level: crit.length ? "bad" : missing.length ? "warn" : "ok",
        detail: missing.length ? `Missing: ${missing.map((s) => `${s.name} (${s.used})`).join(", ")}` : "Only names are checked; no value is ever shown",
      }],
    });
  }
  return sections;
}

export default function LmsAdminHealth() {
  const [snap, setSnap] = useState<Json | null>(null);
  const [ext, setExt] = useState<Json | null>(null);
  const [snapError, setSnapError] = useState<string | null>(null);
  const [extError, setExtError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [a, b] = await Promise.allSettled([
      (async () => { const { data, error } = await supabase.rpc("admin_health_snapshot" as never); if (error) throw new Error(error.message); return data as Json; })(),
      invokeFunction<Json>("admin-health", {}),
    ]);
    if (a.status === "fulfilled") { setSnap(a.value); setSnapError(null); } else { setSnap(null); setSnapError(a.reason instanceof Error ? a.reason.message : "failed"); }
    if (b.status === "fulfilled") { setExt(b.value); setExtError(null); } else { setExt(null); setExtError(b.reason instanceof Error ? b.reason.message : "failed"); }
    setCheckedAt(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => { if (document.visibilityState === "visible") load(); }, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const sections = useMemo(() => build(snap, ext, snapError, extError), [snap, ext, snapError, extError]);
  if (loading) return <Spinner />;

  const all = sections.flatMap((s) => s.rows);
  const bad = all.filter((r) => r.level === "bad");
  const warn = all.filter((r) => r.level === "warn");
  const overall: Level = bad.length ? "bad" : warn.length ? "warn" : "ok";
  const headline = overall === "ok" ? "Everything is healthy" : overall === "warn" ? "Working, with things to check" : "Something needs fixing";
  const Icon = overall === "ok" ? CheckCircle2 : overall === "warn" ? TriangleAlert : XCircle;
  const t = TONE[overall];

  return (
    <div style={{ display: "grid", gap: 20, marginTop: 24 }}>
      <div style={{ ...panel, background: t.bg, border: `1px solid ${t.border}` }}>
        <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Icon size={34} color={t.fg} aria-hidden />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.fg }}>{headline}</div>
            <div style={{ fontSize: 13, color: "#69697b", marginTop: 4 }}>
              {bad.length} problem{bad.length === 1 ? "" : "s"}, {warn.length} to check. Checked {checkedAt ? checkedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}; refreshes every minute.
            </div>
          </div>
          <button type="button" onClick={load} disabled={refreshing} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 8, cursor: refreshing ? "wait" : "pointer" }}>
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Check now
          </button>
        </div>
        {(bad.length > 0 || warn.length > 0) && (
          <ul style={{ margin: 0, padding: "0 28px 20px 52px", fontSize: 13.5, color: "#0b0b2c", lineHeight: 1.7 }}>
            {[...bad, ...warn].slice(0, 8).map((r, i) => (
              <li key={i}><strong>{r.label}</strong>{r.value ? `: ${r.value}` : ""}{r.detail ? `. ${r.detail}` : ""}</li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))", alignItems: "start" }}>
        {sections.map((s) => {
          const w = worst(s.rows);
          return (
            <div key={s.title} style={panel}>
              <PanelHeader title={s.title} right={<Pill level={w === "ok" || w === "info" ? "ok" : w} text={w === "ok" || w === "info" ? "All good" : TONE[w].label} />} />
              <div>
                {s.rows.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "13px 28px", borderTop: i ? "1px solid #f1f4f8" : undefined }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0b0b2c", overflowWrap: "anywhere" }}>{r.label}</div>
                      {r.detail && <div style={{ fontSize: 12, color: "#69697b", marginTop: 3, lineHeight: 1.5, overflowWrap: "anywhere" }}>{r.detail}</div>}
                    </div>
                    <div style={{ textAlign: "right", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                      {r.value && <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0b0b2c" }}>{r.value}</div>}
                      <Pill level={r.level} text={TONE[r.level].label} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#69697b", display: "flex", gap: 6, alignItems: "center" }}><Info size={13} aria-hidden /> Read-only. Nothing here changes anything, and no customer details or secret values are shown.</p>
    </div>
  );
}

function Pill({ level, text }: { level: Level; text: string }) {
  const t = TONE[level];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 800, color: t.fg, background: t.bg, border: `1px solid ${t.border}` }}>{level === "ok" || level === "info" ? <Activity size={10} aria-hidden /> : <TriangleAlert size={10} aria-hidden />}{text}</span>;
}
