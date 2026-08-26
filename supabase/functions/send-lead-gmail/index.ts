import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const isEmail = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting send-lead-gmail request");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error("Auth error:", userError);
      return json({ error: "Unauthorized" }, 401);
    }

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      console.error("User not admin:", userData.user.id);
      return json({ error: "Admin privileges required" }, 403);
    }

    console.log("Auth successful for user:", userData.user.id);

    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    if (!gmailPassword) {
      console.error("GMAIL_APP_PASSWORD not configured");
      return json({ error: "Email is not configured" }, 500);
    }

    const { to, subject, body } = await req.json();

    if (!isEmail(to)) return json({ error: "Invalid recipient email" }, 400);
    if (typeof subject !== "string" || !subject.trim() || subject.length > 300) {
      return json({ error: "Invalid subject" }, 400);
    }
    if (typeof body !== "string" || !body.trim() || body.length > 10000) {
      return json({ error: "Invalid body" }, 400);
    }

    console.log("Connecting to Gmail SMTP...");
    const client = new SmtpClient();

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: "lucas@safetytech.academy",
      password: gmailPassword,
    });

    console.log("Sending email to:", to);
    await client.send({
      from: "lucas@safetytech.academy",
      to: to,
      subject: subject.trim(),
      content: body,
    });

    await client.close();
    console.log("Email sent successfully");
    return json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    return json({ error: "Failed to send email", details: error instanceof Error ? error.message : String(error) }, 500);
  }
});
