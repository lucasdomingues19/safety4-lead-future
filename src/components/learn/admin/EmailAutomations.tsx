import { useEffect, useState } from "react";
import { Bell, Eye, Lock, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/invoke";
import { PanelHeader, Spinner, panel } from "./adminUi";

type Channel = "email" | "in-app";
interface Automation { kind: string; name: string; trigger: string; channels: Channel[]; group: string; /** Always on: sent by the app itself, not the scheduler. */ fixed?: boolean }

/** The lifecycle automations run by the lifecycle-messages function (every 15 min). */
const AUTOMATIONS: Automation[] = [
  { group: "Onboarding", kind: "welcome_course", name: "Welcome to the course", trigger: "Within 3 days of enrolling, until they start the first lesson", channels: ["email"] },
  { group: "Onboarding", kind: "onboarding_day1", name: "Start your first lesson", trigger: "1–3 days after sign-up, if no lesson is completed yet", channels: ["email"] },
  { group: "Onboarding", kind: "onboarding_day3", name: "Meet the community", trigger: "3–6 days after sign-up", channels: ["email"] },
  { group: "Progress", kind: "quiz_passed", name: "Quiz passed", trigger: "The moment a learner first passes a module quiz (instant, in the bell)", channels: ["in-app"], fixed: true },
  { group: "Progress", kind: "module_complete", name: "Module complete", trigger: "When every lesson in a module is finished and its quiz is passed, with the score and what's next (within 15 minutes)", channels: ["email", "in-app"] },
  { group: "Progress", kind: "final_ready", name: "Ready for the final assessment", trigger: "All lessons finished, final assessment not yet passed", channels: ["email", "in-app"] },
  { group: "Progress", kind: "course_complete", name: "Course complete", trigger: "All lessons finished (courses without a final assessment)", channels: ["in-app"] },
  { group: "Re-engagement", kind: "nudge_7", name: "Pick up where you left off", trigger: "No learning activity for 7 days", channels: ["email", "in-app"] },
  { group: "Re-engagement", kind: "nudge_14", name: "Your next lesson is waiting", trigger: "No learning activity for 14 days", channels: ["email", "in-app"] },
  { group: "Re-engagement", kind: "nudge_30", name: "Your progress is saved", trigger: "No learning activity for 30 days", channels: ["email", "in-app"] },
  { group: "Re-engagement", kind: "nudge_60", name: "Still want to finish?", trigger: "No learning activity for 60 days", channels: ["email", "in-app"] },
  { group: "Re-engagement", kind: "nudge_90", name: "We've kept your place (last reminder)", trigger: "No learning activity for 90 days", channels: ["email", "in-app"] },
  { group: "Re-engagement", kind: "access_expiring", name: "Access ending soon", trigger: "Course access ends within 7 days and the course isn't finished", channels: ["email", "in-app"] },
  { group: "Live sessions", kind: "event_reminder", name: "Live session starting soon", trigger: "1 hour before a live session the learner registered for", channels: ["email", "in-app"] },
];

/** Account and payment messages that always send (not switchable). */
const ALWAYS_ON = [
  { name: "Confirm your email", trigger: "Sign-up" },
  { name: "Reset your password", trigger: "Password reset requested" },
  { name: "Sign-in link / invitation", trigger: "Magic link or admin invite" },
  { name: "Your account is ready", trigger: "Admin adds or imports a learner" },
  { name: "Your certificate", trigger: "Course passed (with the verified credential)" },
  { name: "Final assessment result", trigger: "Final assessment graded" },
  { name: "Live session confirmed", trigger: "Learner registers for a live session" },
  { name: "Payment receipt", trigger: "Course purchase (sent by Stripe)" },
];

interface Stat { sent30: number; failed30: number; last: string | null }

export function EmailAutomations() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [preview, setPreview] = useState<{ name: string; subject: string; html: string } | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
      const [{ data: autos }, { data: logs }] = await Promise.all([
        supabase.from("email_automations").select("kind, enabled"),
        supabase.from("email_log").select("kind, status, sent_at").gte("sent_at", since).limit(5000),
      ]);
      setEnabled(Object.fromEntries((autos ?? []).map((a) => [a.kind, a.enabled])));
      const s: Record<string, Stat> = {};
      for (const l of logs ?? []) {
        const st = (s[l.kind] ??= { sent30: 0, failed30: 0, last: null });
        if (l.status === "failed") st.failed30++; else st.sent30++;
        if (!st.last || l.sent_at > st.last) st.last = l.sent_at;
      }
      setStats(s);
      setLoading(false);
    })();
  }, []);

  const toggle = async (kind: string) => {
    const next = !(enabled[kind] ?? true);
    setEnabled((e) => ({ ...e, [kind]: next }));
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("email_automations").update({ enabled: next, updated_at: new Date().toISOString(), updated_by: user?.id ?? null }).eq("kind", kind);
    if (error) { setEnabled((e) => ({ ...e, [kind]: !next })); toast.error("Couldn't save that change"); return; }
    toast.success(next ? "Automation switched on" : "Automation switched off");
  };

  const openPreview = async (a: Automation) => {
    setPreviewing(a.kind);
    try {
      const out = await invokeFunction<{ subject: string; html: string }>("lifecycle-messages", { preview: a.kind });
      setPreview({ name: a.name, ...out });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't load the preview");
    } finally {
      setPreviewing(null);
    }
  };

  if (loading) return <Spinner />;
  const groups = [...new Set(AUTOMATIONS.map((a) => a.group))];
  const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 24 }}>
      <div style={panel}>
        <PanelHeader title="Automations" sub="Sent automatically, checked every 15 minutes. Each learner gets each message once. Reminders respect the learner's email preference and include an unsubscribe link." />
        {groups.map((g) => (
          <div key={g}>
            <div style={{ padding: "14px 28px 6px", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>{g}</div>
            {AUTOMATIONS.filter((a) => a.group === g).map((a) => {
              const on = a.fixed ? true : (enabled[a.kind] ?? true);
              const st = stats[a.kind];
              return (
                <div key={a.kind} style={{ padding: "14px 28px", borderTop: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", opacity: on ? 1 : 0.6 }}>
                  <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{a.name}</span>
                      {a.channels.map((c) => (
                        <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: c === "email" ? "#f5f7ff" : "#f4fbe4", color: c === "email" ? "#3434ff" : "#4a5230" }}>
                          {c === "email" ? <Mail size={11} /> : <Bell size={11} />} {c === "email" ? "Email" : "In-app"}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#69697b", marginTop: 3 }}>{a.trigger}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#69697b", minWidth: 120, fontVariantNumeric: "tabular-nums" }}>
                    {st ? <>{st.sent30} sent (30 days){st.failed30 ? <span style={{ color: "#c93636" }}> · {st.failed30} failed</span> : null}<br /><span style={{ color: "#94a3b8" }}>Last: {st.last ? fmt(st.last) : "—"}</span></> : <span style={{ color: "#94a3b8" }}>Nothing sent yet</span>}
                  </div>
                  {a.channels.includes("email") ? (
                    <button type="button" onClick={() => openPreview(a)} disabled={previewing === a.kind}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#0b0b2c" }}>
                      <Eye size={14} /> {previewing === a.kind ? "Loading…" : "Preview"}
                    </button>
                  ) : <span style={{ width: 92 }} />}
                  {a.fixed ? <span style={{ width: 46, flex: "none", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>Always on</span> : (
                  <button type="button" role="switch" aria-checked={on} aria-label={`${a.name}: ${on ? "on" : "off"}`} onClick={() => toggle(a.kind)}
                    style={{ position: "relative", width: 46, height: 26, flex: "none", border: 0, borderRadius: 999, background: on ? "#3434ff" : "#cbd5e1", cursor: "pointer" }}>
                    <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                  </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={panel}>
        <PanelHeader title="Always sent" sub="Account, payment and certificate messages. Learners need these, so they can't be switched off." />
        <div style={{ padding: "8px 28px 18px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: 10 }}>
          {ALWAYS_ON.map((m) => (
            <div key={m.name} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0" }}>
              <Lock size={14} color="#94a3b8" style={{ marginTop: 3, flex: "none" }} />
              <div><div style={{ fontSize: 13.5, fontWeight: 700 }}>{m.name}</div><div style={{ fontSize: 12, color: "#69697b" }}>{m.trigger}</div></div>
            </div>
          ))}
        </div>
      </div>

      {preview && (
        <div role="dialog" aria-label={`Preview: ${preview.name}`} onClick={() => setPreview(null)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(11,11,44,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(680px, 100%)", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 80px rgba(11,11,44,.3)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "#8ab815" }}>PREVIEW · {preview.name.toUpperCase()}</div>
                <div style={{ marginTop: 4, fontSize: 15, fontWeight: 700 }}>Subject: {preview.subject}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>From SafetyTech Academy &lt;hello@safetytech.academy&gt; · filled in with sample learner data</div>
              </div>
              <button type="button" onClick={() => setPreview(null)} aria-label="Close preview" style={{ border: 0, background: "none", cursor: "pointer", color: "#69697b" }}><X size={20} /></button>
            </div>
            <iframe title="Email preview" srcDoc={preview.html} sandbox="" style={{ border: 0, width: "100%", height: "70vh", background: "#f1f5f9" }} />
          </div>
        </div>
      )}
    </div>
  );
}
