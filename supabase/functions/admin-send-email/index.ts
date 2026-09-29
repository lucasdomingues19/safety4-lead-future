import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

// Admin-only: send an announcement to all learners, or to everyone actively
// enrolled in one course. Recipients are resolved server-side; every send is
// recorded in email_campaigns.

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });
const esc = (t: string) => t.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await db.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!u?.user) return json({ error: "Unauthorized" }, 401);
    const { data: role } = await db.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Admin privileges required" }, 403);

    const { subject, body, audience, testOnly } = (await req.json()) as { subject?: string; body?: string; audience?: string; testOnly?: boolean };
    const cleanSubject = (subject ?? "").trim();
    const cleanBody = (body ?? "").trim();
    if (cleanSubject.length < 3 || cleanSubject.length > 150) return json({ error: "Subject must be 3-150 characters" }, 400);
    if (cleanBody.length < 5 || cleanBody.length > 10000) return json({ error: "Message must be 5-10,000 characters" }, 400);

    // Resolve recipients
    let emails: string[] = [];
    let audienceLabel = "All learners";
    if (testOnly) {
      emails = [u.user.email!];
      audienceLabel = "Test (sent to you only)";
    } else if (!audience || audience === "all") {
      const { data } = await db.from("profiles").select("email");
      emails = (data ?? []).map((p) => p.email);
    } else {
      const { data: course } = await db.from("courses").select("title").eq("id", audience).maybeSingle();
      if (!course) return json({ error: "Course not found" }, 404);
      audienceLabel = `Enrolled in: ${course.title}`;
      const { data: enr } = await db.from("enrollments").select("user_id").eq("course_id", audience).eq("status", "active");
      const ids = (enr ?? []).map((e) => e.user_id);
      if (ids.length) {
        const { data } = await db.from("profiles").select("email").in("id", ids);
        emails = (data ?? []).map((p) => p.email);
      }
    }
    emails = [...new Set(emails.filter(Boolean).map((e) => e.toLowerCase()))];
    if (emails.length === 0) return json({ error: "No recipients for this audience" }, 400);

    const paragraphs = cleanBody.split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px;">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#11113a;padding:26px 36px;text-align:center;"><p style="margin:0;color:#c1ff72;font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p></td></tr>
<tr><td style="padding:32px 40px 16px;color:#1e293b;font-size:15px;line-height:1.7;">${paragraphs}</td></tr>
<tr><td style="padding:8px 40px 28px;text-align:center;"><a href="https://www.safetytech.academy/learn" style="display:inline-block;background:#3434ff;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Open your learning hub</a></td></tr>
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#94a3b8;font-size:11px;">You're receiving this because you have an account at SafetyTech Academy. Questions? Reply to this email.</p></td></tr>
</table></td></tr></table></body></html>`;

    let sent = 0;
    let failed = 0;
    for (let i = 0; i < emails.length; i += 100) {
      const chunk = emails.slice(i, i + 100);
      const res = await resend.batch.send(
        chunk.map((to) => ({
          from: "SafetyTech Academy <noreply@safetyacademy.tech>",
          reply_to: "hello@safetyacademy.tech",
          to: [to],
          subject: cleanSubject,
          html,
        })),
      );
      if (res.error) failed += chunk.length;
      else sent += chunk.length;
    }

    if (!testOnly) {
      await db.from("email_campaigns").insert({
        sent_by: u.user.id,
        subject: cleanSubject,
        body: cleanBody,
        audience: audienceLabel,
        recipient_count: sent,
        failed_count: failed,
      });
    }

    return json({ sent, failed, audience: audienceLabel });
  } catch (e) {
    console.error(e);
    return json({ error: "Unexpected error" }, 500);
  }
});
