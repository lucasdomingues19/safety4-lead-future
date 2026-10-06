import { miaPhoto } from "@/components/learn/MiaAvatar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Captions, CaptionsOff, ChevronLeft, ChevronRight, Loader2, Mic, Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import {
  STEPS, findMedia, generateVoiceover, sentences, setTourActive, silentDurationMs, voiceoverConfigured, type StepMedia, type TourScreen,
} from "@/lib/tour";

// Mia's guided tour over the real LMS: each step switches to its screen,
// dims everything else, spotlights the area being explained and gently zooms
// in, while Mia (HeyGen video, or portrait + voice clip) narrates in a card
// that keeps out of the spotlight's way. Clicks on the page are blocked while
// it plays; Esc / Skip hands the LMS straight back.

interface Props {
  name: string;
  isAdmin: boolean;
  screen: string;
  onNavigate: (screen: TourScreen) => void;
  /** completed = heard Mia to the end; step = last step reached (1-based). */
  onClose: (outcome: { completed: boolean; step: number }) => void;
  /** Primary call to action on the last step. */
  onFinish: () => void;
  ctaLabel: string;
}

const PAD = 10;
const visible = (el: Element | null): el is HTMLElement => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 8 && r.height > 8;
};
const stageEl = () => document.querySelector<HTMLElement>("[data-tour-stage]");
const resetZoom = (instant = false) => {
  const s = stageEl();
  if (!s) return;
  s.style.transition = instant ? "none" : "transform .6s cubic-bezier(.2,.8,.2,1)";
  s.style.transform = "";
};

