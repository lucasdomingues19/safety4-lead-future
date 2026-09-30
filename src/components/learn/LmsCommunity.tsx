import { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Film, Globe2, GraduationCap, ImagePlus, Loader2, Lock, MessageCircle, MoreHorizontal, Pin, PinOff, Send, SmilePlus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { LmsContext } from "@/pages/learn/LmsInterface";
import { toast } from "sonner";
import { toEmbedUrl } from "@/lib/lms";
import { EmojiPicker, insertAtCaret } from "./EmojiPicker";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---------- model ----------
const TOPICS = [
  { id: "general", label: "General", emoji: "💬" },
  { id: "questions", label: "Questions", emoji: "❓" },
  { id: "wins", label: "Wins", emoji: "🎉" },
  { id: "ai-in-ehs", label: "AI in EHS", emoji: "🤖" },
  { id: "resources", label: "Resources", emoji: "📚" },
] as const;
type TopicId = (typeof TOPICS)[number]["id"];
const REACTIONS = ["👍", "❤️", "🎉", "💡", "😂", "🙌"] as const;

// Two spaces: the free Academy community and the paid Global Network.
// Access is enforced by RLS (has_community_access); this only drives the UI.
const SPACES = [
  { id: "academy", name: "SafetyTech Academy", tier: "Free", icon: GraduationCap, title: "Learn together", intro: "Ask questions, share wins and show how you're applying AI in your EHS work." },
  { id: "global-network", name: "SafetyTech Global Network", tier: "Members", icon: Globe2, title: "SafetyTech Global Network", intro: "The members-only community of SafetyTech Academy." },
] as const;
type SpaceId = (typeof SPACES)[number]["id"];
const SPACE_KEY = "lms-community-space";

interface MediaItem { type: "image" | "video"; path: string }
interface Post { id: string; user_id: string; author_name: string; body: string; created_at: string; media: MediaItem[]; topic: TopicId; pinned: boolean }
interface Comment { id: string; post_id: string; user_id: string; author_name: string; body: string; created_at: string }
interface Reaction { post_id: string; user_id: string; emoji: string }

const BUCKET = "community-media";
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

// ---------- helpers ----------
const timeAgo = (iso: string) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const AVATAR_COLOURS = ["#3434ff", "#2c23d2", "#0f766e", "#b45309", "#be185d", "#7c3aed", "#0369a1", "#4d7c0f"];
const avatarColour = (name: string) => AVATAR_COLOURS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLOURS.length];
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => (
  <div className="flex shrink-0 items-center justify-center rounded-full font-bold text-white" style={{ width: size, height: size, background: avatarColour(name), fontSize: size * 0.36 }}>
    {initials(name)}
  </div>
);

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g;
const Linkified = ({ text }: { text: string }) => (
  <>
    {text.split(URL_RE).map((part, i) =>
      i % 2 === 1 ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="break-all font-medium text-[#3434ff] underline-offset-2 hover:underline">{part}</a>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    )}
  </>
);

/** First embeddable video link in a post (YouTube, Vimeo, Loom). */
const embedFor = (text: string) => {
  const url = text.match(/https?:\/\/[^\s]*(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/|loom\.com\/share\/)[^\s]*/i)?.[0];
  return url ? toEmbedUrl(url) : null;
};

/** Shrink big photos before upload (phone photos are often 5–10 MB). */
const shrinkImage = async (file: File): Promise<File> => {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1_500_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
};

