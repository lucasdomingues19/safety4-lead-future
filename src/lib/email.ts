import { supabase } from "@/integrations/supabase/client";

export type EmailType = "enrollment" | "completion" | "certificate";

export interface EmailNotification {
  to: string;
  type: EmailType;
  data: {
    student_name?: string;
    course_title?: string;
    course_url?: string;
    certificate_url?: string;
    instructor_name?: string;
    cpd_hours?: number;
  };
}

export async function sendEnrollmentEmail(
  email: string,
  studentName: string,
  courseTitle: string,
  courseUrl: string,
  cpdHours?: number,
): Promise<boolean> {
  return sendEmailNotification({
    to: email,
    type: "enrollment",
    data: {
      student_name: studentName,
      course_title: courseTitle,
      course_url: courseUrl,
      cpd_hours: cpdHours,
    },
  });
}

export async function sendCompletionEmail(
  email: string,
  studentName: string,
  courseTitle: string,
  cpdHours?: number,
): Promise<boolean> {
  return sendEmailNotification({
    to: email,
    type: "completion",
    data: {
      student_name: studentName,
      course_title: courseTitle,
      cpd_hours: cpdHours,
    },
  });
}

export async function sendCertificateEmail(
  email: string,
  studentName: string,
  courseTitle: string,
  certificateUrl?: string,
): Promise<boolean> {
  return sendEmailNotification({
    to: email,
    type: "certificate",
    data: {
      student_name: studentName,
      course_title: courseTitle,
      certificate_url: certificateUrl,
    },
  });
}

async function sendEmailNotification(notification: EmailNotification): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "send-email-notification",
      {
        body: notification,
      },
    );

    if (error) {
      console.error("Email sending error:", error);
      return false;
    }

    return data?.success || false;
  } catch (error) {
    console.error("Email notification failed:", error);
    return false;
  }
}

// Get email delivery history
export async function getEmailHistory(email: string) {
  const { data, error } = await supabase
    .from("email_logs")
    .select("*")
    .eq("recipient", email)
    .order("sent_at", { ascending: false });

  if (error) {
    console.error("Error fetching email history:", error);
    return [];
  }

  return data || [];
}

// Get email metrics
export async function getEmailMetrics() {
  const { data: sent, error: sentError } = await supabase
    .from("email_logs")
    .select("*")
    .eq("status", "sent");

  const { data: failed, error: failedError } = await supabase
    .from("email_logs")
    .select("*")
    .eq("status", "failed");

  if (sentError || failedError) {
    console.error("Error fetching metrics:", sentError || failedError);
    return { sent_count: 0, failed_count: 0, success_rate: 0 };
  }

  const totalSent = (sent || []).length;
  const totalFailed = (failed || []).length;
  const total = totalSent + totalFailed;
  const successRate = total > 0 ? Math.round((totalSent / total) * 100) : 0;

  return {
    sent_count: totalSent,
    failed_count: totalFailed,
    success_rate: successRate,
  };
}
