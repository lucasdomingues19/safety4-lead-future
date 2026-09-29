// Lesson progression: watch-time heartbeats and server-checked completion.
// Rules live in the database (lesson_lock_reason / complete_lesson); this file
// mirrors them only to drive the UI (locks, disabled buttons, progress text).
import { supabase } from "@/integrations/supabase/client";
import type { Course, Lesson, Module } from "@/lib/lms";

export const DEFAULT_MIN_WATCH_PERCENT = 90;

export const minWatchPercent = (course: Pick<Course, "playback_settings"> | null | undefined): number => {
  const raw = (course?.playback_settings as { min_watch_percent?: number } | null | undefined)?.min_watch_percent;
  return typeof raw === "number" && raw >= 0 && raw <= 100 ? raw : DEFAULT_MIN_WATCH_PERCENT;
};

/** Mirrors complete_lesson(): which lessons count as videos for the watch rule. */
export const isVideoLesson = (lesson: Pick<Lesson, "media_kind" | "media_path" | "video_url">) =>
  lesson.media_kind === "video" ||
  (!lesson.media_path && /(youtube\.com|youtu\.be|vimeo\.com|\.(mp4|webm|mov|m4v)(\?|#|$))/i.test(lesson.video_url ?? ""));

/** Lessons in course order (module position, lesson position, id) — same order the server uses. */
export const courseOrder = (modules: Module[], lessons: Lesson[]) => {
  const mpos = new Map(modules.map((m) => [m.id, m.position]));
  return [...lessons].sort(
    (a, b) =>
      (mpos.get(a.module_id) ?? 0) - (mpos.get(b.module_id) ?? 0) ||
      a.position - b.position ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
};

/** Ids of lessons that are locked because an earlier required lesson isn't complete. */
export const lockedLessonIds = (ordered: Lesson[], completed: Set<string>) => {
  const locked = new Set<string>();
  let blocked = false;
  for (const l of ordered) {
    if (blocked) locked.add(l.id);
    if (l.enforce_progress !== false && !completed.has(l.id)) blocked = true;
  }
  return locked;
};

export const recordWatch = async (lessonId: string, watched: number, duration: number): Promise<number | null> => {
  const { data, error } = await supabase.rpc("record_lesson_watch", {
    _lesson_id: lessonId,
    _watched: Math.round(watched * 10) / 10,
    _duration: Math.round(duration * 10) / 10,
  });
  if (error) {
    console.warn("watch heartbeat failed", error.message);
    return null;
  }
  return Number(data);
};

/** reason: "watch" | "previous_incomplete" | "not_enrolled" | "drip" | "not_found" | "not_authenticated" */
export interface CompleteResult {
  ok: boolean;
  reason?: string;
  watched?: number;
  required?: number;
}

export const completeLesson = async (lessonId: string): Promise<CompleteResult> => {
  const { data, error } = await supabase.rpc("complete_lesson", { _lesson_id: lessonId });
  if (error) throw error;
  return data as unknown as CompleteResult;
};

export const lockMessage = (reason: string) =>
  reason === "previous_incomplete"
    ? "Finish the previous lessons first"
    : reason === "drip"
      ? "This module hasn't been released yet"
      : reason === "not_enrolled"
        ? "You don't have active access to this course"
        : "This lesson can't be completed yet";
