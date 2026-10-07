import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CalendarPlus, Check, Clock, Download, ExternalLink, ImagePlus, Loader2, MessageSquare, Pencil, Plus, Radio, Trash2, Users, Video, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  countdown, embedUrl, formatDay, formatWhen, googleCalendarUrl, icsFile, statusOf, type CommunityEvent,
} from "@/lib/events";

// ---------- data ----------
export function useCommunityEvents(space: "academy" | "global-network", userId?: string) {
  const [events, setEvents] = useState<CommunityEvent[] | null>(null);
  const [going, setGoing] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    const { data } = await supabase.from("community_events").select("*").eq("space", space).order("starts_at").limit(200);
    const list = (data ?? []) as CommunityEvent[];
    setEvents(list);
    if (list.length) {
      const ids = list.map((e) => e.id);
      const [{ data: counts }, { data: rsvps }] = await Promise.all([
        supabase.rpc("event_rsvp_counts", { _ids: ids }),
        userId ? supabase.from("community_event_rsvps").select("event_id").eq("user_id", userId).in("event_id", ids) : Promise.resolve({ data: [] as { event_id: string }[] }),
      ]);
      setGoing(Object.fromEntries(((counts ?? []) as { event_id: string; going: number }[]).map((c) => [c.event_id, Number(c.going)])));
      setMine(new Set((rsvps ?? []).map((r) => r.event_id)));
    }
  }, [space, userId]);

  useEffect(() => { setEvents(null); load(); }, [load]);
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(t); }, []);
  // "Go live" from an admin reaches everyone's open page straight away.
  useEffect(() => {
    const ch = supabase.channel(`events-${space}`).on("postgres_changes", { event: "*", schema: "public", table: "community_events" }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [space, load]);

  const toggleRsvp = async (e: CommunityEvent) => {
    if (!userId) return;
    const has = mine.has(e.id);
    setMine((m) => { const n = new Set(m); if (has) n.delete(e.id); else n.add(e.id); return n; });
    setGoing((g) => ({ ...g, [e.id]: Math.max(0, (g[e.id] ?? 0) + (has ? -1 : 1)) }));
    const { error } = has
      ? await supabase.from("community_event_rsvps").delete().eq("event_id", e.id).eq("user_id", userId)
      : await supabase.from("community_event_rsvps").insert({ event_id: e.id, user_id: userId });
    if (error) { toast.error("Could not update your RSVP"); load(); return; }
    if (!has) toast.success("You're going — add it to your calendar so you don't miss it");
  };

  const live = useMemo(() => (events ?? []).filter((e) => statusOf(e, now) === "live"), [events, now]);
  const upcoming = useMemo(() => (events ?? []).filter((e) => statusOf(e, now) === "upcoming"), [events, now]);
  const past = useMemo(() => (events ?? []).filter((e) => statusOf(e, now) === "ended").sort((a, b) => (a.starts_at < b.starts_at ? 1 : -1)), [events, now]);
  return { events, live, upcoming, past, going, mine, now, toggleRsvp, reload: load };
}

// ---------- small pieces ----------
const DateTile = ({ iso, live }: { iso: string; live?: boolean }) => {
  const d = formatDay(iso);
  return (
    <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${live ? "bg-[#e11d48] text-white" : "bg-[#f1f4ff] text-[#3434ff]"}`}>
      <span className="text-[10px] font-bold uppercase leading-none">{live ? "Live" : d.mon}</span>
      <span className="text-xl font-extrabold leading-tight">{live ? <Radio size={18} className="animate-pulse" /> : d.day}</span>
      {!live && <span className="text-[10px] font-semibold leading-none opacity-70">{d.dow}</span>}
    </div>
  );
};

export const LiveBanner = ({ events, onOpen }: { events: CommunityEvent[]; onOpen: (e: CommunityEvent) => void }) => {
  if (!events.length) return null;
  return (
    <div className="mb-5 space-y-2">
      {events.map((e) => (
        <button key={e.id} onClick={() => onOpen(e)} className="flex w-full items-center gap-3 rounded-2xl bg-[#e11d48] px-4 py-3 text-left text-white shadow-[0_10px_30px_rgba(225,29,72,0.3)] transition hover:brightness-105">
          <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" /><span className="relative inline-flex h-3 w-3 rounded-full bg-white" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.12em] opacity-90">Live now</span>
            <span className="block truncate text-[15px] font-bold">{e.title}</span>
          </span>
          <span className="shrink-0 rounded-lg bg-white px-3.5 py-2 text-[13px] font-bold text-[#e11d48]">Watch</span>
        </button>
      ))}
    </div>
  );
};

export const UpcomingEventsCard = ({
  upcoming, past = [], going, mine, isAdmin, onOpen, onAdd, onSeeAll,
}: { upcoming: CommunityEvent[]; past?: CommunityEvent[]; going: Record<string, number>; mine: Set<string>; isAdmin: boolean; onOpen: (e: CommunityEvent) => void; onAdd: () => void; onSeeAll: () => void }) => (
  <section>
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#69697b]">Upcoming events</h2>
      {isAdmin ? (
        <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-bold text-[#3434ff] hover:bg-[#f1f4ff]"><Plus size={14} /> Add</button>
      ) : upcoming.length > 3 ? <button onClick={onSeeAll} className="text-[12px] font-bold text-[#3434ff] hover:underline">See all</button> : null}
    </div>
    {upcoming.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-[#cfd6e4] bg-white p-5 text-center text-[13px] text-[#94a3b8]">
        {isAdmin ? "Schedule a live session — members can RSVP and add it to their calendar." : "No events scheduled right now."}
      </div>
    ) : (
      <div className="space-y-2">
        {upcoming.slice(0, 3).map((e) => (
          <button key={e.id} onClick={() => onOpen(e)} className="flex w-full items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-3 text-left transition hover:border-[#c7cdf9] hover:shadow-sm">
            <DateTile iso={e.starts_at} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-bold text-[#0b0b2c]">{e.title}</span>
              <span className="block text-[12px] text-[#69697b]">{formatWhen(e)}</span>
              <span className="mt-0.5 block text-[11px] font-semibold text-[#94a3b8]">{going[e.id] ? `${going[e.id]} going` : "Be the first to RSVP"}{mine.has(e.id) ? " · you're going ✓" : ""}</span>
            </span>
          </button>
        ))}
      </div>
    )}
    {past.some((e) => e.replay_url) && (
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#69697b]">Recent replays</h2>
          <button onClick={onSeeAll} className="text-[12px] font-bold text-[#3434ff] hover:underline">See all</button>
        </div>
        <div className="space-y-2">
          {past.filter((e) => e.replay_url).slice(0, 3).map((e) => (
            <button key={e.id} onClick={() => onOpen(e)} className="flex w-full items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-3 text-left transition hover:border-[#c7cdf9] hover:shadow-sm">
              <DateTile iso={e.starts_at} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold text-[#0b0b2c]">{e.title}</span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#3434ff]"><Video size={12} /> Watch the recording</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    )}
  </section>
);

// ---------- full list ----------
export const EventsPanel = ({
  upcoming, past, live, going, mine, isAdmin, onOpen, onAdd, onToggleRsvp,
}: { upcoming: CommunityEvent[]; past: CommunityEvent[]; live: CommunityEvent[]; going: Record<string, number>; mine: Set<string>; isAdmin: boolean; onOpen: (e: CommunityEvent) => void; onAdd: () => void; onToggleRsvp: (e: CommunityEvent) => void }) => {
  const Row = ({ e, kind }: { e: CommunityEvent; kind: "live" | "upcoming" | "past" }) => (
    <article className="flex items-center gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <DateTile iso={e.starts_at} live={kind === "live"} />
      <button onClick={() => onOpen(e)} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[15px] font-bold text-[#0b0b2c]">{e.title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-[#69697b]">
          <span className="inline-flex items-center gap-1"><Clock size={12} /> {formatWhen(e)}</span>
          {kind !== "past" && <span className="inline-flex items-center gap-1"><Users size={12} /> {going[e.id] ?? 0} going</span>}
          {kind === "past" && e.replay_url && <span className="inline-flex items-center gap-1 font-semibold text-[#3434ff]"><Video size={12} /> Replay available</span>}
        </span>
      </button>
      {kind === "live" ? (
        <button onClick={() => onOpen(e)} className="shrink-0 rounded-lg bg-[#e11d48] px-4 py-2 text-[13px] font-bold text-white">Watch live</button>
      ) : kind === "upcoming" ? (
        <button onClick={() => onToggleRsvp(e)} className={`shrink-0 rounded-lg px-4 py-2 text-[13px] font-bold transition ${mine.has(e.id) ? "bg-[#ecffd1] text-[#3f6212]" : "bg-[#3434ff] text-white hover:bg-[#2a2ad6]"}`}>
          {mine.has(e.id) ? <span className="inline-flex items-center gap-1"><Check size={14} /> Going</span> : "I'm going"}
        </button>
      ) : (
        <button onClick={() => onOpen(e)} className="shrink-0 rounded-lg border border-[#e2e8f0] px-4 py-2 text-[13px] font-bold hover:border-[#c7cdf9]">{e.replay_url ? "Watch replay" : "Details"}</button>
      )}
    </article>
  );
  return (
    <div className="mt-6 space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Live sessions</h2>
        {isAdmin && <button onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-[#3434ff] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#2a2ad6]"><Plus size={15} /> New event</button>}
      </div>
      {live.length > 0 && <div className="space-y-2.5">{live.map((e) => <Row key={e.id} e={e} kind="live" />)}</div>}
      <div>
        <h3 className="mb-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#69697b]">Upcoming</h3>
        {upcoming.length === 0 ? <div className="rounded-2xl border border-dashed border-[#cfd6e4] bg-white p-8 text-center text-sm text-[#94a3b8]">No upcoming events yet.</div> : <div className="space-y-2.5">{upcoming.map((e) => <Row key={e.id} e={e} kind="upcoming" />)}</div>}
      </div>
      {past.length > 0 && (
        <div>
          <h3 className="mb-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#69697b]">Past events & replays</h3>
          <div className="space-y-2.5">{past.slice(0, 20).map((e) => <Row key={e.id} e={e} kind="past" />)}</div>
        </div>
      )}
    </div>
  );
};

// ---------- event page (watch / RSVP / replay) ----------
export function EventDialog({
  event, now, going, isGoing, isAdmin, onClose, onToggleRsvp, onEdit, onDiscuss, onChanged,
}: { event: CommunityEvent; now: number; going: number; isGoing: boolean; isAdmin: boolean; onClose: () => void; onToggleRsvp: () => void; onEdit: () => void; onDiscuss: () => void; onChanged: () => void }) {
  const status = statusOf(event, now);
  const stream = embedUrl(event.stream_url);
  const replay = embedUrl(event.replay_url);
  const startsMs = new Date(event.starts_at).getTime();
  const joinOpen = status === "live" || startsMs - now <= 30 * 60_000;
  const [busy, setBusy] = useState(false);

  const downloadIcs = () => {
    const url = URL.createObjectURL(new Blob([icsFile(event)], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url; a.download = `${event.title.replace(/[^\w]+/g, "-").slice(0, 40)}.ics`; a.click();
    URL.revokeObjectURL(url);
  };

  const setLive = async (on: boolean) => {
    setBusy(true);
    const patch: Record<string, unknown> = { live_now: on };
    if (!on && new Date(event.ends_at).getTime() > now && startsMs < now) patch.ends_at = new Date().toISOString();
    const { error } = await supabase.from("community_events").update(patch).eq("id", event.id);
    setBusy(false);
    if (error) { toast.error("Could not update the event"); return; }
    toast.success(on ? "You're live — members see the banner now" : "Event ended");
    onChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0b0b2c]/60 p-3 md:p-8" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {status === "live" && stream ? (
          <iframe src={stream} title={event.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-video w-full border-0 bg-[#0b0b2c]" />
        ) : status === "ended" && replay ? (
          <iframe src={replay} title={`${event.title} replay`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-video w-full border-0 bg-[#0b0b2c]" />
        ) : event.image_url ? (
          <img src={event.image_url} alt="" className="aspect-[16/7] w-full object-cover" />
        ) : (
          <div className={`flex aspect-[16/6] w-full items-center justify-center ${status === "live" ? "bg-[#e11d48]" : "bg-gradient-to-br from-[#3434ff] to-[#202058]"}`}>
            {status === "live" ? <Radio size={44} className="animate-pulse text-white" /> : <CalendarDays size={44} className="text-white/80" />}
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {status === "live" && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e11d48] px-2.5 py-1 text-[11px] font-extrabold uppercase text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live now</span>}
                {status === "upcoming" && <span className="rounded-full bg-[#f1f4ff] px-2.5 py-1 text-[11px] font-bold text-[#3434ff]">Starts in {countdown(event.starts_at, now)}</span>}
                {status === "ended" && <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-bold text-[#69697b]">Ended</span>}
                {event.space === "global-network" && <span className="rounded-full bg-[#202058] px-2.5 py-1 text-[11px] font-bold text-[#9eff1f]">Global Network</span>}
              </div>
              <h2 className="mt-2 text-2xl font-bold leading-tight">{event.title}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#69697b]">
                <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {formatWhen(event)}</span>
                <span className="inline-flex items-center gap-1.5"><Users size={14} /> {going} going</span>
              </p>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-[#94a3b8] hover:bg-[#f5f7fa]" aria-label="Close"><X size={18} /></button>
          </div>

          {event.description && <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-[#475569]">{event.description}</p>}

          <div className="mt-6 flex flex-wrap gap-2.5">
            {status === "live" && event.join_url && (
              <a href={event.join_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#e11d48] px-5 py-3 text-sm font-bold text-white hover:brightness-105"><Video size={16} /> Join on Zoom <ExternalLink size={13} /></a>
            )}
            {status === "upcoming" && (
              <>
                <button onClick={onToggleRsvp} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${isGoing ? "bg-[#ecffd1] text-[#3f6212]" : "bg-[#3434ff] text-white hover:bg-[#2a2ad6]"}`}>
                  {isGoing ? <><Check size={16} /> You're going</> : "I'm going"}
                </button>
                {event.join_url && (joinOpen
                  ? <a href={event.join_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#3434ff] px-5 py-3 text-sm font-bold text-[#3434ff] hover:bg-[#f1f4ff]"><Video size={16} /> Join on Zoom</a>
                  : <span className="inline-flex items-center rounded-xl bg-[#f5f7fa] px-4 py-3 text-[13px] font-semibold text-[#94a3b8]">The Zoom link opens 30 minutes before</span>)}
                <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm font-semibold hover:border-[#c7cdf9]"><CalendarPlus size={16} /> Google Calendar</a>
                <button onClick={downloadIcs} className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm font-semibold hover:border-[#c7cdf9]"><Download size={16} /> Outlook / Apple</button>
              </>
            )}
            {status === "ended" && event.replay_url && !replay && (
              <a href={event.replay_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#3434ff] px-5 py-3 text-sm font-bold text-white hover:bg-[#2a2ad6]"><Video size={16} /> Watch the replay <ExternalLink size={13} /></a>
            )}
            {status === "ended" && !event.replay_url && <p className="text-sm text-[#69697b]">The replay will be added here soon.</p>}
            <button onClick={onDiscuss} className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm font-semibold hover:border-[#c7cdf9]"><MessageSquare size={16} /> Discuss in the feed</button>
          </div>
          {status === "live" && stream && event.join_url && <p className="mt-3 text-[13px] text-[#69697b]">Watch the broadcast above, or join the Zoom session to take part and ask questions live.</p>}

          {isAdmin && (
            <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-[#f1f4f8] pt-5">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#94a3b8]">Admin</span>
              {status !== "live" ? (
                <button disabled={busy || status === "ended"} onClick={() => setLive(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#e11d48] px-3.5 py-2 text-[13px] font-bold text-white disabled:opacity-40"><Radio size={14} /> Go live now</button>
              ) : (
                <button disabled={busy} onClick={() => setLive(false)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b0b2c] px-3.5 py-2 text-[13px] font-bold text-white disabled:opacity-40">End event</button>
              )}
              <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] px-3.5 py-2 text-[13px] font-semibold hover:border-[#c7cdf9]"><Pencil size={14} /> Edit</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- admin editor ----------
const toLocalInput = (iso: string) => new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export function EventEditor({
  initial, space, authorName, onClose, onSaved,
}: { initial: CommunityEvent | null; space: "academy" | "global-network"; authorName: string; onClose: () => void; onSaved: () => void }) {
  const startDefault = useMemo(() => { const d = new Date(Date.now() + 86400000); d.setMinutes(0, 0, 0); return d.toISOString(); }, []);
  const [f, setF] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    space: initial?.space ?? space,
    start: toLocalInput(initial?.starts_at ?? startDefault),
    minutes: initial ? Math.round((new Date(initial.ends_at).getTime() - new Date(initial.starts_at).getTime()) / 60000) : 60,
    join_url: initial?.join_url ?? "",
    stream_url: initial?.stream_url ?? "",
    replay_url: initial?.replay_url ?? "",
    image_url: initial?.image_url ?? "",
    announce: !initial,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const input = "w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm outline-none focus:border-[#3434ff]";

  const upload = async (file: File) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { toast.error("Use a PNG, JPG or WebP image"); return; }
    setUploading(true);
    const path = `events/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "-")}`;
    const { error } = await supabase.storage.from("course-covers").upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    setF((x) => ({ ...x, image_url: supabase.storage.from("course-covers").getPublicUrl(path).data.publicUrl }));
  };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    for (const [label, v] of [["Zoom link", f.join_url], ["Live stream link", f.stream_url], ["Replay link", f.replay_url]] as const) {
      if (v.trim() && !/^https:\/\//i.test(v.trim())) { toast.error(`${label} must start with https://`); return; }
    }
    const starts = new Date(f.start);
    if (Number.isNaN(starts.getTime())) { toast.error("Choose a start date and time"); return; }
    const ends = new Date(starts.getTime() + Math.max(15, f.minutes) * 60000);
    setSaving(true);
    const row = {
      title: f.title.trim(), description: f.description.trim() || null, space: f.space,
      starts_at: starts.toISOString(), ends_at: ends.toISOString(),
      join_url: f.join_url.trim() || null, stream_url: f.stream_url.trim() || null, replay_url: f.replay_url.trim() || null, image_url: f.image_url || null,
    };
    const { data: me } = await supabase.auth.getUser();
    const { error } = initial
      ? await supabase.from("community_events").update(row).eq("id", initial.id)
      : await supabase.from("community_events").insert({ ...row, created_by: me.user?.id ?? null });
    if (error) { setSaving(false); toast.error("Could not save the event"); return; }
    if (!initial && f.announce && me.user) {
      await supabase.from("community_posts").insert({
        user_id: me.user.id, author_name: authorName, space: f.space, topic: "general",
        body: `📅 New live session: ${row.title}\n${formatWhen({ starts_at: row.starts_at, ends_at: row.ends_at })}\n\nRSVP and add it to your calendar from the Events tab.`,
      });
    }
    setSaving(false);
    toast.success(initial ? "Event updated" : "Event scheduled");
    onSaved();
  };

  const remove = async () => {
    if (!initial || !confirm(`Delete “${initial.title}”?`)) return;
    const { error } = await supabase.from("community_events").delete().eq("id", initial.id);
    if (error) { toast.error("Could not delete"); return; }
    toast.success("Event deleted");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#0b0b2c]/60 p-3 md:p-8" role="dialog" aria-modal="true">
      <form onSubmit={save} className="w-full max-w-xl rounded-3xl bg-white p-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c] shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{initial ? "Edit event" : "Schedule an event"}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#94a3b8] hover:bg-[#f5f7fa]" aria-label="Close"><X size={18} /></button>
        </div>
        <label className="mt-4 block text-[13px] font-semibold">Title
          <input required maxLength={140} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`${input} mt-1`} placeholder="e.g. Live Q&A: AI for incident investigation" />
        </label>
        <label className="mt-3 block text-[13px] font-semibold">What's it about? <span className="font-normal text-[#94a3b8]">(optional)</span>
          <textarea rows={3} maxLength={4000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`${input} mt-1 resize-y`} />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-[13px] font-semibold">Community
            <select value={f.space} onChange={(e) => setF({ ...f, space: e.target.value as typeof f.space })} className={`${input} mt-1`}>
              <option value="academy">SafetyTech Academy (free)</option>
              <option value="global-network">Global Network (members)</option>
            </select>
          </label>
          <label className="block text-[13px] font-semibold">Length
            <select value={f.minutes} onChange={(e) => setF({ ...f, minutes: Number(e.target.value) })} className={`${input} mt-1`}>
              {[30, 45, 60, 90, 120, 180].map((m) => <option key={m} value={m}>{m >= 60 ? `${m / 60} hour${m === 60 ? "" : "s"}` : `${m} min`}</option>)}
              {![30, 45, 60, 90, 120, 180].includes(f.minutes) && <option value={f.minutes}>{f.minutes} min</option>}
            </select>
          </label>
          <label className="col-span-2 block text-[13px] font-semibold">Starts <span className="font-normal text-[#94a3b8]">(your local time — members see theirs)</span>
            <input type="datetime-local" required value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} className={`${input} mt-1`} />
          </label>
        </div>
        <label className="mt-3 block text-[13px] font-semibold">Zoom link
          <input value={f.join_url} onChange={(e) => setF({ ...f, join_url: e.target.value })} className={`${input} mt-1`} placeholder="https://us02web.zoom.us/j/…" />
        </label>
        <label className="mt-3 block text-[13px] font-semibold">Live stream link <span className="font-normal text-[#94a3b8]">(optional — plays inside the community)</span>
          <input value={f.stream_url} onChange={(e) => setF({ ...f, stream_url: e.target.value })} className={`${input} mt-1`} placeholder="YouTube Live, Vimeo or Loom link" />
        </label>
        <p className="mt-1 text-[12px] leading-relaxed text-[#94a3b8]">To broadcast a Zoom meeting here, use Zoom's “Live on Custom Live Stream Service” to send it to a private YouTube Live stream, then paste that YouTube link. Without it, members watch by joining the Zoom.</p>
        {initial && (
          <label className="mt-3 block text-[13px] font-semibold">Replay link <span className="font-normal text-[#94a3b8]">(add after the event — YouTube, Vimeo, Loom or your Zoom recording)</span>
            <input value={f.replay_url} onChange={(e) => setF({ ...f, replay_url: e.target.value })} className={`${input} mt-1`} placeholder="https://…" />
          </label>
        )}
        <div className="mt-3 flex items-center gap-3">
          {f.image_url && <img src={f.image_url} alt="" className="h-12 w-20 rounded-lg object-cover" />}
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#e2e8f0] px-3 py-2 text-[13px] font-semibold hover:border-[#c7cdf9]">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} {f.image_url ? "Replace image" : "Add an image"}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const x = e.target.files?.[0]; if (x) upload(x); e.target.value = ""; }} />
          </label>
          {f.image_url && <button type="button" onClick={() => setF({ ...f, image_url: "" })} className="text-[13px] font-semibold text-red-600">Remove</button>}
        </div>
        {!initial && <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" checked={f.announce} onChange={(e) => setF({ ...f, announce: e.target.checked })} className="accent-[#3434ff]" /> Announce it in the community feed</label>}
        <div className="mt-6 flex items-center gap-2">
          {initial && <button type="button" onClick={remove} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={15} /> Delete</button>}
          <button type="button" onClick={onClose} className="ml-auto rounded-lg px-4 py-2.5 text-sm font-semibold text-[#69697b] hover:bg-[#f5f7fa]">Cancel</button>
          <button type="submit" disabled={saving || uploading || !f.title.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6] disabled:opacity-40">{saving && <Loader2 size={15} className="animate-spin" />} {initial ? "Save" : "Schedule"}</button>
        </div>
      </form>
    </div>
  );
}
