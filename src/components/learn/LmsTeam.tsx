import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Download, Loader2, Mail, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/invoke";
import { downloadCsv } from "@/components/learn/admin/adminUi";
import { PROFILE_UPDATED_EVENT, useLmsProfile } from "@/components/learn/shell/useLmsProfile";
import { BuySeatsDialog } from "@/components/learn/BuySeatsDialog";

// My team: a company manager's screen. Seats per course, who has one, how far they
// have got, and the tools to add, invite again or remove people.

interface Seat { course_id: string; course_title: string; course_slug: string; seats: number; used: number; free: number; access_days: number | null }
interface Row {
  user_id: string; name: string; email: string; role: string; course_id: string | null; course_title: string | null; status: string;
  lessons_done: number; lessons_total: number; last_active: string | null; certified: boolean; enrolled_at: string | null; expires_at: string | null; signed_in: boolean;
}
type State = "manager" | "removed" | "completed" | "invited" | "not_started" | "in_progress" | "quiet";
const DAY = 86_400_000;
const STATE: Record<State, { label: string; cls: string }> = {
  manager: { label: "Manager", cls: "bg-[#f1f5f9] text-[#475569]" },
  removed: { label: "Removed", cls: "bg-[#f1f5f9] text-[#94a3b8]" },
  completed: { label: "Completed", cls: "bg-[#ecffd1] text-[#3f6212]" },
  invited: { label: "Invited, not signed in", cls: "bg-[#fff4e5] text-[#9a3412]" },
  not_started: { label: "Not started", cls: "bg-[#f1f5f9] text-[#475569]" },
  in_progress: { label: "In progress", cls: "bg-[#eef1ff] text-[#3434ff]" },
  quiet: { label: "Quiet 14+ days", cls: "bg-[#fff4e5] text-[#9a3412]" },
};
const stateOf = (r: Row): State => {
  if (!r.course_id) return "manager";
  if (r.status === "cancelled") return "removed";
  if (r.certified || (r.lessons_total > 0 && r.lessons_done >= r.lessons_total)) return "completed";
  if (!r.signed_in) return "invited";
  if (r.lessons_done === 0 && !r.last_active) return "not_started";
  const quietFor = Date.now() - Math.max(r.last_active ? new Date(r.last_active).getTime() : 0, r.enrolled_at ? new Date(r.enrolled_at).getTime() : 0);
  if (quietFor > 14 * DAY) return "quiet";
  return r.lessons_done === 0 ? "not_started" : "in_progress";
};
const ago = (iso: string | null) => {
  if (!iso) return "—";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
  return d <= 0 ? "Today" : d === 1 ? "Yesterday" : d < 60 ? `${d} days ago` : new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
};

