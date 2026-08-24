import { useState } from "react";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const CopilotWaitlistForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please add your name and email.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            source: "contact_form",
            inquiry_type: "Copilot Waitlist",
            role: company.trim() || null,
            message: "Joined the waitlist for Microsoft Copilot for EHS & Sustainability (launching October 2026).",
          }),
        },
      );
      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many submissions. Please try again in a minute.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[20px] border border-primary bg-primary/5 p-8 text-center max-w-xl mx-auto">
        <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">You're on the list</h3>
        <p className="text-sm text-[#69697b]">
          We'll be in touch with early access and pricing ahead of the October 2026 launch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[20px] border border-slate-200 bg-white p-6 md:p-8 max-w-xl mx-auto">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="wl-name" className="text-sm font-medium text-slate-700 mb-1.5 block">
            Name *
          </label>
          <input
            id="wl-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-primary"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label htmlFor="wl-company" className="text-sm font-medium text-slate-700 mb-1.5 block">
            Company
          </label>
          <input
            id="wl-company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-primary"
            placeholder="Your organisation"
          />
        </div>
      </div>
      <div className="mb-5">
        <label htmlFor="wl-email" className="text-sm font-medium text-slate-700 mb-1.5 block">
          Work email *
        </label>
        <input
          id="wl-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-primary"
          placeholder="jane@company.com"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-[18px] bg-primary text-white font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        {submitting ? "Joining..." : "Join the Waitlist"}
      </button>
      <p className="text-xs text-slate-400 text-center mt-3">
        No spam. We'll only email you about this program's launch.
      </p>
    </form>
  );
};

export default CopilotWaitlistForm;
