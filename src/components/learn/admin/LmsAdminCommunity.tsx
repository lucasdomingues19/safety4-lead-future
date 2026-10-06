import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Kpi, PanelHeader, Spinner, adminFont, panel } from "./adminUi";

interface Post { id: string; author_name: string; body: string; created_at: string; space: string; media: { path: string }[] | null }
interface Reply { id: string; author_name: string; body: string; created_at: string }
const SPACE_LABEL: Record<string, string> = { academy: "SafetyTech Academy", "global-network": "Global Network" };
interface LComment { id: string; author_name: string; body: string; created_at: string; lesson_id: string }

export function LmsAdminCommunity() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [lessonComments, setLessonComments] = useState<LComment[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [counts, setCounts] = useState({ posts: 0, replies: 0, lesson: 0 });

  const load = useCallback(async () => {
    const [p, lc, cp, cr, cl, rp] = await Promise.all([
      supabase.from("community_posts").select("id, author_name, body, created_at, space, media").order("created_at", { ascending: false }).limit(20),
      supabase.from("lesson_comments").select("id, author_name, body, created_at, lesson_id").order("created_at", { ascending: false }).limit(20),
      supabase.from("community_posts").select("id", { count: "exact", head: true }),
      supabase.from("community_comments").select("id", { count: "exact", head: true }),
      supabase.from("lesson_comments").select("id", { count: "exact", head: true }),
      supabase.from("community_comments").select("id, author_name, body, created_at").order("created_at", { ascending: false }).limit(20),
    ]);
    setReplies((rp.data ?? []) as Reply[]);
    setPosts((p.data ?? []) as unknown as Post[]);
    setLessonComments((lc.data ?? []) as LComment[]);
    setCounts({ posts: cp.count ?? 0, replies: cr.count ?? 0, lesson: cl.count ?? 0 });
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (table: "community_posts" | "community_comments" | "lesson_comments", id: string, mediaPaths: string[] = []) => {
    if (!confirm("Remove this content permanently?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error("Could not remove it"); return; }
    if (mediaPaths.length) await supabase.storage.from("community-media").remove(mediaPaths);
    toast.success("Removed");
    load();
  };

  if (loading) return <Spinner />;

  const Row = ({ who, body, at, tag, onDelete }: { who: string; body: string; at: string; tag?: string; onDelete: () => void }) => (
    <div style={{ padding: "16px 28px", borderBottom: "1px solid #f1f4f8", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{who} <span style={{ fontWeight: 400, color: "#94a3b8" }}>· {new Date(at).toLocaleString()}</span>{tag && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: tag === "Global Network" ? "#202058" : "#f1f4ff", color: tag === "Global Network" ? "#9eff1f" : "#3434ff" }}>{tag}</span>}</div>
        <div style={{ marginTop: 4, fontSize: 14, color: "#0b0b2c", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{body}</div>
      </div>
      <button onClick={onDelete} title="Remove" style={{ background: "none", border: 0, cursor: "pointer", color: "#c93636" }}><Trash2 size={16} /></button>
    </div>
  );

  return (
    <div style={{ marginTop: 28, fontFamily: adminFont, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px, 100%), 1fr))", gap: 20 }}>
        <Kpi label="Community posts" value={counts.posts} />
        <Kpi label="Community replies" value={counts.replies} />
        <Kpi label="Lesson comments" value={counts.lesson} />
      </div>
      <div style={panel}>
        <PanelHeader title="Latest community posts" sub="Remove anything that breaks the guidelines." />
        {posts.length === 0 && <div style={{ padding: 28, fontSize: 13, color: "#94a3b8" }}>No posts yet.</div>}
        {posts.map((p) => {
          const media = Array.isArray(p.media) ? p.media : [];
          return <Row key={p.id} who={p.author_name} body={`${p.body}${media.length ? `\n📎 ${media.length} attachment${media.length === 1 ? "" : "s"}` : ""}`} at={p.created_at} tag={SPACE_LABEL[p.space] ?? p.space} onDelete={() => remove("community_posts", p.id, media.map((m) => m.path))} />;
        })}
      </div>
      <div style={panel}>
        <PanelHeader title="Latest community replies" />
        {replies.length === 0 && <div style={{ padding: 28, fontSize: 13, color: "#94a3b8" }}>No replies yet.</div>}
        {replies.map((r) => <Row key={r.id} who={r.author_name} body={r.body} at={r.created_at} onDelete={() => remove("community_comments", r.id)} />)}
      </div>
      <div style={panel}>
        <PanelHeader title="Latest lesson comments" />
        {lessonComments.length === 0 && <div style={{ padding: 28, fontSize: 13, color: "#94a3b8" }}>No lesson comments yet.</div>}
        {lessonComments.map((c) => <Row key={c.id} who={c.author_name} body={c.body} at={c.created_at} onDelete={() => remove("lesson_comments", c.id)} />)}
      </div>
    </div>
  );
}