export function LmsTeam({ orgId: forcedOrg, embedded }: { orgId?: string; embedded?: boolean }) {
  const { profile } = useLmsProfile();
  const orgs = profile?.managedOrgs ?? [];
  const [orgId, setOrgId] = useState<string | null>(forcedOrg ?? null);
  const [seats, setSeats] = useState<Seat[] | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | State>("all");
  const [addFor, setAddFor] = useState<Seat | null>(null);
  const [buying, setBuying] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { if (!forcedOrg && !orgId && orgs.length) setOrgId(orgs[0].id); }, [forcedOrg, orgId, orgs]);

  // Coming back from Stripe (?session_id=...): confirm the payment so the seats appear straight away.
  const [confirming, setConfirming] = useState(() => !forcedOrg && new URLSearchParams(window.location.search).has("session_id"));
  useEffect(() => {
    if (forcedOrg) return;
    const sp = new URLSearchParams(window.location.search);
    const sid = sp.get("session_id");
    if (!sid) return;
    (async () => {
      try {
        const out = await invokeFunction<{ status: string; org_id?: string; seats?: number }>("confirm-team-checkout", { session_id: sid });
        if (out.status === "paid") {
          toast.success(`${out.seats ?? "Your"} seats have been added.`);
          window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
          if (out.org_id) setOrgId(out.org_id);
        } else toast.message("Your payment is still being confirmed. Refresh in a minute.");
      } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't confirm the payment. If you were charged, your seats will appear shortly."); }
      finally {
        sp.delete("session_id"); sp.delete("cancelled");
        window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
        setConfirming(false);
      }
    })();
  }, [forcedOrg]);
  const org = orgs.find((o) => o.id === orgId);
  const isOwner = org?.role === "owner" || !!profile?.isAdmin;

  const load = useCallback(async () => {
    if (!orgId) return;
    setError(null);
    const [s, t] = await Promise.all([supabase.rpc("org_seat_summary", { _org: orgId }), supabase.rpc("org_team", { _org: orgId })]);
    if (s.error || t.error) { setError((s.error ?? t.error)!.message); return; }
    setSeats((s.data ?? []) as Seat[]);
    setRows((t.data ?? []) as Row[]);
  }, [orgId]);
  useEffect(() => { void load(); }, [load]);

  const remove = async (r: Row) => {
    if (!orgId || !r.course_id) return;
    if (!window.confirm(`Remove ${r.name} from ${r.course_title}?`)) return;
    setBusy(r.user_id + r.course_id);
    try {
      const out = await invokeFunction<{ message: string }>("org-team", { action: "remove", org_id: orgId, course_id: r.course_id, user_id: r.user_id });
      toast.success(out.message);
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't remove them"); } finally { setBusy(null); }
  };
  const resend = async (r: Row) => {
    if (!orgId) return;
    setBusy("r" + r.user_id);
    try { await invokeFunction("org-team", { action: "resend", org_id: orgId, user_id: r.user_id }); toast.success(`Invite sent to ${r.email}`); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't send the invite"); } finally { setBusy(null); }
  };
  const addManager = async () => {
    const email = window.prompt("Email address of the new manager");
    if (!email || !orgId) return;
    try { await invokeFunction("org-team", { action: "add_manager", org_id: orgId, email }); toast.success("Manager added. They can sign in and will see My team."); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't add the manager"); }
  };

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows ?? []).filter((r) => {
      const st = stateOf(r);
      return (filter === "all" || st === filter) && (!needle || `${r.name} ${r.email} ${r.course_title ?? ""}`.toLowerCase().includes(needle));
    });
  }, [rows, q, filter]);

  const exportCsv = () => downloadCsv(`team-progress-${new Date().toISOString().slice(0, 10)}.csv`, shown.filter((r) => r.course_id).map((r) => ({
    Name: r.name, Email: r.email, Course: r.course_title ?? "", Status: STATE[stateOf(r)].label,
    "Lessons done": r.lessons_done, "Lessons total": r.lessons_total, "Last active": r.last_active ? new Date(r.last_active).toISOString().slice(0, 10) : "",
    Certified: r.certified ? "Yes" : "No", "Access ends": r.expires_at ? new Date(r.expires_at).toISOString().slice(0, 10) : "Lifetime",
  })));

  const wrap = (children: React.ReactNode) => embedded
    ? <div className="font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c]">{children}</div>
    : <div className="min-h-screen bg-[#eef1f6] px-4 pb-20 pt-10 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c] md:px-7"><div className="mx-auto max-w-[1100px]">{children}</div></div>;

  if (!orgId) return wrap(
    <div className="py-10">
      {confirming
        ? <p className="flex items-center gap-2 text-[15px] text-[#69697b]"><Loader2 size={16} className="animate-spin" /> Confirming your purchase…</p>
        : <>
            <p className="text-[15px] text-[#69697b]">{profile ? "You don't manage a company yet." : "Loading…"}</p>
            {profile && <button onClick={() => setBuying(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#3434ff] px-4 py-2.5 text-[14px] font-bold text-white"><Plus size={15} /> Buy seats for your team</button>}
            {buying && <BuySeatsDialog onClose={() => setBuying(false)} />}
          </>}
    </div>,
  );

  const counts = (rows ?? []).filter((r) => r.course_id).reduce<Record<string, number>>((m, r) => { const s = stateOf(r); m[s] = (m[s] ?? 0) + 1; return m; }, {});
  const filters: ("all" | State)[] = ["all", "in_progress", "not_started", "invited", "quiet", "completed"];

  return wrap(<>
    {!embedded && (
      <>
        <p className="text-[13px] font-extrabold tracking-[0.12em] text-[#8ab815]">MY TEAM</p>
        <h1 className="mt-3 flex flex-wrap items-center gap-3 text-[34px] font-bold leading-tight md:text-[38px]"><Building2 size={30} className="text-[#3434ff]" /> {org?.name ?? "Your company"}</h1>
        <p className="mt-2 text-[16px] text-[#69697b]">Give your people access, and see how they are getting on.</p>
        {orgs.length > 1 && (
          <select value={orgId} onChange={(e) => { setSeats(null); setRows(null); setOrgId(e.target.value); }} className="mt-4 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[14px] font-semibold" aria-label="Company">
            {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}
      </>
    )}

    {error && <p role="alert" className="mt-6 rounded-xl bg-[#fef2f2] p-4 text-[14px] text-[#b91c1c]">{error}</p>}
    {!seats && !error && <div className="mt-10 flex justify-center"><Loader2 className="animate-spin text-[#3434ff]" /></div>}

    {seats && (
      <section className="mt-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px] font-bold">Seats</h2>
          <div className="flex gap-2">
            {isOwner && <button onClick={addManager} className="rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2 text-[13.5px] font-bold hover:border-[#c7cdf9]">Add a manager</button>}
            <button onClick={() => setBuying(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#3434ff] px-3.5 py-2 text-[13.5px] font-bold text-white hover:bg-[#2a2ad6]"><Plus size={15} /> Buy more seats</button>
          </div>
        </div>
        {seats.length === 0 ? (
          <p className="mt-3 rounded-xl bg-white p-5 text-[14.5px] text-[#69697b]">No seats yet. Buy seats for a course, then add the people who will take it.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {seats.map((s) => (
              <div key={s.course_id} className="rounded-[16px] border border-[#e2e8f0] bg-white p-5">
                <div className="text-[15.5px] font-bold leading-snug">{s.course_title}</div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eef1f6]" role="img" aria-label={`${s.used} of ${s.seats} seats used`}>
                  <div className="h-full rounded-full bg-[#3434ff]" style={{ width: `${s.seats ? Math.min(100, (s.used / s.seats) * 100) : 0}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[13.5px] text-[#69697b]">
                  <span><strong className="text-[#0b0b2c]">{s.used}</strong> of {s.seats} used · <strong className={s.free ? "text-[#3f6212]" : "text-[#9a3412]"}>{s.free} free</strong></span>
                  <span>{s.access_days ? `${s.access_days}-day access` : "Lifetime access"}</span>
                </div>
                <button onClick={() => setAddFor(s)} disabled={s.free <= 0} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0b0b2c] px-3.5 py-2 text-[13.5px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
                  <UserPlus size={15} /> {s.free > 0 ? "Add people" : "No free seats"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    )}

    {rows && (
      <section className="mt-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px] font-bold">Your people</h2>
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2 text-[13.5px] font-bold hover:border-[#c7cdf9]"><Download size={15} /> Export CSV</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 md:max-w-[320px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or course" aria-label="Search people" className="w-full rounded-lg border border-[#e2e8f0] bg-white py-2 pl-9 pr-3 text-[14px] outline-none focus:border-[#3434ff]" />
          </div>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter people">
            {filters.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-[12.5px] font-bold ${filter === f ? "bg-[#0b0b2c] text-white" : "bg-white text-[#69697b]"}`}>
                {f === "all" ? "All" : STATE[f].label} <span className="opacity-60">{f === "all" ? (rows ?? []).filter((r) => r.course_id).length : counts[f] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 overflow-x-auto rounded-[16px] border border-[#e2e8f0] bg-white">
          <table className="w-full min-w-[760px] border-collapse text-[13.5px]">
            <thead><tr className="text-left text-[12px] text-[#69697b]">
              {["Person", "Course", "Progress", "Status", "Last active", ""].map((h) => <th key={h} className="border-b border-[#e2e8f0] px-4 py-3 font-bold">{h}</th>)}
            </tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-[#94a3b8]">{(rows ?? []).length ? "No one matches that." : "No one has been added yet."}</td></tr>}
              {shown.map((r) => {
                const st = stateOf(r), pct = r.lessons_total ? Math.round((r.lessons_done / r.lessons_total) * 100) : 0;
                return (
                  <tr key={`${r.user_id}-${r.course_id}`} className="border-b border-[#f1f4f8] last:border-0">
                    <td className="px-4 py-3"><div className="font-bold">{r.name}</div><div className="text-[12px] text-[#94a3b8]">{r.email}</div></td>
                    <td className="px-4 py-3">{r.course_title ?? "—"}</td>
                    <td className="px-4 py-3">{r.course_id ? (
                      <div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#eef1f6]"><div className="h-full rounded-full bg-[#8ab815]" style={{ width: `${pct}%` }} /></div><span className="tabular-nums text-[12px] text-[#69697b]">{pct}%</span></div>
                    ) : "—"}</td>
                    <td className="px-4 py-3"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold ${STATE[st].cls}`}>{STATE[st].label}</span></td>
                    <td className="px-4 py-3 text-[#69697b]">{r.course_id ? ago(r.last_active) : "—"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {st === "invited" && <button onClick={() => resend(r)} disabled={busy === "r" + r.user_id} className="mr-1 inline-flex items-center gap-1 rounded-md border border-[#e2e8f0] px-2.5 py-1.5 text-[12px] font-bold hover:border-[#c7cdf9]"><Mail size={13} /> Resend invite</button>}
                      {r.course_id && st !== "removed" && <button onClick={() => remove(r)} disabled={busy === r.user_id + r.course_id} aria-label={`Remove ${r.name}`} className="inline-flex items-center gap-1 rounded-md border border-[#e2e8f0] px-2.5 py-1.5 text-[12px] font-bold text-[#b91c1c] hover:border-[#fecaca]"><Trash2 size={13} /> Remove</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    )}

    {addFor && orgId && <AddPeopleDialog orgId={orgId} seat={addFor} onClose={() => setAddFor(null)} onDone={() => { void load(); }} />}
    {buying && orgId && <BuySeatsDialog orgId={orgId} orgName={org?.name} onClose={() => setBuying(false)} />}
  </>);
}

/** Paste emails (one per line, optionally "Name, email"), pick nothing else: the course is the seat card's. */
function AddPeopleDialog({ orgId, seat, onClose, onDone }: { orgId: string; seat: Seat; onClose: () => void; onDone: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ email: string; status: string; message: string }[] | null>(null);

  const people = useMemo(() => text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = l.match(/<([^>]+)>/) ?? l.match(/([^\s,;]+@[^\s,;]+)/);
    const email = (m?.[1] ?? l).trim();
    const name = l.replace(m?.[0] ?? "", "").replace(/[,;<>"]/g, " ").trim();
    const [first_name, ...rest] = name.split(/\s+/).filter(Boolean);
    return { email, first_name, last_name: rest.join(" ") };
  }), [text]);

  const submit = async () => {
    setBusy(true);
    try {
      const out = await invokeFunction<{ results: { email: string; status: string; message: string }[] }>("org-team", { action: "assign", org_id: orgId, course_id: seat.course_id, people });
      setResults(out.results);
      onDone();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't add them"); } finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-[#e2e8f0] bg-white font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c]">
        <DialogHeader>
          <DialogTitle>Add people to {seat.course_title}</DialogTitle>
          <DialogDescription>You have {seat.free} free seat{seat.free === 1 ? "" : "s"}. Each person gets an email with how to sign in.</DialogDescription>
        </DialogHeader>
        {!results ? (
          <>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} aria-label="Email addresses" placeholder={"One person per line:\nana@company.com\nJo Smith, jo@company.com"}
              className="w-full rounded-lg border border-[#e2e8f0] p-3 text-[14px] outline-none focus:border-[#3434ff]" />
            <div className="flex items-center justify-between gap-3">
              <span className={`text-[13px] ${people.length > seat.free ? "font-bold text-[#b91c1c]" : "text-[#69697b]"}`}>{people.length} {people.length === 1 ? "person" : "people"}{people.length > seat.free ? ` — only ${seat.free} seat${seat.free === 1 ? "" : "s"} free` : ""}</span>
              <button onClick={submit} disabled={busy || !people.length || people.length > seat.free} className="inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-4 py-2.5 text-[14px] font-bold text-white disabled:opacity-40">
                {busy && <Loader2 size={15} className="animate-spin" />} Add and send invites
              </button>
            </div>
          </>
        ) : (
          <>
            <ul className="space-y-1.5 text-[14px]">
              {results.map((r) => (
                <li key={r.email} className="flex items-start gap-2"><span className={r.status === "added" ? "text-[#3f6212]" : "text-[#b91c1c]"}>{r.status === "added" ? "✓" : "✕"}</span><span><strong>{r.email}</strong> <span className="text-[#69697b]">{r.message}</span></span></li>
              ))}
            </ul>
            <div className="flex justify-end"><button onClick={onClose} className="rounded-lg bg-[#0b0b2c] px-4 py-2.5 text-[14px] font-bold text-white">Done</button></div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
