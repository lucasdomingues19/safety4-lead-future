import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, X } from "lucide-react";
import { MiaAvatar } from "@/components/learn/MiaAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useTourActive } from "@/lib/tour";

interface Turn {
  role: "user" | "assistant";
  content: string;
  /** Mia couldn't answer, or the learner asked for a person: offer to send it to the team. */
  needsTeam?: boolean;
  reason?: "not_covered" | "asked_for_person";
  /** The question behind this reply (the learner's message just before it). */
  question?: string;
  sent?: boolean;
}

const SUGGESTIONS = [
  "How do I get my certificate?",
  "How do I reset my password?",
  "Where do I find my receipts?",
  "How does the leaderboard work?",
];

/** Mia in the corner of every LMS screen: answers how-to questions about the platform. Hidden during the tour. */
export function MiaHelp() {
  const tourOn = useTourActive();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  if (tourOn) return null;

  const sendToTeam = async (index: number) => {
    const turn = turns[index];
    if (!turn?.question || turn.sent) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mia-help`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ action: "escalate", question: turn.question, reply: turn.content, reason: turn.reason ?? "not_covered" }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Could not send. Please email hello@safetytech.academy.");
      setTurns((t) => t.map((x, i) => (i === index ? { ...x, sent: true } : x)));
    } catch (e) {
      setTurns((t) => [...t, { role: "assistant", content: e instanceof Error ? e.message : "Could not send. Please email hello@safetytech.academy." }]);
    }
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    const next = [...turns, { role: "user" as const, content: question }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mia-help`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}`, "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ messages: next }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Mia couldn't answer just now. Try again shortly.");
      setTurns((t) => [...t, { role: "assistant", content: j.reply, needsTeam: !!j.needs_team, reason: j.reason, question }]);
    } catch (e) {
      setTurns((t) => [...t, { role: "assistant", content: e instanceof Error ? e.message : "Mia couldn't answer just now." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open && (
        <div role="dialog" aria-label="Ask Mia" className="fixed bottom-20 right-3 z-[35] flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_rgba(11,11,44,.18)] sm:bottom-6 sm:right-6"
          style={{ width: "min(370px, calc(100vw - 24px))", height: "min(540px, 70vh)", border: "1px solid #e2e8f0" }}>
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <MiaAvatar size={36} ring={false} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold text-[#0b0b2c]">Mia</div>
              <div className="text-xs text-[#69697b]">Ask how to use the academy</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close Mia" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {turns.length === 0 && (
              <>
                <p className="text-[#0b0b2c]">Hi, I'm Mia. I can show you around the academy: courses, lessons, certificates, the community and settings.</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#3434ff] hover:bg-[#f5f7ff]">{s}</button>
                  ))}
                </div>
              </>
            )}
            {turns.map((t, i) => (
              <div key={i} className={t.role === "user" ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[#e8ecff] px-3.5 py-2 text-[#0b0b2c]" : "max-w-[92%] rounded-2xl rounded-bl-sm bg-[#f1f4fb] px-3.5 py-2 text-[#0b0b2c] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:my-1"}>
                {t.role === "user" ? t.content : <ReactMarkdown>{t.content}</ReactMarkdown>}
                {t.role === "assistant" && t.needsTeam && (
                  <div className="mt-2 border-t border-slate-200 pt-2 text-xs text-[#4a4a60]">
                    {t.sent ? (
                      "Sent. The academy team will reply to your email."
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{t.reason === "asked_for_person" ? "Want a person to reply?" : "Want the team to look into this?"}</span>
                        <button onClick={() => sendToTeam(i)} className="rounded-full bg-[#3434ff] px-3 py-1 font-bold text-white">Send to our team</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {busy && <div className="text-xs text-[#69697b]">Mia is typing…</div>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-slate-100 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                rows={1}
                maxLength={1500}
                placeholder="Ask about the academy…"
                aria-label="Your question for Mia"
                style={{ color: "#0b0b2c", WebkitTextFillColor: "#0b0b2c", backgroundColor: "#ffffff" }}
                className="max-h-24 flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#3434ff] focus:outline-none"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3434ff] text-white disabled:opacity-40">
                <ArrowUp size={18} />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-[#94a3b8]">For account, billing or refund requests, email hello@safetytech.academy.</p>
          </form>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask Mia for help"
          className="fixed bottom-20 right-3 z-[35] flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-[0_10px_30px_rgba(11,11,44,.18)] sm:bottom-6 sm:right-6"
        >
          <MiaAvatar size={44} />
          <span className="text-sm font-extrabold text-[#0b0b2c]">Ask Mia</span>
        </button>
      )}
    </>
  );
}
