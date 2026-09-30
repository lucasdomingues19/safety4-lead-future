import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ExternalLink, ImagePlus, Loader2, Megaphone, Pencil, Plus, Sparkles, Tag, Trash2, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LevelChip } from "./Gamification";

// Right-hand column of the community: admin-managed highlights (announcements,
// offers, promotions, events) plus top contributors. Admins add and edit
// highlights right here; learners only see live ones for spaces they can access.

type Kind = "announcement" | "offer" | "promotion" | "event";
type Space = "all" | "academy" | "global-network";
interface Highlight {
  id: string; kind: Kind; space: Space; title: string; body: string | null; image_url: string | null;
  cta_label: string | null; cta_url: string | null; starts_at: string | null; ends_at: string | null; position: number;
}
interface Leader { user_id: string; display_name: string; points: number; level_name: string; is_me: boolean }

const KINDS: Record<Kind, { label: string; icon: typeof Megaphone; badge: string }> = {
  announcement: { label: "Announcement", icon: Megaphone, badge: "bg-[#f1f4ff] text-[#3434ff]" },
  offer: { label: "Offer", icon: Tag, badge: "bg-[#ecffd1] text-[#3f6212]" },
  promotion: { label: "Promotion", icon: Sparkles, badge: "bg-[#fff7ed] text-[#c2410c]" },
  event: { label: "Event", icon: CalendarDays, badge: "bg-[#fdf2f8] text-[#be185d]" },
};

