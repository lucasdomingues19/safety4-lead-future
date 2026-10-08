import { useEffect, useRef, useState } from "react";

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
const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SPEED_KEY = "lms-playback-speed";

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

  // Playback speed: visible buttons, remembered between lessons. Capped at 2x
  // so watch-time tracking (MAX_STEP) still counts every second.
  const [speed, setSpeed] = useState(() => { try { return Number(localStorage.getItem(SPEED_KEY)) || 1; } catch { return 1; } });
  useEffect(() => { if (ref.current) ref.current.playbackRate = speed; }, [speed]);
  const chooseSpeed = (r: number) => { setSpeed(r); try { localStorage.setItem(SPEED_KEY, String(r)); } catch { /* private mode */ } };

  // Keyboard shortcuts (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = ref.current;
      const t = e.target as HTMLElement | null;
      if (!v || e.metaKey || e.ctrlKey || e.altKey || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName)))) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "k") { e.preventDefault(); if (v.paused) v.play().catch(() => undefined); else v.pause(); }
      else if (k === "arrowleft" || k === "j") { e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); }
      else if (k === "arrowright" || k === "l") { e.preventDefault(); v.currentTime = Math.min(v.duration || v.currentTime, v.currentTime + 10); }
      else if (k === "f") { e.preventDefault(); if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined); else v.requestFullscreen?.().catch(() => undefined); }
      else if (k === "m") { v.muted = !v.muted; }
      else if (k === "c" && v.textTracks[0]) { const tr = v.textTracks[0]; tr.mode = tr.mode === "showing" ? "hidden" : "showing"; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{ marginBottom: "20px" }}>
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
        v.playbackRate = speed;
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
      style={{ ...frameStyle, marginBottom: 0, objectFit: "contain" }}
    >
      {captionsUrl && <track kind="captions" src={captionsUrl} srcLang="en" label="English" default={captionsOn} />}
    </video>
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 10 }} role="group" aria-label="Playback speed">
      <span style={{ fontSize: 12, fontWeight: 700, color: "#69697b", marginRight: 2 }}>Speed</span>
      {SPEEDS.map((r) => (
        <button key={r} type="button" onClick={() => chooseSpeed(r)} aria-pressed={speed === r}
          style={{ border: `1px solid ${speed === r ? "#3434ff" : "#e2e8f0"}`, background: speed === r ? "#3434ff" : "#fff", color: speed === r ? "#fff" : "#0b0b2c", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {r}×
        </button>
      ))}
      <span style={{ marginLeft: "auto", fontSize: 11.5, color: "#94a3b8" }} className="hidden md:inline">Space play/pause · ←/→ 10s · F full screen · C captions</span>
    </div>
    </div>
  );
};

// ---------- YouTube ----------
interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
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

export const TrackedYouTube = ({ videoId, captionsOn, lockSeekAhead, resumeFrom, onSample }: {
  videoId: string;
  captionsOn: boolean;
  /** Stop learners jumping past the furthest point they've reached. */
  lockSeekAhead: boolean;
  resumeFrom: number;
  onSample: OnSample;
}) => {
  const host = useRef<HTMLDivElement>(null);
  const cb = useRef(onSample);
  cb.current = onSample;
  const lock = useRef(lockSeekAhead);
  lock.current = lockSeekAhead;
  const furthest = useRef(resumeFrom);

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
        // Privacy-enhanced mode: no YouTube tracking cookies until played.
        host: "https://www.youtube-nocookie.com",
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0, modestbranding: 1, playsinline: 1,
          ...(captionsOn ? { cc_load_policy: 1, cc_lang_pref: "en" } : {}),
          ...(resumeFrom > 5 ? { start: Math.floor(resumeFrom) } : {}),
        },
      });
      // Polled once a second: a jump ahead is undone on the next tick. Rewinding is always allowed.
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
        const blocked = lock.current && t > furthest.current + 2;
        if (blocked) { player.seekTo(furthest.current, true); last = null; }
        else if (delta > 0) furthest.current = Math.max(furthest.current, t);
        cb.current({ delta: blocked ? 0 : delta, position: blocked ? furthest.current : t, duration: player.getDuration?.() ?? 0, playing });
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
  ready(): Promise<void>;
  setCurrentTime(seconds: number): Promise<number>;
  destroy(): Promise<void>;
}

export const TrackedVimeo = ({ src, lockSeekAhead, resumeFrom, onSample }: {
  src: string;
  /** Stop learners jumping past the furthest point they've reached. */
  lockSeekAhead: boolean;
  resumeFrom: number;
  onSample: OnSample;
}) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const cb = useRef(onSample);
  cb.current = onSample;
  const lock = useRef(lockSeekAhead);
  lock.current = lockSeekAhead;
  const furthest = useRef(resumeFrom);

  useEffect(() => {
    let player: VimeoPlayer | null = null;
    let last: number | null = null;
    let cancelled = false;
    loadScript("https://player.vimeo.com/api/player.js", "Vimeo").then(() => {
      if (cancelled || !frame.current || !window.Vimeo) return;
      player = new window.Vimeo.Player(frame.current);
      if (resumeFrom > 5) player.ready().then(() => player?.setCurrentTime(resumeFrom)).catch(() => undefined);
      player.on("timeupdate", ({ seconds, duration }) => {
        let delta = 0;
        if (last !== null) {
          const step = seconds - last;
          if (step > 0 && step <= MAX_STEP) delta = step;
        }
        last = seconds;
        if (delta > 0) furthest.current = Math.max(furthest.current, seconds);
        cb.current({ delta, position: seconds, duration, playing: true });
      });
      // A jump ahead is snapped back to the furthest point reached. Rewinding is always allowed.
      player.on("seeked", ({ seconds }) => {
        if (lock.current && seconds > furthest.current + 2) {
          last = furthest.current;
          player?.setCurrentTime(furthest.current).catch(() => undefined);
          return;
        }
        last = seconds;
      });
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
