import { useState } from "react";
import { Download } from "lucide-react";
import bookCover from "@/assets/book-cover-safety-4-leader.png";
import { MarketingConsent } from "@/components/MarketingConsent";
import { trackEvent } from "@/utils/analytics";

const PDF = "/Safety-4.0-Leader-eBook.pdf";

// Home-page free guide: name + email on the page itself, then the download, no extra step.
export const EbookDownloadSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

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
          inquiry_type: "Home page guide",
          marketing_consent: consent,
        }),
      });
      if (res.status === 429) { setError("Too many tries. Please wait a minute and try again."); return; }
      if (!res.ok) throw new Error(String(res.status));
      setDone(true);
      trackEvent("home_ebook_submitted", { consent });
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="free-guide" className="bg-[#F5F7FF] py-12 md:py-16" aria-labelledby="free-guide-heading">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 sm:px-6 md:grid-cols-[minmax(0,280px)_1fr] md:gap-14 lg:px-8">
        <img
          src={bookCover}
          alt="Become the Safety 4.0 Leader, free guide by Lucas Domingues"
          loading="lazy"
          decoding="async"
          className="mx-auto w-40 rounded-lg shadow-2xl sm:w-48 md:w-full md:max-w-[280px]"
        />

        <div className="max-w-xl">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-primary">Free guide</span>
          <h2 id="free-guide-heading" className="mb-3">Become the Safety 4.0 Leader</h2>
          <p className="mb-6 text-lg text-[#69697b]">
            A short read (under 30 pages) by Lucas Domingues, with stories, case studies and research on leading safety with AI and digital tools.
          </p>

          {done ? (
            <div className="space-y-3" role="status">
              <p className="font-medium text-slate-900">Thanks, {name.trim().split(" ")[0]}. Your guide is ready.</p>
              <a
                href={PDF}
                download="Safety-4.0-Leader-eBook.pdf"
                onClick={() => trackEvent("home_ebook_download")}
                className="inline-flex items-center justify-center gap-2 rounded bg-primary px-8 py-4 text-sm font-medium uppercase tracking-[0.08em] text-white hover:bg-primary/90"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Download the guide (PDF)
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  First name
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Work email
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </label>
              </div>
              <MarketingConsent id="home-guide-consent" checked={consent} onChange={setConsent} />
              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
              <button type="submit" disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-8 py-4 text-sm font-medium uppercase tracking-[0.08em] text-white hover:bg-primary/90 disabled:opacity-60 sm:w-auto">
                <Download className="h-4 w-4" aria-hidden="true" />
                {sending ? "Sending…" : "Get the free guide"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
