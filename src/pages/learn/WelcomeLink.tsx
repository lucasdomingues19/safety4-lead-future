import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import brandMarkBlue from "@/assets/brand-mark-blue.png";

// Landing page for the "set your password" button in welcome and reminder emails. The email carries a
// long-lived token (14 days). Pressing the button swaps it for a fresh one-time sign-in and carries on
// to choose a password. Email security scanners open links but don't press buttons, so they can't use it up.

export default function WelcomeLink() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("t") ?? "";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    setBusy(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("welcome-link", { body: { token } });
    const tokenHash = (data as { token_hash?: string } | null)?.token_hash;
    if (fnError || !tokenHash) {
      setBusy(false);
      setError("This link has expired. Go to the sign-in page, choose “Forgot password?” and enter your email address, and we'll send you a new one straight away.");
      return;
    }
    const { error: otpError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (otpError) {
      setBusy(false);
      setError("We couldn't sign you in from this link. Please try again, or use “Forgot password?” on the sign-in page.");
      return;
    }
    navigate("/learn/reset-password?welcome=1", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EEF1F6", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0", padding: 36, boxShadow: "0 18px 40px rgba(11,11,44,0.08)", textAlign: "center" }}>
        <img src={brandMarkBlue} alt="SafetyTech Academy" style={{ height: 34, margin: "0 auto 18px" }} />
        {token ? (
          <>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0B0B2C" }}>Set your password</h1>
            <p style={{ margin: "10px 0 22px", fontSize: 15, lineHeight: 1.6, color: "#69697B" }}>Press the button to choose your password and get into SafetyTech Academy.</p>
            <button type="button" onClick={go} disabled={busy}
              style={{ width: "100%", padding: 14, border: 0, borderRadius: 10, background: "#3434FF", color: "#fff", fontWeight: 700, fontSize: 15, cursor: busy ? "wait" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {busy && <Loader2 size={16} className="animate-spin" />} Set my password
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
