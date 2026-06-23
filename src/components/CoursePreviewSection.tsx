import { useState } from "react";
import { Play, Zap, Shield, Award } from "lucide-react";
import { VideoPreviewModal } from "./VideoPreviewModal";

const videoPreviewData = [
  {
    id: "safety-40",
    title: "What is Safety 4.0?",
    description: "Discover how digital transformation is revolutionizing workplace safety. Learn about IoT sensors, AI-powered risk assessment, and how Safety 4.0 creates proactive, data-driven safety cultures that prevent incidents before they happen.",
    shortDescription: "Understand the fundamentals of digital safety transformation",
    icon: Play,
    ytId: "OsKsyXCx8pc",
  },
  {
    id: "why-matters",
    title: "Why this course matter?",
    description: "In today's rapidly evolving workplace, traditional safety approaches are no longer sufficient. This course positions you at the forefront of safety innovation, making you invaluable to organizations seeking digital transformation leaders.",
    shortDescription: "Discover why Safety 4.0 is essential for your career growth",
    icon: Zap,
    ytId: "0BkOP_bW6lo",
  },
  {
    id: "what-learn",
    title: "What you'll learn",
    description: "Master cutting-edge competencies including AI-powered incident prediction, IoT implementation strategies, digital risk assessment frameworks, and leadership techniques for managing technological change in safety-critical environments.",
    shortDescription: "Key competencies and skills you'll master in this program",
    icon: Shield,
    ytId: "YVwZelIBSRc",
  },
  {
    id: "iosh-cpd",
    title: "About IOSH & CPD",
    description: "Learn about our prestigious IOSH approval and CPD accreditation. Understand how this certification elevates your professional standing, meets continuing professional development requirements, and opens doors to advanced career opportunities.",
    shortDescription: "Learn about our accreditations and professional recognition",
    icon: Award,
    ytId: "o71mLFPVQzo",
  },
];

export const CoursePreviewSection = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    title: string;
    description: string;
    url?: string;
  } | null>(null);

  const handleVideoPreview = (video: typeof videoPreviewData[0]) => {
    setSelectedVideo({
      title: video.title,
      description: video.description,
      url: `https://www.youtube.com/embed/${video.ytId}?autoplay=1&mute=1&loop=1&playlist=${video.ytId}`,
    });
    setVideoModalOpen(true);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-6 md:mb-8">
            <span className="text-lime-400">Course Preview</span>
          </h2>
        </div>
        <div className="max-w-7xl mx-auto mb-8 md:mb-12">
          <p className="text-base md:text-xl text-gray-300 leading-relaxed text-justify">
            Professionally recorded in a studio, featuring over 60 high-quality video lessons for a premium learning experience. Designed by trusted educators and built on proven learning methods, the course makes SafetyTech and AI accessible, practical, and easy to understand for EHS professionals at any stage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {videoPreviewData.map((video) => (
            <div
              key={video.id}
              className="bg-white/[0.06] backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-primary/40 transition-all duration-300 cursor-pointer group"
              onClick={() => handleVideoPreview(video)}
            >
              <div className="relative aspect-video rounded-xl mb-4 overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&mute=1&loop=1&playlist=${video.ytId}&controls=0&modestbranding=1&rel=0&playsinline=1`}
                  title={`${video.title} video preview`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1.5 group-hover:text-primary transition-colors">{video.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{video.shortDescription}</p>
              <div className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                <Play className="w-3 h-3 mr-1" />
                Click to preview
              </div>
            </div>
          ))}


        </div>
      </div>

      <VideoPreviewModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoTitle={selectedVideo?.title || ""}
        videoDescription={selectedVideo?.description || ""}
        videoUrl={selectedVideo?.url}
      />
    </section>
  );
};
