import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Captions, CaptionsOff, Loader2, Mic, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import {
  SCENES, findVoiceover, generateVoiceover, sentences, silentDurationMs, voiceoverConfigured,
} from "@/lib/tour";
import { TOUR_CSS, TourBackdrop, TourScene } from "./TourScenes";

// The first-run guided tour: a 2–3 minute animated walkthrough with captions
// and an AI voiceover (when generated). Scenes advance on their own timer, or
// when the voiceover clip ends; everything can be paused, skipped or muted.

interface Props {
  name: string;
  /** Title of the learner's next course, to personalise the first and last scenes. */
  course: string | null;
  isAdmin: boolean;
  onClose: (completed: boolean) => void;
  /** Primary call to action on the last scene. */
  onFinish: () => void;
}

export function OnboardingTour({ name, course, isAdmin, onClose, onFinish }: Props) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [elapsed, setElapsed] = useState(0); // ms into the current scene
  const [voice, setVoice] = useState<Record<string, string> | null>(null);
  const [audioMs, setAudioMs] = useState<Record<string, number>>({});
  const [adminOpen, setAdminOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scene = SCENES[i];
  const isLast = i === SCENES.length - 1;
  const hasVoice = !!voice?.[scene.id];
  const durationMs = hasVoice && audioMs[scene.id] ? audioMs[scene.id] + 900 : silentDurationMs(scene);

  // Which clips exist? (HEAD requests; cheap, and the tour works without them.)
  const loadVoice = useCallback(async () => setVoice(await findVoiceover()), []);
  useEffect(() => { loadVoice(); }, [loadVoice]);

  // Drive the clock. When a clip is playing, follow the clip; otherwise use a timer.
  useEffect(() => {
    if (!playing) return;
    const started = performance.now() - elapsed;
    let raf = 0;
    const tick = () => {
      const t = audioRef.current && hasVoice && !audioRef.current.paused ? audioRef.current.currentTime * 1000 : performance.now() - started;
      setElapsed(t);
      if (t >= durationMs) {
        if (isLast) { setPlaying(false); return; }
        setI((x) => x + 1);
        setElapsed(0);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, i, durationMs, hasVoice, isLast]);

  // Voiceover clip for the current scene.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    const url = voice?.[scene.id];
    if (!url) return;
    el.src = url;
    el.currentTime = 0;
    el.muted = muted;
    if (playing) el.play().catch(() => { /* blocked until a click — captions carry on */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, voice]);
  useEffect(() => { const el = audioRef.current; if (el) { el.muted = muted; if (playing && el.src && el.paused && voice?.[scene.id]) el.play().catch(() => undefined); else if (!playing) el.pause(); } }, [playing, muted]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback((n: number) => { setI(Math.min(Math.max(n, 0), SCENES.length - 1)); setElapsed(0); setPlaying(true); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
      else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go, onClose]);

  // Caption = the sentence being spoken, paced across the scene by length.
  const caption = useMemo(() => {
    const parts = sentences(scene.narration);
    const total = parts.reduce((n, p) => n + p.length, 0);
    const span = Math.max(0, durationMs - 900);
    let acc = 0;
    for (const p of parts) {
      acc += (p.length / total) * span;
      if (elapsed <= acc) return p;
    }
    return parts[parts.length - 1];
  }, [scene, elapsed, durationMs]);

  const sceneProgress = Math.min(1, elapsed / durationMs);
  const finished = isLast && elapsed >= durationMs;
  const spoken = hasVoice && !muted && playing;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-gradient-to-b from-[#0b0b2c] via-[#11114a] to-[#050518] font-['Plus_Jakarta_Sans',sans-serif] text-white" role="dialog" aria-modal="true" aria-label="Guided tour">
      <style>{TOUR_CSS}</style>
      <TourBackdrop />
      <audio ref={audioRef} preload="auto" onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d)) setAudioMs((m) => ({ ...m, [scene.id]: d * 1000 })); }} />

      {/* Top bar */}
      <div className="relative flex items-center gap-3 px-4 py-3 md:px-8">
        <div className="relative flex h-9 w-9 items-center justify-center" aria-hidden>
          <span className={`absolute inset-0 rounded-full bg-[#9eff1f]/30 ${spoken ? "animate-ping" : ""}`} />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#9eff1f] to-[#3434ff]">
            <span className="flex items-end gap-[3px]">{[0, 1, 2, 3].map((b) => <span key={b} className="tr-inf w-[3px] rounded-full bg-[#0b0b2c]" style={{ height: spoken ? undefined : 6, animation: spoken ? `tr-pulse ${0.5 + b * 0.12}s ease-in-out infinite` : undefined, minHeight: 6, transformOrigin: "bottom" }} />)}</span>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9eff1f]">Your guide</div>
          <div className="truncate text-sm font-semibold text-white/90">{scene.title} <span className="text-white/40">· {i + 1} of {SCENES.length}</span></div>
        </div>
        {isAdmin && <button onClick={() => setAdminOpen(true)} className="hidden items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 sm:inline-flex"><Mic size={14} /> Voiceover</button>}
        <button onClick={() => onClose(false)} className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Close tour"><X size={20} /></button>
      </div>

      {/* Stage */}
      <div className={`relative min-h-0 flex-1 overflow-hidden ${playing ? "" : "tr-paused"}`}>
        <TourScene key={scene.id} id={scene.id} name={name} course={course} />
        {!playing && !finished && (
          <button onClick={() => setPlaying(true)} className="absolute inset-0 flex items-center justify-center bg-black/30" aria-label="Resume">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-[#0b0b2c] shadow-2xl"><Play size={34} className="translate-x-0.5" /></span>
          </button>
        )}
        {finished && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <button onClick={onFinish} className="pointer-events-auto rounded-xl bg-[#9eff1f] px-8 py-4 text-base font-extrabold text-[#0b0b2c] shadow-[0_12px_40px_rgba(158,255,31,0.35)] hover:brightness-95">
              {course ? "Continue to my course" : "Start exploring"}
            </button>
          </div>
        )}
      </div>

      {/* Captions */}
      {captions && (
        <div className="relative px-4 pb-2 md:px-8">
          <p key={caption} className="mx-auto max-w-3xl text-center text-[17px] font-medium leading-relaxed text-white md:text-xl" style={{ animation: "tr-up .35s ease-out" }}>{caption}</p>
        </div>
      )}

      {/* Controls */}
      <div className="relative px-4 pb-4 md:px-8 md:pb-6">
        <div className="mx-auto flex max-w-3xl gap-1.5">
          {SCENES.map((s, n) => (
            <button key={s.id} onClick={() => go(n)} className="group h-6 flex-1" aria-label={`Go to ${s.title}`} title={s.title}>
              <span className="block h-1.5 overflow-hidden rounded-full bg-white/20 transition group-hover:bg-white/30"><span className="block h-full rounded-full bg-[#9eff1f]" style={{ width: n < i ? "100%" : n === i ? `${sceneProgress * 100}%` : "0%" }} /></span>
            </button>
          ))}
        </div>
        <div className="mx-auto mt-1 flex max-w-3xl items-center gap-1.5">
          <button onClick={() => setPlaying((p) => !p)} className="rounded-full p-2.5 hover:bg-white/10" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={20} /> : <Play size={20} />}</button>
          <button onClick={() => go(0)} className="rounded-full p-2.5 hover:bg-white/10" aria-label="Restart"><RotateCcw size={18} /></button>
          {!isLast && <button onClick={() => go(i + 1)} className="rounded-full p-2.5 hover:bg-white/10" aria-label="Next scene"><SkipForward size={18} /></button>}
          <span className="ml-auto" />
          <button onClick={() => setCaptions((c) => !c)} className={`rounded-full p-2.5 hover:bg-white/10 ${captions ? "text-[#9eff1f]" : "text-white/60"}`} aria-label="Toggle captions" aria-pressed={captions}>{captions ? <Captions size={20} /> : <CaptionsOff size={20} />}</button>
          {voice && Object.keys(voice).length > 0 && <button onClick={() => setMuted((m) => !m)} className="rounded-full p-2.5 hover:bg-white/10" aria-label={muted ? "Unmute" : "Mute"}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>}
          <button onClick={() => onClose(!isLast ? false : true)} className="ml-1 rounded-lg px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white">{isLast ? "Close" : "Skip tour"}</button>
        </div>
      </div>

      {adminOpen && <VoiceoverPanel onClose={() => setAdminOpen(false)} voice={voice} onChanged={loadVoice} />}
    </div>
  );
}

