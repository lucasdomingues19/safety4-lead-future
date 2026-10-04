import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, FileUp, Loader2, Mail, MoreHorizontal, Plus, Search, ShieldCheck, ShieldOff, Tag, UserPlus, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toast } from "sonner";
import { ImportPeopleDialog, type Product } from "./ImportPeopleDialog";
import { invokeFunction } from "@/lib/invoke";

// People: everyone on the platform with a tick per product (each course +
// the paid Global Network community). Ticking grants lifetime access,
// unticking removes it (progress is kept). Import from Kajabi, add someone by
// hand, and send "set your password" welcome emails.

interface Person {
  id: string;
  email: string;
  name: string;
  company: string | null;
  isAdmin: boolean;
  welcomedAt: string | null;
  lastSignIn: string | null;
  tags: string[];
  access: Record<string, { active: boolean; expires: string | null }>;
  hasName: boolean;
  tourStatus: "completed" | "skipped" | null;
  tourStep: number | null;
  lessonsDone: number;
}

// Onboarding = the five things a new learner should have done. "Fully
// onboarded" means all five; the first missing one is what to nudge them on.
const TOUR_STEPS = 13;
const ONBOARDING = [
  { key: "invited", label: "Invited", done: (p: Person) => !!(p.welcomedAt || p.lastSignIn) },
  { key: "signed-in", label: "Signed in", done: (p: Person) => !!p.lastSignIn },
  { key: "tour", label: "Watched Mia's tour", done: (p: Person) => p.tourStatus === "completed" },
  { key: "profile", label: "Profile name set", done: (p: Person) => p.hasName },
  { key: "lesson", label: "First lesson done", done: (p: Person) => p.lessonsDone > 0 },
] as const;
type OnboardingKey = (typeof ONBOARDING)[number]["key"];
const onboarded = (p: Person) => ONBOARDING.every((s) => s.done(p));
const onboardingNote = (p: Person) => {
  if (onboarded(p)) return { t: `Onboarded · ${p.lessonsDone} lesson${p.lessonsDone === 1 ? "" : "s"} done`, c: "text-[#3f6212]" };
  if (!p.lastSignIn) return { t: p.welcomedAt ? "Invited, not signed in" : "Not invited yet", c: "text-[#94a3b8]" };
  if (p.tourStatus === "skipped") return { t: p.tourStep ? `Skipped tour at ${p.tourStep}/${TOUR_STEPS}` : "Skipped the tour", c: "text-[#b45309]" };
  if (!p.tourStatus) return { t: "Hasn't seen the tour", c: "text-[#b45309]" };
  if (!p.hasName) return { t: "No name on profile", c: "text-[#b45309]" };
  return { t: "No lesson completed yet", c: "text-[#b45309]" };
};

const cleanTag = (t: string) => t.trim().replace(/\s+/g, " ").slice(0, 40);

/** Tag chips for one person, with inline add (suggests existing tags) and remove. */
function TagEditor({ tags, allTags, onAdd, onRemove }: { tags: string[]; allTags: string[]; onAdd: (t: string) => void; onRemove: (t: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const listId = useMemo(() => `tags-${Math.random().toString(36).slice(2)}`, []);
  const submit = () => { const t = cleanTag(value); if (t && !tags.includes(t)) onAdd(t); setValue(""); setAdding(false); };
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {tags.map((t) => (
        <span key={t} className="group inline-flex items-center gap-1 rounded-full bg-[#eef1ff] px-2 py-0.5 text-[11px] font-semibold text-[#3434ff]">
          {t}
          <button onClick={() => onRemove(t)} className="text-[#3434ff]/50 hover:text-red-600" aria-label={`Remove tag ${t}`}><X size={11} /></button>
        </span>
      ))}
      {adding ? (
        <>
          <input
            autoFocus
            list={listId}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } if (e.key === "Escape") { setAdding(false); setValue(""); } }}
            onBlur={submit}
            placeholder="Tag name"
            className="h-6 w-28 rounded-full border border-[#c7cdf9] px-2 text-[11px] outline-none"
          />
          <datalist id={listId}>{allTags.filter((t) => !tags.includes(t)).map((t) => <option key={t} value={t} />)}</datalist>
        </>
      ) : (
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-[#cbd5e1] px-2 py-0.5 text-[11px] font-semibold text-[#94a3b8] hover:border-[#3434ff] hover:text-[#3434ff]"><Plus size={10} /> Tag</button>
      )}
    </div>
  );
}

