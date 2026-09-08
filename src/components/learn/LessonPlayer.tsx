import { useState } from "react";
import { PlayCircle, CheckCircle2, Volume2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lesson } from "@/lib/lms";
import { useLessonProgress } from "@/hooks/useLessonProgress";

interface LessonPlayerProps {
  lesson: Lesson;
  userId: string;
  onComplete?: () => void;
}

export const LessonPlayer = ({ lesson, userId, onComplete }: LessonPlayerProps) => {
  const { progress, updateProgress } = useLessonProgress(userId, lesson.id);
  const [watchTime, setWatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoDuration = lesson.video_duration_seconds || 0;
  const watchPercent = videoDuration > 0 ? Math.round((watchTime / videoDuration) * 100) : 0;
  const isWatched = watchPercent >= 80;

  const handleMarkComplete = async () => {
    if (isWatched) {
      await updateProgress(watchTime, true);
      onComplete?.();
    }
  };

  if (!lesson.video_url) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg bg-white/5">
        <div className="text-center">
          <p className="text-white/60">No video available for this lesson</p>
          {lesson.content && (
            <p className="mt-2 text-sm text-white/40">Check the lesson content below</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
        <iframe
          src={lesson.video_url}
          className="h-full w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={lesson.title}
        />
      </div>

      {/* Progress Tracking */}
      {lesson.video_duration_seconds && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Watch progress</span>
            <span className="text-white">{watchPercent}%</span>
          </div>
          <Progress value={watchPercent} className="h-2" />
          <p className="text-xs text-white/40">
            Watch 80% of this lesson to mark it complete
          </p>
        </div>
      )}

      {/* Completion Status */}
      {progress?.is_completed ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-900/20 px-4 py-3 text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <span>Lesson completed</span>
        </div>
      ) : isWatched ? (
        <Button
          onClick={handleMarkComplete}
          variant="default"
          className="w-full"
          size="lg"
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Mark as Complete
        </Button>
      ) : (
        <div className="rounded-lg bg-white/5 px-4 py-3">
          <p className="text-sm text-white/60">
            Watch the full video to unlock certificate credit
          </p>
        </div>
      )}

      {/* Lesson Content */}
      {lesson.content && (
        <div className="prose prose-invert max-w-none rounded-lg bg-white/5 p-4">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
      )}
    </div>
  );
};
