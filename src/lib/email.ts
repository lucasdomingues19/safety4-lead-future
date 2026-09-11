import { supabase } from "@/integrations/supabase/client";

export interface EventRegistrationEmailData {
  name: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventDescription: string;
  zoomLink: string | null;
  location: string;
}

// Generate ICS calendar file content
export const generateICSFile = (
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  zoomLink: string | null
): string => {
  // Parse date and time
  const [day, month, year] = eventDate.match(/\d+/g) || ["01", "01", "2024"];
  const [hour, minute] = eventTime.split(":").map((t) => t.trim());

  // Create ICS format date (YYYYMMDDTHHMMSSZ)
  const icsDate = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}00Z`;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SafetyTech Academy//Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@safetytech.academy
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${icsDate}
SUMMARY:${eventTitle}
DESCRIPTION:${eventTitle}\\n\\nZoom Link: ${zoomLink || "N/A"}
LOCATION:Online via Zoom
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

// Send event registration confirmation email
export const sendEventRegistrationEmail = async (
  data: EventRegistrationEmailData
): Promise<boolean> => {
  try {
    // Generate ICS file
    const icsContent = generateICSFile(
      data.eventTitle,
      data.eventDate,
      data.eventTime,
      data.zoomLink
    );

    // Call edge function to send email
    const { data: response, error } = await supabase.functions.invoke(
      "send-event-registration-email",
      {
        body: {
          to: data.email,
          name: data.name,
          eventTitle: data.eventTitle,
          eventDate: data.eventDate,
          eventTime: data.eventTime,
          eventDescription: data.eventDescription,
          zoomLink: data.zoomLink,
          location: data.location,
          icsFile: icsContent,
        },
      }
    );

    if (error) {
      console.error("Email sending error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
};
