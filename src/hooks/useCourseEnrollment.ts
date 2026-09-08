import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Enrollment } from "@/lib/lms";

export const useCourseEnrollment = () => {
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEnrollment = useCallback(
    async (userId: string, courseId: string): Promise<Enrollment | null> => {
      try {
        const { data, error: err } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", userId)
          .eq("course_id", courseId)
          .maybeSingle();

        if (err) throw err;
        return (data as Enrollment) || null;
      } catch (err) {
        console.error("Error checking enrollment:", err);
        return null;
      }
    },
    []
  );

  const enrollUser = useCallback(
    async (userId: string, courseId: string, stripeSubscriptionId?: string) => {
      setEnrolling(true);
      setError(null);

      try {
        const { data, error: err } = await supabase
          .from("enrollments")
          .insert([
            {
              user_id: userId,
              course_id: courseId,
              stripe_subscription_id: stripeSubscriptionId || null,
              status: "active",
              enrolled_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (err) throw err;
        return (data as Enrollment) || null;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Enrollment failed";
        setError(message);
        return null;
      } finally {
        setEnrolling(false);
      }
    },
    []
  );

  return { checkEnrollment, enrollUser, enrolling, error };
};
