import { useCallback, useContext, useEffect, useState } from "react";
import { Heart, MessageCircle, Trash2, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { LmsContext } from "@/pages/learn/LmsInterface";
import { toast } from "sonner";

interface Post { id: string; user_id: string; author_name: string; body: string; created_at: string }
interface Comment { id: string; post_id: string; user_id: string; author_name: string; body: string; created_at: string }
interface Like { post_id: string; user_id: string }

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px" };

const timeAgo = (iso: string) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export function LmsCommunity() {
  const { user } = useAuthUser();
  const ctx = useContext(LmsContext);
  const isAdmin = !!ctx?.isAdmin;
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  const displayName = () => {
    const meta = (user?.user_metadata as { full_name?: string } | undefined)?.full_name;
    return ctx?.user?.full_name || meta || user?.email?.split("@")[0] || "Learner";
  };

  const load = useCallback(async () => {
    const { data: postRows } = await supabase
      .from("community_posts")
      .select("id, user_id, author_name, body, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    const ps = (postRows ?? []) as Post[];
    setPosts(ps);
    if (ps.length) {
      const ids = ps.map((p) => p.id);
      const [c, l] = await Promise.all([
        supabase.from("community_comments").select("id, post_id, user_id, author_name, body, created_at").in("post_id", ids).order("created_at"),
        supabase.from("community_likes").select("post_id, user_id").in("post_id", ids),
      ]);
      setComments((c.data ?? []) as Comment[]);
      setLikes((l.data ?? []) as Like[]);
    } else {
      setComments([]);
      setLikes([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createPost = async () => {
    if (!user || !draft.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("community_posts").insert({ user_id: user.id, author_name: displayName(), body: draft.trim() });
    setPosting(false);
    if (error) {
      toast.error("Could not publish your post");
      return;
    }
    setDraft("");
    load();
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const liked = likes.some((l) => l.post_id === postId && l.user_id === user.id);
    setLikes((prev) => (liked ? prev.filter((l) => !(l.post_id === postId && l.user_id === user.id)) : [...prev, { post_id: postId, user_id: user.id }]));
    const { error } = liked
      ? await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", user.id)
      : await supabase.from("community_likes").insert({ post_id: postId, user_id: user.id });
    if (error) {
      toast.error("Could not update your like");
      load();
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !commentDraft.trim()) return;
    const { error } = await supabase.from("community_comments").insert({ post_id: postId, user_id: user.id, author_name: displayName(), body: commentDraft.trim() });
    if (error) {
      toast.error("Could not post your reply");
      return;
    }
    setCommentDraft("");
    load();
  };

  const remove = async (table: "community_posts" | "community_comments", id: string) => {
    if (!confirm("Delete this? This can't be undone.")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      toast.error("Could not delete");
      return;
    }
    load();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", color: "#0b0b2c", padding: "40px 28px 72px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815" }}>COMMUNITY</div>
        <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, color: "#0b0b2c" }}>Learn together</h1>
        <p style={{ margin: "12px 0 0", fontSize: "16px", lineHeight: 1.7, color: "#69697b" }}>
          Ask questions, share how you're applying AI in your EHS work, and learn from other safety professionals.
        </p>

        <div style={{ ...card, marginTop: "28px", padding: "20px" }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={4000}
            rows={3}
            placeholder="Start a discussion..."
            style={{ width: "100%", boxSizing: "border-box", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", fontFamily: "inherit", fontSize: "15px", color: "#0b0b2c", resize: "vertical" }}
          />
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={createPost}
              disabled={posting || !draft.trim()}
              style={{ border: 0, borderRadius: "8px", background: "#3434ff", color: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "12px 24px", cursor: posting || !draft.trim() ? "not-allowed" : "pointer", opacity: posting || !draft.trim() ? 0.55 : 1 }}
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}><Loader2 size={28} className="animate-spin" color="#3434ff" /></div>
        ) : posts.length === 0 ? (
          <div style={{ ...card, marginTop: "20px", padding: "36px", textAlign: "center", color: "#69697b" }}>No discussions yet. Be the first to post.</div>
        ) : (
          posts.map((p) => {
            const postLikes = likes.filter((l) => l.post_id === p.id);
            const liked = postLikes.some((l) => l.user_id === user?.id);
            const thread = comments.filter((c) => c.post_id === p.id);
            const open = openThread === p.id;
            return (
              <div key={p.id} style={{ ...card, marginTop: "16px", padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#3434ff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                    {p.author_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>{p.author_name}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{timeAgo(p.created_at)}</div>
                  </div>
                  {(p.user_id === user?.id || isAdmin) && (
                    <button onClick={() => remove("community_posts", p.id)} title="Delete post" style={{ background: "none", border: 0, cursor: "pointer", color: "#94a3b8" }}><Trash2 size={16} /></button>
                  )}
                </div>
                <p style={{ margin: "14px 0 0", fontSize: "15px", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{p.body}</p>
                <div style={{ marginTop: "16px", display: "flex", gap: "20px" }}>
                  <button onClick={() => toggleLike(p.id)} style={{ background: "none", border: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: liked ? "#e11d48" : "#69697b" }}>
                    <Heart size={16} fill={liked ? "#e11d48" : "none"} /> {postLikes.length}
                  </button>
                  <button onClick={() => { setOpenThread(open ? null : p.id); setCommentDraft(""); }} style={{ background: "none", border: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: open ? "#3434ff" : "#69697b" }}>
                    <MessageCircle size={16} /> {thread.length} {thread.length === 1 ? "reply" : "replies"}
                  </button>
                </div>
                {open && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f4f8" }}>
                    {thread.map((c) => (
                      <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#eef1f6", color: "#3434ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flex: "none" }}>
                          {c.author_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{c.author_name} <span style={{ fontWeight: 400, color: "#94a3b8" }}>· {timeAgo(c.created_at)}</span></div>
                          <div style={{ marginTop: 2, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{c.body}</div>
                        </div>
                        {(c.user_id === user?.id || isAdmin) && (
                          <button onClick={() => remove("community_comments", c.id)} title="Delete reply" style={{ background: "none", border: 0, cursor: "pointer", color: "#94a3b8" }}><Trash2 size={14} /></button>
                        )}
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addComment(p.id)}
                        maxLength={2000}
                        placeholder="Write a reply..."
                        style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontFamily: "inherit", fontSize: 14, color: "#0b0b2c" }}
                      />
                      <button onClick={() => addComment(p.id)} disabled={!commentDraft.trim()} style={{ border: 0, borderRadius: 8, background: "#3434ff", color: "#fff", padding: "0 14px", cursor: commentDraft.trim() ? "pointer" : "not-allowed", opacity: commentDraft.trim() ? 1 : 0.5 }}>
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        <div style={{ ...card, marginTop: "28px", padding: "22px", background: "#f4fbe4", border: "1px solid #d9f09a" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>Community guidelines</div>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: "14px", lineHeight: 1.7, color: "#4a5230" }}>
            <li>Be respectful — we're all here to make workplaces safer.</li>
            <li>Don't share confidential incident details or personal data.</li>
            <li>Keep it relevant to EHS, AI and the courses.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
