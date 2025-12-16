import { useState } from "react";
import { Play, Zap, Shield, Award } from "lucide-react";
import { VideoPreviewModal } from "./VideoPreviewModal";

export const CoursePreviewSection = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    title: string;
    description: string;
    url?: string;
  } | null>(null);

  const videoPreviewData = [
    {
      id: "safety-40",
      title: "What is Safety 4.0?",
      description: "Discover how digital transformation is revolutionizing workplace safety. Learn about IoT sensors, AI-powered risk assessment, and how Safety 4.0 creates proactive, data-driven safety cultures that prevent incidents before they happen.",
      shortDescription: "Understand the fundamentals of digital safety transformation",
      icon: Play,
      gradient: "from-pink-500/20 to-purple-500/20",
    },
    {
      id: "why-matters",
      title: "Why this course matter?",
      description: "In today's rapidly evolving workplace, traditional safety approaches are no longer sufficient. This course positions you at the forefront of safety innovation, making you invaluable to organizations seeking digital transformation leaders.",
      shortDescription: "Discover why Safety 4.0 is essential for your career growth",
      icon: Zap,
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      id: "what-learn",
      title: "What you'll learn",
      description: "Master cutting-edge competencies including AI-powered incident prediction, IoT implementation strategies, digital risk assessment frameworks, and leadership techniques for managing technological change in safety-critical environments.",
      shortDescription: "Key competencies and skills you'll master in this program",
      icon: Shield,
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      id: "iosh-cpd",
      title: "About IOSH & CPD",
      description: "Learn about our prestigious IOSH approval and CPD accreditation. Understand how this certification elevates your professional standing, meets continuing professional development requirements, and opens doors to advanced career opportunities.",
      shortDescription: "Learn about our accreditations and professional recognition",
      icon: Award,
      gradient: "from-yellow-500/20 to-orange-500/20",
    }
  ];

  const handleVideoPreview = (video: typeof videoPreviewData[0]) => {
    let videoUrl: string | undefined;
    
    if (video.id === "safety-40") {
      videoUrl = "https://www.youtube.com/embed/OsKsyXCx8pc?autoplay=1&mute=1&loop=1&playlist=OsKsyXCx8pc";
    } else if (video.id === "iosh-cpd") {
      videoUrl = "https://www.youtube.com/embed/o71mLFPVQzo?autoplay=1&mute=1&loop=1&playlist=o71mLFPVQzo";
    }
    
    setSelectedVideo({
      title: video.title,
      description: video.description,
      url: videoUrl
    });
    setVideoModalOpen(true);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Black to dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-600/20 to-violet-500/15 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-white mb-12">
          Course <span className="text-pink-500">Preview</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {videoPreviewData.map((video) => {
            const IconComponent = video.icon;
            return (
              <div 
                key={video.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-pink-400/50 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl"
                onClick={() => handleVideoPreview(video)}
              >
                {(video.id === "iosh-cpd" || video.id === "safety-40" || video.id === "why-matters" || video.id === "what-learn") ? (
                  <div className="relative aspect-video rounded-xl mb-4 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    <iframe
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      src={`https://www.youtube.com/embed/${video.id === 'iosh-cpd' ? 'o71mLFPVQzo' : video.id === 'safety-40' ? 'OsKsyXCx8pc' : video.id === 'why-matters' ? '0BkOP_bW6lo' : 'YVwZelIBSRc'}?autoplay=1&mute=1&loop=1&playlist=${video.id === 'iosh-cpd' ? 'o71mLFPVQzo' : video.id === 'safety-40' ? 'OsKsyXCx8pc' : video.id === 'why-matters' ? '0BkOP_bW6lo' : 'YVwZelIBSRc'}&controls=0&modestbranding=1&rel=0&playsinline=1`}
                      title={`${video.title} video preview`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className={`aspect-video bg-gradient-to-br ${video.gradient} rounded-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <div className="relative">
                      <IconComponent className="w-12 h-12 text-white/80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <h3 className="text-white font-semibold mb-2 group-hover:text-pink-400 transition-colors duration-300">{video.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{video.shortDescription}</p>
                
                <div className="mt-4 text-xs text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                  <Play className="w-3 h-3 mr-1" />
                  Click to preview
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Preview Modal */}
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
