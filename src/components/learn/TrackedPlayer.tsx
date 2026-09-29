import { useEffect, useRef } from "react";

// Video players that report *actually played* seconds. Seeking never earns
// credit: only small forward steps between consecutive time samples count.
// Supports native <video> (uploaded files / direct MP4), YouTube and Vimeo.

export interface WatchSample {
  /** Played seconds gained since the last sample. */
  delta: number;
  /** Current position and total length, in seconds. */
  position: number;
  duration: number;
  playing: boolean;
}

type OnSample = (s: WatchSample) => void;

const MAX_STEP = 2.5; // seconds between samples at up to 2x speed

const frameStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "#0b0b2c",
  borderRadius: "20px",
  aspectRatio: "16/9",
  marginBottom: "20px",
  display: "block",
};

const loadScript = (src: string, globalName: string) =>
  new Promise<void>((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>)[globalName]) return resolve();
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    const s = existing ?? document.createElement("script");
    s.addEventListener("load", () => resolve());
    s.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
    if (!existing) {
      s.src = src;
      s.async = true;
      document.head.appendChild(s);
    }
  });

// ---------- Native <video> ----------
export const TrackedVideo = ({
  src,
  captionsUrl,
  captionsOn,
  lockSeekAhead,
  resumeFrom,
  onSample,
  onError,
}: {
  src: string;
  captionsUrl?: string | null;
  captionsOn: boolean;
  /** Stop learners jumping past the furthest point they've reached. */
  lockSeekAhead: boolean;
  resumeFrom: number;
  onSample: OnSample;
  onError?: () => void;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const last = useRef<number | null>(null);
  const furthest = useRef(resumeFrom);

  const emit = (playing: boolean) => {
    const v = ref.current;
    if (!v) return;
    const t = v.currentTime;
    let delta = 0;
    if (last.current !== null && !v.seeking) {
      const step = t - last.current;
      if (step > 0 && step <= MAX_STEP) delta = step;
    }
    last.current = t;
    furthest.current = Math.max(furthest.current, t);
    onSample({ delta, position: t, duration: Number.isFinite(v.duration) ? v.duration : 0, playing });
  };

  return (
    <video
      ref={ref}
      src={src}
      controls
      controlsList="nodownload"
      playsInline
      crossOrigin={captionsUrl ? "anonymous" : undefined}
      onLoadedMetadata={(e) => {
        const v = e.currentTarget;
        if (resumeFrom > 5 && resumeFrom < v.duration - 5) v.currentTime = resumeFrom;
        last.current = v.currentTime;
        onSample({ delta: 0, position: v.currentTime, duration: v.duration, playing: false });
      }}
      onTimeUpdate={() => emit(!ref.current?.paused)}
      onSeeking={(e) => {
        const v = e.currentTarget;
        if (lockSeekAhead && v.currentTime > furthest.current + 2) v.currentTime = furthest.current;
        last.current = null;
      }}
      onSeeked={(e) => { last.current = e.currentTarget.currentTime; }}
      onPause={() => emit(false)}
      onEnded={() => emit(false)}
      onError={onError}
      onContextMenu={(e) => e.preventDefault()}
      style={{ ...frameStyle, objectFit: "contain" }}
    >
      {captionsUrl && <track kind="captions" src={captionsUrl} srcLang="en" label="English" default={captionsOn} />}
    </video>
  );
};

// ---------- YouTube ----------
interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
}
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer; PlayerState: { PLAYING: number } };
    onYouTubeIframeAPIReady?: () => void;
    Vimeo?: { Player: new (el: HTMLElement | HTMLIFrameElement) => VimeoPlayer };
  }
}

const loadYouTubeApi = () =>
  new Promise<void>((resolve) => {
    if (window.YT?.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    loadScript("https://www.youtube.com/iframe_api", "__never__").catch(() => undefined);
  });

export const TrackedYouTube = ({ videoId, captionsOn, onSample }: { videoId: string; captionsOn: boolean; onSample: OnSample }) => {
  const host = useRef<HTMLDivElement>(null);
  const cb = useRef(onSample);
  cb.current = onSample;

  useEffect(() => {
    let player: YTPlayer | null = null;
    let timer: number | undefined;
    let last: number | null = null;
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !host.current || !window.YT) return;
      const mount = document.createElement("div");
      host.current.innerHTML = "";
      host.current.appendChild(mount);
      player = new window.YT.Player(mount, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, ...(captionsOn ? { cc_load_policy: 1, cc_lang_pref: "en" } : {}) },
      });
      timer = window.setInterval(() => {
        if (!player?.getPlayerState) return;
        const playing = player.getPlayerState() === 1;
        const t = player.getCurrentTime?.() ?? 0;
        let delta = 0;
        if (playing && last !== null) {
          const step = t - last;
          if (step > 0 && step <= MAX_STEP) delta = step;
        }
        last = playing ? t : null;
        cb.current({ delta, position: t, duration: player.getDuration?.() ?? 0, playing });
      }, 1000);
    });

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      try { player?.destroy(); } catch { /* already gone */ }
    };
  }, [videoId, captionsOn]);

  return <div ref={host} style={{ ...frameStyle, overflow: "hidden" }} />;
};

// ---------- Vimeo ----------
interface VimeoPlayer {
  on(event: string, cb: (d: { seconds: number; duration: number }) => void): void;
  destroy(): Promise<void>;
}

export const TrackedVimeo = ({ src, onSample }: { src: string; onSample: OnSample }) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const cb = useRef(onSample);
  cb.current = onSample;

  useEffect(() => {
    let player: VimeoPlayer | null = null;
    let last: number | null = null;
    let cancelled = false;
    loadScript("https://player.vimeo.com/api/player.js", "Vimeo").then(() => {
      if (cancelled || !frame.current || !window.Vimeo) return;
      player = new window.Vimeo.Player(frame.current);
      player.on("timeupdate", ({ seconds, duration }) => {
        let delta = 0;
        if (last !== null) {
          const step = seconds - last;
          if (step > 0 && step <= MAX_STEP) delta = step;
        }
        last = seconds;
        cb.current({ delta, position: seconds, duration, playing: true });
      });
      player.on("seeked", ({ seconds }) => { last = seconds; });
      player.on("pause", ({ seconds, duration }) => { last = seconds; cb.current({ delta: 0, position: seconds, duration, playing: false }); });
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      player?.destroy().catch(() => undefined);
    };
  }, [src]);

  return (
    <iframe
      ref={frame}
      src={src}
      title="Lesson video"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      style={frameStyle}
    />
  );
};

export const youTubeId = (url: string) => url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1] ?? null;
export const isVimeo = (url: string) => /vimeo\.com/.test(url);
export const isDirectVideoUrl = (url: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
