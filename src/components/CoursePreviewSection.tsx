import { useState } from "react";
import { Play, Zap, Shield, Award } from "lucide-react";
import { VideoPreviewModal } from "./VideoPreviewModal";
import certificateSample from "@/assets/certificate-sample.png";

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

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            Course <span className="text-pink-500">Preview</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Professionally recorded in a studio, featuring over 60 high-quality video lessons for a premium learning experience.
          </p>
          <p className="text-xl text-gray-300 leading-relaxed mt-4">
            Designed by trusted educators and built on proven learning methods, the course makes SafetyTech and AI accessible, practical, and easy to understand for EHS professionals at any stage.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left side - 2x2 Video Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {videoPreviewData.map((video) => {
              const IconComponent = video.icon;
              return (
                <div 
                  key={video.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:border-pink-400/50 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl"
                  onClick={() => handleVideoPreview(video)}
                >
                  {(video.id === "iosh-cpd" || video.id === "safety-40" || video.id === "why-matters" || video.id === "what-learn") ? (
                    <div className="relative aspect-video rounded-xl mb-3 overflow-hidden group-hover:scale-105 transition-transform duration-300">
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
                    <div className={`aspect-video bg-gradient-to-br ${video.gradient} rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                      <div className="relative">
                        <IconComponent className="w-10 h-10 text-white/80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="w-5 h-5 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-pink-400 transition-colors duration-300">{video.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{video.shortDescription}</p>
                  
                  <div className="mt-2 text-xs text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                    <Play className="w-3 h-3 mr-1" />
                    Click to preview
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right side - IOSH Certificate */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 h-full flex flex-col">
              
              {/* Certificate Image */}
              <div className="relative flex-1 mb-4">
                <img 
                  src={certificateSample} 
                  alt="IOSH Approved Certificate Sample"
                  className="w-full h-auto rounded-xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
              
              
              {/* Benefits */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-400"></div>
                  <span>Internationally recognized certification</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-400"></div>
                  <span>8+ hours of CPD credits</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-400"></div>
                  <span>Digital & printable certificate</span>
                </div>
              </div>
            </div>
          </div>
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
