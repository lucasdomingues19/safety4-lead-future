import { useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, CheckCircle2, Download, ExternalLink, Eye, EyeOff, Loader2, Receipt, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { formatPrice } from "@/lib/lms";
import { toast } from "sonner";

/** Tell the LMS shell (sidebar name/photo) that the profile changed. */
export const PROFILE_UPDATED_EVENT = "lms-profile-updated";

interface AccessRow { courseId: string; title: string; slug: string; status: string; enrolledAt: string; expiresAt: string | null; completedAt: string | null }
interface PurchaseRow { id: string; course_title: string; amount_cents: number; currency: string; status: string; receipt_url: string | null; purchased_at: string }

const inputCls = "w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-3 text-[15px] text-[#0b0b2c] outline-none transition focus:border-[#3434ff] focus:ring-4 focus:ring-[#3434ff]/10";
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const Card = ({ title, description, children, tour }: { title: string; description?: string; children: ReactNode; tour?: string }) => (
  <section data-tour={tour} className="mt-5 rounded-[20px] border border-[#e2e8f0] bg-white p-6 md:p-7">
    <h2 className="text-lg font-bold">{title}</h2>
    {description && <p className="mt-1 text-[13px] text-[#69697b]">{description}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

const Switch = ({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint: string }) => (
  <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center gap-5 py-2 text-left">
    <span className="min-w-0 flex-1">
      <span className="block text-[15px] font-semibold">{label}</span>
      <span className="mt-0.5 block text-[13px] text-[#94a3b8]">{hint}</span>
    </span>
    <span className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition ${on ? "bg-[#3434ff]" : "bg-[#e2e8f0]"}`}>
      <span className={`absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[23px]" : "left-[3px]"}`} />
    </span>
  </button>
);

/** Square-crop and shrink a photo to 512px before upload. */
const toAvatar = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(512, side);
  canvas.getContext("2d")!.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
  if (!blob) throw new Error("Could not process the photo");
  return blob;
};

export function LmsSettings() {
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [learnerName, setLearnerName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [captionsDefault, setCaptionsDefault] = useState(true);
  const [hideFromLeaderboard, setHideFromLeaderboard] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const [access, setAccess] = useState<AccessRow[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: enr }, { data: buys }] = await Promise.all([
        supabase.from("profiles").select("full_name, job_title, organisation, captions_default, hide_from_leaderboard, avatar_url").eq("id", user.id).maybeSingle(),
        supabase.from("enrollments").select("course_id, status, enrolled_at, expires_at, completed_at, courses(title, slug)").eq("user_id", user.id).order("enrolled_at", { ascending: false }),
        supabase.from("course_purchases").select("id, course_title, amount_cents, currency, status, receipt_url, purchased_at").order("purchased_at", { ascending: false }),
      ]);
      if (profile) {
        setLearnerName(profile.full_name ?? "");
        setJobTitle(profile.job_title ?? "");
        setOrganisation(profile.organisation ?? "");
        setCaptionsDefault(profile.captions_default);
        setHideFromLeaderboard(profile.hide_from_leaderboard);
        setAvatarUrl(profile.avatar_url ?? null);
      }
      setAccess((enr ?? []).map((e) => {
        const c = e.courses as unknown as { title: string; slug: string } | null;
        return { courseId: e.course_id, title: c?.title ?? "Course", slug: c?.slug ?? "", status: e.status, enrolledAt: e.enrolled_at, expiresAt: e.expires_at, completedAt: e.completed_at };
      }));
      setPurchases((buys ?? []) as PurchaseRow[]);
      setLoading(false);
    })();
  }, [user]);

  const notifyShell = () => window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));

  const save = async () => {
    if (!user) return;
    if (!learnerName.trim()) { toast.error("Please enter your name — it appears on your certificates"); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: learnerName.trim(),
      job_title: jobTitle.trim() || null,
      organisation: organisation.trim() || null,
      captions_default: captionsDefault,
      hide_from_leaderboard: hideFromLeaderboard,
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error("Could not save your settings"); return; }
    toast.success("Settings saved");
    notifyShell();
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;
    if (!/^image\/(png|jpeg|webp|heic|heif)$/.test(file.type) && !/\.(png|jpe?g|webp|heic)$/i.test(file.name)) { toast.error("Choose a JPG, PNG or WebP photo"); return; }
    setUploadingPhoto(true);
    try {
      const blob = await toAvatar(file);
      const path = `${user.id}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (error) throw error;
      const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      const { error: upErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (upErr) throw upErr;
      const old = avatarUrl?.split("/avatars/")[1];
      if (old) supabase.storage.from("avatars").remove([decodeURIComponent(old)]);
      setAvatarUrl(url);
      toast.success("Photo updated");
      notifyShell();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload the photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = async () => {
    if (!user || !avatarUrl) return;
    const old = avatarUrl.split("/avatars/")[1];
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    if (error) { toast.error("Could not remove the photo"); return; }
    if (old) supabase.storage.from("avatars").remove([decodeURIComponent(old)]);
    setAvatarUrl(null);
    notifyShell();
  };

  const changePassword = async () => {
    if (!user?.email) return;
    if (newPw.length < 8) { toast.error("Your new password needs at least 8 characters"); return; }
    if (newPw !== confirmPw) { toast.error("The new passwords don't match"); return; }
    if (newPw === currentPw) { toast.error("Choose a password different from your current one"); return; }
    setChangingPw(true);
    try {
      // Confirm it's really them before changing anything.
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPw });
      if (signInErr) { toast.error("Your current password isn't right"); return; }
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast.success("Password changed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change your password");
    } finally {
      setChangingPw(false);
    }
  };

  const sendReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/learn/reset-password` });
    if (error) { toast.error(error.message); return; }
    toast.success(`We've emailed a reset link to ${user.email}`);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#eef1f6]"><Loader2 size={28} className="animate-spin text-[#3434ff]" /></div>;
  }

  const initials = (learnerName || user?.email || "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const accessLabel = (a: AccessRow) => {
    if (a.status !== "active") return { text: a.status === "cancelled" ? "Access removed" : "Expired", cls: "bg-[#f1f5f9] text-[#69697b]" };
    if (a.expiresAt && new Date(a.expiresAt) < new Date()) return { text: "Expired", cls: "bg-[#fff1f2] text-[#be123c]" };
    if (a.completedAt) return { text: "Completed", cls: "bg-[#f4fbe4] text-[#4a5230]" };
    return { text: "Active", cls: "bg-[#f1f4ff] text-[#3434ff]" };
  };

  return (
    <div className="min-h-screen bg-[#eef1f6] px-4 pb-20 pt-10 font-['Plus_Jakarta_Sans',sans-serif] text-[#0b0b2c] md:px-7">
      <div className="mx-auto max-w-[900px]">
        <p className="text-[13px] font-extrabold tracking-[0.12em] text-[#8ab815]">ACCOUNT</p>
        <h1 className="mt-3 text-[38px] font-bold leading-tight">Settings</h1>

        <Card tour="profile" title="Profile" description="Your name is printed on your certificates.">
          <div className="flex flex-wrap items-center gap-5">
            <button onClick={() => photoInput.current?.click()} disabled={uploadingPhoto} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[#e2e8f0] bg-[#3434ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3434ff]/25" aria-label="Change profile photo">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">{initials}</span>}
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
                {uploadingPhoto ? <Loader2 size={22} className="animate-spin" /> : <Camera size={22} />}
              </span>
            </button>
            <div>
              <div className="text-sm font-semibold">Profile photo</div>
              <div className="mt-1 text-[13px] text-[#94a3b8]">Shown next to your name in the community.</div>
              <div className="mt-2 flex gap-3 text-[13px] font-semibold">
                <button onClick={() => photoInput.current?.click()} disabled={uploadingPhoto} className="text-[#3434ff] hover:underline">{avatarUrl ? "Change photo" : "Upload photo"}</button>
                {avatarUrl && <button onClick={removePhoto} className="inline-flex items-center gap-1 text-[#94a3b8] hover:text-red-600"><Trash2 size={13} /> Remove</button>}
              </div>
            </div>
            <input ref={photoInput} type="file" accept="image/png,image/jpeg,image/webp,image/heic" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ""; }} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-[13px] font-bold text-[#69697b]">Full name</span><input value={learnerName} onChange={(e) => setLearnerName(e.target.value)} autoComplete="name" className={inputCls} /></label>
            <label className="block"><span className="mb-2 block text-[13px] font-bold text-[#69697b]">Job title</span><input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} autoComplete="organization-title" className={inputCls} /></label>
            <label className="block"><span className="mb-2 block text-[13px] font-bold text-[#69697b]">Company name</span><input value={organisation} onChange={(e) => setOrganisation(e.target.value)} placeholder="Where you work" autoComplete="organization" className={inputCls} /></label>
            <div><span className="mb-2 block text-[13px] font-bold text-[#69697b]">Email</span><div data-private className="break-all rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-3 text-[15px] text-[#69697b]">{user?.email}</div></div>
          </div>
        </Card>

        <Card title="Preferences">
          <Switch on={captionsDefault} onChange={setCaptionsDefault} label="Captions on by default" hint="Turn on subtitles automatically for lesson videos" />
          <div className="my-2 border-t border-[#f1f4f8]" />
          <Switch on={hideFromLeaderboard} onChange={setHideFromLeaderboard} label="Hide me from the leaderboard" hint="Your name won't appear in the public rankings" />
        </Card>

        <button onClick={save} disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#3434ff] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#2a2ad6] disabled:opacity-60">
          {saving && <Loader2 size={16} className="animate-spin" />} Save settings
        </button>

        <Card title="Password" description="Enter your current password, then choose a new one (at least 8 characters).">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Current password", value: currentPw, set: setCurrentPw, auto: "current-password" },
              { label: "New password", value: newPw, set: setNewPw, auto: "new-password" },
              { label: "Confirm new password", value: confirmPw, set: setConfirmPw, auto: "new-password" },
            ].map((f) => (
              <label key={f.label} className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#69697b]">{f.label}</span>
                <input type={showPw ? "text" : "password"} autoComplete={f.auto} value={f.value} onChange={(e) => f.set(e.target.value)} className={inputCls} />
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button onClick={changePassword} disabled={changingPw || !currentPw || !newPw || !confirmPw} className="inline-flex items-center gap-2 rounded-lg bg-[#0b0b2c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#202058] disabled:opacity-40">
              {changingPw && <Loader2 size={15} className="animate-spin" />} Change password
            </button>
            <button onClick={() => setShowPw((s) => !s)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#69697b] hover:text-[#0b0b2c]">{showPw ? <EyeOff size={15} /> : <Eye size={15} />} {showPw ? "Hide" : "Show"} passwords</button>
            <button onClick={sendReset} className="text-[13px] font-semibold text-[#3434ff] hover:underline">Forgot your current password? Email me a reset link</button>
          </div>
        </Card>

        <Card title="My courses & access" description="Every course on your account and how long your access lasts.">
          {access.length === 0 ? (
            <p className="text-sm text-[#69697b]">You're not enrolled in any courses yet.</p>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead><tr className="border-b border-[#eef1f6] text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]"><th className="pb-3 pr-4">Course</th><th className="pb-3 pr-4">Enrolled</th><th className="pb-3 pr-4">Access until</th><th className="pb-3">Status</th></tr></thead>
                <tbody>
                  {access.map((a) => {
                    const st = accessLabel(a);
                    return (
                      <tr key={a.courseId} className="border-b border-[#f5f7fa] last:border-0">
                        <td className="py-3.5 pr-4 font-semibold">{a.title}</td>
                        <td className="py-3.5 pr-4 text-[#69697b] tabular-nums">{fmtDate(a.enrolledAt)}</td>
                        <td className="py-3.5 pr-4 text-[#69697b] tabular-nums">{a.expiresAt ? fmtDate(a.expiresAt) : "No expiry"}</td>
                        <td className="py-3.5"><span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${st.cls}`}>{st.text === "Completed" && <CheckCircle2 size={12} className="mr-1 inline" />}{st.text}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Purchase history" description="Payments made on this account. Receipts are issued by Stripe.">
          {purchases.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-[#69697b]"><Receipt size={16} /> No purchases yet.</p>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead><tr className="border-b border-[#eef1f6] text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]"><th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">Course</th><th className="pb-3 pr-4 text-right">Amount</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Receipt</th></tr></thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id} className="border-b border-[#f5f7fa] last:border-0">
                      <td className="py-3.5 pr-4 text-[#69697b] tabular-nums">{fmtDate(p.purchased_at)}</td>
                      <td className="py-3.5 pr-4 font-semibold">{p.course_title}</td>
                      <td className="py-3.5 pr-4 text-right font-semibold tabular-nums">{formatPrice(p.amount_cents, p.currency)}</td>
                      <td className="py-3.5 pr-4"><span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${p.status === "refunded" ? "bg-[#f1f5f9] text-[#69697b]" : "bg-[#f4fbe4] text-[#4a5230]"}`}>{p.status === "refunded" ? "Refunded" : "Paid"}</span></td>
                      <td className="py-3.5">{p.receipt_url ? <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#3434ff] hover:underline">View <ExternalLink size={13} /></a> : <span className="text-[#94a3b8]">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-[13px] text-[#94a3b8]">Questions about a payment? Email <a href="mailto:hello@safetytech.academy" className="font-semibold text-[#3434ff] hover:underline">hello@safetytech.academy</a>.</p>
        </Card>

        <YourDataCard />
      </div>
    </div>
  );
}

/** GDPR self-service: download everything we hold, or delete the account. */
function YourDataCard() {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [alsoCertificates, setAlsoCertificates] = useState(false);

  const download = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("account-data", { body: { action: "export" } });
      if (error || !data || data.error) throw new Error(data?.error || "export failed");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `safetytech-academy-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Your data has been downloaded");
    } catch {
      toast.error("Couldn't prepare your data. Try again, or email hello@safetytech.academy.");
    } finally {
      setExporting(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("account-data", {
        body: { action: "delete", confirm: typed, deleteCertificates: alsoCertificates },
      });
      if (error || !data?.ok) throw new Error(data?.error || "Couldn't delete your account.");
      await supabase.auth.signOut();
      window.location.assign("/learn/auth?deleted=1");
    } catch (e) {
      toast.error((e as Error).message || "Couldn't delete your account.");
      setDeleting(false);
    }
  };

  return (
    <Card title="Your data" description="Download a copy of everything we hold about you, or delete your account.">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={download} disabled={exporting} className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0b0b2c] transition hover:bg-[#f8fafc] disabled:opacity-60">
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download my data
        </button>
        {!confirmOpen && (
          <button type="button" onClick={() => setConfirmOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#fecaca] bg-white px-4 py-2.5 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#fef2f2]">
            <Trash2 size={16} /> Delete my account
          </button>
        )}
      </div>

      {confirmOpen && (
        <div className="mt-5 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-5">
          <p className="text-[15px] font-bold text-[#7f1d1d]">Delete your account permanently?</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#7f1d1d]/80">
            This removes your profile, course access, progress, quiz results and community posts. It can't be undone,
            and paid courses won't be refunded. Your certificates stay verifiable unless you tick the box below.
          </p>
          <label className="mt-4 flex items-start gap-2.5 text-[13px] text-[#7f1d1d]">
            <input type="checkbox" checked={alsoCertificates} onChange={(e) => setAlsoCertificates(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#b91c1c]" />
            <span>Also delete my certificates. Their verification links (for example on LinkedIn) will stop working.</span>
          </label>
          <label className="mt-4 block text-[13px] font-bold text-[#7f1d1d]" htmlFor="confirm-delete">Type DELETE to confirm</label>
          <input id="confirm-delete" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className={`${inputCls} mt-1.5 max-w-xs`} />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={remove} disabled={typed !== "DELETE" || deleting} className="inline-flex items-center gap-2 rounded-lg bg-[#b91c1c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#991b1b] disabled:opacity-50">
              {deleting && <Loader2 size={16} className="animate-spin" />} Permanently delete my account
            </button>
            <button type="button" onClick={() => { setConfirmOpen(false); setTyped(""); setAlsoCertificates(false); }} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#69697b] hover:bg-white">
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
