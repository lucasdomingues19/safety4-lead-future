import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AuthError, requireAdmin } from "../_shared/auth.ts";
import { htmlToText, resendSend, sleep } from "../_shared/emailText.ts";

// Emails members about an admin community post, only when the admin ticked the box.
//   { action: "send", post_id }  (admin, must be the post's author) queue recipients, send what the budget allows
//   { action: "drain" }          (cron, x-cron-secret) send queued recipients within the daily budget
//
// Who gets it: members who have signed in (so nobody is told about a post they can't open yet),
// who have not turned off reminder emails in Settings, and who have access to the post's space.
// Budget: shared with lifecycle, welcome and certificate emails (email_log), under Resend's 100/day.

const SITE = "https://www.safetytech.academy";
const DAILY_BUDGET = 90;
const RESERVE = 10;
const PER_RUN = 8;
const KIND = "community_post";
const TOPIC_LABEL: Record<string, string> = {
  general: "General", questions: "Questions", wins: "Wins", "ai-in-ehs": "AI in EHS", resources: "Resources",
};

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (t: string) => String(t ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));
function safeEqual(a: string, b: string) {
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function emailHtml(post: { author_name: string; body: string; topic: string; space: string }) {
  const network = post.space === "global-network";
  const place = network ? "SafetyTech Global Network" : "SafetyTech Academy community";
  const excerpt = post.body.length > 500 ? post.body.slice(0, 500).replace(/\s+\S*$/, "") + "…" : post.body;
  const paras = esc(excerpt).split(/\n{2,}/).map((p) => `<p style="margin:0 0 12px;">${p.replace(/\n/g, "<br>")}</p>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#202058;padding:26px 36px;text-align:center;"><p style="margin:0;color:#9eff1f;font-size:12px;letter-spacing:3px;text-transform:uppercase;">${esc(place)}</p></td></tr>
<tr><td style="padding:30px 40px 8px;color:#1e293b;font-size:15px;line-height:1.7;">
<p style="margin:0 0 6px;font-size:13px;color:#69697b;">${esc(post.author_name || "SafetyTech Academy")} posted in ${esc(TOPIC_LABEL[post.topic] ?? "General")}</p>
<div style="margin:0 0 6px;padding:16px 18px;background:#f7f8fc;border-left:4px solid #3434ff;border-radius:8px;">${paras}</div>
</td></tr>
<tr><td style="padding:14px 40px 28px;text-align:center;"><a href="${SITE}/learn?view=community" style="display:inline-block;background:#3434ff;color:#ffffff;padding:14px 30px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">Read and reply</a></td></tr>
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">You're getting this because you're a member. To stop community emails, turn off reminder emails in your <a href="${SITE}/learn?view=settings" style="color:#94a3b8;">settings</a>.<br>Questions? Reply to this email.</p></td></tr>
</table></td></tr></table></body></html>`;
}

async function sendOne(to: string, post: { author_name: string; body: string; topic: string; space: string }): Promise<string | null> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "RESEND_API_KEY missing";
  const html = emailHtml(post);
  const network = post.space === "global-network";
  const res = await resendSend(key, {
    from: "SafetyTech Academy <hello@safetytech.academy>",
    reply_to: "hello@safetytech.academy",
    to: [to],
    subject: `${post.author_name || "SafetyTech Academy"} posted in the ${network ? "Global Network" : "community"}`,
    html,
    text: htmlToText(html),
  });
  if (res.ok) return null;
  const b = await res.json().catch(() => ({}));
  return b?.message ?? `Email failed (${res.status})`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const body = (await req.json().catch(() => ({}))) as { action?: string; post_id?: string };
  const cron = safeEqual(req.headers.get("x-cron-secret") ?? "", Deno.env.get("LIFECYCLE_CRON_SECRET") ?? "");
  let caller: { id: string } | null = null;
  if (!cron) {
    try { caller = await requireAdmin(req); } catch (e) { return json({ error: (e as Error).message }, e instanceof AuthError ? e.status : 401); }
  }

  // ---- budget ----
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count: sent24 } = await db.from("email_log").select("id", { count: "exact", head: true }).gte("sent_at", since);
  let room = Math.max(0, DAILY_BUDGET - RESERVE - (sent24 ?? 0));

  // ---- queue recipients for one post ----
  if (body.action === "send") {
    if (!caller) return json({ error: "Admins only" }, 403);
    const { data: post } = await db.from("community_posts").select("id, user_id, space, body, author_name, topic, email_requested").eq("id", body.post_id ?? "").maybeSingle();
    if (!post) return json({ error: "Post not found" }, 404);
    if (post.user_id !== caller.id) return json({ error: "Only the post's author can email it" }, 403);

    // members who have signed in, have not opted out, and can see this space
    const { data: users } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const signedIn = (users?.users ?? []).filter((u) => u.email && u.last_sign_in_at && u.id !== caller!.id);
    const ids = signedIn.map((u) => u.id);
    const { data: profs } = ids.length ? await db.from("profiles").select("id, email_reminders").in("id", ids) : { data: [] as { id: string; email_reminders: boolean | null }[] };
    const optedOut = new Set((profs ?? []).filter((p) => p.email_reminders === false).map((p) => p.id));
    let eligible = signedIn.filter((u) => !optedOut.has(u.id));
    if (post.space === "global-network") {
      const { data: mems } = await db.from("community_memberships").select("user_id").eq("space", "global-network").eq("status", "active");
      const { data: admins } = await db.from("user_roles").select("user_id").eq("role", "admin");
      const allowed = new Set([...(mems ?? []).map((m) => m.user_id), ...(admins ?? []).map((a) => a.user_id)]);
      eligible = eligible.filter((u) => allowed.has(u.id));
    }
    const rows = eligible.map((u) => ({ post_id: post.id, user_id: u.id, email: u.email!.toLowerCase(), status: "queued" }));
    if (rows.length) await db.from("community_email_queue").upsert(rows, { onConflict: "post_id,user_id", ignoreDuplicates: true });
    await db.from("community_posts").update({ email_requested: true }).eq("id", post.id);
    const { count: queued } = await db.from("community_email_queue").select("post_id", { count: "exact", head: true }).eq("post_id", post.id).eq("status", "queued");
    const first = await drain(db, post.id, Math.min(PER_RUN, room));
    return json({ queued_total: rows.length, still_queued: queued ?? 0, sent_now: first.sent, failed_now: first.failed, note: "The rest go out automatically within the daily budget." });
  }

  // ---- drain (cron, or the author pressing send again) ----
  if (body.action === "drain") {
    if (!cron && !caller) return json({ error: "Admins only" }, 403);
    const res = await drain(db, null, Math.min(PER_RUN, room));
    return json(res);
  }

  return json({ error: "Unknown action" }, 400);
});