// ---------- component ----------
export function LmsCommunity() {
  const { user } = useAuthUser();
  const ctx = useContext(LmsContext);
  const isAdmin = !!ctx?.isAdmin;

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<TopicId | "all">("all");
  const [space, setSpace] = useState<SpaceId>(() => {
    try { return localStorage.getItem(SPACE_KEY) === "global-network" ? "global-network" : "academy"; } catch { return "academy"; }
  });
  const [networkAccess, setNetworkAccess] = useState<boolean | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_community_access", { _user: user.id, _space: "global-network" }).then(({ data }) => setNetworkAccess(!!data));
  }, [user]);
  const switchSpace = (id: SpaceId) => {
    setSpace(id);
    setFilter("all");
    setOpenThread(null);
    try { localStorage.setItem(SPACE_KEY, id); } catch { /* private mode */ }
  };
  const spaceInfo = SPACES.find((x) => x.id === space)!;
  const locked = space === "global-network" && networkAccess === false;

  // composer
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState<TopicId>("general");
  const [files, setFiles] = useState<File[]>([]);
  const [pinOnPost, setPinOnPost] = useState(false);
  const [posting, setPosting] = useState(false);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  // threads
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const commentRef = useRef<HTMLInputElement>(null);
  const [reactingOn, setReactingOn] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const displayName = () => {
    const meta = (user?.user_metadata as { full_name?: string } | undefined)?.full_name;
    return (ctx?.user?.full_name && !ctx.user.full_name.includes("@") ? ctx.user.full_name : "") || meta?.trim() || "Learner";
  };

  const load = useCallback(async () => {
    const { data: postRows } = await supabase
      .from("community_posts")
      .select("id, user_id, author_name, body, created_at, media, topic, pinned")
      .eq("space", space)
      .order("created_at", { ascending: false })
      .limit(60);
    const ps = (postRows ?? []) as unknown as Post[];
    setPosts(ps);
    if (ps.length) {
      const ids = ps.map((p) => p.id);
      const paths = ps.flatMap((p) => (Array.isArray(p.media) ? p.media : []).map((m) => m.path));
      const [c, r, signed] = await Promise.all([
        supabase.from("community_comments").select("id, post_id, user_id, author_name, body, created_at").in("post_id", ids).order("created_at"),
        supabase.from("community_reactions").select("post_id, user_id, emoji").in("post_id", ids),
        paths.length ? supabase.storage.from(BUCKET).createSignedUrls(paths, 3600) : Promise.resolve({ data: [] as { path: string | null; signedUrl: string }[] }),
      ]);
      setComments((c.data ?? []) as Comment[]);
      setReactions((r.data ?? []) as Reaction[]);
      setMediaUrls(Object.fromEntries((signed.data ?? []).filter((s) => s.path && s.signedUrl).map((s) => [s.path!, s.signedUrl])));
    } else {
      setComments([]);
      setReactions([]);
    }
    setLoading(false);
  }, [space]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  // Live updates: new posts/replies (or deletions) from anyone refresh the feed.
  useEffect(() => {
    let timer: number | undefined;
    const refresh = () => { window.clearTimeout(timer); timer = window.setTimeout(load, 400); };
    const channel = supabase
      .channel("community-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_comments" }, refresh)
      .subscribe();
    return () => { window.clearTimeout(timer); supabase.removeChannel(channel); };
  }, [load]);

  // ---------- composer ----------
  const addFiles = async (picked: FileList | null) => {
    if (!picked?.length) return;
    const list = Array.from(picked);
    const video = list.find((f) => f.type.startsWith("video/"));
    if (video) {
      if (video.size > MAX_VIDEO_BYTES) { toast.error("Videos can be up to 50 MB — or paste a YouTube/Vimeo/Loom link instead"); return; }
      setFiles([video]);
      return;
    }
    const images = list.filter((f) => f.type.startsWith("image/"));
    const tooBig = images.find((f) => f.size > MAX_IMAGE_BYTES);
    if (tooBig) { toast.error(`${tooBig.name} is over 10 MB`); return; }
    const base = files.some((f) => f.type.startsWith("video/")) ? [] : files;
    const next = [...base, ...(await Promise.all(images.map(shrinkImage)))].slice(0, MAX_IMAGES);
    if (base.length + images.length > MAX_IMAGES) toast.info(`Up to ${MAX_IMAGES} photos per post`);
    setFiles(next);
  };

  const createPost = async () => {
    if (!user || (!draft.trim() && !files.length)) return;
    setPosting(true);
    const uploaded: string[] = [];
    try {
      const media: MediaItem[] = [];
      for (const [i, f] of files.entries()) {
        const path = `${user.id}/${Date.now()}-${i}-${f.name.replace(/[^\w.-]+/g, "-").slice(-60)}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type });
        if (error) throw error;
        uploaded.push(path);
        media.push({ type: f.type.startsWith("video/") ? "video" : "image", path });
      }
      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        author_name: displayName(),
        body: draft.trim(),
        media: media as never,
        topic,
        space,
        pinned: isAdmin && pinOnPost,
      });
      if (error) throw error;
      setDraft("");
      setFiles([]);
      setPinOnPost(false);
      toast.success("Posted");
      load();
    } catch (err) {
      console.error(err);
      if (uploaded.length) supabase.storage.from(BUCKET).remove(uploaded);
      toast.error("Could not publish your post");
    } finally {
      setPosting(false);
    }
  };

  // ---------- actions ----------
  const toggleReaction = async (postId: string, emoji: string) => {
    if (!user) return;
    const mine = reactions.some((r) => r.post_id === postId && r.user_id === user.id && r.emoji === emoji);
    setReactions((prev) => (mine ? prev.filter((r) => !(r.post_id === postId && r.user_id === user.id && r.emoji === emoji)) : [...prev, { post_id: postId, user_id: user.id, emoji }]));
    setReactingOn(null);
    const { error } = mine
      ? await supabase.from("community_reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("emoji", emoji)
      : await supabase.from("community_reactions").insert({ post_id: postId, user_id: user.id, emoji });
    if (error) { toast.error("Could not update your reaction"); load(); }
  };

  const addComment = async (postId: string) => {
    if (!user || !commentDraft.trim()) return;
    const { error } = await supabase.from("community_comments").insert({ post_id: postId, user_id: user.id, author_name: displayName(), body: commentDraft.trim() });
    if (error) { toast.error("Could not post your reply"); return; }
    setCommentDraft("");
    load();
  };

  const removePost = async (p: Post) => {
    if (!confirm("Delete this post? This can't be undone.")) return;
    const { error } = await supabase.from("community_posts").delete().eq("id", p.id);
    if (error) { toast.error("Could not delete"); return; }
    const paths = (p.media ?? []).map((m) => m.path);
    if (paths.length) supabase.storage.from(BUCKET).remove(paths);
    load();
  };

  const removeComment = async (id: string) => {
    if (!confirm("Delete this reply?")) return;
    const { error } = await supabase.from("community_comments").delete().eq("id", id);
    if (error) { toast.error("Could not delete"); return; }
    load();
  };

  const togglePin = async (p: Post) => {
    const { error } = await supabase.from("community_posts").update({ pinned: !p.pinned }).eq("id", p.id);
    if (error) { toast.error("Could not update"); return; }
    toast.success(p.pinned ? "Unpinned" : "Pinned to the top");
    load();
  };

  // ---------- render ----------
  const visible = posts
    .filter((p) => filter === "all" || p.topic === filter)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.created_at < b.created_at ? 1 : -1));
  const canPost = !!draft.trim() || files.length > 0;

  return (
    <div className="min-h-screen bg-[#eef1f6] px-4 pb-20 pt-10 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c] md:px-7">
      <div className="mx-auto max-w-[760px]">
        <p className="text-[13px] font-extrabold tracking-[0.12em] text-[#8ab815]">COMMUNITY</p>

        {/* Space switcher */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5">
          {SPACES.map((sp) => {
            const active = space === sp.id;
            const isLocked = sp.id === "global-network" && networkAccess === false;
            const Icon = sp.icon;
            return (
              <button
                key={sp.id}
                onClick={() => switchSpace(sp.id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${active ? (sp.id === "global-network" ? "bg-[#202058] text-white" : "bg-[#3434ff] text-white") : "text-[#0b0b2c] hover:bg-[#f5f7fa]"}`}
              >
                <Icon size={20} className={active && sp.id === "global-network" ? "text-[#9eff1f]" : ""} />
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-bold">{sp.name}</span>
                  <span className={`flex items-center gap-1 text-[11px] font-semibold ${active ? "text-white/70" : "text-[#94a3b8]"}`}>
                    {isLocked && <Lock size={10} />} {sp.tier}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <h1 className="mt-6 text-[34px] font-bold leading-tight md:text-[38px]">{spaceInfo.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-[#69697b]">{spaceInfo.intro}</p>

        {locked ? (
          <div className="mt-7 overflow-hidden rounded-[20px] bg-[#202058] p-8 text-center text-white md:p-10">
            <Globe2 className="mx-auto h-10 w-10 text-[#9eff1f]" />
            <h2 className="mt-4 text-2xl font-bold">Members only</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-[#cfcfdb]">
              SafetyTech Global Network is our paid membership community. Get in touch and we'll set up your membership.
            </p>
            <a
              href="mailto:hello@safetytech.academy?subject=SafetyTech%20Global%20Network%20membership"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#9eff1f] px-6 py-3 text-sm font-bold text-[#0b0b2c] transition hover:brightness-95"
            >
              Ask about membership
            </a>
          </div>
        ) : (<>

        {/* Composer */}
        <div className="mt-7 rounded-[20px] border border-[#e2e8f0] bg-white p-4 md:p-5">
          <div className="flex gap-3">
            <Avatar name={displayName()} />
            <div className="min-w-0 flex-1">
              <textarea
                ref={draftRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={4000}
                rows={draft ? 4 : 2}
                placeholder="Share something with the community…"
                className="w-full resize-none rounded-xl border-0 bg-[#f5f7fa] px-4 py-3 text-[15px] leading-relaxed outline-none transition placeholder:text-[#94a3b8] focus:bg-white focus:ring-2 focus:ring-[#3434ff]/20"
              />
              {files.length > 0 && (
                <div className={`mt-3 grid gap-2 ${files.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {files.map((f, i) => (
                    <div key={i} className="relative overflow-hidden rounded-xl bg-[#0b0b2c]">
                      {f.type.startsWith("video/") ? (
                        <video src={previews[i]} className="max-h-72 w-full object-contain" muted controls />
                      ) : (
                        <img src={previews[i]} alt="" className={`w-full object-cover ${files.length === 1 ? "max-h-80" : "aspect-square"}`} />
                      )}
                      <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80" aria-label="Remove attachment"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-1">
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-[13px] font-semibold text-[#69697b] transition hover:bg-[#f1f4ff] hover:text-[#3434ff]" title="Add photos">
                  <ImagePlus size={18} /> <span className="hidden sm:inline">Photo</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-[13px] font-semibold text-[#69697b] transition hover:bg-[#f1f4ff] hover:text-[#3434ff]" title="Add a video (or paste a YouTube link)">
                  <Film size={18} /> <span className="hidden sm:inline">Video</span>
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                </label>
                <EmojiPicker onPick={(e) => setDraft(insertAtCaret(draftRef.current, draft, e))} />
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as TopicId)}
                  className="ml-1 h-9 rounded-lg border border-[#e2e8f0] bg-white px-2 text-[13px] font-semibold text-[#0b0b2c]"
                  aria-label="Topic"
                >
                  {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
                </select>
                {isAdmin && (
                  <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-[#69697b]">
                    <input type="checkbox" checked={pinOnPost} onChange={(e) => setPinOnPost(e.target.checked)} className="accent-[#3434ff]" /> Pin as announcement
                  </label>
                )}
                <button
                  onClick={createPost}
                  disabled={posting || !canPost}
                  className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2a2ad6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {posting && <Loader2 size={15} className="animate-spin" />} Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Topic filter */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {[{ id: "all" as const, label: "All", emoji: "✨" }, ...TOPICS].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${filter === t.id ? "bg-[#0b0b2c] text-white" : "bg-white text-[#69697b] hover:text-[#0b0b2c]"}`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="mt-12 flex justify-center"><Loader2 size={28} className="animate-spin text-[#3434ff]" /></div>
        ) : visible.length === 0 ? (
          <div className="mt-4 rounded-[20px] border border-[#e2e8f0] bg-white p-10 text-center">
            <div className="text-4xl">👋</div>
            <p className="mt-3 font-semibold">{filter === "all" ? "No posts yet — start the conversation!" : "Nothing in this topic yet."}</p>
            <p className="mt-1 text-sm text-[#69697b]">Introduce yourself, share a win or ask a question.</p>
          </div>
        ) : (
          visible.map((p) => {
            const postReactions = reactions.filter((r) => r.post_id === p.id);
            const counts = REACTIONS.map((e) => ({ emoji: e, count: postReactions.filter((r) => r.emoji === e).length, mine: postReactions.some((r) => r.emoji === e && r.user_id === user?.id) })).filter((r) => r.count > 0);
            const thread = comments.filter((c) => c.post_id === p.id);
            const open = openThread === p.id;
            const media = Array.isArray(p.media) ? p.media : [];
            const images = media.filter((m) => m.type === "image");
            const video = media.find((m) => m.type === "video");
            const embed = !media.length ? embedFor(p.body) : null;
            const topicInfo = TOPICS.find((t) => t.id === p.topic) ?? TOPICS[0];
            return (
              <article key={p.id} className={`mt-4 rounded-[20px] border bg-white p-4 md:p-5 ${p.pinned ? "border-[#c7cdf9] shadow-[0_0_0_3px_rgba(52,52,255,0.06)]" : "border-[#e2e8f0]"}`}>
                {p.pinned && <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#f1f4ff] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#3434ff]"><Pin size={12} /> Announcement</div>}
                <header className="flex items-center gap-3">
                  <Avatar name={p.author_name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-bold">{p.author_name}</div>
                    <div className="text-xs text-[#94a3b8]">{timeAgo(p.created_at)} · {topicInfo.emoji} {topicInfo.label}</div>
                  </div>
                  {(p.user_id === user?.id || isAdmin) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-lg p-1.5 text-[#94a3b8] hover:bg-[#f5f7fa] hover:text-[#0b0b2c]" aria-label="Post options"><MoreHorizontal size={18} /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white font-['Plus_Jakarta_Sans',sans-serif]">
                        {isAdmin && (
                          <DropdownMenuItem onSelect={() => togglePin(p)}>
                            {p.pinned ? <><PinOff className="mr-2 h-4 w-4" /> Unpin</> : <><Pin className="mr-2 h-4 w-4" /> Pin to top</>}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => removePost(p)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete post</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </header>

                {p.body && <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed"><Linkified text={p.body} /></p>}

                {images.length > 0 && (
                  <div className={`mt-3 grid gap-1.5 overflow-hidden rounded-2xl ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {images.map((m, i) => mediaUrls[m.path] ? (
                      <button key={m.path} onClick={() => setLightbox(mediaUrls[m.path])} className={`block overflow-hidden bg-[#f1f5f9] ${images.length === 3 && i === 0 ? "row-span-2" : ""}`}>
                        <img src={mediaUrls[m.path]} alt="" loading="lazy" className={`h-full w-full object-cover transition hover:scale-[1.02] ${images.length === 1 ? "max-h-[480px]" : "aspect-square"}`} />
                      </button>
                    ) : <div key={m.path} className="aspect-square bg-[#f1f5f9]" />)}
                  </div>
                )}
                {video && mediaUrls[video.path] && (
                  <video src={mediaUrls[video.path]} controls playsInline preload="metadata" className="mt-3 max-h-[480px] w-full rounded-2xl bg-[#0b0b2c]" />
                )}
                {embed && (
                  <iframe src={embed} title="Shared video" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen className="mt-3 aspect-video w-full rounded-2xl border-0 bg-[#0b0b2c]" />
                )}

                {/* Reactions + replies */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {counts.map((r) => (
                    <button key={r.emoji} onClick={() => toggleReaction(p.id, r.emoji)} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[13px] font-semibold transition ${r.mine ? "border-[#3434ff] bg-[#f1f4ff] text-[#3434ff]" : "border-[#e2e8f0] text-[#69697b] hover:border-[#c7cdf9]"}`}>
                      <span className="text-base leading-none">{r.emoji}</span> {r.count}
                    </button>
                  ))}
                  <div className="relative">
                    <button onClick={() => setReactingOn(reactingOn === p.id ? null : p.id)} className="inline-flex items-center rounded-full border border-dashed border-[#cbd5e1] px-2.5 py-1 text-[#69697b] hover:border-[#3434ff] hover:text-[#3434ff]" aria-label="Add reaction"><SmilePlus size={16} /></button>
                    {reactingOn === p.id && (
                      <div className="absolute bottom-full left-0 z-20 mb-2 flex gap-0.5 rounded-full border border-[#e2e8f0] bg-white p-1 shadow-[0_12px_30px_rgba(11,11,44,0.14)]">
                        {REACTIONS.map((e) => (
                          <button key={e} onClick={() => toggleReaction(p.id, e)} className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:scale-125 hover:bg-[#f5f7fa]">{e}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => { setOpenThread(open ? null : p.id); setCommentDraft(""); }} className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold ${open ? "text-[#3434ff]" : "text-[#69697b] hover:text-[#0b0b2c]"}`}>
                    <MessageCircle size={16} /> {thread.length ? `${thread.length} ${thread.length === 1 ? "reply" : "replies"}` : "Reply"}
                  </button>
                </div>

                {open && (
                  <div className="mt-3 space-y-3 border-t border-[#f1f4f8] pt-4">
                    {thread.map((c) => (
                      <div key={c.id} className="flex gap-2.5">
                        <Avatar name={c.author_name} size={30} />
                        <div className="min-w-0 flex-1 rounded-2xl bg-[#f5f7fa] px-3.5 py-2.5">
                          <div className="flex items-center gap-2 text-[13px]">
                            <span className="font-bold">{c.author_name}</span>
                            <span className="text-[#94a3b8]">{timeAgo(c.created_at)}</span>
                            {(c.user_id === user?.id || isAdmin) && (
                              <button onClick={() => removeComment(c.id)} className="ml-auto text-[#94a3b8] hover:text-red-600" aria-label="Delete reply"><Trash2 size={13} /></button>
                            )}
                          </div>
                          <div className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-relaxed"><Linkified text={c.body} /></div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Avatar name={displayName()} size={30} />
                      <div className="flex flex-1 items-center rounded-full border border-[#e2e8f0] bg-white pl-3.5 pr-1 focus-within:border-[#3434ff]">
                        <input
                          ref={commentRef}
                          value={commentDraft}
                          onChange={(e) => setCommentDraft(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(p.id); } }}
                          maxLength={2000}
                          placeholder="Write a reply…"
                          className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                        />
                        <EmojiPicker size={16} onPick={(e) => setCommentDraft(insertAtCaret(commentRef.current, commentDraft, e))} />
                        <button onClick={() => addComment(p.id)} disabled={!commentDraft.trim()} className="rounded-full bg-[#3434ff] p-2 text-white disabled:opacity-40" aria-label="Send reply"><Send size={14} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}

        </>)}

        <div className="mt-7 rounded-[20px] border border-[#d9f09a] bg-[#f4fbe4] p-5">
          <div className="text-[15px] font-bold">Community guidelines</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#4a5230]">
            <li>Be respectful — we're all here to make workplaces safer.</li>
            <li>Don't share confidential incident details, personal data or identifiable photos of people without consent.</li>
            <li>Keep it relevant to EHS, AI and the courses.</li>
          </ul>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setLightbox(null)} role="dialog" aria-label="Photo">
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
          <button className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25" aria-label="Close"><X size={20} /></button>
        </div>
      )}
    </div>
  );
}
