import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { htmlToText, resendSend, sleep } from "../_shared/emailText.ts";

// Admin people management (service role, admin-only):
//   list                         -> sign-in info from auth (last sign-in, created)
//   import { rows, welcome }     -> create/update people (e.g. a Kajabi export)
//                                   and grant products; optionally email them
//   welcome { user_ids }         -> branded "set your password" email
// Access ticks (grant/remove a course or the Global Network) are done by the
// admin UI directly under RLS; only account creation and invites need this.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const SITE = "https://www.safetytech.academy";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface ImportRow { email: string; first_name?: string; last_name?: string; company?: string; products?: string[]; tags?: string[] }

const esc = (t: string) => String(t ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));

async function sendWelcome(to: string, name: string, link: string, courses: string[]): Promise<string | null> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "RESEND_API_KEY missing";
  const first = esc((name || "").split(" ")[0] || "there");
  const courseList = courses.length
    ? `<p style="margin:0 0 8px;">You have access to:</p><ul style="margin:0 0 16px;padding-left:20px;">${courses.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`
    : "";
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#202058;padding:26px 36px;text-align:center;"><p style="margin:0;color:#9eff1f;font-size:12px;letter-spacing:3px;text-transform:uppercase;">SafetyTech Academy</p></td></tr>
<tr><td style="padding:34px 40px 10px;color:#1e293b;font-size:15px;line-height:1.7;">
<h1 style="margin:0 0 14px;font-size:22px;color:#0b0b2c;">Welcome to SafetyTech Academy, ${first}</h1>
<p style="margin:0 0 14px;">Your SafetyTech Academy account is ready. It\u2019s where you\u2019ll find your courses, the learning community and your certificates. Just choose a password to get started.</p>
${courseList}
</td></tr>
<tr><td style="padding:8px 40px 26px;text-align:center;"><a href="${esc(link)}" style="display:inline-block;background:#3434ff;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">Set my password</a></td></tr>
<tr><td style="padding:0 40px 24px;color:#94a3b8;font-size:12px;line-height:1.6;">This link works once and stays valid for 24 hours. If it has stopped working, go to ${SITE}/learn/auth, choose “Forgot password?” and enter this email address to get a new one.</td></tr>
<tr><td style="padding:16px 36px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#94a3b8;font-size:11px;">Questions? Reply to this email or write to hello@safetytech.academy</p></td></tr>
</table></td></tr></table></body></html>`;
  const res = await resendSend(key, {
    from: "SafetyTech Academy <hello@safetytech.academy>",
    reply_to: "hello@safetytech.academy",
    to: [to],
    subject: "Welcome to SafetyTech Academy, set your password",
    html,
    text: htmlToText(html),
  });
  if (res.ok) return null;
  const body = await res.json().catch(() => ({}));
  return body?.message ?? `Email failed (${res.status})`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: me } = await db.auth.getUser(auth.replace("Bearer ", ""));
    if (!me?.user) return json({ error: "Unauthorized" }, 401);
    const { data: role } = await db.from("user_roles").select("role").eq("user_id", me.user.id).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({})) as { action?: string; rows?: ImportRow[]; welcome?: boolean; user_ids?: string[]; access_days?: number };

    // Product key -> title, for welcome emails.
    const productTitles = async (keys: string[]) => {
      const ids = keys.filter((k) => k.startsWith("course:")).map((k) => k.slice(7));
      const { data } = ids.length ? await db.from("courses").select("id, title").in("id", ids) : { data: [] };
      const titles = (data ?? []).map((c: { title: string }) => c.title);
      if (keys.includes("network")) titles.push("SafetyTech Global Network community");
      return titles;
    };

    const welcomeUser = async (userId: string, email: string, name: string) => {
      const { data: link, error } = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: `${SITE}/learn/reset-password?welcome=1` } });
      if (error || !link?.properties?.hashed_token) return error?.message ?? "Could not create link";
      // Link to our own domain (not supabase.co): trusted by mail filters, and the
      // one-time token is only used when the person presses the button there.
      const confirmLink = `${SITE}/learn/auth/confirm?token_hash=${encodeURIComponent(link.properties.hashed_token)}&type=recovery&next=${encodeURIComponent("/learn/reset-password?welcome=1")}`;
      const [{ data: enr }, { data: mem }] = await Promise.all([
        db.from("enrollments").select("course_id").eq("user_id", userId).eq("status", "active"),
        db.from("community_memberships").select("space").eq("user_id", userId).eq("status", "active"),
      ]);
      const keys = [...(enr ?? []).map((e) => `course:${e.course_id}`), ...((mem ?? []).length ? ["network"] : [])];
      const err = await sendWelcome(email, name, confirmLink, await productTitles(keys));
      await sleep(600); // stay under the email provider\u2019s rate limit
      if (!err) await db.from("profiles").update({ welcomed_at: new Date().toISOString() }).eq("id", userId);
      return err;
    };

    // ---------- list ----------
    if (body.action === "list") {
      const users: { id: string; last_sign_in_at: string | null; created_at: string }[] = [];
      for (let page = 1; page <= 20; page++) {
        const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        users.push(...data.users.map((u) => ({ id: u.id, last_sign_in_at: u.last_sign_in_at ?? null, created_at: u.created_at })));
        if (data.users.length < 1000) break;
      }
      return json({ users });
    }

    // ---------- import ----------
    if (body.action === "import") {
      const rows = (body.rows ?? []).slice(0, 200);
      const results: { email: string; status: "created" | "updated" | "error"; welcomed?: boolean; error?: string }[] = [];
      const { data: validCourses } = await db.from("courses").select("id");
      const courseIds = new Set((validCourses ?? []).map((c) => c.id));

      // New or re-activated course access lasts this many days (0/absent = lifetime).
      const days = Number.isFinite(body.access_days) && (body.access_days as number) > 0 ? Math.min(Math.floor(body.access_days as number), 3650) : 0;
      const accessEnds = days ? new Date(Date.now() + days * 86_400_000).toISOString() : null;

      for (const row of rows) {
        const email = String(row.email ?? "").trim().toLowerCase();
        if (!EMAIL_RE.test(email)) { results.push({ email, status: "error", error: "Invalid email" }); continue; }
        const fullName = [row.first_name, row.last_name].map((s) => String(s ?? "").trim()).filter(Boolean).join(" ");
        try {
          let { data: profile } = await db.from("profiles").select("id, full_name, organisation").ilike("email", email).maybeSingle();
          let status: "created" | "updated" = "updated";
          if (!profile) {
            // Confirmed account with no password yet; they set one via the welcome email or "Forgot password".
            const { data: created, error } = await db.auth.admin.createUser({ email, email_confirm: true, user_metadata: fullName ? { full_name: fullName } : {} });
            if (error || !created.user) throw new Error(error?.message ?? "Could not create account");
            profile = { id: created.user.id, full_name: fullName || null, organisation: null };
            status = "created";
          }
          const patch: Record<string, string> = {};
          if (fullName && !profile.full_name) patch.full_name = fullName;
          if (row.company?.trim() && !profile.organisation) patch.organisation = row.company.trim();
          if (Object.keys(patch).length) await db.from("profiles").update(patch).eq("id", profile.id);

          for (const key of row.products ?? []) {
            if (key === "network") {
              // Same access length as the courses, but never shorten a membership that already runs longer.
              const { data: mem } = await db.from("community_memberships").select("status, expires_at").eq("user_id", profile.id).eq("space", "global-network").maybeSingle();
              const runsLonger = mem?.status === "active" && (!mem.expires_at || (accessEnds !== null && new Date(mem.expires_at) > new Date(accessEnds)));
              if (!runsLonger) await db.from("community_memberships").upsert({ user_id: profile.id, space: "global-network", status: "active", source: "import", expires_at: accessEnds, granted_by: me.user.id });
            } else if (key.startsWith("course:") && courseIds.has(key.slice(7))) {
              const courseId = key.slice(7);
              const { data: existing } = await db.from("enrollments").select("status").eq("user_id", profile.id).eq("course_id", courseId).maybeSingle();
              if (!existing) await db.from("enrollments").insert({ user_id: profile.id, course_id: courseId, status: "active", expires_at: accessEnds });
              else if (existing.status !== "active") await db.from("enrollments").update({ status: "active", expires_at: accessEnds }).eq("user_id", profile.id).eq("course_id", courseId);
            }
          }

          const tags = [...new Set((row.tags ?? []).map((t) => String(t).trim().slice(0, 40)).filter(Boolean))];
          if (tags.length) await db.from("people_tags").upsert(tags.map((tag) => ({ user_id: profile!.id, tag })), { onConflict: "user_id,tag", ignoreDuplicates: true });

          let welcomed = false;
          if (body.welcome) {
            const err = await welcomeUser(profile.id, email, fullName || profile.full_name || "");
            welcomed = !err;
            if (err) { results.push({ email, status, welcomed, error: `Imported, but the welcome email failed: ${err}` }); continue; }
          }
          results.push({ email, status, welcomed });
        } catch (e) {
          results.push({ email, status: "error", error: (e as Error).message });
        }
      }
      return json({ results });
    }

    // ---------- welcome ----------
    if (body.action === "welcome") {
      const ids = (body.user_ids ?? []).slice(0, 100);
      const { data: people } = ids.length ? await db.from("profiles").select("id, email, full_name").in("id", ids) : { data: [] };
      const results: { id: string; email: string; ok: boolean; error?: string }[] = [];
      for (const p of people ?? []) {
        const err = await welcomeUser(p.id, p.email, p.full_name ?? "");
        results.push({ id: p.id, email: p.email, ok: !err, ...(err ? { error: err } : {}) });
      }
      return json({ results });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("admin-people error", e);
    return json({ error: (e as Error).message ?? "Internal error" }, 500);
  }
});
