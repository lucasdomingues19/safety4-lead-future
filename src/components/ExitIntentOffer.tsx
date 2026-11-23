import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import bookCover from "@/assets/book-cover-safety-4-leader.png";
import { MarketingConsent } from "@/components/MarketingConsent";
import { claimPopupSlot, popupAlreadyShown, releasePopupSlot } from "@/lib/popupManager";
import { trackEvent } from "@/utils/analytics";

// Desktop exit intent: when the pointer leaves through the top of the window (towards
// the tab bar / close button) and no other popup has shown this visit, offer the free
// guide once. Remembered for 30 days so returning visitors aren't asked again.
const SNOOZE_KEY = "exit_guide_snoozed_until";
const SNOOZE_DAYS = 30;
const MIN_MS_ON_PAGE = 4000;

const snoozed = () => {
  try { return Number(localStorage.getItem(SNOOZE_KEY) || 0) > Date.now(); } catch { return false; }
};
const snooze = () => {
  try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86400000)); } catch { /* private mode */ }
};

const ExitIntentOffer = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (snoozed() || !window.matchMedia("(pointer: fine) and (min-width: 768px)").matches) return;
    const since = Date.now();
    const onOut = (e: MouseEvent) => {
      if (e.relatedTarget || e.clientY > 8) return;
      if (Date.now() - since < MIN_MS_ON_PAGE || popupAlreadyShown() || snoozed()) return;
      if (!claimPopupSlot("exit_guide")) return;
      snooze();
      setOpen(true);
      trackEvent("exit_guide_shown");
    };
    document.addEventListener("mouseout", onOut);
    return () => document.removeEventListener("mouseout", onOut);
  }, []);

  useEffect(() => {
    if (!open) return;
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    releasePopupSlot("exit_guide");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please add your first name and a valid email address.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          source: "ebook_download",
          inquiry_type: "Exit pop-up",
          marketing_consent: consent,
        }),
      });
      if (res.status === 429) { setError("Too many tries. Please wait a minute and try again."); return; }
      if (!res.ok) throw new Error(String(res.status));
      setDone(true);
      trackEvent("exit_guide_submitted", { consent });
    } catch {
      setError("Something went wrong. Please try again, or get the guide from the eBook page.");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-guide-title"
        className="relative w-full max-w-[640px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="grid sm:grid-cols-[200px_1fr]">
          <div className="hidden sm:flex items-center justify-center bg-primary p-6">
            <img src={bookCover} alt="" className="w-full max-w-[150px] rounded-lg shadow-xl" />
          </div>
          <div className="p-6 md:p-8">
            {done ? (
              <div className="space-y-4">
                <h2 id="exit-guide-title" className="text-2xl font-bold text-slate-900">Your guide is ready</h2>
                <p className="text-sm text-[#69697b]">Thanks, {name.trim().split(" ")[0]}. Download it below.</p>
                <a
                  href="/Safety-4.0-Leader-eBook.pdf"
                  download="Safety-4.0-Leader-eBook.pdf"
                  onClick={() => trackEvent("exit_guide_download")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-4 text-sm font-medium uppercase tracking-[0.08em] text-white hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" /> Download the guide
                </a>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4" noValidate>
                <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-primary">Before you go</span>
                <h2 id="exit-guide-title" className="text-2xl font-bold leading-tight text-slate-900">Take the free Safety 4.0 Leader guide with you</h2>
                <p className="text-sm text-[#69697b]">A short read for EHS professionals starting with AI and SafetyTech, by Lucas Domingues.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    First name
                    <input ref={firstField} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Work email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </label>
                </div>
                <MarketingConsent id="exit-guide-consent" checked={consent} onChange={setConsent} />
                {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
                <button type="submit" disabled={sending}
                  className="w-full rounded bg-primary px-6 py-4 text-sm font-medium uppercase tracking-[0.08em] text-white hover:bg-primary/90 disabled:opacity-60">
                  {sending ? "Sending…" : "Get the free guide"}
                </button>
                <button type="button" onClick={close} className="w-full text-center text-xs text-slate-500 hover:text-slate-700">No thanks</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentOffer;
