// Client side of the lesson-media edge function: uploads go straight from the
// browser to private storage through a signed URL; playback URLs are signed
// per request and only issued to admins and enrolled learners.
import { supabase } from "@/integrations/supabase/client";

export type MediaPurpose = "media" | "captions" | "resource";

export interface SignedLessonMedia {
  media_url: string | null;
  captions_url: string | null;
  resources: { label: string; url: string; is_file: boolean }[];
}

const EXT_TYPES: Record<string, string> = {
  mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  vtt: "text/vtt", srt: "text/vtt", txt: "text/plain", csv: "text/csv",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  zip: "application/zip",
};

const extOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

/** Browsers often report "" or odd types for Office/VTT files; trust the extension. */
export const contentTypeFor = (file: File) => EXT_TYPES[extOf(file.name)] ?? file.type;

export const isPdf = (nameOrMime?: string | null) => !!nameOrMime && /pdf/i.test(nameOrMime);
export const isOfficeDoc = (name?: string | null) => !!name && /\.(pptx?|docx?|xlsx?)$/i.test(name);

export const formatBytes = (n?: number | null) => {
  if (!n) return "";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

/** SubRip (.srt) → WebVTT, since browsers only play WebVTT caption tracks. */
const srtToVtt = async (file: File): Promise<File> => {
  const text = await file.text();
  const vtt = "WEBVTT\n\n" + text.replace(/\r/g, "").replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return new File([vtt], file.name.replace(/\.srt$/i, ".vtt"), { type: "text/vtt" });
};

const invoke = async <T,>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke("lesson-media", { body });
  if (data?.error) throw new Error(data.error);
  if (error) {
    // FunctionsHttpError hides the JSON body; surface the server's message when present.
    const ctx = (error as { context?: Response }).context;
    const msg = ctx ? await ctx.json().then((j) => j?.error).catch(() => null) : null;
    throw new Error(msg || error.message);
  }
  return data as T;
};

/** Upload a file for a lesson; resolves to the stored path ("s3:..." / "sb:..."). */
export async function uploadLessonFile(
  lessonId: string,
  input: File,
  purpose: MediaPurpose,
  onProgress?: (percent: number) => void,
): Promise<{ path: string; name: string; mime: string; size: number }> {
  const file = purpose === "captions" && extOf(input.name) === "srt" ? await srtToVtt(input) : input;
  const mime = contentTypeFor(file);
  const { path, upload_url, headers } = await invoke<{ path: string; upload_url: string; headers: Record<string, string> }>({
    action: "upload",
    lesson_id: lessonId,
    filename: file.name,
    content_type: mime,
    size: file.size,
    purpose,
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", upload_url);
    Object.entries(headers ?? {}).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText.slice(0, 200)}`)));
    xhr.onerror = () => reject(new Error("Upload failed — network error or storage CORS not configured"));
    xhr.send(file);
  });

  return { path, name: file.name, mime, size: file.size };
}

export const deleteLessonFile = (path: string) => invoke<{ ok: true }>({ action: "delete", path });

export const getSignedLessonMedia = (lessonId: string) => invoke<SignedLessonMedia>({ action: "view", lesson_id: lessonId });

export const getMediaStorageStatus = () => invoke<{ s3_configured: boolean; supabase_max_bytes: number }>({ action: "status" });