const isLive = (h: Highlight) => (!h.starts_at || new Date(h.starts_at) <= new Date()) && (!h.ends_at || new Date(h.ends_at) > new Date());
const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export function CommunitySidebar({ space, isAdmin }: { space: "academy" | "global-network"; isAdmin: boolean }) {
  const [items, setItems] = useState<Highlight[] | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [editing, setEditing] = useState<Partial<Highlight> | null>(null);

  const load = useCallback(async () => {
    const [{ data: hs }, { data: lb }] = await Promise.all([
      supabase.from("community_highlights").select("*").in("space", ["all", space]).order("position").order("created_at", { ascending: false }),
      supabase.rpc("get_leaderboard", { _limit: 5 }),
    ]);
    setItems((hs ?? []) as Highlight[]);
    setLeaders((lb ?? []) as Leader[]);
  }, [space]);
  useEffect(() => { load(); }, [load]);

  const remove = async (h: Highlight) => {
    if (!confirm(`Delete “${h.title}”?`)) return;
    const { error } = await supabase.from("community_highlights").delete().eq("id", h.id);
    if (error) { toast.error("Could not delete"); return; }
    load();
  };

  const visible = (items ?? []).filter((h) => isAdmin || isLive(h));

  return (
    <div className="space-y-4">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#69697b]">Highlights</h2>
          {isAdmin && (
            <button onClick={() => setEditing({ kind: "announcement", space })} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-bold text-[#3434ff] hover:bg-[#f1f4ff]"><Plus size={14} /> Add</button>
          )}
        </div>
        {items === null ? (
          <div className="flex justify-center rounded-2xl bg-white py-8"><Loader2 size={20} className="animate-spin text-[#3434ff]" /></div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cfd6e4] bg-white p-5 text-center text-[13px] text-[#94a3b8]">
            {isAdmin ? "Add announcements, offers, promotions or events here — members see them next to the feed." : "Nothing new right now."}
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((h) => {
              const k = KINDS[h.kind];
              const Icon = k.icon;
              return (
                <article key={h.id} className={`overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white ${isAdmin && !isLive(h) ? "opacity-60" : ""}`}>
                  {h.image_url && <img src={h.image_url} alt="" className="aspect-[16/9] w-full object-cover" />}
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${k.badge}`}><Icon size={11} /> {k.label}</span>
                      {h.space === "global-network" && <span className="rounded-full bg-[#202058] px-2 py-0.5 text-[10px] font-bold text-[#9eff1f]">Network</span>}
                      {isAdmin && !isLive(h) && <span className="text-[10px] font-semibold text-[#94a3b8]">{h.starts_at && new Date(h.starts_at) > new Date() ? "Scheduled" : "Ended"}</span>}
                      {isAdmin && (
                        <span className="ml-auto flex gap-0.5">
                          <button onClick={() => setEditing(h)} className="rounded p-1 text-[#94a3b8] hover:bg-[#f5f7fa] hover:text-[#0b0b2c]" aria-label="Edit"><Pencil size={13} /></button>
                          <button onClick={() => remove(h)} className="rounded p-1 text-[#94a3b8] hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 size={13} /></button>
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-[15px] font-bold leading-snug text-[#0b0b2c]">{h.title}</h3>
                    {h.body && <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-[#69697b]">{h.body}</p>}
                    {h.ends_at && h.kind !== "announcement" && isLive(h) && <p className="mt-2 text-[11px] font-semibold text-[#c2410c]">Ends {new Date(h.ends_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>}
                    {h.cta_url && h.cta_label && (
                      <a href={h.cta_url} target={h.cta_url.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#3434ff] px-3.5 py-2 text-[13px] font-bold text-white hover:bg-[#2a2ad6]">
                        {h.cta_label} {!h.cta_url.startsWith("/") && <ExternalLink size={12} />}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {leaders.length > 0 && (
        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#69697b]"><Trophy size={14} className="text-[#8ab815]" /> Top contributors</h2>
          <ol className="space-y-2.5">
            {leaders.map((l, i) => (
              <li key={l.user_id} className="flex items-center gap-2.5">
                <span className="w-4 text-[13px] font-extrabold text-[#94a3b8]">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-[#0b0b2c]">{l.display_name}{l.is_me ? " (you)" : ""}</span>
                  <LevelChip name={l.level_name} />
                </span>
                <span className="text-[13px] font-bold tabular-nums text-[#0b0b2c]">{l.points}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {editing && <HighlightEditor initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function HighlightEditor({ initial, onClose, onSaved }: { initial: Partial<Highlight>; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Partial<Highlight>>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const input = "w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm outline-none focus:border-[#3434ff]";

  const upload = async (file: File) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { toast.error("Use a PNG, JPG or WebP image"); return; }
    setUploading(true);
    const path = `highlights/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "-")}`;
    const { error } = await supabase.storage.from("course-covers").upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    setF((x) => ({ ...x, image_url: supabase.storage.from("course-covers").getPublicUrl(path).data.publicUrl }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const cta = (f.cta_url ?? "").trim();
    if (cta && !/^(https:\/\/|mailto:|\/)/i.test(cta)) { toast.error("Button links must start with https://, mailto: or /"); return; }
    setSaving(true);
    const row = {
      kind: f.kind ?? "announcement", space: f.space ?? "all", title: (f.title ?? "").trim(), body: f.body?.trim() || null,
      image_url: f.image_url || null, cta_label: f.cta_label?.trim() || null, cta_url: cta || null,
      starts_at: f.starts_at || null, ends_at: f.ends_at || null, position: f.position ?? 0,
    };
    const { error } = f.id
      ? await supabase.from("community_highlights").update(row).eq("id", f.id)
      : await supabase.from("community_highlights").insert(row);
    setSaving(false);
    if (error) { toast.error("Could not save — check the fields"); return; }
    toast.success(f.id ? "Highlight updated" : "Highlight added");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0b0b2c]/50 p-4 md:p-10" role="dialog" aria-modal="true">
      <form onSubmit={save} className="w-full max-w-lg rounded-3xl bg-white p-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c] shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{f.id ? "Edit highlight" : "New highlight"}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#94a3b8] hover:bg-[#f5f7fa]" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-[13px] font-semibold">Type
            <select value={f.kind ?? "announcement"} onChange={(e) => setF({ ...f, kind: e.target.value as Kind })} className={`${input} mt-1`}>
              {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <label className="text-[13px] font-semibold">Show in
            <select value={f.space ?? "all"} onChange={(e) => setF({ ...f, space: e.target.value as Space })} className={`${input} mt-1`}>
              <option value="all">Both communities</option>
              <option value="academy">SafetyTech Academy only</option>
              <option value="global-network">Global Network only</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block text-[13px] font-semibold">Title
          <input required maxLength={120} value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} className={`${input} mt-1`} placeholder="e.g. 20% off the Copilot course this week" />
        </label>
        <label className="mt-3 block text-[13px] font-semibold">Text <span className="font-normal text-[#94a3b8]">(optional)</span>
          <textarea maxLength={600} rows={3} value={f.body ?? ""} onChange={(e) => setF({ ...f, body: e.target.value })} className={`${input} mt-1 resize-y`} />
        </label>
        <div className="mt-3">
          <span className="text-[13px] font-semibold">Image <span className="font-normal text-[#94a3b8]">(optional, 16:9)</span></span>
          <div className="mt-1 flex items-center gap-3">
            {f.image_url && <img src={f.image_url} alt="" className="h-14 w-24 rounded-lg object-cover" />}
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#e2e8f0] px-3 py-2 text-[13px] font-semibold hover:border-[#c7cdf9]">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} {f.image_url ? "Replace" : "Upload"}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const x = e.target.files?.[0]; if (x) upload(x); e.target.value = ""; }} />
            </label>
            {f.image_url && <button type="button" onClick={() => setF({ ...f, image_url: null })} className="text-[13px] font-semibold text-red-600">Remove</button>}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-[13px] font-semibold">Button text
            <input maxLength={40} value={f.cta_label ?? ""} onChange={(e) => setF({ ...f, cta_label: e.target.value })} className={`${input} mt-1`} placeholder="e.g. Claim offer" />
          </label>
          <label className="text-[13px] font-semibold">Button link
            <input value={f.cta_url ?? ""} onChange={(e) => setF({ ...f, cta_url: e.target.value })} className={`${input} mt-1`} placeholder="https://… or /learn/…" />
          </label>
          <label className="text-[13px] font-semibold">Show from <span className="font-normal text-[#94a3b8]">(optional)</span>
            <input type="datetime-local" value={toLocal(f.starts_at ?? null)} onChange={(e) => setF({ ...f, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className={`${input} mt-1`} />
          </label>
          <label className="text-[13px] font-semibold">Hide after <span className="font-normal text-[#94a3b8]">(optional)</span>
            <input type="datetime-local" value={toLocal(f.ends_at ?? null)} onChange={(e) => setF({ ...f, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className={`${input} mt-1`} />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#69697b] hover:bg-[#f5f7fa]">Cancel</button>
          <button type="submit" disabled={saving || uploading || !(f.title ?? "").trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6] disabled:opacity-40">{saving && <Loader2 size={15} className="animate-spin" />} Save</button>
        </div>
      </form>
    </div>
  );
}
