import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { AwsClient } from "npm:aws4fetch@1.0.20";

// TEMPORARY — Kajabi → LMS content move. Gated by a one-time IMPORT_TOKEN
// secret; delete this function and the secret once the move is done.
//   stash   { name, data }                 -> saves JSON copied from Kajabi to the private "imports" bucket
//   presign { lesson_id, filename, size }  -> S3 PUT URL for a lesson video (same key scheme as lesson-media)

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-import-token",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json", ...cors } });
const safeName = (name: string) => name.normalize("NFKD").replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-").slice(-120) || "file";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const token = Deno.env.get("IMPORT_TOKEN");
  if (!token || token.length < 32 || req.headers.get("x-import-token") !== token) return json({ error: "Forbidden" }, 403);
  const body = await req.json().catch(() => ({})) as { action?: string; name?: string; data?: unknown; lesson_id?: string; filename?: string; size?: number };
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (body.action === "stash") {
    if (!body.name || !/^[\w-]{1,60}$/.test(body.name)) return json({ error: "Bad name" }, 400);
    const blob = new Blob([JSON.stringify(body.data)], { type: "application/json" });
    const { error } = await db.storage.from("imports").upload(`kajabi/${body.name}.json`, blob, { upsert: true, contentType: "application/json" });
    return error ? json({ error: error.message }, 500) : json({ ok: true });
  }

  if (body.action === "presign") {
    const { lesson_id, filename, size } = body;
    if (!lesson_id || !filename || !size) return json({ error: "Missing details" }, 400);
    const { data: lesson } = await db.from("lessons").select("id").eq("id", lesson_id).maybeSingle();
    if (!lesson) return json({ error: "Lesson not found" }, 404);
    const bucket = Deno.env.get("LMS_S3_BUCKET")!, region = Deno.env.get("LMS_S3_REGION")!;
    const aws = new AwsClient({ accessKeyId: Deno.env.get("LMS_S3_ACCESS_KEY_ID")!, secretAccessKey: Deno.env.get("LMS_S3_SECRET_ACCESS_KEY")!, region, service: "s3" });
    const key = `lessons/${lesson_id}/${Date.now()}-${safeName(filename)}`;
    const url = new URL(`https://${bucket}.s3.${region}.amazonaws.com/${key.split("/").map(encodeURIComponent).join("/")}`);
    url.searchParams.set("X-Amz-Expires", "7200");
    const signed = await aws.sign(new Request(url, { method: "PUT" }), { aws: { signQuery: true } });
    return json({ path: `s3:${key}`, upload_url: signed.url });
  }

  if (body.action === "delete") {
    // Remove stored lesson videos that were imported by mistake (s3:lessons/... only).
    const paths = ((body as { paths?: string[] }).paths ?? []).filter((x) => x.startsWith("s3:lessons/"));
    const bucket = Deno.env.get("LMS_S3_BUCKET")!, region = Deno.env.get("LMS_S3_REGION")!;
    const aws = new AwsClient({ accessKeyId: Deno.env.get("LMS_S3_ACCESS_KEY_ID")!, secretAccessKey: Deno.env.get("LMS_S3_SECRET_ACCESS_KEY")!, region, service: "s3" });
    let deleted = 0;
    for (const path of paths.slice(0, 100)) {
      const key = path.slice(3);
      const res = await aws.fetch(`https://${bucket}.s3.${region}.amazonaws.com/${key.split("/").map(encodeURIComponent).join("/")}`, { method: "DELETE" });
      if (res.ok || res.status === 204) deleted++;
    }
    return json({ deleted });
  }

  if (body.action === "verify") {
    // HEAD each stored video and report its size, to confirm uploads are complete.
    const paths = (body as { paths?: string[] }).paths ?? [];
    const bucket = Deno.env.get("LMS_S3_BUCKET")!, region = Deno.env.get("LMS_S3_REGION")!;
    const aws = new AwsClient({ accessKeyId: Deno.env.get("LMS_S3_ACCESS_KEY_ID")!, secretAccessKey: Deno.env.get("LMS_S3_SECRET_ACCESS_KEY")!, region, service: "s3" });
    const out: Record<string, number | null> = {};
    for (const path of paths.slice(0, 100)) {
      if (!path.startsWith("s3:lessons/")) { out[path] = null; continue; }
      const key = path.slice(3);
      const res = await aws.fetch(`https://${bucket}.s3.${region}.amazonaws.com/${key.split("/").map(encodeURIComponent).join("/")}`, { method: "HEAD" });
      out[path] = res.ok ? Number(res.headers.get("content-length")) : null;
    }
    return json({ sizes: out });
  }

  return json({ error: "Unknown action" }, 400);
});
