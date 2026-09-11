/**
 * Stripe payment integration for course enrollment.
 * Handles checkout session creation, subscription management, and payment verification.
 */

import { supabase } from "@/integrations/supabase/client";

interface CheckoutSessionRequest {
  courseId: string;
  userId: string;
  priceCents: number;
  courseTitle: string;
  userEmail: string;
}

interface CheckoutSession {
  sessionId: string;
  url: string;
}

interface SubscriptionStatus {
  isActive: boolean;
  endsAt: string | null;
  cancelledAt: string | null;
  status: "active" | "cancelled" | "expired" | "past_due";
}

/**
 * Create a Stripe checkout session for course enrollment.
 * Calls an edge function that communicates with Stripe.
 */
export async function createCheckoutSession(
  request: CheckoutSessionRequest
): Promise<CheckoutSession> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      {
        body: request,
      }
    );

    if (error) throw error;

    if (!data.sessionId || !data.url) {
      throw new Error("Invalid checkout session response");
    }

    return {
      sessionId: data.sessionId,
      url: data.url,
    };
  } catch (err) {
    console.error("Failed to create checkout session:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Failed to create checkout session"
    );
  }
}

/**
 * Verify that a user has an active subscription to a course.
 * Used for access control before allowing lesson viewing.
 */
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

/**
 * Get subscription status for a user's course enrollment.
 * Returns subscription expiration and cancellation info.
 */
export async function getSubscriptionStatus(
  userId: string,
  courseId: string
): Promise<SubscriptionStatus | null> {
  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select("status, expires_at, enrolled_at")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw error;
    }

    if (!data) return null;

    const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
    const isExpired = expiresAt && expiresAt < new Date();

    return {
      isActive:
        data.status === "active" && !isExpired,
      endsAt: data.expires_at,
      cancelledAt:
        data.status === "cancelled" ? new Date().toISOString() : null,
      status: isExpired
        ? "expired"
        : (data.status as "active" | "cancelled" | "expired" | "past_due"),
    };
  } catch (err) {
    console.error("Failed to get subscription status:", err);
    throw err;
  }
}

/**
 * Cancel a user's subscription to a course.
 * Should only be called after Stripe cancellation is confirmed.
 */
export async function cancelEnrollment(
  userId: string,
  courseId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("enrollments")
      .update({ status: "cancelled" })
      .eq("user_id", userId)
      .eq("course_id", courseId);

    if (error) throw error;
  } catch (err) {
    console.error("Failed to cancel enrollment:", err);
    throw err;
  }
}

/**
 * Create or update enrollment after successful payment.
 * This is called by the Stripe webhook handler.
 */
export async function createEnrollmentFromPayment(
  userId: string,
  courseId: string,
  stripeSubscriptionId: string,
  expiresAt?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("enrollments")
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          stripe_subscription_id: stripeSubscriptionId,
          status: "active",
          enrolled_at: new Date().toISOString(),
          expires_at: expiresAt || null,
        },
        { onConflict: "user_id,course_id" }
      );

    if (error) throw error;
  } catch (err) {
    console.error("Failed to create enrollment from payment:", err);
    throw err;
  }
}
