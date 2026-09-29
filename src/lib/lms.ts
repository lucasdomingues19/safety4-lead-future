// Shared types and helpers for the learning platform (LMS).
export type { Quiz, QuizQuestion, QuizAttempt } from "./quiz";
import type { QuizQuestion } from "./quiz";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_cents: number | null;
  currency: string;
  cover_image_url: string | null;
  cpd_hours: number | null;
  published: boolean;
  playback_settings?: unknown;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  drip_days?: number;
  created_at: string;
  updated_at: string;
}

/** A lesson resource is either an external link (url) or an uploaded file (path). */
export interface LessonResource {
  label: string;
  url?: string;
  path?: string;
  name?: string;
}

export type LessonMediaKind = "video" | "slides" | "document";

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  video_url: string | null;
  body: string | null;
  transcript: string | null;
  resources: LessonResource[] | null;
  media_kind: LessonMediaKind | null;
  media_path: string | null;
  media_name: string | null;
  media_mime: string | null;
  media_size: number | null;
  captions_path: string | null;
  position: number;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  stripe_subscription_id: string | null;
  status: "active" | "cancelled" | "expired";
  enrolled_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  watch_duration_seconds: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Normalize raw lesson rows to add computed duration_minutes field. */
export const asLessons = (rows: unknown[] | null | undefined): Lesson[] =>
  (rows ?? []) as unknown as Lesson[];

/** Normalize raw quiz question rows. */
export const asQuizQuestions = (rows: unknown[] | null | undefined): QuizQuestion[] =>
  (rows ?? []) as unknown as QuizQuestion[];

/** Format a price (in cents) to a localized currency string. */
export const formatPrice = (priceCents: number | null | undefined, currency = "GBP"): string => {
  if (!priceCents || priceCents <= 0) return "Free";
  try {
    const priceInUnits = priceCents / 100;
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(priceInUnits);
  } catch {
    return `£${(priceCents / 100).toFixed(0)}`;
  }
};

/** Links that must be shown in an iframe (players, slide decks, docs) rather than a <video> tag. */
export const isIframeEmbed = (url: string) =>
  /youtube\.com|youtu\.be|vimeo\.com|docs\.google\.com|drive\.google\.com|canva\.com|onedrive\.live\.com|sharepoint\.com|loom\.com|\.pdf(\?|#|$)/i.test(url);

/**
 * Convert any common video / slide URL into an embeddable iframe src.
 * Supports YouTube, Vimeo, Loom, Google Slides/Docs/Drive, Canva, and direct
 * iframe/embed URLs (Mux, Bunny, etc.).
 */
export const toEmbedUrl = (raw: string | null | undefined, opts: { captions?: boolean } = {}): string | null => {
  if (!raw) return null;
  const url = raw.trim();

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1${opts.captions ? "&cc_load_policy=1&cc_lang_pref=en" : ""}`;
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}${opts.captions ? "?texttrack=en" : ""}`;
  }

  const gdoc = url.match(/docs\.google\.com\/(presentation|document|spreadsheets)\/d\/([\w-]+)/);
  if (gdoc) {
    return gdoc[1] === "presentation"
      ? `https://docs.google.com/presentation/d/${gdoc[2]}/embed?start=false&loop=false`
      : `https://docs.google.com/${gdoc[1]}/d/${gdoc[2]}/preview`;
  }

  const gdrive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (gdrive) return `https://drive.google.com/file/d/${gdrive[1]}/preview`;

  const canva = url.match(/canva\.com\/design\/([\w-]+)\/([\w-]+)/);
  if (canva) return `https://www.canva.com/design/${canva[1]}/${canva[2]}/view?embed`;

  const loom = url.match(/loom\.com\/share\/([\w-]+)/);
  if (loom) return `https://www.loom.com/embed/${loom[1]}`;

  return url;
};

/** Whether a module is unlocked for a student given their enrolment date. */
export const isModuleUnlocked = (
  module: Pick<Module, "drip_days">,
  enrolledAt: string | null | undefined,
): boolean => {
  if (!module.drip_days || module.drip_days <= 0) return true;
  if (!enrolledAt) return false;
  const unlockTime =
    new Date(enrolledAt).getTime() + module.drip_days * 24 * 60 * 60 * 1000;
  return Date.now() >= unlockTime;
};
