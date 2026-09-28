// Shared types and helpers for the learning platform (LMS).

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructor_id: string | null;
  price_cents: number | null;
  currency: string;
  stripe_product_id: string | null;
  cover_image_url: string | null;
  cpd_hours: number | null;
  published: boolean;
  published_at: string | null;
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

export interface LessonResource {
  label: string;
  url: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  video_url: string | null;
  body: string | null;
  transcript: string | null;
  resources: LessonResource[] | null;
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

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string | null;
  issued_at: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  module_id: string;
  title: string;
  pass_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  prompt: string;
  options: string[];
  correct_index: number;
  position: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  started_at: string;
  submitted_at: string | null;
  created_at: string;
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

/**
 * Convert any common video URL into an embeddable iframe src.
 * Supports YouTube, Vimeo, and direct iframe/embed URLs (Mux, Bunny, etc.).
 */
export const toEmbedUrl = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  const url = raw.trim();

  // YouTube
  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  }

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  // Assume it is already an embeddable URL (Mux, Bunny, custom iframe src)
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
