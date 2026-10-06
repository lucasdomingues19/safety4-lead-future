import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Square } from "lucide-react";
import { MiaAvatar } from "@/components/learn/MiaAvatar";
import { supabase } from "@/integrations/supabase/client";

interface Turn { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "Summarise this lesson in three points",
  "Give me an example from a real workplace",
  "Quiz me on this lesson",
  "How could I apply this in my role?",
];

const storeKey = (lessonId: string) => `mia-chat:${lessonId}`;

/** "Ask Mia": a lesson-aware AI tutor (edge fn lesson-tutor, streamed). */
export function LessonTutor({ lessonId, preview }: { lessonId: string; preview?: boolean }) {
  const [turns, setTurns] = useState<Turn[]>(() => {
    try { return JSON.parse(sessionStorage.getItem(storeKey(lessonId)) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { sessionStorage.setItem(storeKey(lessonId), JSON.stringify(turns.slice(-20))); } catch { /* private mode */ }
  }, [turns, lessonId]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [turns]);
  useEffect(() => () => abort.current?.abort(), []);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setError(null);
    setInput("");
    const history: Turn[] = [...turns, { role: "user", content: q }];
    setTurns([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    const ctl = new AbortController();
    abort.current = ctl;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lesson-tutor`, {
        method: "POST",
        signal: ctl.signal,
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ lessonId, messages: history }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Mia couldn't answer just now. Try again shortly.");
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        setTurns([...history, { role: "assistant", content: text }]);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setTurns((t) => (t[t.length - 1]?.content ? t : t.slice(0, -1)));
      } else {
        setTurns(history.slice(0, -1));
        setInput(q);
        setError((e as Error).message);
      }
    } finally {
      setBusy(false);
      abort.current = null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {turns.length === 0 ? (
        <div style={{ borderRadius: 14, background: "linear-gradient(135deg,#f5f7ff,#f4fbe4)", padding: "18px 18px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
            <MiaAvatar size={30} ring={false} /> Ask Mia about this lesson
          </div>
          <p style={{ margin: "6px 0 14px", fontSize: 13.5, color: "#69697b", lineHeight: 1.55 }}>
            Mia has read this lesson's transcript and notes. Ask anything: what a term means, how it applies to your site, or test yourself.
            {preview ? " (Admin preview: questions work here too.)" : ""}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => ask(s)} style={{ border: "1px solid #dfe3ff", background: "#fff", borderRadius: 999, padding: "7px 12px", fontSize: 13, fontWeight: 600, color: "#0b0b2c", cursor: "pointer", fontFamily: "inherit" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }} aria-live="polite">
          {turns.map((t, i) => (
            t.role === "user" ? (
              <div key={i} style={{ alignSelf: "flex-end", maxWidth: "85%", background: "#3434ff", color: "#fff", borderRadius: "14px 14px 4px 14px", padding: "10px 14px", fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{t.content}</div>
            ) : (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", maxWidth: "100%" }}>
                <MiaAvatar size={28} ring={false} />
                <div style={{ minWidth: 0, background: "#f5f7fa", borderRadius: "4px 14px 14px 14px", padding: "10px 14px", fontSize: 14, lineHeight: 1.65 }} className="prose prose-sm max-w-none">
                  {t.content ? <ReactMarkdown>{t.content}</ReactMarkdown> : <span style={{ color: "#69697b" }}>Mia is thinking…</span>}
                </div>
              </div>
            )
          ))}
          <div ref={end} />
        </div>
      )}

      {error && <p role="alert" style={{ margin: 0, fontSize: 13, color: "#b91c1c" }}>{error}</p>}

      <form onSubmit={(e) => { e.preventDefault(); ask(input); }} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
          maxLength={2000}
          rows={1}
          placeholder="Ask Mia a question about this lesson…"
          aria-label="Your question for Mia"
          style={{ flex: 1, resize: "none", padding: "11px 14px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 16, fontFamily: "inherit", lineHeight: 1.4, outline: "none", minHeight: 44, maxHeight: 140 }}
        />
        {busy ? (
          <button type="button" onClick={() => abort.current?.abort()} aria-label="Stop" style={sendBtn("#0b0b2c")}><Square size={15} /></button>
        ) : (
          <button type="submit" disabled={!input.trim()} aria-label="Send" style={{ ...sendBtn("#3434ff"), opacity: input.trim() ? 1 : 0.4 }}><ArrowUp size={18} /></button>
        )}
      </form>
      {turns.length > 0 && !busy && (
        <button type="button" onClick={() => { setTurns([]); setError(null); }} style={{ alignSelf: "flex-start", border: 0, background: "none", padding: 0, fontSize: 12.5, color: "#69697b", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
          Start a new conversation
        </button>
      )}
      <p style={{ margin: 0, fontSize: 11.5, color: "#94a3b8" }}>Mia is AI and can make mistakes. Check important points against the lesson.</p>
    </div>
  );
}

const sendBtn = (bg: string): React.CSSProperties => ({ flex: "none", width: 44, height: 44, border: 0, borderRadius: 12, background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" });
