import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Identify the caller from their JWT.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const courseId = typeof body.course_id === "string" ? body.course_id : null;
    if (!courseId) {
      return new Response(JSON.stringify({ error: "course_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Verify the user is enrolled.
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (!enrollment) {
      return new Response(JSON.stringify({ error: "Not enrolled" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load course + all lessons for the course.
    const { data: course } = await admin
      .from("courses")
      .select("id, title, cpd_hours")
      .eq("id", courseId)
      .maybeSingle();

    const { data: modules } = await admin
      .from("modules")
      .select("id")
      .eq("course_id", courseId);
    const moduleIds = (modules ?? []).map((m) => m.id);

    const { data: lessons } = moduleIds.length
      ? await admin.from("lessons").select("id").in("module_id", moduleIds)
      : { data: [] as { id: string }[] };
    const lessonIds = (lessons ?? []).map((l) => l.id);

    if (lessonIds.length === 0) {
      return new Response(JSON.stringify({ completed: false, reason: "no lessons" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Count this user's completed lessons within the course.
    const { data: progress } = await admin
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);

    const completedCount = (progress ?? []).length;
    const allDone = completedCount >= lessonIds.length;

    if (!allDone) {
      return new Response(
        JSON.stringify({ completed: false, completedCount, total: lessonIds.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Already completed before? Don't re-issue a certificate.
    if (enrollment.completed_at) {
      return new Response(JSON.stringify({ completed: true, alreadyIssued: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark the enrolment complete.
    await admin
      .from("enrollments")
      .update({ completed_at: new Date().toISOString(), status: "completed" })
      .eq("id", enrollment.id);

    // Issue the certificate via the existing function (handles numbering + email).
    const recipientName =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.email ? user.email.split("@")[0] : "Graduate");

    let certificateNumber: string | null = null;
    try {
      const issueRes = await fetch(`${supabaseUrl}/functions/v1/issue-certificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify({
          recipientName,
          recipientEmail: user.email,
          courseName: course?.title ?? "Safety 4.0 Course",
          completionDate: new Date().toISOString().slice(0, 10),
          cpdHours: course?.cpd_hours ?? null,
        }),
      });
      const issueJson = await issueRes.json().catch(() => ({}));
      certificateNumber = issueJson?.certificate_number ?? issueJson?.certificateNumber ?? null;
    } catch (e) {
      console.error("certificate issue failed", e);
    }

    return new Response(
      JSON.stringify({ completed: true, certificateNumber }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("complete-course error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
