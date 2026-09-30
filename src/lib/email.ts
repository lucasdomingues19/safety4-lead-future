import { supabase } from "@/integrations/supabase/client";

/** Ask the server to email the event confirmation. It builds the email from
 *  the events table and only sends to someone who just registered. */
export async function sendEventRegistrationEmail(details: { eventId: string; email: string }): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("send-event-registration-email", {
      body: { event_id: details.eventId, email: details.email },
    });
    if (error) {
      console.error("Event registration email error:", error);
      return false;
    }
    return !!data?.success;
  } catch (error) {
    console.error("Event registration email failed:", error);
    return false;
  }
}
