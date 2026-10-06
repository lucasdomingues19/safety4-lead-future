// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { sleep } from "../_shared/emailText.ts";
import { SITE, sendTeamAccess, sendTeamWelcome } from "../_shared/welcome.ts";

// Company managers: add people to seats, remove them, resend invites, add co-managers.
// The caller must be a manager/owner of the organisation (or an admin). All seat rules
// (limits, "free the seat if unstarted") live in the database functions.

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...corsHeaders } });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_PEOPLE = 50;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Please sign in first" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
    const me = u?.user;
    if (!me) return json({ error: "Please sign in first" }, 401);

    const body = (await req.json().catch(() => ({}))) as any;
    const orgId = String(body.org_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(orgId)) return json({ error: "Missing company" }, 400);

    const { data: isMgr } = await db.rpc("is_org_manager", { _user: me.id, _org: orgId });
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: me.id, _role: "admin" });
    if (!isMgr && !isAdmin) return json({ error: "You don't manage this company" }, 403);

    const { data: org } = await db.from("organisations").select("id, name").eq("id", orgId).maybeSingle();
    if (!org) return json({ error: "Company not found" }, 404);

    // A confirm-page link on our own domain for first-time sign-in (same as the admin invite).
    const inviteLink = async (email: string): Promise<string | null> => {
      const { data: link } = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: `${SITE}/learn/reset-password?welcome=1` } });
      const th = link?.properties?.hashed_token;
      return th ? `${SITE}/learn/auth/confirm?token_hash=${encodeURIComponent(th)}&type=recovery&next=${encodeURIComponent("/learn/reset-password?welcome=1")}` : null;
    };
    const findOrCreate = async (email: string, fullName: string) => {
      let { data: p } = await db.from("profiles").select("id, full_name").ilike("email", email).maybeSingle();
      let created = false;
      if (!p) {
        const { data: c, error } = await db.auth.admin.createUser({ email, email_confirm: true, user_metadata: fullName ? { full_name: fullName } : {} });
        if (error || !c.user) throw new Error(error?.message ?? "Could not create the account");
        p = { id: c.user.id, full_name: fullName || null };
        created = true;
      }
      return { id: p.id as string, name: (p.full_name as string) || fullName, created };
    };

    // ---------- assign people to seats ----------
    if (body.action === "assign") {
      const courseId = String(body.course_id ?? "");
      const people = Array.isArray(body.people) ? body.people.slice(0, MAX_PEOPLE) : [];
      if (!people.length) return json({ error: "Add at least one email address" }, 400);
      const { data: course } = await db.from("courses").select("id, title, slug").eq("id", courseId).maybeSingle();
      if (!course) return json({ error: "Course not found" }, 404);

      const results: any[] = [];
      for (const row of people) {
        const email = String(row.email ?? "").trim().toLowerCase();
        const name = [row.first_name, row.last_name].map((s: any) => String(s ?? "").trim()).filter(Boolean).join(" ");
        if (!EMAIL_RE.test(email)) { results.push({ email, status: "invalid", message: "That doesn't look like an email address" }); continue; }
        try {
          const person = await findOrCreate(email, name);
          const { data: outcome, error } = await db.rpc("team_assign_seat", { _org: orgId, _course: courseId, _user: person.id });
          if (error) throw error;
          if (outcome === "no_seats") { results.push({ email, status: "no_seats", message: "No free seats left" }); continue; }
          if (outcome === "already_has_access") { results.push({ email, status: "already_has_access", message: "Already has access to this course" }); continue; }
          if (outcome === "already_assigned") { results.push({ email, status: "already_assigned", message: "Already has a seat" }); continue; }

          await db.from("profiles").update({ organisation: org.name }).eq("id", person.id).is("organisation", null);
          // New accounts get the set-password invite; existing people a short "access added" note.
          const { data: au } = await db.auth.admin.getUserById(person.id);
          const everSignedIn = !!au?.user?.last_sign_in_at;
          let err: string | null;
          if (!everSignedIn) {
            const link = await inviteLink(email);
            err = link ? await sendTeamWelcome({ to: email, name: person.name, link, course: course.title, org: org.name }) : "Could not create the sign-in link";
            if (!err) await db.from("profiles").update({ welcomed_at: new Date().toISOString() }).eq("id", person.id);
          } else {
            err = await sendTeamAccess({ to: email, name: person.name, course: course.title, org: org.name, url: `${SITE}/learn/${course.slug}` });
          }
          await sleep(600); // stay under the email provider's rate limit
          results.push({ email, status: "added", message: err ? `Added, but the email didn't send (${err}). Use Resend invite.` : "Added and invited" });
        } catch (e) {
          results.push({ email, status: "error", message: (e as Error).message });
        }
      }
      return json({ results });
    }

    // ---------- remove someone from a seat ----------
    if (body.action === "remove") {
      const { data: out, error } = await db.rpc("team_remove_seat", { _org: orgId, _course: String(body.course_id ?? ""), _user: String(body.user_id ?? "") });
      if (error) throw error;
      const message = out === "freed" ? "Removed. The seat is free to give to someone else."
        : out === "kept_used" ? "Access removed. They had already started, so the seat stays used."
        : "That person doesn't have a seat here.";
      return json({ outcome: out, message });
    }

    // ---------- resend the invite to someone who never signed in ----------
    if (body.action === "resend") {
      const userId = String(body.user_id ?? "");
      const { data: member } = await db.from("organisation_members").select("user_id").eq("organisation_id", orgId).eq("user_id", userId).maybeSingle();
      if (!member) return json({ error: "That person isn't on your team" }, 404);
      const { data: au } = await db.auth.admin.getUserById(userId);
      if (!au?.user?.email) return json({ error: "No email on file" }, 404);
      if (au.user.last_sign_in_at) return json({ error: "They've already signed in. They can use “Forgot password?” if they're stuck." }, 400);
      const { data: prof } = await db.from("profiles").select("full_name, welcomed_at").eq("id", userId).maybeSingle();
      if (prof?.welcomed_at && Date.now() - new Date(prof.welcomed_at).getTime() < 20 * 3600_000) return json({ error: "An invite went out less than a day ago. Please wait before sending another." }, 429);
      const { data: enr } = await db.from("enrollments").select("course_id").eq("user_id", userId).eq("organisation_id", orgId).limit(1).maybeSingle();
      const { data: course } = enr ? await db.from("courses").select("title").eq("id", enr.course_id).maybeSingle() : { data: null };
      const link = await inviteLink(au.user.email);
      if (!link) return json({ error: "Could not create the sign-in link" }, 500);
      const err = await sendTeamWelcome({ to: au.user.email, name: prof?.full_name ?? "", link, course: course?.title ?? "your course", org: org.name });
      if (err) return json({ error: `The email didn't send (${err})` }, 502);
      await db.from("profiles").update({ welcomed_at: new Date().toISOString() }).eq("id", userId);
      return json({ ok: true });
    }

    // ---------- add a co-manager (owners and admins only) ----------
    if (body.action === "add_manager") {
      const { data: mine } = await db.from("organisation_members").select("role").eq("organisation_id", orgId).eq("user_id", me.id).maybeSingle();
      if (mine?.role !== "owner" && !isAdmin) return json({ error: "Only the company owner can add managers" }, 403);
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return json({ error: "That doesn't look like an email address" }, 400);
      const person = await findOrCreate(email, "");
      await db.from("organisation_members").upsert({ organisation_id: orgId, user_id: person.id, role: "manager" }, { onConflict: "organisation_id,user_id" });
      return json({ ok: true, created: person.created });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("org-team:", e);
    return json({ error: e instanceof Error ? e.message : "Something went wrong" }, 500);
  }
});