const PAGE = 50;
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const live = (a?: { active: boolean; expires: string | null }) => !!a && a.active && (!a.expires || new Date(a.expires) > new Date());

export function LmsAdminUsers() {
  const { user: me } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "no-access" | "not-invited" | "never-signed-in" | "admins" | "onboarded" | "not-onboarded" | `missing:${OnboardingKey}`>("all");
  const [tagFilter, setTagFilter] = useState("");
  const [bulkTag, setBulkTag] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyCell, setBusyCell] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkProduct, setBulkProduct] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const [profilesRes, rolesRes, coursesRes, enrRes, memRes, authRes, tagsRes, lessonsRes] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, organisation, welcomed_at, tour_status, tour_last_step"),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
      supabase.from("courses").select("id, title, published").order("title"),
      supabase.from("enrollments").select("user_id, course_id, status, expires_at"),
      supabase.from("community_memberships").select("user_id, status, expires_at").eq("space", "global-network"),
      supabase.functions.invoke("admin-people", { body: { action: "list" } }),
      supabase.from("people_tags").select("user_id, tag"),
      supabase.rpc("admin_first_lessons"),
    ]);
    const lessons = new Map(((lessonsRes.data ?? []) as { user_id: string; lessons_done: number }[]).map((r) => [r.user_id, r.lessons_done]));
    const tagsByUser = new Map<string, string[]>();
    (tagsRes.data ?? []).forEach((t) => tagsByUser.set(t.user_id, [...(tagsByUser.get(t.user_id) ?? []), t.tag].sort()));
    const prods: Product[] = [
      ...(coursesRes.data ?? []).map((c) => ({ key: `course:${c.id}`, title: c.published ? c.title : `${c.title} (draft)` })),
      { key: "network", title: "Global Network" },
    ];
    const admins = new Set((rolesRes.data ?? []).map((r) => r.user_id));
    const signIns = new Map(((authRes.data?.users ?? []) as { id: string; last_sign_in_at: string | null }[]).map((u) => [u.id, u.last_sign_in_at]));
    const access = new Map<string, Person["access"]>();
    const put = (uid: string, key: string, v: { active: boolean; expires: string | null }) => { const m = access.get(uid) ?? {}; m[key] = v; access.set(uid, m); };
    (enrRes.data ?? []).forEach((e) => put(e.user_id, `course:${e.course_id}`, { active: e.status === "active", expires: e.expires_at }));
    (memRes.data ?? []).forEach((m) => put(m.user_id, "network", { active: m.status === "active", expires: m.expires_at }));
    setProducts(prods);
    setPeople((profilesRes.data ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      name: p.full_name || p.email.split("@")[0],
      company: p.organisation,
      isAdmin: admins.has(p.id),
      welcomedAt: p.welcomed_at,
      lastSignIn: signIns.get(p.id) ?? null,
      tags: tagsByUser.get(p.id) ?? [],
      access: access.get(p.id) ?? {},
      hasName: !!p.full_name?.trim(),
      tourStatus: (p.tour_status as Person["tourStatus"]) ?? null,
      tourStep: p.tour_last_step,
      lessonsDone: lessons.get(p.id) ?? 0,
    })).sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    people.forEach((p) => p.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [people]);
  const allTags = tagCounts.map(([t]) => t);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return people.filter((p) => {
      if (tagFilter && !p.tags.includes(tagFilter)) return false;
      if (q && !`${p.name} ${p.email} ${p.company ?? ""} ${p.tags.join(" ")}`.toLowerCase().includes(q)) return false;
      if (filter === "admins") return p.isAdmin;
      if (filter === "no-access") return !Object.values(p.access).some(live);
      if (filter === "not-invited") return !p.welcomedAt && !p.lastSignIn;
      if (filter === "never-signed-in") return !p.lastSignIn;
      if (filter === "onboarded") return onboarded(p);
      if (filter === "not-onboarded") return !onboarded(p);
      if (filter.startsWith("missing:")) return !ONBOARDING.find((o) => `missing:${o.key}` === filter)!.done(p);
      return true;
    });
  }, [people, search, filter, tagFilter]);
  const pageRows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  useEffect(() => { setPage(0); }, [search, filter, tagFilter]);

  // ---------- tags ----------
  const addTag = async (ids: string[], raw: string) => {
    const tag = cleanTag(raw);
    if (!tag || !ids.length) return;
    const { error } = await supabase.from("people_tags").upsert(ids.map((user_id) => ({ user_id, tag })), { onConflict: "user_id,tag", ignoreDuplicates: true });
    if (error) { toast.error("Could not add the tag"); return; }
    setPeople((prev) => prev.map((p) => (ids.includes(p.id) && !p.tags.includes(tag) ? { ...p, tags: [...p.tags, tag].sort() } : p)));
    if (ids.length > 1) toast.success(`Tagged ${ids.length} people “${tag}”`);
  };
  const removeTag = async (ids: string[], raw: string) => {
    const tag = cleanTag(raw);
    if (!tag || !ids.length) return;
    const { error } = await supabase.from("people_tags").delete().eq("tag", tag).in("user_id", ids);
    if (error) { toast.error("Could not remove the tag"); return; }
    setPeople((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, tags: p.tags.filter((t) => t !== tag) } : p)));
    if (ids.length > 1) toast.success(`Removed “${tag}” from ${ids.length} people`);
  };

  // ---------- access changes (admin RLS) ----------
  const setAccess = async (personId: string, key: string, grant: boolean) => {
    if (key === "network") {
      const { error } = grant
        ? await supabase.from("community_memberships").upsert({ user_id: personId, space: "global-network", status: "active", source: "admin", expires_at: null, granted_by: me?.id ?? null })
        : await supabase.from("community_memberships").update({ status: "cancelled" }).eq("user_id", personId).eq("space", "global-network");
      return error;
    }
    const courseId = key.slice(7);
    const existing = people.find((p) => p.id === personId)?.access[key];
    if (!grant) return (await supabase.from("enrollments").update({ status: "cancelled" }).eq("user_id", personId).eq("course_id", courseId)).error;
    if (existing) return (await supabase.from("enrollments").update({ status: "active", expires_at: live(existing) ? existing.expires : null }).eq("user_id", personId).eq("course_id", courseId)).error;
    return (await supabase.from("enrollments").insert({ user_id: personId, course_id: courseId, status: "active" })).error;
  };

  const toggle = async (p: Person, key: string) => {
    const grant = !live(p.access[key]);
    setBusyCell(`${p.id}:${key}`);
    const error = await setAccess(p.id, key, grant);
    setBusyCell(null);
    if (error) { toast.error("Could not update access"); return; }
    setPeople((prev) => prev.map((x) => (x.id === p.id ? { ...x, access: { ...x.access, [key]: { active: grant, expires: grant ? (live(x.access[key]) ? x.access[key].expires : null) : x.access[key]?.expires ?? null } } } : x)));
    toast.success(`${grant ? "Gave" : "Removed"} ${products.find((x) => x.key === key)?.title} ${grant ? "to" : "from"} ${p.name}`);
  };

  const bulk = async (grant: boolean) => {
    if (!bulkProduct || !selected.size) return;
    const title = products.find((x) => x.key === bulkProduct)?.title;
    if (!grant && !confirm(`Remove ${title} from ${selected.size} people?`)) return;
    setBulkBusy(true);
    let failed = 0;
    for (const id of selected) {
      const p = people.find((x) => x.id === id);
      if (!p || live(p.access[bulkProduct]) === grant) continue;
      if (await setAccess(id, bulkProduct, grant)) failed++;
    }
    setBulkBusy(false);
    if (failed) toast.error(`${failed} couldn't be updated`); else toast.success(`${grant ? "Gave" : "Removed"} ${title} for ${selected.size} people`);
    load();
  };

  const sendWelcome = async (ids: string[]) => {
    if (!ids.length) return;
    if (ids.length > 100) { toast.error("Select up to 100 people at a time — your email plan sends 100 a day"); return; }
    if (!confirm(`Email ${ids.length} ${ids.length === 1 ? "person" : "people"} a link to set their password?`)) return;
    setBulkBusy(true);
    let data: { results: unknown[] };
    try {
      data = await invokeFunction("admin-people", { action: "welcome", user_ids: ids });
    } catch (e) {
      setBulkBusy(false);
      toast.error(e instanceof Error ? e.message : "Could not send");
      return;
    }
    setBulkBusy(false);
    const res = data.results as { ok: boolean; email: string; error?: string }[];
    const bad = res.filter((r) => !r.ok);
    if (bad.length) toast.error(`${res.length - bad.length} sent, ${bad.length} failed: ${bad[0].error}`); else toast.success(`Welcome email sent to ${res.length}`);
    load();
  };

  const setAdmin = async (p: Person, makeAdmin: boolean) => {
    const ok = makeAdmin
      ? confirm(`Make ${p.name} an admin?\n\nAdmins can see every learner, change anyone's access, edit and publish courses, send announcements and see payments. Only give this to people you trust.`)
      : confirm(`Remove admin rights from ${p.name}? They keep their own courses and community access.`);
    if (!ok) return;
    const { error } = makeAdmin
      ? await supabase.from("user_roles").insert({ user_id: p.id, role: "admin" })
      : await supabase.from("user_roles").delete().eq("user_id", p.id).eq("role", "admin");
    if (error) { toast.error(error.message.includes("owner") || error.message.includes("last admin") ? error.message : "Could not change admin rights"); return; }
    setPeople((prev) => prev.map((x) => (x.id === p.id ? { ...x, isAdmin: makeAdmin } : x)));
    toast.success(makeAdmin ? `${p.name} is now an admin` : `${p.name} is no longer an admin`);
  };

  if (loading) return <div className="mt-16 flex justify-center"><Loader2 size={28} className="animate-spin text-[#3434ff]" /></div>;

  const allOnPage = pageRows.length > 0 && pageRows.every((p) => selected.has(p.id));
  const status = (p: Person) =>
    p.lastSignIn ? { t: `Active · ${fmt(p.lastSignIn)}`, c: "text-[#4a5230]" } : p.welcomedAt ? { t: `Invited ${fmt(p.welcomedAt)}`, c: "text-[#3434ff]" } : { t: "Not invited yet", c: "text-[#94a3b8]" };

  return (
    <div className="mt-7 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] max-w-md flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or company" className="w-full rounded-lg border border-[#e2e8f0] bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#3434ff]" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm font-semibold">
          <option value="all">Everyone ({people.length})</option>
          <option value="no-access">No product access</option>
          <option value="not-invited">Not invited yet</option>
          <option value="never-signed-in">Never signed in</option>
          <option value="admins">Admins</option>
          <optgroup label="Onboarding">
            <option value="onboarded">Fully onboarded</option>
            <option value="not-onboarded">Not fully onboarded</option>
            {ONBOARDING.map((o) => <option key={o.key} value={`missing:${o.key}`}>Missing: {o.label.toLowerCase()}</option>)}
          </optgroup>
        </select>
        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm font-semibold" aria-label="Filter by tag">
          <option value="">All tags</option>
          {tagCounts.map(([t, n]) => <option key={t} value={t}>{t} ({n})</option>)}
        </select>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-bold hover:border-[#c7cdf9]"><UserPlus size={16} /> Add person</button>
          <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6]"><FileUp size={16} /> Import CSV</button>
        </div>
      </div>

      {people.length > 0 && (() => {
        const learners = people.filter((p) => !p.isAdmin);
        const n = learners.length || 1;
        const full = learners.filter(onboarded).length;
        return (
          <div className="mt-4 rounded-[20px] border border-[#e2e8f0] bg-white p-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <button onClick={() => setFilter(filter === "onboarded" ? "all" : "onboarded")} className={`rounded-xl px-3 py-2 text-left transition ${filter === "onboarded" ? "bg-[#ecffd1]" : "hover:bg-[#f7f8ff]"}`}>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#69697b]">Fully onboarded</div>
                <div className="text-2xl font-extrabold tabular-nums">{full}<span className="text-base font-bold text-[#94a3b8]"> / {learners.length}</span> <span className="text-sm font-bold text-[#3f6212]">{Math.round((full / n) * 100)}%</span></div>
              </button>
              <div className="hidden h-10 w-px bg-[#e2e8f0] sm:block" />
              <div className="flex flex-1 flex-wrap gap-2">
                {ONBOARDING.map((o) => {
                  const done = learners.filter(o.done).length;
                  const active = filter === `missing:${o.key}`;
                  return (
                    <button key={o.key} onClick={() => setFilter(active ? "all" : `missing:${o.key}`)} title={`Show the ${learners.length - done} learner(s) still missing this step`} className={`min-w-[120px] flex-1 rounded-xl border px-3 py-2 text-left transition ${active ? "border-[#3434ff] bg-[#f1f4ff]" : "border-[#eef1f6] hover:border-[#c7cdf9]"}`}>
                      <div className="text-[11.5px] font-semibold text-[#69697b]">{o.label}</div>
                      <div className="mt-0.5 text-[15px] font-extrabold tabular-nums">{done}<span className="text-[12px] font-semibold text-[#94a3b8]"> / {learners.length}</span></div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#eef1f6]"><div className="h-full rounded-full bg-[#3434ff]" style={{ width: `${(done / n) * 100}%` }} /></div>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="mt-2 px-3 text-[12px] text-[#94a3b8]">Learners only (admins excluded). Click a step to see who still needs it, then select them to send a nudge.</p>
          </div>
        );
      })()}

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-[#0b0b2c] px-4 py-3 text-white">
          <span className="text-sm font-bold">{selected.size} selected</span>
          <select value={bulkProduct} onChange={(e) => setBulkProduct(e.target.value)} className="rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white">
            <option value="" className="text-[#0b0b2c]">Choose a product…</option>
            {products.map((p) => <option key={p.key} value={p.key} className="text-[#0b0b2c]">{p.title}</option>)}
          </select>
          <button disabled={!bulkProduct || bulkBusy} onClick={() => bulk(true)} className="rounded-lg bg-[#9eff1f] px-3.5 py-2 text-sm font-bold text-[#0b0b2c] disabled:opacity-40">Give access</button>
          <button disabled={!bulkProduct || bulkBusy} onClick={() => bulk(false)} className="rounded-lg bg-white/10 px-3.5 py-2 text-sm font-bold disabled:opacity-40">Remove access</button>
          <button disabled={bulkBusy} onClick={() => sendWelcome([...selected])} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-bold disabled:opacity-40"><Mail size={15} /> Send welcome email</button>
          <span className="mx-1 h-6 w-px bg-white/20" />
          <Tag size={15} className="text-white/60" />
          <input list="bulk-tags" value={bulkTag} onChange={(e) => setBulkTag(e.target.value)} placeholder="Tag…" className="w-32 rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none" />
          <datalist id="bulk-tags">{allTags.map((t) => <option key={t} value={t} />)}</datalist>
          <button disabled={!bulkTag.trim()} onClick={() => { addTag([...selected], bulkTag); setBulkTag(""); }} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40">Add tag</button>
          <button disabled={!bulkTag.trim()} onClick={() => { removeTag([...selected], bulkTag); setBulkTag(""); }} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40">Remove tag</button>
          {bulkBusy && <Loader2 size={16} className="animate-spin" />}
          <button onClick={() => setSelected(new Set())} className="ml-auto rounded-full p-1.5 hover:bg-white/10" aria-label="Clear selection"><X size={16} /></button>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-[20px] border border-[#e2e8f0] bg-white">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] text-left text-[11px] font-bold uppercase tracking-wider text-[#69697b]">
              <th className="w-10 px-4 py-3"><input type="checkbox" checked={allOnPage} onChange={() => { const n = new Set(selected); pageRows.forEach((p) => (allOnPage ? n.delete(p.id) : n.add(p.id))); setSelected(n); }} className="accent-[#3434ff]" aria-label="Select all on this page" /></th>
              <th className="px-3 py-3">Person</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Onboarding</th>
              {products.map((p) => <th key={p.key} className="max-w-[120px] px-2 py-3 text-center normal-case tracking-normal" title={p.title}><span className="line-clamp-2 text-[11.5px] font-bold">{p.title}</span></th>)}
              <th className="w-12 px-2 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && <tr><td colSpan={5 + products.length} className="px-6 py-10 text-center text-[#94a3b8]">Nobody matches.</td></tr>}
            {pageRows.map((p) => {
              const st = status(p);
              return (
                <tr key={p.id} className={`border-b border-[#f1f4f8] last:border-0 ${selected.has(p.id) ? "bg-[#f7f8ff]" : "hover:bg-[#fafbfc]"}`}>
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => { const n = new Set(selected); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); setSelected(n); }} className="accent-[#3434ff]" aria-label={`Select ${p.name}`} /></td>
                  <td className="px-3 py-3">
                    <div className="font-bold">{p.name}{p.isAdmin && <span className="ml-2 rounded bg-[#0b0b2c] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Admin</span>}</div>
                    <div className="text-xs text-[#94a3b8]">{p.email}{p.company ? ` · ${p.company}` : ""}</div>
                    <TagEditor tags={p.tags} allTags={allTags} onAdd={(t) => addTag([p.id], t)} onRemove={(t) => removeTag([p.id], t)} />
                  </td>
                  <td className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${st.c}`}>
                    {st.t}
                    {!p.lastSignIn && <button onClick={() => sendWelcome([p.id])} className="ml-2 font-bold text-[#3434ff] hover:underline">{p.welcomedAt ? "Resend" : "Invite"}</button>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1" aria-label={`Onboarding: ${ONBOARDING.filter((o) => o.done(p)).length} of ${ONBOARDING.length} steps`}>
                      {ONBOARDING.map((o) => <span key={o.key} title={`${o.label}: ${o.done(p) ? "done" : "not yet"}`} className={`h-2 w-5 rounded-full ${o.done(p) ? (onboarded(p) ? "bg-[#84cc16]" : "bg-[#3434ff]") : "bg-[#e2e8f0]"}`} />)}
                    </div>
                    <div className={`mt-1 whitespace-nowrap text-[11.5px] font-semibold ${onboardingNote(p).c}`}>{onboardingNote(p).t}</div>
                  </td>
                  {products.map((prod) => {
                    const a = p.access[prod.key];
                    const on = live(a);
                    const expired = !!a && a.active && !on;
                    const busy = busyCell === `${p.id}:${prod.key}`;
                    return (
                      <td key={prod.key} className="px-2 py-3 text-center">
                        <button
                          onClick={() => toggle(p, prod.key)}
                          disabled={busy}
                          title={on ? (a?.expires ? `Access until ${fmt(a.expires)} — click to remove` : "Lifetime access — click to remove") : expired ? `Expired ${fmt(a!.expires)} — click to restore` : "Click to give access"}
                          className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg border-2 transition ${on ? (prod.key === "network" ? "border-[#202058] bg-[#202058] text-[#9eff1f]" : "border-[#3434ff] bg-[#3434ff] text-white") : "border-[#cbd5e1] bg-white text-transparent hover:border-[#3434ff]"} ${busy ? "opacity-40" : ""}`}
                          aria-label={`${on ? "Remove" : "Give"} ${prod.title} ${on ? "from" : "to"} ${p.name}`}
                          aria-pressed={on}
                        >
                          {busy ? <Loader2 size={13} className="animate-spin text-[#3434ff]" /> : <Check size={15} strokeWidth={3} />}
                        </button>
                        {on && a?.expires && <div className="mt-0.5 text-[10px] text-[#94a3b8]">to {new Date(a.expires).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>}
                        {expired && <div className="mt-0.5 text-[10px] text-[#be123c]">expired</div>}
                      </td>
                    );
                  })}
                  <td className="px-2 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-lg p-1.5 text-[#94a3b8] hover:bg-[#f1f4ff] hover:text-[#0b0b2c]" aria-label={`More actions for ${p.name}`}><MoreHorizontal size={18} /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white font-['Plus_Jakarta_Sans',sans-serif]">
                        {p.isAdmin ? (
                          <DropdownMenuItem onSelect={() => setAdmin(p, false)} disabled={p.id === me?.id}>
                            <ShieldOff className="mr-2 h-4 w-4" /> {p.id === me?.id ? "You're an admin" : "Remove admin rights"}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onSelect={() => setAdmin(p, true)}><ShieldCheck className="mr-2 h-4 w-4 text-[#3434ff]" /> Make admin</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => sendWelcome([p.id])}><Mail className="mr-2 h-4 w-4" /> {p.lastSignIn ? "Send password reset link" : p.welcomedAt ? "Resend welcome email" : "Send welcome email"}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE && (
        <div className="mt-3 flex items-center justify-between text-[13px] text-[#69697b]">
          <span>{page * PAGE + 1}–{Math.min(filtered.length, (page + 1) * PAGE)} of {filtered.length}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
            <button disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(page + 1)} className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
      <p className="mt-3 text-[12px] text-[#94a3b8]">Ticking gives lifetime access; for a fixed period use Admin → Access. Removing access keeps the person's progress, so ticking again restores it.</p>

      {showImport && <ImportPeopleDialog products={products} existingTags={allTags} existingEmails={new Set(people.map((p) => p.email.toLowerCase()))} onClose={() => setShowImport(false)} onDone={load} />}
      {showAdd && <AddPersonDialog products={products} onClose={() => setShowAdd(false)} onDone={load} />}
    </div>
  );
}

function AddPersonDialog({ products, onClose, onDone }: { products: Product[]; onClose: () => void; onDone: () => void }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [grant, setGrant] = useState<Set<string>>(new Set());
  const [welcome, setWelcome] = useState(true);
  const [saving, setSaving] = useState(false);
  const input = "w-full rounded-lg border border-[#e2e8f0] px-3.5 py-2.5 text-sm outline-none focus:border-[#3434ff]";

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let r: { status: string; welcomed?: boolean; error?: string } | undefined;
    try {
      const data = await invokeFunction<{ results: { status: string; welcomed?: boolean; error?: string }[] }>("admin-people", {
        action: "import", welcome, rows: [{ email, first_name: first, last_name: last, company, products: [...grant] }],
      });
      r = data.results?.[0];
    } catch (err) {
      setSaving(false);
      toast.error(err instanceof Error ? err.message : "Could not add this person");
      return;
    }
    setSaving(false);
    if (!r || r.status === "error") { toast.error(r?.error ?? "Could not add this person"); return; }
    toast.success(`${r.status === "created" ? "Added" : "Updated"} ${email}${r.welcomed ? " — welcome email sent" : ""}${r.error ? ` (${r.error})` : ""}`);
    onDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0b0b2c]/50 p-4 md:p-10" role="dialog" aria-modal="true">
      <form onSubmit={save} className="w-full max-w-lg rounded-3xl bg-white p-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c] shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Add a person</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#94a3b8] hover:bg-[#f5f7fa]" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" className={input} />
          <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" className={input} />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={`${input} sm:col-span-2`} />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name (optional)" className={`${input} sm:col-span-2`} />
        </div>
        <div className="mt-5 text-[13px] font-bold">Access</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {products.map((p) => {
            const on = grant.has(p.key);
            return <button type="button" key={p.key} onClick={() => { const n = new Set(grant); if (on) n.delete(p.key); else n.add(p.key); setGrant(n); }} className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold ${on ? "border-[#3434ff] bg-[#f1f4ff] text-[#3434ff]" : "border-[#e2e8f0] text-[#69697b]"}`}>{on ? "✓ " : ""}{p.title}</button>;
          })}
        </div>
        <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" checked={welcome} onChange={(e) => setWelcome(e.target.checked)} className="accent-[#3434ff]" /> Email them a link to set their password</label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#69697b] hover:bg-[#f5f7fa]">Cancel</button>
          <button type="submit" disabled={saving || !email} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6] disabled:opacity-40">{saving && <Loader2 size={15} className="animate-spin" />} Add person</button>
        </div>
      </form>
    </div>
  );
}
