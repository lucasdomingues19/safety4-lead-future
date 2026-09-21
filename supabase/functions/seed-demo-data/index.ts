import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Upsert demo course
    await supabase.from("courses").upsert({
      id: "demo-001",
      title: "AI Fundamentals in EHS",
      slug: "ai-fundamentals-ehs",
      description: "Master AI applications in workplace safety",
      status: "published",
    });

    // Modules
    await supabase.from("modules").upsert([
      { id: "mod-001", course_id: "demo-001", title: "AI Basics", order_num: 1, status: "published" },
      { id: "mod-002", course_id: "demo-001", title: "Machine Learning", order_num: 2, status: "published" },
      { id: "mod-003", course_id: "demo-001", title: "Practical Tools", order_num: 3, status: "published" },
    ]);

    // Lessons
    await supabase.from("lessons").upsert([
      { id: "les-001", module_id: "mod-001", title: "AI Fundamentals", content: "Content...", order_num: 1, status: "published" },
      { id: "les-002", module_id: "mod-001", title: "Safety Apps", content: "Content...", order_num: 2, status: "published" },
      { id: "les-003", module_id: "mod-002", title: "ML Basics", content: "Content...", order_num: 1, status: "published" },
      { id: "les-004", module_id: "mod-002", title: "Analytics", content: "Content...", order_num: 2, status: "published" },
      { id: "les-005", module_id: "mod-003", title: "Tools", content: "Content...", order_num: 1, status: "published" },
      { id: "les-006", module_id: "mod-003", title: "Implementation", content: "Content...", order_num: 2, status: "published" },
    ]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
