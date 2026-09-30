import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Award, MousePointer2, BookOpen, Calendar, Camera, CheckCircle2, Flame, Globe2, GraduationCap, Heart, KeyRound, Linkedin, Lock, MessageCircle, PlayCircle, Radio, Receipt, Sparkles, Trophy, Video } from "lucide-react";
import brandMarkWhite from "@/assets/brand-mark-white.png";
import type { SceneId } from "@/lib/tour";

// Every scene is pure CSS animation (keyframes + delays), so it can pause,
// restart and respect reduced-motion without any timers. Scenes remount when
// they change, which replays their animation from the start.

export const TOUR_CSS = `
@keyframes tr-up{from{opacity:0;transform:translateY(22px) scale(.98)}to{opacity:1;transform:none}}
@keyframes tr-pop{0%{opacity:0;transform:scale(.4)}70%{transform:scale(1.12)}100%{opacity:1;transform:scale(1)}}
@keyframes tr-fill{from{width:0}to{width:var(--to)}}
@keyframes tr-slide{from{opacity:0;transform:translateX(-26px)}to{opacity:1;transform:none}}
@keyframes tr-glow{0%,100%{box-shadow:0 0 0 0 rgba(158,255,31,.55)}50%{box-shadow:0 0 0 14px rgba(158,255,31,0)}}
@keyframes tr-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes tr-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes tr-seal{0%{opacity:0;transform:scale(2.4) rotate(-18deg)}60%{opacity:1;transform:scale(.92) rotate(4deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes tr-unlock{0%{opacity:.5;filter:grayscale(1)}100%{opacity:1;filter:none}}
@keyframes tr-rise{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translateY(-70px) scale(1.2)}}
@keyframes tr-out{from{opacity:1}to{opacity:0;transform:scale(.8)}}
@keyframes tr-hand{0%{opacity:0;transform:translate(70px,60px)}25%{opacity:1}70%{transform:translate(0,0)}78%{transform:translate(0,0) scale(.82)}88%{transform:translate(0,0) scale(1)}100%{opacity:1;transform:translate(0,0)}}
@keyframes tr-ripple{0%{opacity:.7;transform:translate(-50%,-50%) scale(0)}100%{opacity:0;transform:translate(-50%,-50%) scale(1)}}
@keyframes tr-hand-out{to{opacity:0}}
@keyframes tr-scene{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}
@keyframes tr-drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(8vw,6vh)}}
@keyframes tr-drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-7vw,-5vh)}}
.tr-a{animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.8,.2,1)}
.tr-paused .tr-a,.tr-paused .tr-inf{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.tr-a,.tr-inf{animation:none!important;opacity:1!important;transform:none!important}}
`;

const a = (name: string, dur = 0.7, delay = 0, extra: CSSProperties = {}): CSSProperties => ({ animationName: name, animationDuration: `${dur}s`, animationDelay: `${delay}s`, ...extra });
const A = ({ name, dur, delay, children, style, className = "" }: { name: string; dur?: number; delay?: number; children: ReactNode; style?: CSSProperties; className?: string }) => (
  <div className={`tr-a ${className}`} style={{ ...a(name, dur, delay), ...style }}>{children}</div>
);

