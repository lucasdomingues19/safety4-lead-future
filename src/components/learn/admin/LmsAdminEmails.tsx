import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { invokeFunction } from "@/lib/invoke";
import { PanelHeader, Spinner, adminFont, ghostBtn, input, panel, primaryBtn } from "./adminUi";

interface Campaign { id: string; subject: string; audience: string; recipient_count: number; failed_count: number; sent_at: string }
interface CourseOpt { id: string; title: string }

export function LmsAdminEmails() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [courses, setCourses] = useState<CourseOpt[]>([]);
  const [audience, setAudience] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<"test" | "send" | null>(null);

  const load = async () => {
    const [c, k] = await Promise.all([
      supabase.from("email_campaigns").select("id, subject, audience, recipient_count, failed_count, sent_at").order("sent_at", { ascending: false }).limit(25),
      supabase.from("courses").select("id, title").order("title"),
    ]);
    setCampaigns((c.data ?? []) as Campaign[]);
    setCourses((k.data ?? []) as CourseOpt[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const send = async (testOnly: boolean) => {
    if (subject.trim().length < 3 || body.trim().length < 5) { toast.error("Add a subject and a message first"); return; }
    if (!testOnly && !confirm(`Send this to ${audience === "all" ? "ALL learners" : audience === "global-network" ? "all Global Network members" : "everyone enrolled in this course"}? This can't be undone.`)) return;
    setBusy(testOnly ? "test" : "send");
    let data: { sent: number; failed: number };
    try {
      data = await invokeFunction("admin-send-email", { subject, body, audience, testOnly });
    } catch (e) {
      setBusy(null);
      toast.error(e instanceof Error ? e.message : "Could not send");
      return;
    }
    setBusy(null);
    toast.success(testOnly ? "Test email sent to you" : `Sent to ${data.sent} learner${data.sent === 1 ? "" : "s"}${data.failed ? ` (${data.failed} failed)` : ""}`);
    if (!testOnly) { setSubject(""); setBody(""); load(); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ marginTop: 28, fontFamily: adminFont, display: "grid", gap: 24 }}>
      <div style={panel}>
        <PanelHeader title="Send an announcement" sub="Sent from hello@safetytech.academy (replies come to that inbox) with a link back to the learning hub." />
        <div style={{ padding: 28, display: "grid", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#69697b", marginBottom: 8 }}>Audience</div>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} style={input}>
              <option value="all">All learners</option>
              <option value="global-network">SafetyTech Global Network members</option>
              {courses.map((c) => <option key={c.id} value={c.id}>Enrolled in: {c.title}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#69697b", marginBottom: 8 }}>Subject</div>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} placeholder="e.g. New module released" style={input} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#69697b", marginBottom: 8 }}>Message</div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} maxLength={10000} placeholder="Write your message. Blank lines start a new paragraph." style={{ ...input, resize: "vertical", lineHeight: 1.6 }} />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => send(true)} disabled={!!busy} style={{ ...ghostBtn, opacity: busy ? 0.6 : 1 }}>{busy === "test" ? "Sending test..." : "Send test to me"}</button>
            <button onClick={() => send(false)} disabled={!!busy} style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}>{busy === "send" ? "Sending..." : "Send to audience"}</button>
          </div>
        </div>
      </div>

      <div style={panel}>
        <PanelHeader title="Sent announcements" />
        {campaigns.length === 0 && <div style={{ padding: 28, fontSize: 13, color: "#94a3b8" }}>Nothing sent yet.</div>}
        {campaigns.map((c, i) => (
          <div key={c.id} style={{ padding: "16px 28px", borderBottom: i < campaigns.length - 1 ? "1px solid #f1f4f8" : "none", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{c.subject}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{c.audience} · {new Date(c.sent_at).toLocaleString()}</div>
            </div>
            <div style={{ fontSize: 13, color: "#69697b", textAlign: "right" }}>{c.recipient_count} delivered{c.failed_count ? <span style={{ color: "#c93636" }}> · {c.failed_count} failed</span> : null}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
