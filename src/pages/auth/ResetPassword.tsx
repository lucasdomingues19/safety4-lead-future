import { useState } from "react";
import { Mail, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [step, setStep] = useState<"request" | "verify" | "reset" | "success">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return Math.min(strength, 4);
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setStep("verify");
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setStep("reset");
      setIsLoading(false);
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setStep("success");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ background: "#3434FF" }}>
            <span className="text-white font-bold">ST</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">SafetyTech</h1>
          <p className="text-slate-600 dark:text-slate-400">Learning Platform</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-lg">
          {step === "request" && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Forgot Password?</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Enter your email and we'll send you a code to reset your password.
              </p>

              <form onSubmit={handleRequestReset} className="space-y-4">
                {error && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-bold text-white transition-all"
                  style={{ background: "#3434FF" }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.opacity = "1")}
                >
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>

              <a href="/auth/login" className="flex items-center justify-center gap-2 mt-6 text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </a>
            </>
          )}

          {step === "verify" && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify Code</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                {error && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.slice(0, 6))}
                    maxLength={6}
                    placeholder="000000"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-bold text-white transition-all"
                  style={{ background: "#3434FF" }}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>
              </form>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
                Didn't receive the code?{" "}
                <button className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  Resend
                </button>
              </p>
            </>
          )}

          {step === "reset" && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create New Password</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Enter a new password for your account.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${(passwordStrength / 4) * 100}%`,
                            background: passwordStrength === 1 ? "#ef4444" : passwordStrength === 2 ? "#f59e0b" : passwordStrength === 3 ? "#eab308" : "#16a34a",
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {passwordStrength === 1 ? "Weak" : passwordStrength === 2 ? "Fair" : passwordStrength === 3 ? "Good" : "Strong"}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-bold text-white transition-all"
                  style={{ background: "#3434FF" }}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Reset</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Your password has been successfully reset.
                </p>
              </div>

              <a
                href="/auth/login"
                className="inline-block w-full py-3 rounded-lg font-bold text-white transition-all text-center"
                style={{ background: "#3434FF" }}
              >
                Back to Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
