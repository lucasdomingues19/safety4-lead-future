import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface RequestBody {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventDescription: string;
  zoomLink: string | null;
  location: string;
  icsFile: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const body: RequestBody = await req.json();

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3434ff 0%, #2a2ad6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .event-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3434ff; }
    .detail-row { display: flex; margin: 12px 0; }
    .detail-label { font-weight: 600; width: 100px; color: #0b0b2c; }
    .detail-value { color: #69697b; flex: 1; }
    .zoom-link { background: #e8f0ff; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
    .zoom-link a { color: #3434ff; text-decoration: none; font-weight: 600; font-size: 16px; }
    .cta-button { display: inline-block; background: #3434ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; }
    .description { color: #69697b; line-height: 1.8; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Registration Confirmed!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">You're all set for ${body.eventTitle}</p>
    </div>

    <div class="content">
      <p>Hi ${body.name},</p>

      <p>Thank you for registering for our event! We're excited to have you join us.</p>

      <div class="event-details">
        <h3 style="margin-top: 0; color: #0b0b2c;">Event Details</h3>

        <div class="detail-row">
          <div class="detail-label">Event:</div>
          <div class="detail-value"><strong>${body.eventTitle}</strong></div>
        </div>

        <div class="detail-row">
          <div class="detail-label">Date:</div>
          <div class="detail-value">${body.eventDate}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">Time:</div>
          <div class="detail-value">${body.eventTime} UTC</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">Location:</div>
          <div class="detail-value">${body.location}</div>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;">

        <p class="description"><strong>Event Description:</strong><br>${body.eventDescription}</p>
      </div>

      ${
        body.zoomLink
          ? `
        <div class="zoom-link">
          <p style="margin: 0 0 10px 0; color: #0b0b2c; font-weight: 600;">Join via Zoom</p>
          <a href="${body.zoomLink}" target="_blank">Click here to join the meeting</a>
        </div>
      `
          : ""
      }

      <p style="text-align: center;">
        <a href="https://safetytech.academy/events" class="cta-button">View Event Details</a>
      </p>

      <div style="background: #f0f4ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #3434ff; font-size: 14px;"><strong>📅 Add to Calendar</strong></p>
        <p style="margin: 5px 0 0 0; color: #69697b; font-size: 14px;">A calendar file is attached to this email. Download and open it to add this event to your calendar.</p>
      </div>

      <p style="color: #69697b; font-size: 14px;">If you have any questions about the event, feel free to reach out to us.</p>

      <p style="margin: 30px 0 10px 0;">Best regards,<br><strong>SafetyTech Academy Team</strong></p>

      <div class="footer">
        <p>© 2024 SafetyTech Academy. All rights reserved.</p>
        <p>You received this email because you registered for an event on safetytech.academy</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Create ICS attachment
    const icsContent = body.icsFile;

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SafetyTech Academy <hello@safetyacademy.tech>",
        to: body.to,
        subject: `Confirmed: ${body.eventTitle} Registration`,
        html: emailHtml,
        attachments: [
          {
            filename: "event.ics",
            content: icsContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

serve(handler);
