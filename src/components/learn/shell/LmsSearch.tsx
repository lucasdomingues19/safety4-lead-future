import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, StickyNote, AlignLeft, Type, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface Hit { lesson_id: string; course_slug: string; course_title: string; module_title: string; lesson_title: string; kind: string; snippet: string; score: number }
interface Group { lessonId: string; slug: string; course: string; module: string; title: string; hits: Hit[] }

const KIND: Record<string, { label: string; tab: string; Icon: typeof Type }> = {
  title: { label: "Lesson", tab: "overview", Icon: Type },
  overview: { label: "Overview", tab: "overview", Icon: FileText },
  transcript: { label: "Transcript", tab: "transcript", Icon: AlignLeft },
  note: { label: "My note", tab: "overview", Icon: StickyNote },
};

/** Wrap the searched words in <mark> inside a snippet. */
function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  return <>{text.split(re).map((part, i) => (i % 2 ? <mark key={i} style={{ background: "#e8ffbd", color: "inherit", borderRadius: 3, padding: "0 1px" }}>{part}</mark> : <Fragment key={i}>{part}</Fragment>))}</>;
}

/** Search across lessons, transcripts and your own notes. Open with ⌘K / Ctrl+K or "/". */
export function LmsSearch({ phone }: { phone?: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);
  const seq = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); }
      else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const words = useMemo(() => q.toLowerCase().split(/\s+/).filter((w) => w.length >= 2).slice(0, 6), [q]);

  useEffect(() => {
    if (q.trim().length < 2) { setHits(null); setBusy(false); setError(false); return; }
    setBusy(true);
    const id = ++seq.current;
    const timer = setTimeout(async () => {
      const { data, error: err } = await supabase.rpc("search_learning" as never, { _q: q, _limit: 40 } as never);
      if (id !== seq.current) return;
      setBusy(false);
      setError(!!err);
      setHits(err ? [] : ((data ?? []) as Hit[]));
      setActive(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const h of hits ?? []) {
      const g = map.get(h.lesson_id) ?? { lessonId: h.lesson_id, slug: h.course_slug, course: h.course_title, module: h.module_title, title: h.lesson_title, hits: [] };
      g.hits.push(h);
      map.set(h.lesson_id, g);
    }
    return [...map.values()];
  }, [hits]);

  const go = useCallback((g: Group, h?: Hit) => {
    const best = h ?? g.hits[0];
    const tab = KIND[best.kind]?.tab ?? "overview";
    setOpen(false);
    navigate(`/learn/${g.slug}/lesson/${g.lessonId}?tab=${tab}&q=${encodeURIComponent(q.trim())}`);
  }, [navigate, q]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, groups.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && groups[active]) { e.preventDefault(); go(groups[active]); }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Search lessons, transcripts and notes"
        style={phone
          ? { width: 40, height: 40, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0b0b2c" }
          : { display: "flex", alignItems: "center", gap: 8, height: 40, minWidth: 220, padding: "0 12px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#69697b", fontFamily: "inherit", fontSize: 13.5 }}>
        <Search size={16} />
        {!phone && <><span style={{ flex: 1, textAlign: "left" }}>Search lessons…</span><kbd style={{ fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 6, padding: "1px 6px", color: "#94a3b8", fontFamily: "inherit" }}>⌘K</kbd></>}
      </button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setQ(""); setHits(null); } }}>
        <DialogContent className="top-[12%] max-w-2xl translate-y-0 gap-0 overflow-hidden border-[#e2e8f0] bg-white p-0 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c]">
          <DialogTitle className="sr-only">Search your courses</DialogTitle>
          <DialogDescription className="sr-only">Search lesson titles, overviews, transcripts and your own notes</DialogDescription>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid #e2e8f0" }}>
            {busy ? <Loader2 size={18} className="animate-spin" color="#3434ff" /> : <Search size={18} color="#3434ff" />}
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown} placeholder="Search lessons, transcripts and your notes…"
              aria-label="Search" style={{ flex: 1, border: 0, outline: "none", fontSize: 16, fontFamily: "inherit", background: "transparent" }} />
          </div>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {q.trim().length < 2 && <p style={{ margin: 0, padding: "26px 22px", fontSize: 14, color: "#69697b" }}>Type at least 2 letters. Try a topic like <em>governance</em>, a tool, or something you wrote in your notes.</p>}
            {error && <p role="alert" style={{ margin: 0, padding: "22px", fontSize: 14, color: "#b91c1c" }}>Search isn't available right now. Please try again in a moment.</p>}
            {!error && hits && groups.length === 0 && !busy && <p style={{ margin: 0, padding: "26px 22px", fontSize: 14, color: "#69697b" }}>No matches for “{q.trim()}” in your courses.</p>}
            {groups.map((g, i) => (
              <div key={g.lessonId} onMouseEnter={() => setActive(i)}
                style={{ padding: "12px 18px", borderTop: i ? "1px solid #f1f4f8" : 0, background: i === active ? "#f5f7ff" : "#fff" }}>
                <button type="button" onClick={() => go(g)} style={{ display: "block", width: "100%", border: 0, background: "none", padding: 0, textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: "inherit" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#8ab815", textTransform: "uppercase" }}>{g.course} · {g.module}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}><Highlight text={g.title} words={words} /></div>
                </button>
                {g.hits.filter((h) => h.kind !== "title").slice(0, 3).map((h) => {
                  const K = KIND[h.kind] ?? KIND.overview;
                  return (
                    <button key={h.kind} type="button" onClick={() => go(g, h)} style={{ display: "flex", gap: 8, alignItems: "flex-start", width: "100%", border: 0, background: "none", padding: "6px 0 0", textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: "#475569", fontSize: 13, lineHeight: 1.5 }}>
                      <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 1, fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "#eef0ff", color: "#3434ff" }}><K.Icon size={11} /> {K.label}</span>
                      <span style={{ minWidth: 0 }}><Highlight text={h.snippet} words={words} /></span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, padding: "9px 18px", borderTop: "1px solid #e2e8f0", fontSize: 11.5, color: "#94a3b8" }}>
            <span>↑↓ to move</span><span>Enter to open</span><span>Esc to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
