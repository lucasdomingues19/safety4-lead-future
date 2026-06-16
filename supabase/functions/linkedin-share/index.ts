import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Scopes:
//  - openid, profile  -> read the member URN via /v2/userinfo (Sign In with LinkedIn using OpenID Connect)
//  - w_member_social   -> publish posts on the member's behalf (Share on LinkedIn)
const SCOPES = "openid profile w_member_social";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
    const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return json(
        { error: "LinkedIn posting is not configured yet. Add the LinkedIn app credentials." },
        500,
      );
    }

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return json({ error: "Invalid request body" }, 400);
    }

    const action = (payload as { action?: string }).action;

    // 1) Build the LinkedIn authorization URL (keeps client_id server-side)
    if (action === "authorize") {
      const { redirectUri, state } = payload as { redirectUri?: string; state?: string };
      if (!redirectUri || !state) {
        return json({ error: "Missing redirectUri or state" }, 400);
      }
      const url =
        "https://www.linkedin.com/oauth/v2/authorization?" +
        new URLSearchParams({
          response_type: "code",
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          scope: SCOPES,
        }).toString();
      return json({ url });
    }

    // 2) Exchange the code, upload the image, and publish the post
    if (action === "publish") {
      const { code, redirectUri, image, text } = payload as {
        code?: string;
        redirectUri?: string;
        image?: string;
        text?: string;
      };
      if (!code || !redirectUri || !image || !text) {
        return json({ error: "Missing code, redirectUri, image or text" }, 400);
      }
      if (text.length > 2900) {
        return json({ error: "Post text is too long" }, 400);
      }

      // Exchange authorization code for an access token
      const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      const tokenJson = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok || !tokenJson.access_token) {
        console.error("token exchange failed", tokenJson);
        return json({ error: "LinkedIn sign-in failed. Please try again." }, 400);
      }
      const accessToken = tokenJson.access_token as string;

      // Read the member URN
      const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const me = await meRes.json().catch(() => ({}));
      if (!meRes.ok || !me.sub) {
        console.error("userinfo failed", me);
        return json({ error: "Could not read your LinkedIn profile." }, 400);
      }
      const author = `urn:li:person:${me.sub}`;

      // Register an image upload
      const regRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: author,
            serviceRelationships: [
              { relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" },
            ],
          },
        }),
      });
      const reg = await regRes.json().catch(() => ({}));
      if (!regRes.ok || !reg?.value?.asset) {
        console.error("registerUpload failed", reg);
        return json({ error: "Could not prepare the image upload on LinkedIn." }, 400);
      }
      const asset = reg.value.asset as string;
      const uploadUrl =
        reg.value.uploadMechanism?.[
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ]?.uploadUrl;
      if (!uploadUrl) {
        console.error("no uploadUrl", reg);
        return json({ error: "LinkedIn did not return an upload URL." }, 400);
      }

      // Upload the binary image
      const base64 = image.includes(",") ? image.split(",")[1] : image;
      const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const upRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: binary,
      });
      if (!upRes.ok) {
        const detail = await upRes.text().catch(() => "");
        console.error("image upload failed", upRes.status, detail);
        return json({ error: "The certificate image could not be uploaded to LinkedIn." }, 400);
      }

      // Publish the post with the uploaded image
      const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text },
              shareMediaCategory: "IMAGE",
              media: [
                {
                  status: "READY",
                  description: { text: "Safety 4.0 Academy certificate" },
                  media: asset,
                  title: { text: "Safety 4.0 - Leading Safety in the Digital Age" },
                },
              ],
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      });
      if (!postRes.ok) {
        const detail = await postRes.text().catch(() => "");
        console.error("ugcPosts failed", postRes.status, detail);
        return json({ error: "The post could not be published on LinkedIn." }, 400);
      }

      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("linkedin-share error", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
