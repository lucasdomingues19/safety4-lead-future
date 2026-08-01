import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { openWhatsAppBusiness } from "@/lib/outreach";

type Msg = { role: "user" | "assistant"; content: string };

const SESSION_KEY = "s4a_chat_session_id";
const HISTORY_KEY = "s4a_chat_history";
const BUSINESS_PHONE = "447983819437";
const BUSINESS_MESSAGE = "Hi Lucas, I was chatting with the site assistant and would like to speak with your team.";

function getOrCreateSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

const WELCOME: Msg = {
  role: "assistant",
  content: "Hello, how can I help you?",
};

const AUTO_OPEN_KEY = "s4a_chat_auto_opened";

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      // Auto-open once per session on desktop only
      try {
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        if (isDesktop && !sessionStorage.getItem(AUTO_OPEN_KEY)) {
          sessionStorage.setItem(AUTO_OPEN_KEY, "1");
          setOpen(true);
        }
      } catch {}
    }, 1500);
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Msg[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {}
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-40)));
    } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const QUICK_OPTIONS = [
    "What courses do you offer?",
    "How much does it cost?",
    "Is it IOSH approved?",
    "When is the next cohort?",
    "Speak to a human",
  ];

  const send = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || loading) return;
    if (!text) setInput("");
    setMessages((m) => [...m, { role: "user", content: messageText }]);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: {
          session_id: getOrCreateSessionId(),
          message: messageText,
          page_url: window.location.href,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const reply: string = data?.reply ?? "Sorry, something went wrong.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (data?.escalated) setEscalated(true);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry — I'm having trouble responding right now. Please tap the WhatsApp button below to reach our team directly.",
        },
      ]);
      setEscalated(true);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const openWhatsApp = async () => {
    const result = await openWhatsAppBusiness(BUSINESS_PHONE, BUSINESS_MESSAGE);
    toast[result.success ? "success" : "error"](result.message);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
          className="fixed bottom-6 right-24 z-50 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 animate-fade-in"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[380px] h-[560px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">SafetyTech Academy Assistant</div>
              <div className="text-xs opacity-90">We usually reply in seconds</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/90 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            {escalated && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="block w-full text-center bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Continue on WhatsApp
                </button>
              </div>
            )}
          </div>

          {/* Quick options */}
          {!escalated && (
            <div className="border-t border-slate-100 bg-white px-3 pt-2 pb-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-medium">
                Quick options
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => send(option)}
                    disabled={loading}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="border-t border-slate-200 bg-white p-2 flex items-end gap-2 text-slate-900">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about courses, pricing…"
              rows={1}
              maxLength={2000}
              className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 max-h-32"
            />
            <Button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
