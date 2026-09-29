import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", color: "#0B0B2C", boxSizing: "border-box" };

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // The reset link signs the user in with a recovery session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated — you're signed in.");
    navigate("/learn", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EEF1F6", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "#fff", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "36px", boxShadow: "0 18px 40px rgba(11,11,44,0.08)" }}>
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#0B0B2C" }}>Set a new password</h1>
        {!ready ? (
          <div style={{ marginTop: 16, fontSize: 14, color: "#69697B" }}>
            <p>Open this page from the reset link in your email. If the link has expired, request a new one.</p>
            <Link to="/learn/auth" style={{ color: "#3434FF", fontWeight: 600 }}>Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={save} style={{ marginTop: 20, display: "grid", gap: 14 }}>
            <input type="password" autoComplete="new-password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            <input type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
            <button type="submit" disabled={saving} style={{ marginTop: 4, padding: "13px", border: 0, borderRadius: "10px", background: "#3434FF", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              {saving && <Loader2 size={16} className="animate-spin" />} Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
