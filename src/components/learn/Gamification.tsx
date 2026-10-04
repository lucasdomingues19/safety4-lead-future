import { useEffect, useState } from "react";
import { Flame, Info, Lock, X } from "lucide-react";
import { BADGES, LEVELS, POINT_RULES, diffSinceLastSeen, levelByName, type MyGamification } from "@/lib/gamification";

export const LevelChip = ({ name, compact = false }: { name?: string | null; compact?: boolean }) => {
  const l = levelByName(name);
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold leading-4" style={{ background: l.bg, color: l.fg }} title={`Level: ${l.name}`}>
      <span aria-hidden>{l.emoji}</span>{!compact && l.name}
    </span>
  );
};

export const NetworkChip = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-[#202058] px-2 py-0.5 text-[11px] font-bold leading-4 text-[#9eff1f]" title="SafetyTech Global Network member">🌐 Network</span>
);

/** Dashboard card: level, points to next level, streak and badges. */
export const ProgressCard = ({ g }: { g: MyGamification }) => {
  const [showRules, setShowRules] = useState(false);
  const [celebrate, setCelebrate] = useState<{ levelUp: boolean; newBadges: string[] } | null>(null);
  const level = LEVELS[g.level] ?? LEVELS[1];
  const next = g.next_level_points;
  const pct = next ? Math.min(100, Math.round(((g.points - g.level_floor) / (next - g.level_floor)) * 100)) : 100;
  const nextName = LEVELS[g.level + 1]?.name;
  const earned = BADGES.filter((b) => g.badges[b.id]).length;

  useEffect(() => {
    const d = diffSinceLastSeen(g);
    if (d.levelUp || d.newBadges.length) setCelebrate(d);
  }, [g]);

  return (
    <div className="rounded-[20px] border border-[#e2e8f0] bg-white p-6 md:p-7">
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: level.bg }}>{level.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8ab815]">Level {g.level}</div>
          <div className="text-2xl font-bold text-[#0b0b2c]">{level.name}</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eef1f6]"><div className="h-full rounded-full bg-[#3434ff] transition-all" style={{ width: `${pct}%` }} /></div>
            <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[#69697b]">
              {next ? `${g.points} / ${next} pts` : `${g.points} pts · top level`}
            </span>
          </div>
          {next && nextName && <div className="mt-1 text-xs text-[#94a3b8]">{next - g.points} points to {nextName}</div>}
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl bg-[#fff7ed] px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-[#c2410c]"><Flame size={22} /> {g.streak}</div>
            <div className="text-[11px] font-semibold text-[#9a3412]">day streak</div>
          </div>
          <div className="rounded-2xl bg-[#f1f4ff] px-4 py-3 text-center">
            <div className="text-2xl font-extrabold text-[#3434ff]">{earned}<span className="text-base text-[#94a3b8]">/{BADGES.length}</span></div>
            <div className="text-[11px] font-semibold text-[#3434ff]">badges</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-9 [&>*]:min-w-0">
        {BADGES.map((b) => {
          const has = g.badges[b.id];
          return (
            <div key={b.id} title={has ? `${b.name} — earned` : `${b.name}: ${b.hint}`} className={`flex flex-col items-center rounded-2xl border px-2 py-3 text-center ${has ? "border-[#d9f09a] bg-[#f7fde8]" : "border-[#eef1f6] bg-[#fafbfc]"}`}>
              <div className={`relative flex h-11 w-11 items-center justify-center rounded-full text-2xl ${has ? "bg-white shadow-sm" : "bg-[#eef1f6] grayscale opacity-50"}`}>
                {b.emoji}
                {!has && <Lock size={11} className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 text-[#94a3b8]" />}
              </div>
              <div className={`mt-2 text-[11.5px] font-bold leading-tight ${has ? "text-[#0b0b2c]" : "text-[#94a3b8]"}`}>{b.name}</div>
            </div>
          );
        })}
      </div>

      <button onClick={() => setShowRules((s) => !s)} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3434ff] hover:underline">
        <Info size={14} /> How points work
      </button>
      {showRules && (
        <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1.5 text-[13px] text-[#69697b] sm:grid-cols-2">
          {POINT_RULES.map((r) => (
            <li key={r.label} className="flex justify-between gap-4 border-b border-[#f1f4f8] py-1"><span>{r.label}</span><span className="font-bold text-[#0b0b2c]">+{r.points}</span></li>
          ))}
        </ul>
      )}

      {celebrate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b2c]/60 p-4" onClick={() => setCelebrate(null)}>
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setCelebrate(null)} className="absolute right-4 top-4 rounded-full p-1 text-[#94a3b8] hover:bg-[#f5f7fa]" aria-label="Close"><X size={18} /></button>
            <div className="text-6xl motion-safe:animate-bounce">{celebrate.levelUp ? level.emoji : BADGES.find((b) => b.id === celebrate.newBadges[0])?.emoji}</div>
            <h3 className="mt-4 text-2xl font-bold text-[#0b0b2c]">{celebrate.levelUp ? `You're now a ${level.name}!` : "New badge unlocked!"}</h3>
            <p className="mt-2 text-sm text-[#69697b]">
              {celebrate.levelUp
                ? `You've reached level ${g.level} with ${g.points} points. Keep going!`
                : celebrate.newBadges.map((id) => BADGES.find((b) => b.id === id)?.name).filter(Boolean).join(", ")}
            </p>
            {celebrate.levelUp && celebrate.newBadges.length > 0 && (
              <div className="mt-4 flex justify-center gap-2 text-2xl">{celebrate.newBadges.map((id) => <span key={id} title={BADGES.find((b) => b.id === id)?.name}>{BADGES.find((b) => b.id === id)?.emoji}</span>)}</div>
            )}
            <button onClick={() => setCelebrate(null)} className="mt-6 w-full rounded-xl bg-[#3434ff] py-3 text-sm font-bold text-white hover:bg-[#2a2ad6]">Nice!</button>
          </div>
        </div>
      )}
    </div>
  );
};
