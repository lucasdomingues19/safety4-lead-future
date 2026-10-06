import { useEffect, useMemo, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/invoke";

interface Tier { min: number; pct: number }
interface TeamCourse { id: string; title: string; price_cents: number; currency: string | null; team_tiers: Tier[] }

const money = (cents: number, cur = "GBP") => new Intl.NumberFormat("en-GB", { style: "currency", currency: cur.toUpperCase() }).format(cents / 100);
/** Same maths as the database's team_price(); the server recalculates at checkout. */
export const discountFor = (tiers: Tier[], seats: number) => tiers.reduce((p, t) => (seats >= t.min && t.pct > p ? t.pct : p), 0);

/** Buy seats for a company: pick the course and how many, see the volume price, pay by card. */
export function BuySeatsDialog({ orgId, orgName, onClose }: { orgId?: string; orgName?: string; onClose: () => void }) {
  const [courses, setCourses] = useState<TeamCourse[] | null>(null);
  const [courseId, setCourseId] = useState("");
  const [seats, setSeats] = useState(5);
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("courses").select("id, title, price_cents, currency, team_tiers").eq("published", true).eq("team_enabled", true).gt("price_cents", 0).order("title")
      .then(({ data }) => {
        const list = ((data ?? []) as unknown as TeamCourse[]).map((c) => ({ ...c, team_tiers: Array.isArray(c.team_tiers) ? c.team_tiers : [] }));
        setCourses(list);
        if (list[0]) setCourseId(list[0].id);
      });
  }, []);

  const course = courses?.find((c) => c.id === courseId);
  const calc = useMemo(() => {
    if (!course) return null;
    const pct = discountFor(course.team_tiers, seats);
    const unit = Math.round((course.price_cents * (100 - pct)) / 100);
    return { pct, unit, total: unit * seats, list: course.price_cents * seats };
  }, [course, seats]);

  const go = async () => {
    if (!course) return;
    setBusy(true);
    try {
      const out = await invokeFunction<{ url: string }>("create-team-checkout", { course_id: course.id, seats, ...(orgId ? { org_id: orgId } : { org_name: company }) });
      window.location.href = out.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't start the payment");
      setBusy(false);
    }
  };

  const seatsOk = Number.isInteger(seats) && seats >= 2 && seats <= 500;
  const canPay = !!course && seatsOk && (orgId || company.trim().length >= 2);

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-[#e2e8f0] bg-white font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Users size={20} className="text-[#3434ff]" /> Buy seats for {orgName ?? "your team"}</DialogTitle>
          <DialogDescription>Pay by card now, then choose who gets each seat. Need an invoice or a purchase order? Email hello@safetytech.academy.</DialogDescription>
        </DialogHeader>
        {!courses ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#3434ff]" /></div> : courses.length === 0 ? (
          <p className="py-4 text-[14.5px] text-[#69697b]">No courses are available for team seats yet. Email hello@safetytech.academy and we'll set it up.</p>
        ) : (
          <div className="space-y-4">
            {!orgId && (
              <label className="block text-[13px] font-bold">Company name
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Safety Ltd" maxLength={120} className="mt-1 w-full rounded-lg border border-[#e2e8f0] px-3 py-2.5 text-[14.5px] font-normal outline-none focus:border-[#3434ff]" />
              </label>
            )}
            <label className="block text-[13px] font-bold">Course
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-1 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2.5 text-[14.5px] font-normal">
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title} · {money(c.price_cents, c.currency ?? "GBP")} each</option>)}
              </select>
            </label>
            <label className="block text-[13px] font-bold">Number of seats
              <input type="number" min={2} max={500} value={seats} onChange={(e) => setSeats(Math.floor(Number(e.target.value)) || 0)} className="mt-1 w-32 rounded-lg border border-[#e2e8f0] px-3 py-2.5 text-[14.5px] font-normal outline-none focus:border-[#3434ff]" />
              {!seatsOk && <span className="ml-3 text-[12.5px] font-normal text-[#b91c1c]">Between 2 and 500</span>}
            </label>

            {course && calc && seatsOk && (
              <div className="rounded-xl bg-[#f5f7ff] p-4">
                <div className="flex items-baseline justify-between"><span className="text-[13.5px] text-[#69697b]">{seats} seats × {money(calc.unit, course.currency ?? "GBP")}</span><span className="text-[22px] font-extrabold tabular-nums">{money(calc.total, course.currency ?? "GBP")}</span></div>
                {calc.pct > 0 && <div className="mt-1 text-[13px] font-bold text-[#3f6212]">You save {money(calc.list - calc.total, course.currency ?? "GBP")} ({calc.pct}% volume discount)</div>}
                <div className="mt-2 text-[12px] text-[#69697b]">
                  {course.team_tiers.length > 0 && <>Volume discounts: {course.team_tiers.map((t) => `${t.min}+ seats ${t.pct}% off`).join(" · ")}. </>}
                  VAT is added at checkout where it applies, and you can enter a discount code there.
                </div>
              </div>
            )}

            <button onClick={go} disabled={busy || !canPay} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3434ff] px-4 py-3 text-[15px] font-bold text-white disabled:opacity-40">
              {busy && <Loader2 size={16} className="animate-spin" />} Continue to payment
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
