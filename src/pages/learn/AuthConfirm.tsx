import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import brandMarkBlue from "@/assets/brand-mark-blue.png";

// Landing page for the links in our account emails (confirm email, set or reset
// password, sign-in link, invitation). The email links to OUR domain, and the
// one-time token is only used when the person presses the button here. Email
// security scanners open links automatically but don't press buttons, so they
// can no longer use up a learner's single-use link. Supabase's own verify URL
// (a different domain) is no longer in the email at all.

const TYPES = ["signup", "invite", "magiclink", "recovery", "email_change", "email"] as const;
type OtpType = (typeof TYPES)[number];

const COPY: Record<OtpType, { title: string; text: string; button: string }> = {
  recovery: { title: "Set your password", text: "Press the button to continue and choose your password.", button: "Continue" },
  invite: { title: "Accept your invitation", text: "Press the button to join SafetyTech Academy.", button: "Accept invitation" },
  signup: { title: "Confirm your email", text: "Press the button to confirm your email address and sign in.", button: "Confirm my email" },
  magiclink: { title: "Sign in", text: "Press the button to sign in to SafetyTech Academy.", button: "Sign in" },
  email: { title: "Sign in", text: "Press the button to sign in to SafetyTech Academy.", button: "Sign in" },
  email_change: { title: "Confirm your new email", text: "Press the button to confirm the change.", button: "Confirm change" },
};

export default function AuthConfirm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tokenHash = params.get("token_hash") ?? "";
  const rawType = params.get("type") ?? "";
  const type = (TYPES as readonly string[]).includes(rawType) ? (rawType as OtpType) : null;
  // Only ever continue inside the learning platform.
  const nextRaw = params.get("next") ?? "/learn";
  const next = nextRaw.startsWith("/learn") && !nextRaw.startsWith("//") ? nextRaw : "/learn";

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    if (!type || !tokenHash) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      setBusy(false);
      setError(/expired|invalid/i.test(error.message)
        ? "This link has expired or has already been used. You can get a new one with “Forgot password?” on the sign-in page."
        : error.message);
      return;
    }
    navigate(next, { replace: true });
  };

  const c = type ? COPY[type] : null;
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EEF1F6", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0", padding: 36, boxShadow: "0 18px 40px rgba(11,11,44,0.08)", textAlign: "center" }}>
        <img src={brandMarkBlue} alt="SafetyTech Academy" style={{ height: 34, margin: "0 auto 18px" }} />
        {c && tokenHash ? (
          <>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0B0B2C" }}>{c.title}</h1>
            <p style={{ margin: "10px 0 22px", fontSize: 15, lineHeight: 1.6, color: "#69697B" }}>{c.text}</p>
            <button type="button" onClick={go} disabled={busy}
              style={{ width: "100%", padding: 14, border: 0, borderRadius: 10, background: "#3434FF", color: "#fff", fontWeight: 700, fontSize: 15, cursor: busy ? "wait" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {busy && <Loader2 size={16} className="animate-spin" />} {c.button}
            </button>
            {error && <p role="alert" style={{ margin: "16px 0 0", fontSize: 14, lineHeight: 1.55, color: "#B91C1C" }}>{error}</p>}
          </>
        ) : (
          <>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0B0B2C" }}>This link isn't complete</h1>
            <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.6, color: "#69697B" }}>Open the link from your email again, or ask for a new one on the sign-in page.</p>
          </>
        )}
        <p style={{ margin: "22px 0 0", fontSize: 13 }}><Link to="/learn/auth" style={{ color: "#3434FF", fontWeight: 600 }}>Back to sign in</Link></p>
      </div>
    </div>
  );
}
