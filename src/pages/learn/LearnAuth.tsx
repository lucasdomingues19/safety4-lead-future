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

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/learn`,
        },
      });
      if (error) {
        toast.error("Google sign-in failed. Please try again.");
        setLoading(false);
      }
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      setLoading(false);
    }
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
          toast.success("Account created! You're all set.");
          navigate("/learn");
        } else {
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

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            border: "1px solid #E2E8F0",
            background: "#fff",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0B0B2C",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = "#F8FAFC";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 4.75 12 4.75Z" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ margin: "28px 0", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }}></div>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }}></div>
        </div>

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