async function drain(db: any, postId: string | null, batch: number) {
  if (batch <= 0) return { sent: 0, failed: 0, skipped: "daily budget used" };
  let q = db.from("community_email_queue").select("post_id, user_id, email").eq("status", "queued").order("queued_at").limit(batch);
  if (postId) q = q.eq("post_id", postId);
  const { data: rows } = await q;
  const results = { sent: 0, failed: 0 };
  const postCache = new Map<string, any>();
  for (const r of rows ?? []) {
    if (!postCache.has(r.post_id)) {
      const { data: p } = await db.from("community_posts").select("author_name, body, topic, space").eq("id", r.post_id).maybeSingle();
      postCache.set(r.post_id, p);
    }
    const post = postCache.get(r.post_id);
    if (!post) { await db.from("community_email_queue").update({ status: "failed", error: "post removed" }).eq("post_id", r.post_id).eq("user_id", r.user_id); results.failed++; continue; }
    // claim: one email per person per post, ever
    const { error: claim } = await db.from("email_log").insert({ user_id: r.user_id, kind: KIND, dedupe_key: r.post_id, status: "sending" });
    if (claim) { await db.from("community_email_queue").update({ status: "sent", sent_at: new Date().toISOString() }).eq("post_id", r.post_id).eq("user_id", r.user_id); continue; }
    const err = await sendOne(r.email, post);
    if (err) {
      await db.from("email_log").update({ status: "failed", error: err.slice(0, 300) }).eq("user_id", r.user_id).eq("kind", KIND).eq("dedupe_key", r.post_id);
      await db.from("community_email_queue").update({ status: "failed", error: err.slice(0, 300) }).eq("post_id", r.post_id).eq("user_id", r.user_id);
      results.failed++;
      if (/rate|429|quota|limit/i.test(err)) break;
    } else {
      await db.from("email_log").update({ status: "sent" }).eq("user_id", r.user_id).eq("kind", KIND).eq("dedupe_key", r.post_id);
      await db.from("community_email_queue").update({ status: "sent", sent_at: new Date().toISOString() }).eq("post_id", r.post_id).eq("user_id", r.user_id);
      results.sent++;
    }
    await sleep(700);
  }
  return results;
}