export function MiaTour({ name, isAdmin, screen, onNavigate, onClose, onFinish, ctaLabel }: Props) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [media, setMedia] = useState<Record<string, StepMedia> | null>(null);
  const [mediaMs, setMediaMs] = useState<Record<string, number>>({});
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const spotRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const step = STEPS[i];
  const isLast = i === STEPS.length - 1;
  const m = media?.[step.id] ?? {};
  const durationMs = (m.video || m.audio) && mediaMs[step.id] ? mediaMs[step.id] + 700 : silentDurationMs(step);
  const finished = isLast && elapsed >= durationMs;
  const speaking = playing && !muted && !!(m.video || m.audio) && !finished;
  const close = useCallback(() => onClose({ completed: finished || isLast, step: i + 1 }), [onClose, finished, isLast, i]);

  // After Mia's last line, the card closes itself unless the learner acts.
  const [closingIn, setClosingIn] = useState<number | null>(null);
  useEffect(() => {
    if (!finished) { setClosingIn(null); return; }
    setClosingIn(10);
    const t = window.setInterval(() => setClosingIn((n) => (n === null ? null : n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [finished]);
  useEffect(() => { if (closingIn !== null && closingIn <= 0) close(); }, [closingIn, close]);
  const firstName = name.split(" ")[0] || "there";

  const loadMedia = useCallback(async () => setMedia(await findMedia()), []);
  useEffect(() => { loadMedia(); }, [loadMedia]);

  // Personal details (marked data-private) stay blurred while the tour is on
  // screen, so it can be recorded or shown on a call. Hand the page back
  // exactly as it was afterwards.
  useEffect(() => {
    setTourActive(true);
    return () => { resetZoom(true); setTourActive(false); };
  }, []);

  // 1) Show the step's screen, 2) find its anchor, 3) let the page settle,
  // scroll it to the middle, 4) zoom in as far as it still fits on screen.
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(() => { if (!cancelled) fn(); }, ms)); };
    setTarget(null);
    resetZoom();
    const switching = screen !== step.screen;
    if (switching) onNavigate(step.screen);
    const started = Date.now();

    const zoomTo = (el: HTMLElement) => {
      const s = stageEl();
      if (!step.zoom || !s || !s.contains(el)) return;
      const r = el.getBoundingClientRect();
      const sr = s.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const margin = 24;
      // Largest zoom that keeps the whole spotlight inside the visible stage.
      const fit = Math.min(
        (cy - margin) / (r.height / 2), (window.innerHeight - cy - margin) / (r.height / 2),
        (cx - Math.max(sr.left, 0) - margin) / (r.width / 2), (window.innerWidth - cx - margin) / (r.width / 2),
      );
      const z = Math.min(step.zoom, fit);
      if (z <= 1.02) return;
      s.style.transformOrigin = `${cx - sr.left}px ${cy - sr.top}px`;
      s.style.transition = "transform .9s cubic-bezier(.2,.8,.2,1)";
      s.style.transform = `scale(${z})`;
    };

    const whenScrollSettles = (fn: () => void) => {
      let last = window.scrollY, still = 0;
      const t0 = Date.now();
      const poll = () => {
        if (window.scrollY === last) still += 1; else { still = 0; last = window.scrollY; }
        if (still >= 3 || Date.now() - t0 > 1500) fn(); else later(poll, 60);
      };
      later(poll, 60);
    };

    const find = () => {
      // First anchor (in priority order) that is actually on screen — phone and desktop layouts may both carry it.
      const el = step.targets.map((t) => [...document.querySelectorAll(`[data-tour="${t}"]`)].find(visible)).find(Boolean) ?? null;
      if (!el && step.targets.length && Date.now() - started < 4000) { later(find, 150); return; }
      if (!el) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      whenScrollSettles(() => { setTarget(el); zoomTo(el); });
    };
    // Let the zoom-out finish (and a new screen mount) before measuring anything.
    later(find, switching ? 450 : 520);
    return () => { cancelled = true; timers.forEach((t) => window.clearTimeout(t)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  // Spotlight follows its target every frame (scrolling, zoom, late layout).
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = spotRef.current;
      if (el) {
        if (target && target.isConnected) {
          const r = target.getBoundingClientRect();
          el.style.opacity = "1";
          el.style.transform = `translate(${r.left - PAD}px, ${r.top - PAD}px)`;
          el.style.width = `${r.width + PAD * 2}px`;
          el.style.height = `${r.height + PAD * 2}px`;
        } else {
          el.style.opacity = "0";
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  // The clock: follows Mia's video or voice clip when there is one, else reading pace.
  useEffect(() => {
    if (!playing || finished || media === null) return;
    const t0 = performance.now() - elapsed;
    let raf = 0;
    const tick = () => {
      const mediaEl = m.video ? videoRef.current : m.audio ? audioRef.current : null;
      const t = mediaEl && !mediaEl.paused && mediaEl.currentTime > 0 ? mediaEl.currentTime * 1000 : performance.now() - t0;
      setElapsed(t);
      if (t >= durationMs) {
        if (!isLast) { setI((x) => x + 1); setElapsed(0); }
        else setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, i, durationMs, finished, media]);

  // Load and play the step's clip.
  useEffect(() => {
    const v = videoRef.current, a = audioRef.current;
    v?.pause(); a?.pause();
    const el = m.video ? v : m.audio ? a : null;
    if (!el) return;
    el.src = (m.video ?? m.audio)!;
    el.currentTime = 0;
    el.muted = muted;
    if (playing) el.play().catch(() => { /* autoplay blocked until a click — captions carry on */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, media]);
  useEffect(() => {
    const el = m.video ? videoRef.current : m.audio ? audioRef.current : null;
    if (!el) return;
    el.muted = muted;
    if (playing && !finished) el.play().catch(() => undefined); else el.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, muted]);

  const go = useCallback((n: number) => {
    setI(Math.min(Math.max(n, 0), STEPS.length - 1));
    setElapsed(0);
    setPlaying(true);
  }, []);
  // Relative moves count every click, even rapid ones.
  const move = useCallback((d: number) => {
    setI((x) => Math.min(Math.max(x + d, 0), STEPS.length - 1));
    setElapsed(0);
    setPlaying(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (adminOpen) return;
      if (e.key === "Escape") close();
      else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, close, adminOpen]);

  // Subtitles: one short line at a time (long sentences split at commas),
  // paced across the clip by length.
  const caption = useMemo(() => {
    const parts = sentences(step.narration).flatMap((sen) => {
      if (sen.length <= 80) return [sen];
      const out: string[] = [];
      let cur = "";
      for (const bit of sen.split(/(?<=,)\s+/)) {
        if (cur && (cur + " " + bit).length > 80) { out.push(cur); cur = bit; } else cur = cur ? `${cur} ${bit}` : bit;
      }
      if (cur) out.push(cur);
      return out;
    });
    const total = parts.reduce((n, p) => n + p.length, 0);
    const span = Math.max(1, durationMs - 700);
    let acc = 0;
    for (const p of parts) { acc += (p.length / total) * span; if (elapsed <= acc) return p; }
    return parts[parts.length - 1];
  }, [step, elapsed, durationMs]);

  // Ring around Mia = progress through the whole tour.
  const overall = Math.min(1, (i + Math.min(1, elapsed / durationMs)) / STEPS.length);
  const R = 47, C = 2 * Math.PI * R;
  const ctl = "flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-30";

  return (
    <div className="fixed inset-0 z-[80] font-['Plus_Jakarta_Sans',sans-serif]" role="dialog" aria-modal="true" aria-label="Guided tour with Mia">
      <style>{`
        @keyframes mia-ring{0%{box-shadow:0 0 0 0 rgba(158,255,31,.5)}100%{box-shadow:0 0 0 14px rgba(158,255,31,0)}}
        @keyframes mia-spot{0%,100%{box-shadow:0 0 0 9999px rgba(8,8,36,.62),0 0 0 3px #9eff1f,0 0 24px 6px rgba(158,255,31,.35)}50%{box-shadow:0 0 0 9999px rgba(8,8,36,.62),0 0 0 3px #9eff1f,0 0 36px 12px rgba(158,255,31,.5)}}
        @keyframes mia-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes mia-bar{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
        @media (prefers-reduced-motion:reduce){.mia-anim{animation:none!important;transition:none!important}}
        .mia-touring [data-private]{filter:blur(7px);user-select:none}
        .mia-touring [data-tour-admin]{display:none!important}
      `}</style>

      {/* Dim layer when nothing is spotlit; otherwise the spotlight's own shadow dims the page. */}
      <div className="mia-anim absolute inset-0 transition-colors duration-500" style={{ background: target ? "transparent" : "rgba(8,8,36,.62)" }} />
      <div
        ref={spotRef}
        aria-hidden
        className="mia-anim pointer-events-none absolute left-0 top-0 rounded-2xl"
        style={{ opacity: 0, transition: "transform .55s cubic-bezier(.2,.8,.2,1), width .55s cubic-bezier(.2,.8,.2,1), height .55s cubic-bezier(.2,.8,.2,1), opacity .4s", animation: "mia-spot 2.4s ease-in-out infinite" }}
      />

      {/* Subtitles, centred along the bottom of the screen */}
      <div className="pointer-events-none absolute inset-x-3 bottom-[118px] flex flex-col items-center gap-3 sm:inset-x-6 sm:bottom-24 sm:right-[176px]">
        {finished ? (
          <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl bg-[#0b0b2c]/95 px-5 py-4 text-center shadow-2xl ring-1 ring-white/10" style={{ animation: "mia-in .35s ease-out" }}>
            <div className="text-[15px] font-bold text-white">You're all set, {firstName}!</div>
            <div className="flex gap-2">
              <button onClick={onFinish} className="rounded-xl bg-[#9eff1f] px-5 py-2.5 text-[14px] font-extrabold text-[#0b0b2c] hover:brightness-95">{ctaLabel}</button>
              <button onClick={() => go(0)} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-[14px] font-bold text-white hover:bg-white/15"><RotateCcw size={15} /> Replay</button>
            </div>
            {closingIn !== null && closingIn > 0 && (
              <p className="text-[12px] text-white/50">Closing in {closingIn}s · <button onClick={() => setClosingIn(null)} className="font-semibold text-white/75 underline-offset-2 hover:underline">keep open</button></p>
            )}
          </div>
        ) : captions && media !== null ? (
          <p key={caption} aria-live="polite" className="max-w-[760px] rounded-xl bg-[#0b0b2c]/90 px-4 py-2.5 text-center text-[16px] font-semibold leading-snug text-white shadow-xl sm:text-[19px]" style={{ animation: "mia-in .25s ease-out", textWrap: "balance" } as React.CSSProperties}>
            {caption}
          </p>
        ) : null}
      </div>

      {/* Controls */}
      <div className="absolute bottom-5 right-[118px] flex items-center gap-0.5 rounded-full bg-[#0b0b2c]/95 px-1.5 py-1 shadow-xl ring-1 ring-white/10 sm:bottom-7 sm:right-[176px]">
        <button onClick={() => move(-1)} disabled={i === 0} className={ctl} aria-label="Previous"><ChevronLeft size={18} /></button>
        {finished
          ? <button onClick={() => go(0)} className={ctl} aria-label="Replay"><RotateCcw size={16} /></button>
          : <button onClick={() => setPlaying((p) => !p)} className={ctl} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>}
        <button onClick={() => move(1)} disabled={isLast} className={ctl} aria-label="Next"><ChevronRight size={18} /></button>
        <span className="hidden px-1 text-[12px] font-semibold tabular-nums text-white/45 sm:inline">{i + 1}/{STEPS.length}</span>
        <button onClick={() => setCaptions((c) => !c)} className={`${ctl} ${captions ? "!text-[#9eff1f]" : ""}`} aria-label="Subtitles" aria-pressed={captions}>{captions ? <Captions size={17} /> : <CaptionsOff size={17} />}</button>
        {(m.video || m.audio) && <button onClick={() => setMuted((x) => !x)} className={ctl} aria-label={muted ? "Unmute" : "Mute"}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>}
        {isAdmin && <button onClick={() => setAdminOpen(true)} className={`${ctl} hidden sm:flex`} aria-label="Mia's voice and video" title="Mia's voice and video"><Mic size={16} /></button>}
        <button onClick={close} className={ctl} aria-label="Close tour" title="Close tour"><X size={18} /></button>
      </div>

      {/* Mia, always bottom-right */}
      <div className="absolute bottom-4 right-4 h-[92px] w-[92px] sm:bottom-6 sm:right-6 sm:h-[136px] sm:w-[136px]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="#9eff1f" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - overall)} style={{ transition: "stroke-dashoffset .3s linear" }} />
        </svg>
        <div
          className="mia-anim absolute inset-[7%] overflow-hidden rounded-full bg-gradient-to-br from-[#9eff1f] via-[#3434ff] to-[#202058] shadow-[0_12px_40px_rgba(0,0,0,.45)]"
          style={{ animation: speaking ? "mia-ring 1.4s ease-out infinite" : undefined }}
        >
          {media === null ? (
            <div className="relative h-full w-full"><img src={miaPhoto} alt="" className="h-full w-full object-cover" /><span className="absolute inset-0 flex items-center justify-center bg-[#0b0b2c]/35"><Loader2 className="animate-spin text-white/90" size={26} /></span></div>
          ) : m.video ? (
            <video ref={videoRef} playsInline className="h-full w-full object-cover" onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d)) setMediaMs((x) => ({ ...x, [step.id]: d * 1000 })); }} />
          ) : (
            <img src={miaPhoto} alt="Mia" className="h-full w-full object-cover" />
          )}
        </div>
        {!playing && !finished && media !== null && (
          <button onClick={() => setPlaying(true)} className="absolute inset-[7%] flex items-center justify-center rounded-full bg-black/45 text-white" aria-label="Resume"><Play size={30} className="translate-x-0.5" /></button>
        )}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#9eff1f] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0b0b2c] shadow">Mia</span>
        {speaking && !m.video && (
          <span className="absolute right-0 top-0 flex h-6 items-end gap-[2px] rounded-full bg-[#9eff1f] px-1.5 py-1.5" aria-hidden>
            {[0, 1, 2].map((b) => <span key={b} className="mia-anim w-[3px] origin-bottom rounded-full bg-[#0b0b2c]" style={{ height: 10, animation: `mia-bar ${0.45 + b * 0.15}s ease-in-out infinite` }} />)}
          </span>
        )}
      </div>

      <audio ref={audioRef} preload="auto" onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d)) setMediaMs((x) => ({ ...x, [step.id]: d * 1000 })); }} />
      {adminOpen && <VoicePanel onClose={() => setAdminOpen(false)} media={media} onChanged={loadMedia} />}
    </div>
  );
}

function VoicePanel({ onClose, media, onChanged }: { onClose: () => void; media: Record<string, StepMedia> | null; onChanged: () => void }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { voiceoverConfigured().then(setConfigured).catch(() => setConfigured(false)); }, []);
  const voiced = STEPS.filter((s) => media?.[s.id]?.audio).length;
  const videos = STEPS.filter((s) => media?.[s.id]?.video).length;

  const run = async (force: boolean) => {
    setBusy(true);
    const t = toast.loading("Recording Mia's voice…");
    try {
      const results = await generateVoiceover(force);
      const bad = results.filter((r) => !r.ok);
      if (bad.length) toast.error(`${bad.length} clip(s) failed: ${bad[0].error}`, { id: t }); else toast.success("Mia's voice is ready", { id: t });
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record the voice", { id: t });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-[#0b0b2c]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="text-lg font-bold">Mia's voice & video</h3><button onClick={onClose} className="rounded-full p-1.5 text-[#94a3b8] hover:bg-[#f5f7fa]" aria-label="Close"><X size={18} /></button></div>
        <p className="mt-2 text-sm text-[#69697b]">{videos} of {STEPS.length} steps have Mia's video · {voiced} of {STEPS.length} have her voice. Steps without either show captions only.</p>
        {configured === null ? <Loader2 size={18} className="mt-4 animate-spin" /> : !configured ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Voice isn't connected — add the ElevenLabs key (secret <code>ELEVENLABS_API_KEY</code>).</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => run(false)} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy && <Loader2 size={15} className="animate-spin" />} Record missing</button>
            <button disabled={busy} onClick={() => run(true)} className="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Re-record all</button>
          </div>
        )}
        <p className="mt-4 text-xs text-[#94a3b8]">Changing the script re-records only the steps whose wording changed. Mia's HeyGen video takes priority over the voice clip wherever both exist.</p>
      </div>
    </div>
  );
}
