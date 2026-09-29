import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AwsClient } from "npm:aws4fetch@1.0.20";

// Lesson media gateway. Files live in private storage and are only ever
// reached through short-lived signed URLs issued here:
//   upload  (admin)                     -> signed PUT URL for a new file
//   view    (admin or enrolled learner) -> signed GET URLs for a lesson's files
//   delete  (admin)                     -> remove a replaced file
// Large video goes to AWS S3 (Supabase free plan caps uploads at 50 MB);
// slides, documents, captions and resources go to the Supabase bucket.
// Stored paths are "s3:<key>" or "sb:<key>".

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SB_BUCKET = "video-lessons";
const SB_MAX_BYTES = 50 * 1024 * 1024;
const S3_MAX_BYTES = 5 * 1024 * 1024 * 1024; // single-PUT limit
const VIEW_TTL_SECONDS = 4 * 60 * 60;
const UPLOAD_TTL_SECONDS = 60 * 60;

const ALLOWED_TYPES = new Set([
  "video/mp4", "video/webm", "video/quicktime",
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/vtt", "text/plain", "text/csv",
  "image/png", "image/jpeg", "image/webp",
  "application/zip",
]);

const s3Config = () => {
  const bucket = Deno.env.get("LMS_S3_BUCKET");
  const region = Deno.env.get("LMS_S3_REGION");
  const accessKeyId = Deno.env.get("LMS_S3_ACCESS_KEY_ID");
  const secretAccessKey = Deno.env.get("LMS_S3_SECRET_ACCESS_KEY");
  if (!bucket || !region || !accessKeyId || !secretAccessKey) return null;
  return { bucket, region, aws: new AwsClient({ accessKeyId, secretAccessKey, region, service: "s3" }) };
};

const s3ObjectUrl = (cfg: NonNullable<ReturnType<typeof s3Config>>, key: string) =>
  new URL(`https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com/${key.split("/").map(encodeURIComponent).join("/")}`);

const s3Presign = async (
  cfg: NonNullable<ReturnType<typeof s3Config>>,
  method: "GET" | "PUT" | "DELETE",
  key: string,
  ttl: number,
  downloadName?: string,
) => {
  const url = s3ObjectUrl(cfg, key);
  url.searchParams.set("X-Amz-Expires", String(ttl));
  if (downloadName) url.searchParams.set("response-content-disposition", `attachment; filename="${downloadName.replace(/"/g, "")}"`);
  const signed = await cfg.aws.sign(new Request(url, { method }), { aws: { signQuery: true } });
  return signed.url;
};

