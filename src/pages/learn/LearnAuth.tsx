import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

const LearnAuth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/learn");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") navigate("/learn");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleForgot = async () => {
    if (!email) {
      toast.error("Enter your email address first, then click 'Forgot password?'");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/learn/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("If an account exists for that email, a reset link is on its way.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (mode === "signup" && !fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/learn`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          // Track conversion event
          if (window.oaiq) {
            window.oaiq("measure", "registration_completed", { type: "customer_action" });
          }
          toast.success("Account created! You're all set.");
          navigate("/learn");
        } else {
          // In development, auto-confirm email and auto-sign in
          if (import.meta.env.DEV) {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (!signInError) {
              // Track conversion event
              if (window.oaiq) {
                window.oaiq("measure", "registration_completed", { type: "customer_action" });
              }
              toast.success("Account created! Signed in automatically.");
              navigate("/learn");
              return;
            }
          }
          // Track conversion event
          if (window.oaiq) {
            window.oaiq("measure", "registration_completed", { type: "customer_action" });
          }
          toast.success("Account created! Check your email to confirm, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/learn");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#EEF1F6",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: "16px",
    }}>
      {/* Gradient Background */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(circle at 80% 20%, rgba(52, 52, 255, 0.1) 0%, transparent 50%)",
        pointerEvents: "none",
      }}></div>

      {/* Card */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "420px",
        background: "#fff",
        borderRadius: "24px",
        border: "1px solid #E2E8F0",
        padding: "48px 36px",
        boxShadow: "0 18px 40px rgba(11, 11, 44, 0.12)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <img
            src="assets/brand-mark-blue.png"
            alt="SafetyTech Academy"
            style={{ height: "48px", width: "auto", marginBottom: "20px", marginLeft: "auto", marginRight: "auto" }}
          />
          <h1 style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#0B0B2C",
            margin: "0 0 12px",
            letterSpacing: "-0.01em",
          }}>
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{
            fontSize: "15px",
            color: "#69697B",
            margin: 0,
            lineHeight: 1.6,
          }}>
            {mode === "signin"
              ? "Sign in to access your learning dashboard"
              : "Join the SafetyTech Academy community"}
          </p>
        </div>

        <div style={{ height: "8px" }}></div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "signup" && (
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0B0B2C",
                marginBottom: "8px",
              }}>
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  color: "#0B0B2C",
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3434FF";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52, 52, 255, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          )}

          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#0B0B2C",
              marginBottom: "8px",
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "inherit",
                color: "#0B0B2C",
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3434FF";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52, 52, 255, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#0B0B2C",
              marginBottom: "8px",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "inherit",
                color: "#0B0B2C",
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3434FF";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52, 52, 255, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {mode === "signin" && (
              <div style={{ marginTop: "8px", textAlign: "right" }}>
                <button type="button" onClick={handleForgot} disabled={loading} style={{ background: "none", border: 0, padding: 0, color: "#3434FF", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "14px 16px",
              background: "#3434FF",
              color: "#fff",
              border: "0",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1,
              transition: "background 0.2s",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#2A2AD6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#3434FF";
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* Toggle */}
        <p style={{
          textAlign: "center",
          fontSize: "14px",
          color: "#69697B",
          marginTop: "24px",
          margin: "24px 0 0",
        }}>
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            style={{
              background: "none",
              border: "none",
              color: "#3434FF",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              fontFamily: "inherit",
              fontSize: "inherit",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#2A2AD6")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3434FF")}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
};

export default LearnAuth;
