import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoUploadForm } from "@/components/learn/VideoUploadForm";
import { LessonPlayer } from "@/components/learn/LessonPlayer";
import { Lesson } from "@/lib/lms";

const Phase2Test = () => {
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  // Mock lesson for testing LessonPlayer
  const mockLesson: Lesson = {
    id: "test-lesson-1",
    module_id: "test-module-1",
    title: "Phase 2 Test Lesson",
    description: "Testing video upload and playback",
    video_url: uploadedVideoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
    video_duration_seconds: uploadedVideoUrl ? 300 : 213,
    content: "<h2>Welcome!</h2><p>This is a test lesson. Upload a video above or use the YouTube placeholder to test the player.</p>",
    position: 1,
    is_locked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Phase 2: Video Upload & Playback</h1>
          <p className="text-white/60">Test the LMS video components live</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload">Video Upload</TabsTrigger>
            <TabsTrigger value="player">Lesson Player</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Test Video Upload</CardTitle>
                <CardDescription>
                  Upload a video to Supabase Storage and test the component
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VideoUploadForm
                  courseId="test-course"
                  lessonId="test-lesson-1"
                  onUploadComplete={(url) => {
                    setUploadedVideoUrl(url);
                    console.log("Video uploaded:", url);
                  }}
                />
              </CardContent>
            </Card>

            {uploadedVideoUrl && (
              <Card className="bg-green-900/20 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-green-400">✅ Upload Successful!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/80 break-all font-mono">
                    {uploadedVideoUrl}
                  </p>
                  <p className="text-xs text-white/60 mt-2">
                    Switch to "Lesson Player" tab to watch your video →
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="player" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Lesson Player</CardTitle>
                <CardDescription>
                  {uploadedVideoUrl
                    ? "Playing your uploaded video"
                    : "Playing YouTube placeholder video"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LessonPlayer
                  lesson={mockLesson}
                  userId="test-user"
                  onComplete={() => console.log("Lesson completed!")}
                />
              </CardContent>
            </Card>

            <Card className="bg-blue-900/20 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-blue-400">Testing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-white/80">
                <p>✓ Try uploading an MP4 video file (max 5GB)</p>
                <p>✓ Watch ~80% of the video</p>
                <p>✓ Click "Mark as Complete" button</p>
                <p>✓ Check Supabase dashboard → lesson_progress table for saved data</p>
                <p>✓ Refresh page - progress should persist from database</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Phase2Test;
