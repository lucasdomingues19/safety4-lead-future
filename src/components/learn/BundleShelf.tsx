import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/invoke";
import { useAuthUser } from "@/hooks/useAuthUser";

interface BundleCourse { course_id: string; courses: { title: string; price_cents: number | null; cover_image_url: string | null } | null }
interface Bundle { id: string; title: string; description: string | null; cover_image_url: string | null; price_cents: number; currency: string; bundle_courses: BundleCourse[] }
const money = (c: number, cur = "GBP") => new Intl.NumberFormat("en-GB", { style: "currency", currency: cur, maximumFractionDigits: c % 100 ? 2 : 0 }).format(c / 100);

/** Bundles on the dashboard: several courses for one price. Also confirms a payment on return from Stripe. */
export function BundleShelf({ onChanged }: { onChanged?: () => void }) {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: b }, { data: e }] = await Promise.all([
      supabase.from("bundles").select("id, title, description, cover_image_url, price_cents, currency, bundle_courses(course_id, courses(title, price_cents, cover_image_url))").eq("published", true).order("price_cents"),
      supabase.from("enrollments").select("course_id, status, expires_at").eq("user_id", user.id),
    ]);
    setBundles(((b ?? []) as unknown as Bundle[]).filter((x) => x.bundle_courses.length >= 2));
    setOwned(new Set((e ?? []).filter((x) => x.status === "active" && (!x.expires_at || new Date(x.expires_at) > new Date())).map((x) => x.course_id)));
  }, [user]);
  useEffect(() => { void load(); }, [load]);

  // Back from Stripe: unlock the courses straight away.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const sid = sp.get("bundle_session");
    if (!sid) return;
    (async () => {
      try {
        const out = await invokeFunction<{ status: string; title?: string }>("confirm-bundle-checkout", { session_id: sid });
        if (out.status === "paid") { toast.success(`${out.title} is unlocked. Enjoy!`); await load(); onChanged?.(); }
        else toast.message("Your payment is still being confirmed. Refresh in a minute.");
      } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't confirm the payment. If you were charged, your courses will appear shortly."); }
      finally { sp.delete("bundle_session"); window.history.replaceState(null, "", `${window.location.pathname}${sp.toString() ? `?${sp}` : ""}`); }
    })();
  }, [load, onChanged]);

  const buy = async (b: Bundle) => {
    setBusy(b.id);
    try {
      const out = await invokeFunction<{ url?: string; alreadyOwned?: boolean }>("create-bundle-checkout", { bundle_id: b.id });
      if (out.alreadyOwned) { toast.success("You already have every course in this bundle."); navigate("/learn?view=learning"); }
      else if (out.url) window.location.href = out.url;
    } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't start the payment"); } finally { setBusy(null); }
  };

  const shown = bundles.filter((b) => !b.bundle_courses.every((c) => owned.has(c.course_id)));
  if (!shown.length) return null;

  return (
    <>
      <h2 style={{ margin: "44px 0 0", fontSize: "22px", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}><Layers size={22} color="#3434ff" /> Course bundles</h2>
      <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#69697b" }}>Learn more for less. One payment, all the courses.</p>
      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))", gap: 20 }}>
        {shown.map((b) => {
          const courses = b.bundle_courses.map((c) => c.courses).filter(Boolean) as NonNullable<BundleCourse["courses"]>[];
          const list = courses.reduce((n, c) => n + (c.price_cents ?? 0), 0);
          const save = Math.max(0, list - b.price_cents);
          const cover = b.cover_image_url ?? courses.find((c) => c.cover_image_url)?.cover_image_url;
          return (
            <div key={b.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {cover && <img src={cover} alt="" style={{ display: "block", width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.3 }}>{b.title}</div>
                  <div style={{ textAlign: "right", flex: "none" }}>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{money(b.price_cents, b.currency)}</div>
                    {save > 0 && <div style={{ fontSize: 12, color: "#94a3b8", textDecoration: "line-through" }}>{money(list, b.currency)}</div>}
                  </div>
                </div>
                {save > 0 && <div style={{ marginTop: 8, alignSelf: "flex-start", fontSize: 12.5, fontWeight: 800, color: "#3f6212", background: "#ecffd1", padding: "3px 10px", borderRadius: 999 }}>Save {money(save, b.currency)}</div>}
                {b.description && <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.6, color: "#69697b" }}>{b.description}</p>}
                <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0, display: "grid", gap: 7, flex: 1 }}>
                  {b.bundle_courses.map((c) => (
                    <li key={c.course_id} style={{ display: "flex", gap: 8, fontSize: 14, alignItems: "flex-start" }}>
                      <Check size={16} color="#8ab815" style={{ flex: "none", marginTop: 2 }} />
                      <span>{c.courses?.title}{owned.has(c.course_id) && <span style={{ marginLeft: 6, fontSize: 11.5, color: "#94a3b8" }}>(you already have this)</span>}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => buy(b)} disabled={busy === b.id} style={{ marginTop: 18, border: 0, borderRadius: 8, background: "#3434ff", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", padding: "13px 18px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {busy === b.id && <Loader2 size={14} className="animate-spin" />} Get the bundle
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
