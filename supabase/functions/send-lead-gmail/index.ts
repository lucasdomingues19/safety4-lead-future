import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

const isEmail = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const encodeHeader = (value: string) =>
  // RFC 2047 encode so accents/emoji in names or subjects survive
  /^[\x20-\x7E]*$/.test(value)
    ? value
    : `=?UTF-8?B?${btoa(String.fromCharCode(...new TextEncoder().encode(value)))}?=`;

const toBase64Url = (input: string) => {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const buildRawEmail = (to: string, subject: string, body: string) =>
  toBase64Url(
    [
      `To: ${to}`,
      `Subject: ${encodeHeader(subject)}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "MIME-Version: 1.0",
      "",
      body,
    ].join("\r\n"),
  );

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) return json({ error: "Admin privileges required" }, 403);

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const gmailKey = Deno.env.get("GOOGLE_MAIL_API_KEY");
    if (!lovableApiKey || !gmailKey) {
      return json({ error: "Gmail connection is not configured for this project." }, 500);
    }

    const { to, subject, body } = await req.json();

    if (!isEmail(to)) return json({ error: "Invalid recipient email address" }, 400);
    if (typeof subject !== "string" || !subject.trim() || subject.length > 300) {
      return json({ error: "Subject is required (max 300 characters)" }, 400);
    }
    if (typeof body !== "string" || !body.trim() || body.length > 10000) {
      return json({ error: "Message body is required (max 10,000 characters)" }, 400);
    }

    const response = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": gmailKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: buildRawEmail(to, subject.trim(), body) }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gmail send failed [${response.status}]: ${errorBody}`);
      return json(
        { error: "Gmail request failed", status: response.status, details: errorBody },
        response.status,
      );
    }

    const result = await response.json();
    console.log("Gmail message sent:", result?.id);
    return json({ success: true, id: result?.id, threadId: result?.threadId });
  } catch (error) {
    console.error("send-lead-gmail error:", error);
    return json({ error: "Failed to send email via Gmail." }, 500);
  }
});
