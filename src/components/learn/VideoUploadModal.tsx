import { useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadVideoToS3 } from "../../utils/s3Upload";

export function VideoUploadModal({ onClose, onUploadComplete }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Please drop a video file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid video file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadVideoToS3(file, (percent) => setProgress(percent));
      onUploadComplete?.(url, file.name);
      setFile(null);
      setProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,11,44,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "40px", maxWidth: "500px", width: "90%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Upload video</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={24} />
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: "2px dashed #cbd5e1",
            borderRadius: "12px",
            padding: "40px 20px",
            textAlign: "center",
            background: "#f8fafc",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => document.getElementById("videoInput")?.click()}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>📹</div>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>Drag & drop your video</div>
          <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>or click to browse</div>
          <input
            id="videoInput"
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>

        {file && (
          <div style={{ marginTop: "20px", padding: "16px", background: "#f8fafc", borderRadius: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>{file.name}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        )}

        {uploading && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ height: "8px", background: "#eef1f6", borderRadius: "999px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: "#3434ff",
                  width: `${progress}%`,
                  transition: "width 0.2s",
                }}
              />
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px", textAlign: "center" }}>
              {progress}% uploaded
            </div>
          </div>
        )}

        {error && <div style={{ marginTop: "12px", padding: "12px", background: "#fee2e2", borderRadius: "8px", fontSize: "13px", color: "#dc2626" }}>{error}</div>}

        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#0b0b2c",
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 700,
              borderRadius: "8px",
              padding: "12px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              flex: 1,
              border: "0",
              background: file && !uploading ? "#3434ff" : "#e2e8f0",
              color: file && !uploading ? "#fff" : "#94a3b8",
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 700,
              borderRadius: "8px",
              padding: "12px",
              cursor: file && !uploading ? "pointer" : "not-allowed",
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
