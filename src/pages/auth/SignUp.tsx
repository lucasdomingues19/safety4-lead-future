import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const SignUp = () => {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 4);
  };

  const handlePasswordChange = (password: string) => {
    setFormData((prev) => ({ ...prev, password }));
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Valid email is required";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setStep("verify");
      setIsLoading(false);
    }, 1500);
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
          {step === "form" ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create Account</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        errors.fullName ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                      } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Lucas Domingues"
                      required
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        errors.email ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                      } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                        errors.password ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                      } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
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

                  {/* Password Strength */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${(passwordStrength / 4) * 100}%`,
                            background:
                              passwordStrength === 1
                                ? "#ef4444"
                                : passwordStrength === 2
                                ? "#f59e0b"
                                : passwordStrength === 3
                                ? "#eab308"
                                : "#16a34a",
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {passwordStrength === 1
                          ? "Weak password"
                          : passwordStrength === 2
                          ? "Fair password"
                          : passwordStrength === 3
                          ? "Good password"
                          : "Strong password"}
                      </p>
                    </div>
                  )}
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                        errors.confirmPassword ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                      } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 rounded mt-0.5"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.terms && <p className="text-red-600 text-sm">{errors.terms}</p>}

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
                  style={{ background: "#3434FF" }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.opacity = "1")}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              {/* Sign In Link */}
              <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
                Already have an account?{" "}
                <a href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
                  Sign in
                </a>
              </p>
            </>
          ) : (
            /* Email Verification Step */
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify Your Email</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  We've sent a verification email to <strong>{formData.email}</strong>
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  Click the link in the email to verify your account and get started learning.
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                    resend it
                  </button>
                </p>
              </div>

              <button
                onClick={() => window.location.href = "/phase2"}
                className="w-full py-3 rounded-lg font-bold text-white transition-all"
                style={{ background: "#3434FF" }}
              >
                Go to Learning Platform
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
