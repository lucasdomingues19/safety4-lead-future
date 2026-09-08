import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useLessonVideo = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = async (
    file: File,
    courseId: string,
    lessonId: string,
    onProgress?: (progress: number) => void
  ): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${lessonId}.${fileExt}`;
      const filePath = `${courseId}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("video-lessons")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        setError(uploadError.message);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("video-lessons").getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadVideo, uploading, error };
};