// a miniature of the real LMS card style
const Card = ({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-white text-[#0b0b2c] shadow-[0_20px_50px_rgba(0,0,0,0.35)] ${className}`} style={style}>{children}</div>
);
const Bar = ({ pct, delay = 0.4, dur = 1.6, color = "#3434ff" }: { pct: number; delay?: number; dur?: number; color?: string }) => (
  <div className="h-2 overflow-hidden rounded-full bg-[#e8ebf4]"><div className="tr-a h-full rounded-full" style={{ ...a("tr-fill", dur, delay), background: color, ["--to" as string]: `${pct}%` }} /></div>
);
const Tag = ({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "lime" | "navy" | "red" }) => (
  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone === "lime" ? "bg-[#ecffd1] text-[#3f6212]" : tone === "navy" ? "bg-[#202058] text-[#9eff1f]" : tone === "red" ? "bg-[#e11d48] text-white" : "bg-[#eef1ff] text-[#3434ff]"}`}>{children}</span>
);
// Scales a scene down (never up) so it always fits the stage with breathing
// room, from a phone in portrait to a wide desktop.
const Stage = ({ children }: { children: ReactNode }) => {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const pad = 28;
      const h = i.offsetHeight, w = i.offsetWidth;
      if (!h || !w) return;
      setScale(Math.min(1, (o.clientHeight - pad) / h, (o.clientWidth - 16) / w));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o); ro.observe(i);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={outer} className="flex h-full w-full items-center justify-center overflow-hidden px-4">
      <div ref={inner} className="flex w-full max-w-full shrink-0 justify-center" style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>{children}</div>
    </div>
  );
};

/** An animated hand that glides in and taps its parent (which must be `relative`). */
const Tap = ({ delay, stay = false }: { delay: number; stay?: boolean }) => (
  <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-10">
    <span className="tr-a absolute left-0 top-0 h-16 w-16 rounded-full bg-[#9eff1f]" style={a("tr-ripple", 0.7, delay + 1.05, { animationFillMode: "both" })} />
    <span className="tr-a absolute left-0 top-0 block" style={{ ...a("tr-hand", 1.3, delay), ...(stay ? {} : { animation: `tr-hand 1.3s cubic-bezier(.2,.8,.2,1) ${delay}s both, tr-hand-out .4s ease ${delay + 2}s forwards` }) }}>
      <MousePointer2 size={26} className="-translate-x-1 -translate-y-1 fill-white text-[#0b0b2c] drop-shadow-[0_4px_10px_rgba(0,0,0,.45)]" strokeWidth={1.6} />
    </span>
  </span>
);

// ---------------------------------------------------------------------------
const Welcome = ({ name }: { name: string }) => (
  <Stage>
    <div className="text-center">
      <A name="tr-pop" dur={0.9}><img src={brandMarkWhite} alt="" className="mx-auto h-16 w-auto" /></A>
      <A name="tr-up" delay={0.5}><div className="mt-6 text-xs font-extrabold uppercase tracking-[0.25em] text-[#9eff1f]">SafetyTech Academy</div></A>
      <A name="tr-up" delay={0.8}><h2 className="mt-3 text-4xl font-bold leading-tight text-white md:text-6xl">Welcome, {name}</h2></A>
      <A name="tr-up" delay={1.3}><p className="mx-auto mt-4 max-w-md text-base text-white/70 md:text-lg">A two-minute tour of your learning home.</p></A>
    </div>
  </Stage>
);

const Dashboard = ({ course }: { course: string }) => (
  <Stage>
    <div className="w-full max-w-2xl space-y-4">
      <A name="tr-up" delay={0.2}>
        <div className="rounded-2xl bg-gradient-to-br from-[#17176e] to-[#05051e] p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#a6e21a]">Continue where you left off</div>
          <div className="mt-2 text-xl font-bold md:text-2xl">{course}</div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="tr-a h-full rounded-full bg-[#a6e21a]" style={{ ...a("tr-fill", 1.8, 0.9), ["--to" as string]: "62%" }} /></div>
          <div className="mt-4"><span className="relative inline-block"><span className="tr-a tr-inf inline-block rounded-full bg-[#3434ff] px-5 py-2.5 text-xs font-bold uppercase tracking-wider" style={{ ...a("tr-pulse", 1.6, 1.5, { animationIterationCount: "infinite" }) }}>Resume course</span><Tap delay={3} /></span></div>
        </div>
      </A>
      <div className="grid grid-cols-3 gap-3">
        <A name="tr-up" delay={1}><Card className="p-4"><BookOpen size={20} className="text-[#3434ff]" /><div className="mt-2 text-sm font-bold">My courses</div><div className="mt-2"><Bar pct={62} delay={1.4} /></div></Card></A>
        <A name="tr-up" delay={1.25}><Card className="p-4"><Trophy size={20} className="text-[#8ab815]" /><div className="mt-2 text-sm font-bold">Level 2</div><div className="text-xs text-[#69697b]">Practitioner</div></Card></A>
        <A name="tr-up" delay={1.5}><Card className="p-4"><Flame size={20} className="text-[#c2410c]" /><div className="mt-2 text-sm font-bold">5 day streak</div><div className="text-xs text-[#69697b]">Keep it going</div></Card></A>
      </div>
    </div>
  </Stage>
);

const Learning = () => {
  const lessons = [
    { t: "Welcome to the course", done: true },
    { t: "Why AI matters in EHS", done: true },
    { t: "Hands-on workshop", done: false, next: true },
    { t: "Wrap-up", done: false, locked: true },
  ];
  return (
    <Stage>
      <div className="grid w-full max-w-3xl gap-4 md:grid-cols-[1.25fr_1fr]">
        <A name="tr-up" delay={0.2}>
          <Card className="overflow-hidden">
            <div className="flex aspect-video items-center justify-center bg-[#0b0b2c]"><PlayCircle size={52} className="text-white/80" /></div>
            <div className="p-4">
              <div className="flex justify-between text-[11px] font-semibold text-[#69697b]"><span>Watched</span><span>92%</span></div>
              <div className="mt-1.5"><Bar pct={92} delay={0.6} dur={3} color="#16a34a" /></div>
              <A name="tr-pop" delay={3.4} style={{ marginTop: 12 }}><div className="tr-inf relative inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-4 py-2 text-xs font-bold text-white" style={{ animation: "tr-glow 1.6s infinite" }}><CheckCircle2 size={14} /> Mark complete & continue<Tap delay={3.6} /></div></A>
            </div>
          </Card>
        </A>
        <div className="space-y-2.5">
          {lessons.map((l, i) => (
            <A key={l.t} name="tr-slide" delay={0.5 + i * 0.35}>
              <Card className="flex items-center gap-3 px-4 py-3">
                {l.done ? <CheckCircle2 size={18} className="text-[#16a34a]" /> : l.locked ? <div className="tr-a" style={a("tr-unlock", 0.6, 4.6)}><Lock size={18} className="text-[#94a3b8]" /></div> : <PlayCircle size={18} className="text-[#3434ff]" />}
                <span className="text-sm font-semibold">{l.t}</span>
                {l.next && <span className="ml-auto"><Tag>Up next</Tag></span>}
              </Card>
            </A>
          ))}
          <A name="tr-up" delay={2.2}><div className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-medium text-white/80">Lessons unlock in order as you complete them.</div></A>
        </div>
      </div>
    </Stage>
  );
};

const Assess = ({ name }: { name: string }) => (
  <Stage>
    <div className="grid w-full max-w-3xl items-center gap-5 md:grid-cols-2">
      <div className="space-y-2.5">
        {["Module 1 quiz", "Module 2 quiz", "Final assessment"].map((q, i) => (
          <A key={q} name="tr-slide" delay={0.3 + i * 0.9}>
            <Card className="flex items-center gap-3 px-4 py-3.5">
              <GraduationCap size={18} className="text-[#3434ff]" />
              <span className="text-sm font-semibold">{q}</span>
              <span className="tr-a ml-auto" style={a("tr-pop", 0.5, 0.9 + i * 0.9)}><Tag tone="lime">Passed</Tag></span>
            </Card>
          </A>
        ))}
      </div>
      <A name="tr-up" delay={3.2}>
        <div className="relative rounded-2xl border-4 border-[#9eff1f]/70 bg-white p-6 text-center text-[#0b0b2c] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#3434ff]">Certificate of completion</div>
          <div className="mt-2 text-lg font-bold">{name}</div>
          <div className="mt-1 text-xs text-[#69697b]">IOSH-approved Safety 4.0</div>
          <div className="tr-a absolute -bottom-5 -right-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#3434ff] text-white shadow-lg" style={a("tr-seal", 0.8, 4.2)}><Award size={30} /></div>
          <div className="tr-a mt-5 flex justify-center gap-2" style={a("tr-up", 0.6, 5)}><Tag tone="lime">✓ Verified</Tag><span className="inline-flex items-center gap-1 rounded-full bg-[#0a66c2] px-2.5 py-1 text-[11px] font-bold text-white"><Linkedin size={11} /> Add to LinkedIn</span></div>
        </div>
      </A>
    </div>
  </Stage>
);

const Points = () => (
  <Stage>
    <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
      <A name="tr-up" delay={0.2}>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🦺</div>
            <div className="flex-1"><div className="text-xs font-extrabold uppercase tracking-wider text-[#8ab815]">Level 2</div><div className="text-xl font-bold">Practitioner</div><div className="mt-2"><Bar pct={72} delay={0.6} dur={2.4} /></div></div>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="flex items-center gap-1.5 rounded-xl bg-[#fff7ed] px-3 py-2 text-sm font-extrabold text-[#c2410c]"><Flame size={16} /> 5</div>
            <div className="relative flex items-center gap-1.5 rounded-xl bg-[#f1f4ff] px-3 py-2 text-sm font-extrabold text-[#3434ff]">+10 pts
              <span className="tr-a absolute -top-1 right-2 text-xs font-extrabold text-[#16a34a]" style={a("tr-rise", 1.6, 1.4)}>+10</span>
              <span className="tr-a absolute -top-1 right-8 text-xs font-extrabold text-[#16a34a]" style={a("tr-rise", 1.6, 2.4)}>+50</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {["👣", "🔥", "🎯", "🎓", "📜"].map((b, i) => (
              <div key={b} className="tr-a flex aspect-square items-center justify-center rounded-xl bg-[#f7fde8] text-2xl" style={a("tr-pop", 0.5, 1.2 + i * 0.4)}>{b}</div>
            ))}
          </div>
        </Card>
      </A>
      <A name="tr-up" delay={1}>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Trophy size={16} className="text-[#3434ff]" /> Leaderboard</div>
          {[["Sarah K.", "Leader", 1540], ["You", "Practitioner", 340], ["Dan R.", "Observer", 85]].map(([n, l, p], i) => (
            <div key={n as string} className={`tr-a flex items-center gap-3 rounded-xl px-3 py-2.5 ${n === "You" ? "bg-[#f1f4ff]" : ""}`} style={a("tr-slide", 0.5, 1.4 + i * 0.35)}>
              <span className="w-4 text-sm font-extrabold text-[#94a3b8]">{i + 1}</span>
              <span className="flex-1"><span className="block text-sm font-bold">{n}</span><span className="text-[11px] text-[#69697b]">{l}</span></span>
              <span className="text-sm font-extrabold">{p}</span>
            </div>
          ))}
        </Card>
      </A>
    </div>
  </Stage>
);

const Community = () => (
  <Stage>
    <div className="w-full max-w-2xl">
      <A name="tr-up" delay={0.2}>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1.5">
          <div className="flex items-center gap-2 rounded-xl bg-[#3434ff] px-3 py-2.5 text-white"><GraduationCap size={18} /><span className="text-sm font-bold">SafetyTech Academy<span className="block text-[10px] font-semibold opacity-70">Free</span></span></div>
          <div className="tr-a flex items-center gap-2 rounded-xl bg-[#202058] px-3 py-2.5 text-white" style={a("tr-up", 0.6, 0.9)}><Globe2 size={18} className="text-[#9eff1f]" /><span className="text-sm font-bold">Global Network<span className="block text-[10px] font-semibold opacity-70">Members</span></span></div>
        </div>
      </A>
      <A name="tr-up" delay={1.3} style={{ marginTop: 14 }}>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3434ff] text-sm font-bold text-white">SK</div>
            <div className="flex-1"><div className="text-sm font-bold">Sarah K. <Tag>Specialist</Tag></div><div className="text-xs text-[#94a3b8]">just now · 💬 Wins</div></div>
          </div>
          <p className="mt-3 text-sm leading-relaxed">Just finished my first module. The hands-on exercise was brilliant 🎉</p>
          <div className="tr-a mt-3 flex aspect-[16/6] items-center justify-center rounded-xl bg-gradient-to-br from-[#3434ff] to-[#202058]" style={a("tr-up", 0.6, 2.2)}><Camera size={26} className="text-white/70" /></div>
          <div className="mt-3 flex gap-2">
            {["🎉 4", "💡 2", "🙌 3"].map((r, i) => <span key={r} className="tr-a rounded-full border border-[#3434ff]/30 bg-[#f1f4ff] px-2.5 py-1 text-xs font-bold text-[#3434ff]" style={a("tr-pop", 0.4, 2.8 + i * 0.35)}>{r}</span>)}
            <span className="tr-a ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#69697b]" style={a("tr-up", 0.4, 3.9)}><MessageCircle size={14} /> Reply</span>
          </div>
        </Card>
      </A>
    </div>
  </Stage>
);

const Events = () => (
  <Stage>
    <div className="w-full max-w-2xl space-y-3.5">
      <A name="tr-up" delay={0.2}>
        <div className="flex items-center gap-3 rounded-2xl bg-[#e11d48] px-4 py-3.5 text-white shadow-[0_12px_32px_rgba(225,29,72,0.4)]">
          <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" /><span className="relative inline-flex h-3 w-3 rounded-full bg-white" /></span>
          <span className="flex-1"><span className="block text-[11px] font-extrabold uppercase tracking-wider opacity-90">Live now</span><span className="block text-[15px] font-bold">Live Q&A: AI for incident investigation</span></span>
          <span className="relative rounded-lg bg-white px-3.5 py-2 text-[13px] font-bold text-[#e11d48]">Watch</span>
        </div>
      </A>
      <A name="tr-up" delay={1.2}>
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-[#f1f4ff] text-[#3434ff]"><span className="text-[10px] font-bold uppercase">Oct</span><span className="text-xl font-extrabold leading-none">14</span></div>
          <div className="flex-1"><div className="text-[15px] font-bold">AI in EHS masterclass</div><div className="text-xs text-[#69697b]">Tue, 14:00–15:00 BST · 38 going</div></div>
          <span className="relative inline-flex h-9 min-w-[104px] items-center justify-center">
            <span className="tr-a absolute inset-0 inline-flex items-center justify-center rounded-lg bg-[#3434ff] text-[13px] font-bold text-white" style={a("tr-out", 0.4, 2.4)}>I'm going</span>
            <span className="tr-a absolute inset-0 inline-flex items-center justify-center rounded-lg bg-[#ecffd1] text-[13px] font-bold text-[#3f6212]" style={a("tr-pop", 0.5, 2.8)}>✓ Going</span>
            <Tap delay={1.35} />
          </span>
        </Card>
      </A>
      <div className="flex flex-wrap gap-2.5">
        {[[<Calendar key="c" size={15} />, "Add to calendar"], [<Video key="v" size={15} />, "Join on Zoom"], [<Radio key="r" size={15} />, "Replay"]].map(([ic, t], i) => (
          <A key={t as string} name="tr-up" delay={3 + i * 0.4}><span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white">{ic}{t}</span></A>
        ))}
      </div>
    </div>
  </Stage>
);

const Settings = () => (
  <Stage>
    <div className="grid w-full max-w-3xl gap-3.5 md:grid-cols-3">
      {[
        { i: <Camera size={22} className="text-[#3434ff]" />, t: "Profile photo", s: "Shown in the community" },
        { i: <Sparkles size={22} className="text-[#8ab815]" />, t: "Your name", s: "Printed on certificates" },
        { i: <KeyRound size={22} className="text-[#3434ff]" />, t: "Password", s: "Change it any time" },
        { i: <Receipt size={22} className="text-[#3434ff]" />, t: "Receipts", s: "Every purchase, with invoices" },
        { i: <BookOpen size={22} className="text-[#3434ff]" />, t: "Course access", s: "Start and end dates" },
        { i: <Heart size={22} className="text-[#e11d48]" />, t: "Support", s: "Answers and a direct line" },
      ].map((x, i) => (
        <A key={x.t} name="tr-up" delay={0.25 + i * 0.4}><Card className="p-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f4ff]">{x.i}</div><div className="mt-3 text-sm font-bold">{x.t}</div><div className="text-xs text-[#69697b]">{x.s}</div></Card></A>
      ))}
    </div>
  </Stage>
);

const Go = ({ cta }: { cta: string }) => (
  <Stage>
    <div className="text-center">
      <A name="tr-pop" dur={0.8}><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#9eff1f] text-[#0b0b2c]" style={{ animation: "tr-float 3s ease-in-out infinite" }}><PlayCircle size={40} /></div></A>
      <A name="tr-up" delay={0.6}><h2 className="mt-6 text-3xl font-bold text-white md:text-5xl">You're all set</h2></A>
      <A name="tr-up" delay={1.1}><p className="mx-auto mt-3 max-w-md text-base text-white/70">{cta}</p></A>
    </div>
  </Stage>
);

/** Slow drifting brand glows over a faint grid — sits behind every scene. */
export const TourBackdrop = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)" }} />
    <div className="tr-inf absolute -left-[10%] top-[8%] h-[46vmax] w-[46vmax] rounded-full bg-[#3434ff] opacity-30 blur-[110px]" style={{ animation: "tr-drift1 18s ease-in-out infinite" }} />
    <div className="tr-inf absolute -right-[12%] bottom-[-6%] h-[38vmax] w-[38vmax] rounded-full bg-[#9eff1f] opacity-[0.13] blur-[120px]" style={{ animation: "tr-drift2 22s ease-in-out infinite" }} />
  </div>
);

export function TourScene({ id, name, course }: { id: SceneId; name: string; course: string | null }) {
  return <div className="tr-a relative h-full w-full" style={a("tr-scene", 0.6)}><SceneBody id={id} name={name} course={course} /></div>;
}

function SceneBody({ id, name, course }: { id: SceneId; name: string; course: string | null }) {
  switch (id) {
    case "welcome": return <Welcome name={name} />;
    case "dashboard": return <Dashboard course={course ?? "Your first course"} />;
    case "learning": return <Learning />;
    case "assess": return <Assess name={name} />;
    case "points": return <Points />;
    case "community": return <Community />;
    case "events": return <Events />;
    case "settings": return <Settings />;
    case "go": return <Go cta={course ? `Next up: ${course}.` : "Browse the courses on your dashboard and start your first lesson."} />;
  }
}
