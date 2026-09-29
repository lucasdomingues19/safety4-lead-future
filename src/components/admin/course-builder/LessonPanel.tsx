import { useEffect, useRef, useState } from "react";
import {
  Bold, Captions, ExternalLink, FileText, Film, Heading2, Link as LinkIcon, List, Loader2, Paperclip,
  Presentation, Sparkles, Trash2, Wand2, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Course, Lesson, LessonMediaKind, LessonResource } from "@/lib/lms";
import { uploadLessonFile, deleteLessonFile, formatBytes, contentTypeFor } from "@/lib/lessonMedia";
import { generateOverview } from "@/lib/lmsAi";
import { minWatchPercent } from "@/lib/progress";
import type { Saver } from "./useSaver";
import { Dropzone, FieldLabel, ProgressBar, Section, Toggle, inputClass } from "./ui";

const MAIN_ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.m4v,.webm,.mov,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx";

/** Pick how learners see a file from its type. */
const kindFor = (file: File): LessonMediaKind | null => {
  const t = contentTypeFor(file);
  if (t.startsWith("video/")) return "video";
  if (/pdf|powerpoint|presentation/.test(t)) return "slides";
  if (/word|excel|spreadsheet|msword/.test(t)) return "document";
  return null;
};

/** Read a local video's length before upload, so the watch rule knows the real duration. */
const readVideoDuration = (file: File) =>
  new Promise<number | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(Number.isFinite(v.duration) ? v.duration : null); };
    v.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    v.src = url;
  });

const isYouTube = (url?: string | null) => !!url && /youtube\.com|youtu\.be/.test(url);

