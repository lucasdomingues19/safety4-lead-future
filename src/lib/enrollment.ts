import { supabase } from "@/integrations/supabase/client";
import type { Enrollment, Course } from "@/lib/lms";

/**
 * Check if user is enrolled in a course
 */
export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("Error checking enrollment:", error);
    return false;
  }

  return !!data;
}

/**
 * Get user's enrollments
 */
export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  if (error) {
    console.error("Error fetching enrollments:", error);
    return [];
  }

  return (data || []) as Enrollment[];
}

/**
 * Get enrolled courses for user
 */
export async function getUserEnrolledCourses(userId: string): Promise<(Course & { enrolled_at: string })[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("enrolled_at, courses(*)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  if (error) {
    console.error("Error fetching enrolled courses:", error);
    return [];
  }

  return (data || []).map((e: any) => ({
    ...(e.courses as Course),
    enrolled_at: e.enrolled_at,
  }));
}

/**
 * Enroll user in a FREE course
 */
export async function enrollInFreeCourse(userId: string, courseId: string): Promise<Enrollment | null> {
  // Check if already enrolled
  const enrolled = await isUserEnrolled(userId, courseId);
  if (enrolled) {
    return null;
  }

  const { data, error } = await supabase
    .from("enrollments")
    .insert([
      {
        user_id: userId,
        course_id: courseId,
        status: "active",
        enrolled_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error enrolling in course:", error);
    throw error;
  }

  return data as Enrollment;
}

/**
 * Create enrollment after successful Stripe payment
 * This is called from the Stripe webhook handler
 */
export async function createEnrollmentFromPayment(
  userId: string,
  courseId: string,
  stripeSubscriptionId: string,
): Promise<Enrollment | null> {
  // Check if already enrolled
  const enrolled = await isUserEnrolled(userId, courseId);
  if (enrolled) {
    return null;
  }

  const { data, error } = await supabase
    .from("enrollments")
    .insert([
      {
        user_id: userId,
        course_id: courseId,
        stripe_subscription_id: stripeSubscriptionId,
        status: "active",
        enrolled_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating enrollment from payment:", error);
    throw error;
  }

  return data as Enrollment;
}

/**
 * Cancel enrollment
 */
export async function cancelEnrollment(enrollmentId: string): Promise<boolean> {
  const { error } = await supabase
    .from("enrollments")
    .update({ status: "cancelled" })
    .eq("id", enrollmentId);

  if (error) {
    console.error("Error cancelling enrollment:", error);
    return false;
  }

  return true;
}

/**
 * Get enrollment details
 */
export async function getEnrollment(enrollmentId: string): Promise<Enrollment | null> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching enrollment:", error);
    return null;
  }

  return data as Enrollment | null;
}
