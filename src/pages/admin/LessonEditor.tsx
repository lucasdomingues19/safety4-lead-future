import { useState } from "react";
import { Upload, FileText, Zap, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function LessonEditor({ lessonId }: { lessonId: string }) {
  const [lesson, setLesson] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [transcript, setTranscript] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Upload video to S3
  const uploadVideo = async (file: File) => {
    setUploading(true);
    try {
      const { data, error } = await supabase.storage
        .from("lesson-videos")
        .upload(`${lessonId}/${file.name}`, file);

      if (error) throw error;

      const url = supabase.storage.from("lesson-videos").getPublicUrl(data.path).data.publicUrl;
      setVideoUrl(url);

      await supabase.from("lessons").update({ video_url: url }).eq("id", lessonId);
      toast.success("Video uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Upload resource
  const uploadResource = async (file: File) => {
    setUploading(true);
    try {
      const { data, error } = await supabase.storage
        .from("lesson-resources")
        .upload(`${lessonId}/${file.name}`, file);

      if (error) throw error;

      const url = supabase.storage.from("lesson-resources").getPublicUrl(data.path).data.publicUrl;
      const newResource = { id: Date.now(), name: file.name, url, type: file.type };

      setResources([...resources, newResource]);
      toast.success("Resource added!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Generate transcript with AI
  const generateTranscript = async () => {
    if (!videoUrl) {
      toast.error("Upload video first");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-transcript", {
        body: { videoUrl, lessonId },
      });

      if (error) throw error;

      setTranscript(data.transcript);
      await supabase.from("lessons").update({ transcript: data.transcript }).eq("id", lessonId);
      toast.success("Transcript generated!");
    } catch (err) {
      toast.error("Transcript generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px" }}>Edit Lesson Content</h1>

      {/* Video Upload */}
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Upload size={20} />
          <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Upload Video</h2>
        </div>
        <p style={{ color: "#69697b", marginBottom: "16px" }}>Supports MP4, WebM, or embed URLs (YouTube, Vimeo, Mux)</p>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])}
          disabled={uploading}
          style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", width: "100%", cursor: "pointer" }}
        />
        {videoUrl && <p style={{ color: "#16a34a", marginTop: "12px" }}>✓ Video: {videoUrl.split("/").pop()}</p>}
      </div>

      {/* AI Transcript */}
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Zap size={20} />
          <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>AI Transcript</h2>
        </div>
        <p style={{ color: "#69697b", marginBottom: "16px" }}>Auto-generate transcript from video using OpenAI Whisper</p>
        <button
          onClick={generateTranscript}
          disabled={generating || !videoUrl}
          style={{ padding: "10px 20px", background: generating ? "#ccc" : "#3434ff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
        >
          {generating ? "Generating..." : "Generate Transcript"}
        </button>
        {transcript && (
          <div style={{ marginTop: "16px", padding: "16px", background: "#f5f7fa", borderRadius: "8px", maxHeight: "200px", overflow: "auto" }}>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: "#0b0b2c" }}>{transcript}</p>
          </div>
        )}
      </div>

      {/* Resources */}
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <FileText size={20} />
          <h2 style={{ fontSize: "18px", fontWeight: 600", margin: 0 }}>Course Resources</h2>
        </div>
        <p style={{ color: "#69697b", marginBottom: "16px" }}>Upload PDFs, slides, workbooks, and other materials</p>
        <input
          type="file"
          accept=".pdf,.docx,.pptx,.xlsx,.txt"
          onChange={(e) => e.target.files?.[0] && uploadResource(e.target.files[0])}
          disabled={uploading}
          style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", width: "100%", marginBottom: "16px", cursor: "pointer" }}
        />
        <div style={{ display: "grid", gap: "8px" }}>
          {resources.map((res) => (
            <div key={res.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "#f5f7fa", borderRadius: "8px" }}>
              <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ color: "#3434ff", textDecoration: "none", fontWeight: 500 }}>
                📄 {res.name}
              </a>
              <button onClick={() => setResources(resources.filter((r) => r.id !== res.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
