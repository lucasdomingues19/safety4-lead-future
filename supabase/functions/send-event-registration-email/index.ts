import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

// Event registration confirmation. Public (the registration form is public),
// so it trusts nothing from the caller except which event and which email:
// it only sends when that email registered for that event (via capture-lead)
// in the last 30 minutes, only once per registration, and builds every word
// and link of the email from the events table. Previously the caller chose
// the recipient, title, text and "Zoom link", making it an open relay.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors } });
const esc = (t: unknown) => String(t ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));
const safeUrl = (u: unknown) => { try { const x = new URL(String(u)); return x.protocol === "https:" ? x.toString() : null; } catch { return null; } };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { event_id, email } = await req.json() as { event_id?: string; email?: string };
    const addr = String(email ?? "").trim().toLowerCase();
    if (!event_id || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(addr)) return json({ success: false, error: "Invalid request" }, 400);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const since = new Date(Date.now() - 30 * 60_000).toISOString();
    const { data: lead } = await db.from("leads")
      .select("id, name, confirmation_sent_at")
      .eq("event_id", event_id).ilike("email", addr).gte("created_at", since)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!lead) return json({ success: false, error: "No recent registration found" }, 404);
    if (lead.confirmation_sent_at) return json({ success: true, already: true });

    const { data: ev } = await db.from("events").select("title, date, time, description, zoom_link, location").eq("id", event_id).maybeSingle();
    if (!ev) return json({ success: false, error: "Event not found" }, 404);

    // Claim the send first so parallel calls can't double-send.
    const { data: claimed } = await db.from("leads").update({ confirmation_sent_at: new Date().toISOString() }).eq("id", lead.id).is("confirmation_sent_at", null).select("id").maybeSingle();
    if (!claimed) return json({ success: true, already: true });

    const zoom = safeUrl(ev.zoom_link);
    const first = esc(String(lead.name ?? "").split(" ")[0] || "there");
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#3434ff;padding:30px 36px;text-align:center;color:#fff;"><h1 style="margin:0;font-size:24px;">You're registered!</h1><p style="margin:8px 0 0;opacity:.9;">${esc(ev.title)}</p></td></tr>
<tr><td style="padding:30px 36px;color:#1e293b;font-size:15px;line-height:1.7;">
<p style="margin:0 0 14px;">Hi ${first},</p>
<p style="margin:0 0 18px;">Thanks for registering — we're looking forward to seeing you.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fc;border-left:4px solid #3434ff;border-radius:6px;"><tr><td style="padding:18px 20px;font-size:14px;line-height:1.9;">
<strong>${esc(ev.title)}</strong><br>
Date: ${esc(ev.date)}<br>
Time: ${esc(ev.time)} (UTC)<br>
${ev.location ? `Where: ${esc(ev.location)}<br>` : ""}
</td></tr></table>
${ev.description ? `<p style="margin:18px 0 0;color:#475569;">${esc(ev.description)}</p>` : ""}
${zoom ? `<p style="margin:22px 0 0;text-align:center;"><a href="${esc(zoom)}" style="display:inline-block;background:#3434ff;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;">Join on Zoom</a></p>` : ""}
<p style="margin:26px 0 0;">See you there,<br><strong>SafetyTech Academy</strong></p>
</td></tr>
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:11px;">You received this because you registered for an event at safetytech.academy. Questions? Reply to this email.</td></tr>
</table></td></tr></table></body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SafetyTech Academy <hello@safetytech.academy>",
        reply_to: "hello@safetytech.academy",
        to: [addr],
        subject: `Confirmed: ${ev.title}`,
        html,
      }),
    });
    if (!res.ok) {
      await db.from("leads").update({ confirmation_sent_at: null }).eq("id", lead.id);
      throw new Error(`Email send failed (${res.status})`);
    }
    return json({ success: true, id: (await res.json()).id });
  } catch (error) {
    console.error("send-event-registration-email:", error);
    return json({ success: false, error: "Could not send the confirmation" }, 500);
  }
});
