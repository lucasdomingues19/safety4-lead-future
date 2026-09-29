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

export interface EventRegistrationEmail {
  name: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventDescription: string;
  zoomLink: string | null;
  location: string;
}

export async function sendEventRegistrationEmail(details: EventRegistrationEmail): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("send-event-registration-email", {
      body: { ...details, to: details.email },
    });
    if (error) {
      console.error("Event registration email error:", error);
      return false;
    }
    return !!data?.success || !!data?.id;
  } catch (error) {
    console.error("Event registration email failed:", error);
    return false;
  }
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
