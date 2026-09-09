import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_S3_REGION || "eu-north-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadVideoToS3(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const Key = `videos/${fileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: import.meta.env.VITE_AWS_S3_BUCKET || "safetytech-videos",
      Key,
      Body: file,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const videoUrl = `https://${import.meta.env.VITE_AWS_S3_BUCKET}.s3.${import.meta.env.VITE_AWS_S3_REGION}.amazonaws.com/${Key}`;
    return videoUrl;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload video to S3");
  }
}

export function getS3VideoUrl(key: string): string {
  return `https://${import.meta.env.VITE_AWS_S3_BUCKET}.s3.${import.meta.env.VITE_AWS_S3_REGION}.amazonaws.com/${key}`;
}
