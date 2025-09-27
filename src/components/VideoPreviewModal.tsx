import { Button } from "@/components/ui/button";
import { X, Play } from "lucide-react";
import { useEffect } from "react";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  videoDescription: string;
  videoUrl?: string;
}

export const VideoPreviewModal = ({ 
  isOpen, 
  onClose, 
  videoTitle, 
  videoDescription,
  videoUrl 
}: VideoPreviewModalProps) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl mx-auto animate-scale-in">
        {/* Close Button */}
        <Button
          variant="outline"
          size="sm"
          className="absolute -top-12 right-0 z-10 border-white/30 text-white hover:bg-white/10"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
        
        {/* Video Container */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20">
          {/* Video Player */}
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
            {videoUrl ? (
              <video 
                className="w-full h-full"
                controls
                autoPlay
                playsInline
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              // Placeholder for now
              <div className="flex flex-col items-center space-y-4 text-white">
                <Play className="w-16 h-16 text-white/60" />
                <p className="text-lg font-medium">Video Preview Coming Soon</p>
                <p className="text-sm text-white/60 text-center max-w-md">
                  This preview video will showcase the key concepts covered in this module.
                </p>
              </div>
            )}
          </div>
          
          {/* Video Info */}
          <div className="p-6 space-y-4">
            <h3 className="text-2xl font-bold text-white">{videoTitle}</h3>
            <p className="text-gray-300 leading-relaxed">{videoDescription}</p>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                size="lg" 
                className="bg-lime-500 hover:bg-lime-600 text-white font-semibold"
              >
                Start Learning Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={onClose}
              >
                Continue Browsing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};