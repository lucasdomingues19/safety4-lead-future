import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";

// Lightweight emoji picker (no library): a curated set that fits a
// professional EHS community, including safety-themed emoji.
const GROUPS: { label: string; emoji: string[] }[] = [
  { label: "Smileys", emoji: ["😀", "😃", "😄", "😁", "😅", "😂", "🙂", "😉", "😊", "😍", "🤩", "😎", "🤔", "🧐", "😮", "😬", "😴", "🥳", "🤯", "😇"] },
  { label: "Reactions", emoji: ["👍", "👏", "🙌", "🙏", "💪", "🤝", "👀", "💯", "✅", "❤️", "🔥", "✨", "🎉", "🏆", "🥇", "🚀", "💡", "📈", "🎯", "⭐"] },
  { label: "Safety", emoji: ["🦺", "⛑️", "🚧", "⚠️", "🧯", "🚨", "🏗️", "🏭", "🔒", "🩺", "🧤", "🥽", "♻️", "🌱", "🌍", "⚡", "🛠️", "📋", "🧪", "🚑"] },
  { label: "Work", emoji: ["🤖", "🧠", "💻", "📱", "📊", "📚", "🎓", "📝", "📌", "📎", "🗓️", "⏱️", "☕", "🔍", "🧩", "🗣️", "📣", "💬", "✉️", "🔗"] },
];

export const EmojiPicker = ({ onPick, size = 18 }: { onPick: (emoji: string) => void; size?: number }) => {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-center rounded-lg p-2 transition hover:bg-[#f1f4ff] hover:text-[#3434ff] ${open ? "bg-[#f1f4ff] text-[#3434ff]" : "text-[#69697b]"}`}
        aria-label="Add emoji"
        aria-expanded={open}
      >
        <Smile size={size} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-[296px] rounded-2xl border border-[#e2e8f0] bg-white p-2 shadow-[0_18px_40px_rgba(11,11,44,0.14)]">
          <div className="mb-2 flex gap-1">
            {GROUPS.map((g, i) => (
              <button key={g.label} type="button" onClick={() => setGroup(i)} className={`rounded-md px-2 py-1 text-[11px] font-bold ${group === i ? "bg-[#3434ff] text-white" : "text-[#69697b] hover:bg-[#f5f7fa]"}`}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-8 gap-0.5">
            {GROUPS[group].emoji.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { onPick(e); setOpen(false); }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-xl transition hover:scale-110 hover:bg-[#f5f7fa]"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/** Insert text at the caret of a textarea/input and return the new value. */
export const insertAtCaret = (el: HTMLTextAreaElement | HTMLInputElement | null, value: string, insert: string) => {
  if (!el) return value + insert;
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? value.length;
  const next = value.slice(0, start) + insert + value.slice(end);
  requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + insert.length, start + insert.length); });
  return next;
};
