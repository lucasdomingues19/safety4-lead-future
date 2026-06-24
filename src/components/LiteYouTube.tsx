import { useState } from "react";
import { Play } from "lucide-react";

interface LiteYouTubeProps {
  videoId: string;
  title: string;
  /** Extra query params appended when the real player loads (after click). */
  params?: string;
  className?: string;
  /** Mount the real player immediately and start playing (muted) on load. */
  autoPlay?: boolean;
}

/**
 * Lightweight YouTube facade.
 * Renders a static thumbnail (instant load) and only mounts the heavy
 * YouTube iframe player once the user clicks play.
 */
export const LiteYouTube = ({
  videoId,
  title,
  params = "autoplay=1&rel=0&modestbranding=1",
  className = "",
  autoPlay = false,
}: LiteYouTubeProps) => {
  const [activated, setActivated] = useState(autoPlay);

  if (activated) {
    return (
      <iframe
        className={`w-full h-full ${className}`}
        src={`https://www.youtube.com/embed/${videoId}?${params}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Play video: ${title}`}
      className={`group relative block w-full h-full overflow-hidden ${className}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        srcSet={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg 480w, https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg 1280w`}
        sizes="(max-width: 768px) 100vw, 800px"
        alt={title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform group-hover:scale-110">
          <Play className="h-7 w-7 translate-x-0.5 fill-current" />
        </span>
      </span>
    </button>
  );
};
