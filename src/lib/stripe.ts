import { supabase } from "@/integrations/supabase/client";

/** Whether the user holds an active, unexpired enrolment in the course. */
export async function verifyEnrollmentAccess(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select("status, expires_at")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return false;
      }
      throw error;
    }

    if (!data) return false;

    // Check if enrollment is active
    if (data.status !== "active") return false;

    // Check if enrollment has expired
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error("Failed to verify enrollment:", err);
    throw err;
  }
}
