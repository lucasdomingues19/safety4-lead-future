import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const REACTIONS = [
  { kind: "like", emoji: "👍", label: "Like" },
  { kind: "love", emoji: "❤️", label: "Love" },
  { kind: "support", emoji: "🙌", label: "Support" },
  { kind: "insightful", emoji: "💡", label: "Insightful" },
  { kind: "celebrate", emoji: "🎉", label: "Celebrate" },
] as const;
type Kind = (typeof REACTIONS)[number]["kind"];

/** Reactions for a set of lesson comments: one query, optimistic toggles. */
export function useCommentReactions(commentIds: string[], userId: string | undefined) {
  const [rows, setRows] = useState<{ comment_id: string; user_id: string; kind: Kind }[]>([]);
  const key = commentIds.join(",");

  const load = useCallback(async () => {
    if (!commentIds.length) { setRows([]); return; }
    const { data } = await supabase.from("lesson_comment_reactions").select("comment_id, user_id, kind").in("comment_id", commentIds);
    setRows((data ?? []) as typeof rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => { load(); }, [load]);

  const toggle = async (commentId: string, kind: Kind) => {
    if (!userId) return;
    const mine = rows.some((r) => r.comment_id === commentId && r.user_id === userId && r.kind === kind);
    setRows((rs) => mine
      ? rs.filter((r) => !(r.comment_id === commentId && r.user_id === userId && r.kind === kind))
      : [...rs, { comment_id: commentId, user_id: userId, kind }]);
    const { error } = mine
      ? await supabase.from("lesson_comment_reactions").delete().eq("comment_id", commentId).eq("user_id", userId).eq("kind", kind)
      : await supabase.from("lesson_comment_reactions").insert({ comment_id: commentId, user_id: userId, kind });
    if (error) load(); // roll back to the truth
  };

  return useMemo(() => ({ rows, toggle }), [rows]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** The reaction row under a comment: counts for what's been used, plus a picker. */
export function ReactionBar({ commentId, rows, userId, onToggle }: {
  commentId: string;
  rows: { comment_id: string; user_id: string; kind: Kind }[];
  userId: string | undefined;
  onToggle: (commentId: string, kind: Kind) => void;
}) {
  const [open, setOpen] = useState(false);
  const mine = rows.filter((r) => r.comment_id === commentId);
  const used = REACTIONS.filter((r) => mine.some((m) => m.kind === r.kind));

  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {used.map((r) => {
        const n = mine.filter((m) => m.kind === r.kind).length;
        const on = mine.some((m) => m.kind === r.kind && m.user_id === userId);
        return (
          <button key={r.kind} type="button" onClick={() => onToggle(commentId, r.kind)} aria-pressed={on} aria-label={`${r.label}: ${n}`} title={r.label}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, border: `1px solid ${on ? "#3434ff" : "#e2e8f0"}`, background: on ? "#f5f7ff" : "#fff", color: on ? "#2c23d2" : "#475569", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <span aria-hidden>{r.emoji}</span>{n}
          </button>
        );
      })}
      <span style={{ position: "relative" }}>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Add a reaction"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, border: "1px dashed #cbd5e1", background: "#fff", color: "#69697b", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          <span aria-hidden>☺</span> React
        </button>
        {open && (
          <div role="menu" style={{ position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 30, display: "flex", gap: 2, padding: 5, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 12px 30px rgba(11,11,44,.15)" }}>
            {REACTIONS.map((r) => (
              <button key={r.kind} type="button" role="menuitem" title={r.label} aria-label={r.label} onClick={() => { onToggle(commentId, r.kind); setOpen(false); }}
                style={{ width: 38, height: 38, border: 0, borderRadius: 10, background: "transparent", fontSize: 21, cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f4f8"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                {r.emoji}
              </button>
            ))}
          </div>
        )}
      </span>
    </div>
  );
}
