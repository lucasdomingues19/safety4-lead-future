import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import * as jose from "https://deno.land/x/jose@v5.4.1/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const isEmail = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const encodeHeader = (value: string) =>
  /^[\x20-\x7E]*$/.test(value)
    ? value
    : `=?UTF-8?B?${btoa(String.fromCharCode(...new TextEncoder().encode(value)))}?=`;

const toBase64Url = (input: string) => {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const buildRawEmail = (to: string, subject: string, body: string, from?: string) =>
  toBase64Url(
    [
      from ? `From: ${from}` : undefined,
      `To: ${to}`,
      `Subject: ${encodeHeader(subject)}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "MIME-Version: 1.0",
      "",
      body,
    ].filter(Boolean).join("\r\n"),
  );

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const generateAccessToken = async (serviceAccountJson: string): Promise<string> => {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  const privateKey = await jose.importPKCS8(sa.private_key, "RS256");
  const jwt = await new jose.SignJWT({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/gmail.send",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })
    .setProtectedHeader({ alg: "RS256" })
    .sign(privateKey);

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${await tokenResponse.text()}`);
  }

  const { access_token } = await tokenResponse.json();
  return access_token;
};

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

    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!serviceAccountJson) {
      return json({ error: "Gmail API is not configured. Service account credentials missing." }, 500);
    }

    const { to, subject, body } = await req.json();

    if (!isEmail(to)) return json({ error: "Invalid recipient email address" }, 400);
    if (typeof subject !== "string" || !subject.trim() || subject.length > 300) {
      return json({ error: "Subject is required (max 300 characters)" }, 400);
    }
    if (typeof body !== "string" || !body.trim() || body.length > 10000) {
      return json({ error: "Message body is required (max 10,000 characters)" }, 400);
    }

    const accessToken = await generateAccessToken(serviceAccountJson);
    const fromEmail = "lucas@safetytech.academy";
    const rawEmail = buildRawEmail(to, subject.trim(), body, fromEmail);

    const response = await fetch(`https://www.googleapis.com/gmail/v1/users/${encodeURIComponent(fromEmail)}/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: rawEmail }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gmail send failed [${response.status}]: ${errorBody}`);
      return json(
        { error: "Gmail API request failed", status: response.status, details: errorBody },
        response.status,
      );
    }

    const result = await response.json();
    console.log("Gmail message sent:", result?.id);
    return json({ success: true, id: result?.id, threadId: result?.threadId });
  } catch (error) {
    console.error("send-lead-gmail error:", error);
    return json({ error: "Failed to send email via Gmail API." }, 500);
  }
});
