import { supabase } from "@/integrations/supabase/client";

export async function seedDemoData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    console.log("Seeding demo data for user:", user.id);

    // Create enrollments for demo courses
    const courseIds = ["demo-course-1", "demo-course-2"];

    for (const courseId of courseIds) {
      const { error } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: "active",
          enrolled_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error && !error.message.includes("duplicate")) {
        console.error("Error creating enrollment:", error);
      } else {
        console.log("✓ Enrolled in course:", courseId);
      }
    }

    console.log("✓ Demo data seeding complete!");
    return true;
  } catch (err) {
    console.error("Error seeding demo data:", err);
    return false;
  }
}