const safeName = (name: string) =>
  name.normalize("NFKD").replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-").slice(-120) || "file";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: userData, error: userError } = await db.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const { data: roleRow } = await db.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    const isAdmin = !!roleRow;
    const s3 = s3Config();

    const body = await req.json() as {
      action?: string;
      lesson_id?: string;
      filename?: string;
      content_type?: string;
      size?: number;
      purpose?: "media" | "captions" | "resource";
      path?: string;
    };

    // ---------- upload ----------
    if (body.action === "upload") {
      if (!isAdmin) return json({ error: "Forbidden" }, 403);
      const { lesson_id, filename, content_type, size, purpose } = body;
      if (!lesson_id || !filename || !content_type || !size || !purpose) return json({ error: "Missing upload details" }, 400);
      if (!ALLOWED_TYPES.has(content_type)) return json({ error: `File type ${content_type} is not supported` }, 400);
      if (purpose === "captions" && content_type !== "text/vtt") return json({ error: "Captions must be a WebVTT (.vtt) or .srt file" }, 400);

      const { data: lesson } = await db.from("lessons").select("id").eq("id", lesson_id).maybeSingle();
      if (!lesson) return json({ error: "Lesson not found" }, 404);

      const key = `lessons/${lesson_id}/${Date.now()}-${safeName(filename)}`;
      const isVideo = content_type.startsWith("video/");
      const useS3 = !!s3 && (isVideo || size > SB_MAX_BYTES);

      if (useS3) {
        if (size > S3_MAX_BYTES) return json({ error: "Files over 5 GB are not supported" }, 400);
        const url = await s3Presign(s3!, "PUT", key, UPLOAD_TTL_SECONDS);
        return json({ path: `s3:${key}`, upload_url: url, headers: { "Content-Type": content_type } });
      }
      if (size > SB_MAX_BYTES) {
        return json({
          error: isVideo
            ? "Video storage (AWS S3) is not configured yet, and files over 50 MB can't be stored in Supabase on the free plan."
            : "Files over 50 MB need AWS S3 storage, which is not configured yet.",
        }, 400);
      }
      const { data: signed, error } = await db.storage.from(SB_BUCKET).createSignedUploadUrl(key);
      if (error || !signed) return json({ error: `Could not prepare upload: ${error?.message ?? "unknown"}` }, 500);
      return json({ path: `sb:${key}`, upload_url: signed.signedUrl, headers: { "Content-Type": content_type, "x-upsert": "false" } });
    }

    // ---------- view ----------
    if (body.action === "view") {
      const lessonId = body.lesson_id;
      if (!lessonId) return json({ error: "Missing lesson_id" }, 400);
      const { data: lesson } = await db
        .from("lessons")
        .select("id, media_path, media_name, captions_path, resources")
        .eq("id", lessonId)
        .maybeSingle();
      if (!lesson) return json({ error: "Lesson not found" }, 404);

      if (!isAdmin) {
        // Same rules as completion: active enrolment, drip release, and every
        // earlier required lesson complete.
        const { data: lock, error: lockErr } = await db.rpc("lesson_lock_reason", { _user: user.id, _lesson: lessonId });
        if (lockErr) return json({ error: "Could not check access" }, 500);
        if (lock) {
          const msg: Record<string, string> = {
            not_enrolled: "No active enrolment",
            drip: "Module not unlocked yet",
            previous_incomplete: "Finish the previous lessons first",
          };
          return json({ error: msg[lock as string] ?? "Lesson locked", reason: lock }, 403);
        }
      }

      const sign = async (path: string | null, downloadName?: string): Promise<string | null> => {
        if (!path) return null;
        if (path.startsWith("s3:")) {
          if (!s3) return null;
          return s3Presign(s3, "GET", path.slice(3), VIEW_TTL_SECONDS, downloadName);
        }
        if (path.startsWith("sb:")) {
          const { data } = await db.storage.from(SB_BUCKET).createSignedUrl(path.slice(3), VIEW_TTL_SECONDS, downloadName ? { download: downloadName } : undefined);
          return data?.signedUrl ?? null;
        }
        return null;
      };

      const resources = Array.isArray(lesson.resources) ? lesson.resources as { label: string; url?: string; path?: string; name?: string }[] : [];
      const signedResources = await Promise.all(resources.map(async (r) => ({
        label: r.label,
        url: r.path ? await sign(r.path, r.name ?? r.label) : r.url ?? null,
        is_file: !!r.path,
      })));

      return json({
        media_url: await sign(lesson.media_path),
        captions_url: await sign(lesson.captions_path),
        resources: signedResources.filter((r) => r.url),
        expires_in: VIEW_TTL_SECONDS,
      });
    }

    // ---------- delete ----------
    if (body.action === "delete") {
      if (!isAdmin) return json({ error: "Forbidden" }, 403);
      const path = body.path ?? "";
      const key = path.slice(3);
      if (!key.startsWith("lessons/") || key.includes("..")) return json({ error: "Invalid path" }, 400);
      if (path.startsWith("s3:")) {
        if (!s3) return json({ error: "S3 not configured" }, 400);
        const url = await s3Presign(s3, "DELETE", key, 60);
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok && res.status !== 404) return json({ error: `S3 delete failed (${res.status})` }, 502);
      } else if (path.startsWith("sb:")) {
        const { error } = await db.storage.from(SB_BUCKET).remove([key]);
        if (error) return json({ error: error.message }, 500);
      } else {
        return json({ error: "Invalid path" }, 400);
      }
      return json({ ok: true });
    }

    // ---------- status (admin: which backends are live) ----------
    if (body.action === "status") {
      if (!isAdmin) return json({ error: "Forbidden" }, 403);
      return json({ s3_configured: !!s3, supabase_max_bytes: SB_MAX_BYTES });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("lesson-media error", err);
    return json({ error: err instanceof Error ? err.message : "Internal error" }, 500);
  }
});
