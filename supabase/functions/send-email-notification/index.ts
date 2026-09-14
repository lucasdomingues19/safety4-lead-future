import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface EmailRequest {
  to: string;
  type: "enrollment" | "completion" | "certificate";
  data: {
    student_name?: string;
    course_title?: string;
    course_url?: string;
    certificate_url?: string;
    instructor_name?: string;
    cpd_hours?: number;
  };
}

const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const senderEmail = "hello@safetyacademy.tech";
const baseUrl = Deno.env.get("APP_BASE_URL") || "https://safetyacademy.tech";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Email templates
const templates = {
  enrollment: (data: EmailRequest["data"]) => ({
    subject: `Welcome to ${data.course_title}! 🎓`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3434ff 0%, #0b0b2c 100%); color: white; padding: 40px 20px; border-radius: 8px; text-align: center; }
    .content { padding: 30px 20px; background: #f8f9fa; border-radius: 8px; margin-top: 20px; }
    .button { background: #3434ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .badge { display: inline-block; background: #8ab815; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Welcome to SafetyTech Academy!</h1>
    </div>

    <div class="content">
      <p>Hi ${data.student_name},</p>

      <p>You're now enrolled in <strong>${data.course_title}</strong>!</p>

      <p>You can start learning right away. Here's what to expect:</p>
      <ul>
        <li><strong>Video lessons</strong> covering essential safety concepts</li>
        <li><strong>Interactive quizzes</strong> with AI-powered grading</li>
        <li><strong>Certificate</strong> upon completion${data.cpd_hours ? ` (${data.cpd_hours} CPD hours)` : ""}</li>
        <li><strong>Progress tracking</strong> to monitor your learning</li>
      </ul>

      <a href="${baseUrl}/learn/${data.course_url}" class="button">Start Learning Now →</a>

      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        <strong>Need help?</strong> Reply to this email or visit our support page.
      </p>
    </div>

    <div class="footer">
      <p>SafetyTech Academy | Building safer workplaces through AI-powered training</p>
      <p><small>© 2026 SafetyTech. All rights reserved.</small></p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  completion: (data: EmailRequest["data"]) => ({
    subject: `🎉 Congratulations! You've Completed ${data.course_title}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8ab815 0%, #5e7f0f 100%); color: white; padding: 40px 20px; border-radius: 8px; text-align: center; }
    .content { padding: 30px 20px; background: #f8f9fa; border-radius: 8px; margin-top: 20px; }
    .achievement { text-align: center; padding: 20px; background: white; border-radius: 8px; border: 2px solid #8ab815; margin: 20px 0; }
    .achievement-icon { font-size: 48px; margin-bottom: 10px; }
    .button { background: #8ab815; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Course Complete!</h1>
    </div>

    <div class="content">
      <p>Hi ${data.student_name},</p>

      <p>Fantastic work! You've successfully completed <strong>${data.course_title}</strong>.</p>

      <div class="achievement">
        <div class="achievement-icon">🏆</div>
        <p><strong>Your Achievement Unlocked</strong></p>
        <p>${data.cpd_hours ? `${data.cpd_hours} CPD Hours Earned` : "Certificate Ready"}</p>
      </div>

      <p><strong>What's next?</strong></p>
      <ul>
        <li>✅ Your certificate has been generated</li>
        <li>📥 Download your certificate and add it to your portfolio</li>
        <li>📚 Explore other courses to continue your learning journey</li>
        <li>🤝 Share your achievement with your network</li>
      </ul>

      <a href="${baseUrl}/learn/certificates" class="button">View Your Certificate →</a>

      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        <strong>Continue learning:</strong> Check out our other courses to expand your expertise.
      </p>
    </div>

    <div class="footer">
      <p>SafetyTech Academy | Building safer workplaces through AI-powered training</p>
      <p><small>© 2026 SafetyTech. All rights reserved.</small></p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  certificate: (data: EmailRequest["data"]) => ({
    subject: `📜 Your Certificate is Ready - ${data.course_title}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3434ff 0%, #0b0b2c 100%); color: white; padding: 40px 20px; border-radius: 8px; text-align: center; }
    .content { padding: 30px 20px; background: #f8f9fa; border-radius: 8px; margin-top: 20px; }
    .certificate-box { text-align: center; padding: 20px; background: white; border-radius: 8px; border: 3px solid #8ab815; margin: 20px 0; }
    .button { background: #3434ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📜 Certificate Issued</h1>
    </div>

    <div class="content">
      <p>Hi ${data.student_name},</p>

      <p>Your certificate for <strong>${data.course_title}</strong> has been generated and is ready to download.</p>

      <div class="certificate-box">
        <div style="font-size: 24px; margin-bottom: 10px;">📋</div>
        <p><strong>Certificate of Completion</strong></p>
        <p style="color: #666; font-size: 14px;">${data.course_title}</p>
      </div>

      <p><strong>What you can do with your certificate:</strong></p>
      <ul>
        <li>📥 Download and print it</li>
        <li>💼 Add it to your LinkedIn profile</li>
        <li>📧 Share it with your employer or colleagues</li>
        <li>📚 Use it to demonstrate your expertise</li>
      </ul>

      <a href="${data.certificate_url || baseUrl + '/learn/certificates'}" class="button">Download Certificate →</a>

      <p style="background: #fffbea; border-left: 4px solid #8ab815; padding: 15px; border-radius: 4px; margin-top: 20px;">
        <strong>💡 Tip:</strong> You can verify this certificate's authenticity at our verification page using your certificate ID.
      </p>
    </div>

    <div class="footer">
      <p>SafetyTech Academy | Building safer workplaces through AI-powered training</p>
      <p><small>© 2026 SafetyTech. All rights reserved.</small></p>
    </div>
  </div>
</body>
</html>
    `,
  }),
};

async function sendEmail(request: EmailRequest): Promise<{ success: boolean; message_id?: string; error?: string }> {
  const template = templates[request.type];
  if (!template) {
    return { success: false, error: `Unknown email type: ${request.type}` };
  }

  const emailContent = template(request.data);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderEmail,
        to: request.to,
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await response.json();
    return { success: true, message_id: data.id };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const emailRequest: EmailRequest = await req.json();

    // Validate request
    if (!emailRequest.to || !emailRequest.type || !emailRequest.data) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "content-type": "application/json" } },
      );
    }

    // Send email
    const result = await sendEmail(emailRequest);

    // Log email send for audit trail
    if (result.success) {
      await supabase.from("email_logs").insert({
        recipient: emailRequest.to,
        email_type: emailRequest.type,
        message_id: result.message_id,
        status: "sent",
        data: emailRequest.data,
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { "content-type": "application/json" },
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Request processing error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
});