export const LessonPanel = ({
  lesson,
  course,
  moduleTitle,
  autoFocusTitle,
  onChange,
  onDelete,
  saver,
}: {
  lesson: Lesson;
  course: Course;
  moduleTitle: string;
  autoFocusTitle: boolean;
  onChange: (patch: Partial<Lesson>) => void;
  onDelete: () => void;
  saver: Saver;
}) => {
  const [uploading, setUploading] = useState<{ label: string; percent: number } | null>(null);
  const [showEmbed, setShowEmbed] = useState(!!lesson.video_url && !lesson.media_path);
  const [aiOverview, setAiOverview] = useState(false);
  const [fetchingTranscript, setFetchingTranscript] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const resources: LessonResource[] = lesson.resources ?? [];
  const busy = !!uploading;
  const watchPct = minWatchPercent(course);

  useEffect(() => {
    if (autoFocusTitle) { titleRef.current?.focus(); titleRef.current?.select(); }
  }, [autoFocusTitle]);

  const persistNow = (patch: Partial<Lesson>) => { onChange(patch); saver.flush(); };

  const withUpload = async (file: File, purpose: "media" | "captions" | "resource") => {
    const label = `Uploading ${file.name}`;
    setUploading({ label, percent: 0 });
    try {
      return await uploadLessonFile(lesson.id, file, purpose, (percent) => setUploading({ label, percent }));
    } finally {
      setUploading(null);
    }
  };

  const uploadMain = async (file: File) => {
    const kind = kindFor(file);
    if (!kind) { toast.error("Upload a video (MP4, MOV, WebM), slides (PDF, PPTX) or a document (DOCX, XLSX)"); return; }
    try {
      const duration = kind === "video" ? await readVideoDuration(file) : null;
      const res = await withUpload(file, "media");
      const old = [lesson.media_path, kind !== "video" ? lesson.captions_path : null].filter(Boolean) as string[];
      persistNow({
        media_kind: kind, media_path: res.path, media_name: res.name, media_mime: res.mime, media_size: res.size,
        video_duration_seconds: duration,
        ...(duration && !lesson.duration_minutes ? { duration_minutes: Math.max(1, Math.round(duration / 60)) } : {}),
        ...(kind !== "video" ? { captions_path: null } : {}),
      });
      old.forEach((p) => deleteLessonFile(p).catch(() => undefined));
      setShowEmbed(false);
      toast.success(kind === "video" ? "Video uploaded" : kind === "slides" ? "Slides uploaded" : "Document uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const removeMain = () => {
    if (!lesson.media_path || !confirm(`Remove ${lesson.media_name ?? "this file"} from the lesson?`)) return;
    const old = [lesson.media_path, lesson.captions_path].filter(Boolean) as string[];
    persistNow({ media_kind: null, media_path: null, media_name: null, media_mime: null, media_size: null, captions_path: null, video_duration_seconds: null });
    old.forEach((p) => deleteLessonFile(p).catch(() => undefined));
  };

  const uploadCaptions = async (file: File) => {
    if (!/\.(vtt|srt)$/i.test(file.name)) { toast.error("Captions must be a .vtt or .srt file"); return; }
    try {
      const res = await withUpload(file, "captions");
      const old = lesson.captions_path;
      persistNow({ captions_path: res.path });
      if (old) deleteLessonFile(old).catch(() => undefined);
      toast.success("Captions added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const addResourceFile = async (file: File) => {
    try {
      const res = await withUpload(file, "resource");
      persistNow({ resources: [...resources, { label: file.name.replace(/\.[^.]+$/, ""), path: res.path, name: res.name }] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const setResources = (next: LessonResource[]) => onChange({ resources: next });
  const removeResource = (i: number) => {
    const r = resources[i];
    persistNow({ resources: resources.filter((_, j) => j !== i) });
    if (r.path) deleteLessonFile(r.path).catch(() => undefined);
  };

  // Minimal Markdown helpers for the description box.
  const wrapSelection = (before: string, after = before, placeholder = "text") => {
    const el = bodyRef.current;
    if (!el) return;
    const value = lesson.body ?? "";
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    onChange({ body: next });
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + selected.length); });
  };
  const prefixLines = (prefix: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const value = lesson.body ?? "";
    const start = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    const end = el.selectionEnd;
    const block = value.slice(start, end) || "";
    const next = value.slice(0, start) + (block ? block.split("\n").map((l) => prefix + l).join("\n") : prefix) + value.slice(end);
    onChange({ body: next });
    requestAnimationFrame(() => el.focus());
  };

  const writeOverview = async () => {
    if ((lesson.body ?? "").trim() && !confirm("Replace the current description with an AI-written overview?")) return;
    await saver.flush();
    setAiOverview(true);
    try {
      const { overview } = await generateOverview(lesson.id);
      onChange({ body: overview });
      toast.success("Overview written — edit it as you like");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not write the overview");
    } finally {
      setAiOverview(false);
    }
  };

  const fetchYouTubeTranscript = async () => {
    setFetchingTranscript(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-transcript", { body: { videoUrl: lesson.video_url } });
      if (error || data?.error) throw new Error(data?.error ?? error?.message);
      onChange({ transcript: data.transcript });
      toast.success("Transcript added from YouTube captions");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't fetch captions for this video");
    } finally {
      setFetchingTranscript(false);
    }
  };

  const MediaIcon = lesson.media_kind === "video" ? Film : lesson.media_kind === "slides" ? Presentation : FileText;

  return (
    <div className="space-y-5 pb-24">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#94a3b8]">{moduleTitle} · Lesson</p>
        <input
          ref={titleRef}
          value={lesson.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Lesson title"
          className="mt-1 w-full rounded-lg border border-transparent bg-transparent px-0 py-1 text-[28px] font-bold leading-tight tracking-tight text-[#0b0b2c] outline-none placeholder:text-[#cbd5e1] hover:border-transparent focus:border-transparent"
        />
      </div>

      {/* Main content */}
      <Section title="Lesson content" description="Upload a video, slide deck or document — or embed a link.">
        {lesson.media_path ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#f5f7ff] p-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white"><MediaIcon className="h-5 w-5 text-[#3434ff]" /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{lesson.media_name}</div>
                <div className="text-xs text-[#69697b]">
                  {formatBytes(lesson.media_size)}
                  {lesson.video_duration_seconds ? ` · ${Math.floor(lesson.video_duration_seconds / 60)}:${String(Math.round(lesson.video_duration_seconds % 60)).padStart(2, "0")}` : ""}
                  {" · "}{lesson.media_path.startsWith("s3:") ? "AWS S3" : "Secure storage"}
                </div>
              </div>
              {lesson.media_kind !== "video" && (
                <select
                  value={lesson.media_kind ?? "slides"}
                  onChange={(e) => onChange({ media_kind: e.target.value as LessonMediaKind })}
                  className="h-9 rounded-lg border border-[#e2e8f0] bg-white px-2 text-[13px]"
                  aria-label="Show file as"
                >
                  <option value="slides">Show as slides</option>
                  <option value="document">Show as document</option>
                </select>
              )}
              <label className={`cursor-pointer rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[13px] font-semibold hover:border-[#c7cdf9] ${busy ? "pointer-events-none opacity-50" : ""}`}>
                Replace
                <input type="file" accept={MAIN_ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMain(f); e.target.value = ""; }} />
              </label>
              <button onClick={removeMain} disabled={busy} className="rounded-lg px-2.5 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50">Remove</button>
            </div>
            {lesson.media_kind === "video" && (
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#69697b]">
                <Captions className="h-4 w-4" />
                {lesson.captions_path ? "Captions attached" : "No captions yet"}
                <label className={`cursor-pointer font-semibold text-[#3434ff] hover:underline ${busy ? "pointer-events-none opacity-50" : ""}`}>
                  {lesson.captions_path ? "Replace" : "Upload .vtt / .srt"}
                  <input type="file" accept=".vtt,.srt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCaptions(f); e.target.value = ""; }} />
                </label>
                {lesson.captions_path && (
                  <button className="font-semibold text-red-600 hover:underline" onClick={() => { const old = lesson.captions_path!; persistNow({ captions_path: null }); deleteLessonFile(old).catch(() => undefined); }}>Remove</button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Dropzone
              accept={MAIN_ACCEPT}
              onFile={uploadMain}
              disabled={busy}
              title="Drop a video, slides or document here — or click to browse"
              hint="Video up to 5 GB (MP4, MOV, WebM) · Slides & documents up to 50 MB (PDF, PPTX, DOCX)"
            />
            {!showEmbed ? (
              <button onClick={() => setShowEmbed(true)} className="text-[13px] font-semibold text-[#3434ff] hover:underline">Embed from YouTube, Vimeo, Loom, Google Slides or Canva instead</button>
            ) : (
              <div>
                <FieldLabel hint="YouTube, Vimeo, Loom, Google Slides/Docs, Canva">Embed link</FieldLabel>
                <input value={lesson.video_url ?? ""} onChange={(e) => onChange({ video_url: e.target.value || null })} placeholder="https://youtu.be/…" className={inputClass} />
              </div>
            )}
          </div>
        )}
        {uploading && <div className="mt-3"><ProgressBar label={uploading.label} percent={uploading.percent} /></div>}
      </Section>

      {/* Progress rule */}
      <Toggle
        checked={lesson.enforce_progress !== false}
        onChange={(v) => onChange({ enforce_progress: v })}
        label="Learners must complete this lesson before moving on"
        description={
          lesson.enforce_progress !== false
            ? `Later lessons stay locked until this one is complete. Videos must be watched to ${watchPct}% (skipping ahead doesn't count).`
            : "Optional lesson — learners can skip it, and it doesn't block the quiz or certificate."
        }
      />

      {/* Description */}
      <Section
        title="Description"
        description="Shown under the lesson as the Overview."
        action={
          <button
            onClick={writeOverview}
            disabled={aiOverview || !(lesson.transcript ?? "").trim()}
            title={(lesson.transcript ?? "").trim() ? "Write an overview from the transcript" : "Add a transcript first (under More options)"}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-[13px] font-semibold text-[#0b0b2c] hover:border-[#c7cdf9] disabled:opacity-40"
          >
            {aiOverview ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-[#8ab815]" />} Write with AI
          </button>
        }
      >
        <div className="overflow-hidden rounded-lg border border-[#e2e8f0] focus-within:border-[#3434ff] focus-within:ring-4 focus-within:ring-[#3434ff]/10">
          <div className="flex gap-0.5 border-b border-[#eef1f6] bg-[#fafbff] px-1.5 py-1">
            {[
              { icon: Bold, label: "Bold", run: () => wrapSelection("**") },
              { icon: Heading2, label: "Heading", run: () => prefixLines("### ") },
              { icon: List, label: "Bullet list", run: () => prefixLines("- ") },
              { icon: LinkIcon, label: "Link", run: () => wrapSelection("[", "](https://)", "link text") },
            ].map(({ icon: I, label, run }) => (
              <button key={label} type="button" onClick={run} title={label} aria-label={label} className="rounded p-1.5 text-[#69697b] hover:bg-white hover:text-[#0b0b2c]"><I className="h-4 w-4" /></button>
            ))}
          </div>
          <textarea
            ref={bodyRef}
            rows={8}
            value={lesson.body ?? ""}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder="What will learners get from this lesson?"
            className="block w-full resize-y border-0 px-3.5 py-3 text-sm leading-relaxed text-[#0b0b2c] outline-none"
          />
        </div>
      </Section>

      {/* Downloads */}
      <Section title="Downloads & links" description="Workbooks, templates, checklists or useful links.">
        {resources.length > 0 && (
          <ul className="mb-3 divide-y divide-[#f1f5f9] rounded-xl border border-[#e2e8f0]">
            {resources.map((r, i) => (
              <li key={i} className="flex items-center gap-2 px-3 py-2">
                {r.path ? <Paperclip className="h-4 w-4 shrink-0 text-[#69697b]" /> : <ExternalLink className="h-4 w-4 shrink-0 text-[#69697b]" />}
                <input
                  value={r.label}
                  onChange={(e) => setResources(resources.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  placeholder="Label"
                  className="min-w-0 flex-1 rounded border border-transparent px-1.5 py-1 text-sm font-medium outline-none hover:border-[#e2e8f0] focus:border-[#3434ff]"
                />
                {r.path ? (
                  <span className="hidden max-w-[200px] truncate text-xs text-[#94a3b8] sm:inline">{r.name}</span>
                ) : (
                  <input
                    value={r.url ?? ""}
                    onChange={(e) => setResources(resources.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                    placeholder="https://…"
                    className="min-w-0 flex-1 rounded border border-transparent px-1.5 py-1 text-xs text-[#69697b] outline-none hover:border-[#e2e8f0] focus:border-[#3434ff]"
                  />
                )}
                <button onClick={() => removeResource(i)} disabled={busy} className="rounded p-1 text-[#94a3b8] hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${r.label}`}><X className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Dropzone accept="*/*" onFile={addResourceFile} disabled={busy} compact title="Add a file" hint="PDF, Word, Excel, images, ZIP · up to 50 MB" />
          <button onClick={() => setResources([...resources, { label: "", url: "" }])} className="rounded-xl border border-[#e2e8f0] px-4 py-3 text-[13px] font-semibold text-[#0b0b2c] hover:border-[#c7cdf9]">
            <LinkIcon className="mx-auto mb-1 h-4 w-4 text-[#3434ff]" /> Add link
          </button>
        </div>
      </Section>

      {/* More options */}
      <details className="group rounded-2xl border border-[#e2e8f0] bg-white">
        <summary className="cursor-pointer list-none px-6 py-4 text-[15px] font-bold marker:hidden">
          More options <span className="ml-1 text-[13px] font-normal text-[#69697b]">— transcript and duration</span>
        </summary>
        <div className="space-y-4 border-t border-[#f1f5f9] px-6 py-5">
          <div className="max-w-[200px]">
            <FieldLabel hint="shown to learners">Duration (minutes)</FieldLabel>
            <input type="number" min={0} value={lesson.duration_minutes ?? ""} onChange={(e) => onChange({ duration_minutes: e.target.value ? Number(e.target.value) : null })} className={inputClass} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <FieldLabel hint="shown in the Transcript tab; also used by AI">Transcript</FieldLabel>
              {isYouTube(lesson.video_url) && !lesson.media_path && (
                <button onClick={fetchYouTubeTranscript} disabled={fetchingTranscript} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3434ff] hover:underline disabled:opacity-50">
                  {fetchingTranscript ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Get from YouTube captions
                </button>
              )}
            </div>
            <textarea rows={8} value={lesson.transcript ?? ""} onChange={(e) => onChange({ transcript: e.target.value })} placeholder="Paste the lesson transcript" className={`${inputClass} resize-y leading-relaxed`} />
          </div>
        </div>
      </details>

      <div className="flex justify-between pt-2">
        <a href={`/learn/${course.slug}/lesson/${lesson.id}`} target="_blank" rel="noopener noreferrer" onClick={() => saver.flush()} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3434ff] hover:underline">
          Preview this lesson <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" /> Delete lesson
        </button>
      </div>
    </div>
  );
};