function VoiceoverPanel({ onClose, voice, onChanged }: { onClose: () => void; voice: Record<string, string> | null; onChanged: () => void }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { voiceoverConfigured().then(setConfigured).catch(() => setConfigured(false)); }, []);
  const done = Object.keys(voice ?? {}).length;

  const run = async (force: boolean) => {
    setBusy(true);
    const t = toast.loading("Recording the narration…");
    try {
      const results = await generateVoiceover(force);
      const bad = results.filter((r) => !r.ok);
      if (bad.length) toast.error(`${bad.length} clip(s) failed: ${bad[0].error}`, { id: t }); else toast.success("Voiceover ready", { id: t });
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate the voiceover", { id: t });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-[#0b0b2c]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="text-lg font-bold">AI voiceover</h3><button onClick={onClose} className="rounded-full p-1.5 text-[#94a3b8] hover:bg-[#f5f7fa]" aria-label="Close"><X size={18} /></button></div>
        <p className="mt-2 text-sm text-[#69697b]">{done} of {SCENES.length} scenes have a recorded voice. Learners hear it automatically; scenes without one show captions only.</p>
        {configured === null ? <Loader2 size={18} className="mt-4 animate-spin" /> : !configured ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Voice isn't connected yet. Add your ElevenLabs key (secret <code>ELEVENLABS_API_KEY</code>) and optionally a voice (<code>ELEVENLABS_VOICE_ID</code>), then come back.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => run(false)} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy && <Loader2 size={15} className="animate-spin" />} Generate missing</button>
            <button disabled={busy} onClick={() => run(true)} className="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Re-record everything</button>
          </div>
        )}
        <p className="mt-4 text-xs text-[#94a3b8]">Changing the script re-records only the scenes whose wording changed.</p>
      </div>
    </div>
  );
}
