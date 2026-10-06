import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PanelHeader, Spinner, adminFont, input, panel } from "../adminUi";

interface Course { id: string; title: string; price_cents: number | null; published: boolean }
interface Bundle { id: string; slug: string; title: string; description: string | null; cover_image_url: string | null; price_cents: number; currency: string; published: boolean; bundle_courses: { course_id: string }[] }
const money = (c: number, cur = "GBP") => new Intl.NumberFormat("en-GB", { style: "currency", currency: cur }).format(c / 100);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** Bundles: pick the courses, set one price, publish. Learners see them on their dashboard. */
export function Bundles() {
  const [bundles, setBundles] = useState<Bundle[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<Bundle | "new" | null>(null);
  const load = useCallback(async () => {
    const [{ data: b }, { data: c }] = await Promise.all([
      supabase.from("bundles").select("*, bundle_courses(course_id)").order("created_at", { ascending: false }),
      supabase.from("courses").select("id, title, price_cents, published").order("title"),
    ]);
    setBundles((b ?? []) as unknown as Bundle[]); setCourses((c ?? []) as Course[]);
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (!bundles) return <Spinner />;
  const titleOf = (id: string) => courses.find((c) => c.id === id)?.title ?? "Course";
  const del = async (b: Bundle) => {
    if (!window.confirm(`Delete the bundle "${b.title}"? People who already bought it keep their courses.`)) return;
    const { error } = await supabase.from("bundles").delete().eq("id", b.id);
    if (error) toast.error("Couldn't delete it"); else { toast.success("Bundle deleted"); void load(); }
  };
  return (
    <div style={{ ...panel, marginTop: 20, fontFamily: adminFont }}>
      <PanelHeader title="Bundles" sub="Two or more courses for one price. Published bundles appear on learners' dashboards."
        right={<button onClick={() => setEditing("new")} style={{ display: "inline-flex", gap: 6, alignItems: "center", border: 0, borderRadius: 8, background: "#3434ff", color: "#fff", padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Plus size={14} /> New bundle</button>} />
      {bundles.length === 0 && <p style={{ margin: "0 28px 24px", fontSize: 14, color: "#69697b" }}>No bundles yet. Try "AI Fundamentals + Safety 4.0" at a combined price.</p>}
      {bundles.map((b) => {
        const list = b.bundle_courses.reduce((n, c) => n + (courses.find((x) => x.id === c.course_id)?.price_cents ?? 0), 0);
        return (
          <div key={b.id} style={{ borderTop: "1px solid #f1f4f8", padding: "14px 24px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <div style={{ flex: "1 1 280px", minWidth: 0 }}>
              <div style={{ fontWeight: 800 }}>{b.title} <span style={{ marginLeft: 6, padding: "2px 9px", borderRadius: 999, fontSize: 11.5, background: b.published ? "#ecffd1" : "#f1f5f9", color: b.published ? "#3f6212" : "#475569" }}>{b.published ? "Published" : "Draft"}</span></div>
              <div style={{ fontSize: 12.5, color: "#69697b", marginTop: 3 }}>{b.bundle_courses.map((c) => titleOf(c.course_id)).join(" + ")}</div>
            </div>
            <div style={{ fontSize: 13.5, fontVariantNumeric: "tabular-nums" }}><strong>{money(b.price_cents, b.currency)}</strong>{list > b.price_cents && <span style={{ color: "#3f6212" }}> · saves {money(list - b.price_cents, b.currency)}</span>}</div>
            <button onClick={() => setEditing(b)} aria-label={`Edit ${b.title}`} style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: "7px 11px", cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}><Pencil size={13} /> Edit</button>
            <button onClick={() => del(b)} aria-label={`Delete ${b.title}`} style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: "7px 11px", cursor: "pointer", color: "#b91c1c" }}><Trash2 size={13} /></button>
          </div>
        );
      })}
      {editing && <BundleEditor bundle={editing === "new" ? null : editing} courses={courses} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}
    </div>
  );
}

function BundleEditor({ bundle, courses, onClose, onSaved }: { bundle: Bundle | null; courses: Course[]; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(bundle?.title ?? "");
  const [slug, setSlug] = useState(bundle?.slug ?? "");
  const [description, setDescription] = useState(bundle?.description ?? "");
  const [cover, setCover] = useState(bundle?.cover_image_url ?? "");
  const [price, setPrice] = useState(bundle ? bundle.price_cents / 100 : 0);
  const [published, setPublished] = useState(bundle?.published ?? false);
  const [picked, setPicked] = useState<string[]>(bundle?.bundle_courses.map((c) => c.course_id) ?? []);
  const [busy, setBusy] = useState(false);
  const list = picked.reduce((n, id) => n + (courses.find((c) => c.id === id)?.price_cents ?? 0), 0);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const valid = title.trim().length >= 2 && picked.length >= 2 && price > 0 && /^[a-z0-9-]{2,80}$/.test(slug || slugify(title));

  const save = async () => {
    setBusy(true);
    try {
      const row = { title: title.trim(), slug: slug || slugify(title), description: description.trim() || null, cover_image_url: cover.trim() || null, price_cents: Math.round(price * 100), published, updated_at: new Date().toISOString() };
      let id = bundle?.id;
      if (id) { const { error } = await supabase.from("bundles").update(row).eq("id", id); if (error) throw error; }
      else { const { data, error } = await supabase.from("bundles").insert(row).select("id").single(); if (error) throw error; id = data.id; }
      await supabase.from("bundle_courses").delete().eq("bundle_id", id!);
      const { error: e2 } = await supabase.from("bundle_courses").insert(picked.map((course_id, position) => ({ bundle_id: id!, course_id, position })));
      if (e2) throw e2;
      toast.success("Bundle saved"); onSaved();
    } catch (e) { toast.error(/duplicate|unique/i.test((e as Error).message) ? "That web address is taken. Change the slug." : "Couldn't save the bundle"); setBusy(false); }
  };
  const lab: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, marginBottom: 12 };
  return (
    <div role="dialog" aria-label="Bundle" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(11,11,44,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(560px, 100%)", maxHeight: "92vh", overflowY: "auto", background: "#fff", borderRadius: 18, padding: 26 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 19, fontWeight: 800 }}>{bundle ? "Edit bundle" : "New bundle"}</h3>
        <label style={lab}>Name<input style={{ ...input, marginTop: 5 }} value={title} onChange={(e) => { setTitle(e.target.value); if (!bundle) setSlug(slugify(e.target.value)); }} placeholder="AI + Safety 4.0 Bundle" /></label>
        <label style={lab}>Short description (optional)<textarea style={{ ...input, marginTop: 5, minHeight: 64 }} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <div style={lab}>Courses in the bundle (pick at least 2)
          <div style={{ marginTop: 6, display: "grid", gap: 6, fontWeight: 500 }}>
            {courses.map((c) => <label key={c.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5 }}><input type="checkbox" checked={picked.includes(c.id)} onChange={() => toggle(c.id)} /> {c.title} <span style={{ color: "#94a3b8" }}>· {c.price_cents ? money(c.price_cents) : "free"}{c.published ? "" : " · not published"}</span></label>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ ...lab, flex: 1 }}>Bundle price (£)<input style={{ ...input, marginTop: 5 }} type="number" min={1} step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></label>
          <div style={{ ...lab, flex: 1, fontWeight: 500, fontSize: 13.5, paddingTop: 22, color: "#475569" }}>{list > 0 && <>Courses separately: <strong>{money(list)}</strong>{price > 0 && price < list / 100 && <span style={{ color: "#3f6212" }}> · saves {money(list - Math.round(price * 100))}</span>}{price * 100 >= list && list > 0 && <span style={{ color: "#9a3412" }}> · not cheaper than buying separately</span>}</>}</div>
        </div>
        <label style={lab}>Cover image URL (optional, otherwise the first course cover is used)<input style={{ ...input, marginTop: 5 }} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://…" /></label>
        <label style={lab}>Web address name<input style={{ ...input, marginTop: 5 }} value={slug} onChange={(e) => setSlug(slugify(e.target.value))} /></label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, fontWeight: 700, marginBottom: 16 }}><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published (visible to learners)</label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: "9px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={save} disabled={busy || !valid} style={{ display: "inline-flex", gap: 6, alignItems: "center", border: 0, borderRadius: 8, background: "#3434ff", color: "#fff", padding: "9px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: busy || !valid ? 0.5 : 1 }}>{busy && <Loader2 size={14} className="animate-spin" />} Save bundle</button>
        </div>
      </div>
    </div>
  );
}
