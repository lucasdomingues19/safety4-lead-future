import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, FileUp, Loader2, Mail, Search, UserPlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toast } from "sonner";
import { ImportPeopleDialog, type Product } from "./ImportPeopleDialog";

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
  access: Record<string, { active: boolean; expires: string | null }>;
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
  const [filter, setFilter] = useState<"all" | "no-access" | "not-invited" | "never-signed-in" | "admins">("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyCell, setBusyCell] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkProduct, setBulkProduct] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const [profilesRes, rolesRes, coursesRes, enrRes, memRes, authRes] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, organisation, welcomed_at"),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
      supabase.from("courses").select("id, title, published").order("title"),
      supabase.from("enrollments").select("user_id, course_id, status, expires_at"),
      supabase.from("community_memberships").select("user_id, status, expires_at").eq("space", "global-network"),
      supabase.functions.invoke("admin-people", { body: { action: "list" } }),
    ]);
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
      access: access.get(p.id) ?? {},
    })).sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return people.filter((p) => {
      if (q && !`${p.name} ${p.email} ${p.company ?? ""}`.toLowerCase().includes(q)) return false;
      if (filter === "admins") return p.isAdmin;
      if (filter === "no-access") return !Object.values(p.access).some(live);
      if (filter === "not-invited") return !p.welcomedAt && !p.lastSignIn;
      if (filter === "never-signed-in") return !p.lastSignIn;
      return true;
    });
  }, [people, search, filter]);
  const pageRows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  useEffect(() => { setPage(0); }, [search, filter]);

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
    const { data, error } = await supabase.functions.invoke("admin-people", { body: { action: "welcome", user_ids: ids } });
    setBulkBusy(false);
    if (error || data?.error) { toast.error(data?.error ?? "Could not send"); return; }
    const res = data.results as { ok: boolean; email: string; error?: string }[];
    const bad = res.filter((r) => !r.ok);
    if (bad.length) toast.error(`${res.length - bad.length} sent, ${bad.length} failed: ${bad[0].error}`); else toast.success(`Welcome email sent to ${res.length}`);
    load();
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
        </select>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-bold hover:border-[#c7cdf9]"><UserPlus size={16} /> Add person</button>
          <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2a2ad6]"><FileUp size={16} /> Import CSV</button>
        </div>
      </div>

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
          {bulkBusy && <Loader2 size={16} className="animate-spin" />}
          <button onClick={() => setSelected(new Set())} className="ml-auto rounded-full p-1.5 hover:bg-white/10" aria-label="Clear selection"><X size={16} /></button>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-[20px] border border-[#e2e8f0] bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] text-left text-[11px] font-bold uppercase tracking-wider text-[#69697b]">
              <th className="w-10 px-4 py-3"><input type="checkbox" checked={allOnPage} onChange={() => { const n = new Set(selected); pageRows.forEach((p) => (allOnPage ? n.delete(p.id) : n.add(p.id))); setSelected(n); }} className="accent-[#3434ff]" aria-label="Select all on this page" /></th>
              <th className="px-3 py-3">Person</th>
              <th className="px-3 py-3">Status</th>
              {products.map((p) => <th key={p.key} className="max-w-[120px] px-2 py-3 text-center normal-case tracking-normal" title={p.title}><span className="line-clamp-2 text-[11.5px] font-bold">{p.title}</span></th>)}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && <tr><td colSpan={3 + products.length} className="px-6 py-10 text-center text-[#94a3b8]">Nobody matches.</td></tr>}
            {pageRows.map((p) => {
              const st = status(p);
              return (
                <tr key={p.id} className={`border-b border-[#f1f4f8] last:border-0 ${selected.has(p.id) ? "bg-[#f7f8ff]" : "hover:bg-[#fafbfc]"}`}>
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => { const n = new Set(selected); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); setSelected(n); }} className="accent-[#3434ff]" aria-label={`Select ${p.name}`} /></td>
                  <td className="px-3 py-3">
                    <div className="font-bold">{p.name}{p.isAdmin && <span className="ml-2 rounded bg-[#0b0b2c] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Admin</span>}</div>
                    <div className="text-xs text-[#94a3b8]">{p.email}{p.company ? ` · ${p.company}` : ""}</div>
                  </td>
                  <td className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${st.c}`}>
                    {st.t}
                    {!p.lastSignIn && <button onClick={() => sendWelcome([p.id])} className="ml-2 font-bold text-[#3434ff] hover:underline">{p.welcomedAt ? "Resend" : "Invite"}</button>}
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

      {showImport && <ImportPeopleDialog products={products} existingEmails={new Set(people.map((p) => p.email.toLowerCase()))} onClose={() => setShowImport(false)} onDone={load} />}
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
    const { data, error } = await supabase.functions.invoke("admin-people", {
      body: { action: "import", welcome, rows: [{ email, first_name: first, last_name: last, company, products: [...grant] }] },
    });
    setSaving(false);
    const r = data?.results?.[0];
    if (error || data?.error || !r || r.status === "error") { toast.error(r?.error ?? data?.error ?? "Could not add this person"); return; }
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
