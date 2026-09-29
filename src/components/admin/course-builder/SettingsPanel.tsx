import { useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Course } from "@/lib/lms";
import { minWatchPercent } from "@/lib/progress";
import { FieldLabel, Section, inputClass } from "./ui";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const SettingsPanel = ({ course, onChange, onDeleted }: { course: Course; onChange: (patch: Partial<Course>) => void; onDeleted: () => void }) => {
  const [uploadingCover, setUploadingCover] = useState(false);
  const paid = (course.price_cents ?? 0) > 0;
  const watchPct = minWatchPercent(course);
  const playback = (course.playback_settings as Record<string, unknown> | null) ?? {};

  const uploadCover = async (file: File) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { toast.error("Use a PNG, JPG or WebP image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Images must be under 5 MB"); return; }
    setUploadingCover(true);
    try {
      const path = `${course.id}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "-")}`;
      const { error } = await supabase.storage.from("course-covers").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (error) throw error;
      const { data } = supabase.storage.from("course-covers").getPublicUrl(path);
      onChange({ cover_image_url: data.publicUrl });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingCover(false);
    }
  };

  const remove = async () => {
    const typed = prompt(`This permanently deletes "${course.title}", all its lessons, quizzes and learner progress.\n\nType DELETE to confirm.`);
    if (typed !== "DELETE") return;
    const { error } = await supabase.from("courses").delete().eq("id", course.id);
    if (error) { toast.error("Could not delete the course"); return; }
    toast.success("Course deleted");
    onDeleted();
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8 pb-24 md:px-0">
      <Section title="Course details">
        <div className="space-y-4">
          <div>
            <FieldLabel>Title</FieldLabel>
            <input value={course.title} onChange={(e) => onChange({ title: e.target.value })} className={inputClass} />
          </div>
          <div>
            <FieldLabel hint="shown in the catalogue and course page">Description</FieldLabel>
            <textarea rows={4} value={course.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} className={`${inputClass} resize-y`} />
          </div>
          <div>
            <FieldLabel hint="16:9, at least 1280×720">Cover image</FieldLabel>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative aspect-[16/9] w-64 overflow-hidden rounded-xl bg-gradient-to-br from-[#3434ff] to-[#202058]">
                {course.cover_image_url ? <img src={course.cover_image_url} alt="" className="h-full w-full object-cover" /> : <span className="absolute bottom-3 left-3 right-3 line-clamp-2 text-sm font-bold text-white">{course.title}</span>}
                {uploadingCover && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#e2e8f0] px-3.5 py-2 text-[13px] font-semibold hover:border-[#c7cdf9]">
                  <ImagePlus className="h-4 w-4 text-[#3434ff]" /> {course.cover_image_url ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ""; }} />
                </label>
                {course.cover_image_url && <button onClick={() => onChange({ cover_image_url: null })} className="text-left text-[13px] font-semibold text-red-600 hover:underline">Remove image</button>}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { value: false, label: "Free", text: "Learners enrol with one click" },
            { value: true, label: "Paid", text: "One-off payment by card (Stripe)" },
          ].map((o) => (
            <button key={o.label} onClick={() => onChange({ price_cents: o.value ? Math.max(course.price_cents ?? 0, 4900) : 0 })} className={`rounded-xl border p-3.5 text-left transition ${paid === o.value ? "border-[#3434ff] bg-[#f5f7ff] ring-4 ring-[#3434ff]/10" : "border-[#e2e8f0] hover:border-[#c7cdf9]"}`}>
              <span className="block text-sm font-semibold">{o.label}</span>
              <span className="text-[13px] text-[#69697b]">{o.text}</span>
            </button>
          ))}
        </div>
        {paid && (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-40">
              <FieldLabel>Price</FieldLabel>
              <input type="number" min={1} step="0.01" value={(course.price_cents ?? 0) / 100} onChange={(e) => onChange({ price_cents: Math.max(100, Math.round(Number(e.target.value || 0) * 100)) })} className={inputClass} />
            </div>
            <div className="w-36">
              <FieldLabel>Currency</FieldLabel>
              <select value={(course.currency || "GBP").toUpperCase()} onChange={(e) => onChange({ currency: e.target.value })} className={inputClass}>
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        )}
      </Section>

      <Section title="Progress & completion" description="Applies to lessons marked “Learners must complete this lesson before moving on”.">
        <FieldLabel>Share of each video learners must watch</FieldLabel>
        <div className="flex items-center gap-4">
          <input type="range" min={0} max={100} step={5} value={watchPct} onChange={(e) => onChange({ playback_settings: { ...playback, min_watch_percent: Number(e.target.value) } })} className="flex-1 accent-[#3434ff]" aria-label="Minimum watch percentage" />
          <span className="w-14 text-right text-lg font-bold tabular-nums">{watchPct}%</span>
        </div>
        <p className="mt-2 text-[13px] text-[#69697b]">{watchPct === 0 ? "No watch requirement — learners can complete video lessons straight away." : `Skipping ahead doesn't count. Set to 0% to switch the requirement off.`}</p>
        <div className="mt-5 max-w-[220px]">
          <FieldLabel hint="shown on the certificate">CPD hours</FieldLabel>
          <input type="number" min={0} step="0.5" value={course.cpd_hours ?? ""} onChange={(e) => onChange({ cpd_hours: e.target.value ? Number(e.target.value) : null })} className={inputClass} />
        </div>
      </Section>

      <Section title="Course link">
        <div className="flex items-center overflow-hidden rounded-lg border border-[#e2e8f0] focus-within:border-[#3434ff] focus-within:ring-4 focus-within:ring-[#3434ff]/10">
          <span className="whitespace-nowrap bg-[#f7f8fc] px-3 py-2.5 text-sm text-[#69697b]">safetytech.academy/learn/</span>
          <input value={course.slug} onChange={(e) => onChange({ slug: slugify(e.target.value) || course.slug })} className="min-w-0 flex-1 px-2 py-2.5 text-sm outline-none" />
        </div>
        <p className="mt-2 text-[13px] text-[#69697b]">Changing this breaks links you've already shared.</p>
      </Section>

      <Section title="Delete course" description="Removes the course, its content and all learner progress. This can't be undone.">
        <button onClick={remove} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete this course</button>
      </Section>
    </div>
  );
};
