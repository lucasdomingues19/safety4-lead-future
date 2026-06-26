// Shared types and helpers for the learning platform (LMS).

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  price_cents: number;
  currency: string;
  cpd_hours: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  drip_days: number;
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
  position: number;
  video_url: string | null;
  body: string | null;
  resources: LessonResource[];
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
}

export interface Quiz {
  id: string;
  module_id: string;
  title: string;
  pass_threshold: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  prompt: string;
  options: string[];
  correct_index: number;
  position: number;
}

/** Normalize raw lesson rows (resources comes back as Json) into typed Lessons. */
export const asLessons = (rows: unknown[] | null | undefined): Lesson[] =>
  ((rows ?? []) as Record<string, unknown>[]).map((r) => ({
    ...(r as unknown as Lesson),
    resources: Array.isArray(r.resources) ? (r.resources as LessonResource[]) : [],
  }));

/** Normalize raw quiz question rows (options comes back as Json). */
export const asQuizQuestions = (rows: unknown[] | null | undefined): QuizQuestion[] =>
  ((rows ?? []) as Record<string, unknown>[]).map((r) => ({
    ...(r as unknown as QuizQuestion),
    options: Array.isArray(r.options) ? (r.options as string[]) : [],
  }));

/** Format a price in minor units to a localized currency string. */
export const formatPrice = (cents: number, currency = "GBP"): string => {
  if (!cents) return "Free";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `£${(cents / 100).toFixed(0)}`;
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
