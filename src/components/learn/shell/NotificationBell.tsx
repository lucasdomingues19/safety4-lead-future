import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Note { id: string; kind: string; title: string; body: string | null; link: string | null; created_at: string; read_at: string | null }

const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/** In-app notifications: unread badge, a dropdown list, mark as read. */
export function NotificationBell({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const unread = notes.filter((n) => !n.read_at).length;

  const load = useCallback(async () => {
    const { data } = await supabase.from("notifications").select("id, kind, title, body, link, created_at, read_at")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(30);
    setNotes((data as Note[]) ?? []);
  }, [userId]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 60_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { window.clearInterval(t); window.removeEventListener("focus", onFocus); };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  const markRead = async (ids: string[]) => {
    if (!ids.length) return;
    const at = new Date().toISOString();
    setNotes((ns) => ns.map((n) => (ids.includes(n.id) ? { ...n, read_at: n.read_at ?? at } : n)));
    await supabase.from("notifications").update({ read_at: at }).in("id", ids).is("read_at", null);
  };

  const openNote = (n: Note) => {
    markRead([n.id]);
    setOpen(false);
    if (!n.link) return;
    if (/^https?:\/\//.test(n.link)) window.open(n.link, "_blank", "noopener");
    else if (n.link.startsWith("/verify/")) window.open(n.link, "_blank", "noopener");
    else navigate(n.link);
  };

  return (
    <div ref={box} style={{ position: "relative", flex: "none" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        style={{ position: "relative", width: 42, height: 42, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#0b0b2c", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <Bell size={19} />
        {unread > 0 && (
          <span style={{ position: "absolute", top: -5, right: -5, minWidth: 19, height: 19, padding: "0 5px", borderRadius: 999, background: "#3434ff", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Notifications" style={{ position: "absolute", right: 0, top: 50, width: "min(380px, calc(100vw - 24px))", maxHeight: "min(520px, 75vh)", overflow: "hidden", display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 24px 60px rgba(11,11,44,.18)", zIndex: 60 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #f1f4f8" }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Notifications</span>
            {unread > 0 && (
              <button type="button" onClick={() => markRead(notes.filter((n) => !n.read_at).map((n) => n.id))} style={{ border: 0, background: "none", color: "#3434ff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>
          <div style={{ overflowY: "auto" }}>
            {notes.length === 0 ? (
              <p style={{ margin: 0, padding: "28px 16px", textAlign: "center", fontSize: 14, color: "#69697b" }}>You're all caught up.</p>
            ) : notes.map((n) => (
              <button key={n.id} type="button" onClick={() => openNote(n)} style={{ width: "100%", textAlign: "left", display: "flex", gap: 10, padding: "12px 16px", border: 0, borderBottom: "1px solid #f5f7fa", background: n.read_at ? "#fff" : "#f5f7ff", cursor: "pointer", fontFamily: "inherit", color: "#0b0b2c" }}>
                <span aria-hidden style={{ width: 8, height: 8, marginTop: 6, flex: "none", borderRadius: 999, background: n.read_at ? "transparent" : "#3434ff" }} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>{n.title}</span>
                  {n.body && <span style={{ marginTop: 2, fontSize: 13, color: "#69697b", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>{n.body}</span>}
                  <span style={{ display: "block", marginTop: 4, fontSize: 12, color: "#94a3b8" }}>{ago(n.created_at)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
