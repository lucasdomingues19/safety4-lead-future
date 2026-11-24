import { useState } from "react";
import { trackEvent } from "@/utils/analytics";

// Newsletter sign-up for blue CTA bands. Saves the lead and, because subscribing is the
// whole point of this form, adds the person to Kit (they can unsubscribe from any email).
export const NewsletterSignup = ({ placement }: { placement: string }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
          source: "newsletter_popup",
          inquiry_type: `Newsletter sign-up (${placement})`,
          marketing_consent: true,
        }),
      });
      if (res.status === 429) { setError("Too many tries. Please wait a minute and try again."); return; }
      if (!res.ok) throw new Error(String(res.status));
      setDone(true);
      trackEvent("newsletter_signup", { placement });
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return <p className="mx-auto max-w-md rounded-[8px] bg-white/15 px-4 py-3 font-medium text-white" role="status">You're subscribed. Thanks, {name.trim().split(" ")[0]}!</p>;
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl" noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor={`nl-name-${placement}`}>First name</label>
        <input id={`nl-name-${placement}`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="First name"
          className="rounded-[8px] px-4 py-3 text-[#0b0b2c] placeholder-[#69697b] sm:w-40" />
        <label className="sr-only" htmlFor={`nl-email-${placement}`}>Work email</label>
        <input id={`nl-email-${placement}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="Work email"
          className="flex-1 rounded-[8px] px-4 py-3 text-[#0b0b2c] placeholder-[#69697b]" />
        <button type="submit" disabled={sending}
          className="rounded-[8px] bg-white px-6 py-3 font-semibold text-primary transition-colors duration-300 hover:bg-gray-50 disabled:opacity-60">
          {sending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-white" role="alert">{error}</p>}
      <p className="mt-3 text-xs text-white/70">Event invitations and practical AI-in-EHS tips. Unsubscribe at any time.</p>
    </form>
  );
};
