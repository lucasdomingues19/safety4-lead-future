import { useState } from "react";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLessonVideo } from "@/hooks/useLessonVideo";

interface VideoUploadFormProps {
  courseId: string;
  lessonId: string;
  onUploadComplete: (videoUrl: string) => void;
}

export const VideoUploadForm = ({
  courseId,
  lessonId,
  onUploadComplete,
}: VideoUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { uploadVideo, uploading, error } = useLessonVideo();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const droppedFile = files[0];
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile);
      } else {
        toast.error("Please drop a video file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a video file");
      return;
    }

    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > maxSize) {
      toast.error("Video file must be smaller than 5GB");
      return;
    }

    const videoUrl = await uploadVideo(file, courseId, lessonId);

    if (videoUrl) {
      toast.success("Video uploaded successfully!");
      onUploadComplete(videoUrl);
      setFile(null);
    } else {
      toast.error(error || "Failed to upload video");
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/10"
            : "border-white/20 bg-white/5 hover:border-white/40"
        }`}
      >
        <Upload className="mx-auto h-8 w-8 text-white/60 mb-3" />
        <p className="text-sm text-white/60">
          Drag and drop your video here, or{" "}
          <label className="cursor-pointer text-primary hover:underline">
            click to select
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-xs text-white/40 mt-1">MP4, WebM, OGG • Max 5GB</p>
      </div>

      {/* Selected File Info */}
      {file && (
        <div className="rounded-lg bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {file.name}
              </p>
              <p className="text-xs text-white/60 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              disabled={uploading}
              className="text-xs text-white/40 hover:text-white/60 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-500/50 p-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        size="lg"
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            Upload Video
          </>
        )}
      </Button>

      {/* Info Text */}
      {!file && !uploading && (
        <p className="text-xs text-white/40 text-center">
          Videos are stored in Supabase Storage and streamed via CDN
        </p>
      )}
    </div>
  );
};
