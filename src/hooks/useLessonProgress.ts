import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LessonProgress } from "@/lib/lms";

export const useLessonProgress = (userId: string | undefined, lessonId: string | undefined) => {
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !lessonId) return;

    const loadProgress = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: err } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("lesson_id", lessonId)
          .maybeSingle();

        if (err) throw err;
        setProgress((data as LessonProgress) || null);
      } catch (err) {
        console.error("Error loading progress:", err);
        setError(err instanceof Error ? err.message : "Failed to load progress");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [userId, lessonId]);

  const updateProgress = useCallback(
    async (watchDurationSeconds: number, isCompleted: boolean): Promise<LessonProgress | null> => {
      if (!userId || !lessonId) return null;

      try {
        const { data, error: err } = await supabase
          .from("lesson_progress")
          .upsert(
            {
              user_id: userId,
              lesson_id: lessonId,
              watch_duration_seconds: watchDurationSeconds,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,lesson_id" }
          )
          .select()
          .single();

        if (err) throw err;
        setProgress((data as LessonProgress) || null);
        return (data as LessonProgress) || null;
      } catch (err) {
        console.error("Error updating progress:", err);
        setError(err instanceof Error ? err.message : "Failed to update progress");
        return null;
      }
    },
    [userId, lessonId]
  );

  return { progress, loading, error, updateProgress };
};
