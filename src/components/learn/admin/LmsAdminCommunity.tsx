import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Kpi, PanelHeader, Spinner, adminFont, panel } from "./adminUi";

interface Post { id: string; author_name: string; body: string; created_at: string }
interface LComment { id: string; author_name: string; body: string; created_at: string; lesson_id: string }

export function LmsAdminCommunity() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [lessonComments, setLessonComments] = useState<LComment[]>([]);
  const [counts, setCounts] = useState({ posts: 0, replies: 0, lesson: 0 });

  const load = useCallback(async () => {
    const [p, lc, cp, cr, cl] = await Promise.all([
      supabase.from("community_posts").select("id, author_name, body, created_at").order("created_at", { ascending: false }).limit(20),
      supabase.from("lesson_comments").select("id, author_name, body, created_at, lesson_id").order("created_at", { ascending: false }).limit(20),
      supabase.from("community_posts").select("id", { count: "exact", head: true }),
      supabase.from("community_comments").select("id", { count: "exact", head: true }),
      supabase.from("lesson_comments").select("id", { count: "exact", head: true }),
    ]);
    setPosts((p.data ?? []) as Post[]);
    setLessonComments((lc.data ?? []) as LComment[]);
    setCounts({ posts: cp.count ?? 0, replies: cr.count ?? 0, lesson: cl.count ?? 0 });
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (table: "community_posts" | "lesson_comments", id: string) => {
    if (!confirm("Remove this content permanently?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error("Could not remove it"); return; }
    toast.success("Removed");
    load();
  };

  if (loading) return <Spinner />;

  const Row = ({ who, body, at, onDelete }: { who: string; body: string; at: string; onDelete: () => void }) => (
    <div style={{ padding: "16px 28px", borderBottom: "1px solid #f1f4f8", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{who} <span style={{ fontWeight: 400, color: "#94a3b8" }}>· {new Date(at).toLocaleString()}</span></div>
        <div style={{ marginTop: 4, fontSize: 14, color: "#0b0b2c", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{body}</div>
      </div>
      <button onClick={onDelete} title="Remove" style={{ background: "none", border: 0, cursor: "pointer", color: "#c93636" }}><Trash2 size={16} /></button>
    </div>
  );

  return (
    <div style={{ marginTop: 28, fontFamily: adminFont, display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
        <Kpi label="Community posts" value={counts.posts} />
        <Kpi label="Community replies" value={counts.replies} />
        <Kpi label="Lesson comments" value={counts.lesson} />
      </div>
      <div style={panel}>
        <PanelHeader title="Latest community posts" sub="Remove anything that breaks the guidelines." />
        {posts.length === 0 && <div style={{ padding: 28, fontSize: 13, color: "#94a3b8" }}>No posts yet.</div>}
        {posts.map((p) => <Row key={p.id} who={p.author_name} body={p.body} at={p.created_at} onDelete={() => remove("community_posts", p.id)} />)}
      </div>
      <div style={panel}>
        <PanelHeader title="Latest lesson comments" />
        {lessonComments.length === 0 && <div style={{ padding: 28, fontSize: 13, color: "#94a3b8" }}>No lesson comments yet.</div>}
        {lessonComments.map((c) => <Row key={c.id} who={c.author_name} body={c.body} at={c.created_at} onDelete={() => remove("lesson_comments", c.id)} />)}
      </div>
    </div>
  );
}
