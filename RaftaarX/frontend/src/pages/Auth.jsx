import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bike,
  KeyRound,
  LockKeyhole,
  Mail,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

const roles = [
  { label: "User", value: "user", icon: UserRound },
  { label: "Partner", value: "partner", icon: Bike },
  { label: "Admin", value: "admin", icon: ShieldCheck },
];

function Auth() {
  const navigate = useNavigate();
  const { login, signup, setAuthSession } = useAuth();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminKey: "",
    otp: "",
  });
  const [otpChallenge, setOtpChallenge] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");


  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const resetOtpChallenge = () => {
    setOtpChallenge(null);
    setNotice("");
    setResendCooldown(0);
    setResendingOtp(false);
    setFormData((previous) => ({
      ...previous,
      otp: "",
    }));
  };

  const handleResendOtp = async () => {
    if (!otpChallenge) return;
    setResendingOtp(true);
    setError("");
    setNotice("");
    try {
      const res = await api.post("/auth/resend-otp", {
        verificationId: otpChallenge.verificationId,
      });
      setNotice(res.message || "New OTP code has been sent!");
      setResendCooldown(30);
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendingOtp(false);
    }
  };


  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError("");
    resetOtpChallenge();
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setError("");
    resetOtpChallenge();
  };

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      if (otpChallenge) {
        const authResponse = await api.post("/auth/verify-otp", {
          verificationId: otpChallenge.verificationId,
          otp: formData.otp.trim(),
        });

        setAuthSession(authResponse);
        navigate(`/${authResponse.user.role}`);
        return;
      }

      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Password and confirm password must match.");
        }

        if (formData.password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }
      }

      const payload =
        mode === "signup"
          ? {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role,
              adminKey: formData.adminKey,
            }
          : {
              email: formData.email,
              password: formData.password,
            };

      const authResponse =
        mode === "signup" ? await signup(payload) : await login(payload);

      if (authResponse.requiresOtp) {
        setOtpChallenge({
          verificationId: authResponse.verificationId,
          email: authResponse.email,
        });
        setNotice(authResponse.message);
        setResendCooldown(30);

        return;
      }

      navigate(`/${authResponse.user.role}`);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="theme-page overflow-x-hidden px-4 py-24 sm:px-6 sm:py-28 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-card rounded-[32px] p-5 backdrop-blur sm:p-8"
        >
          <p className="theme-accent text-sm uppercase tracking-[0.35em]">
            Fast Access
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl md:text-6xl">
            Log in or sign up to access your dashboard.
          </h1>
          <p className="theme-text-muted mt-6 max-w-2xl text-base sm:text-lg">
            Select your role to proceed. After successful authentication, you will be
            redirected to your dashboard (user, partner, or admin panel).
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {roles.map(({ label, value, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRoleChange(value)}
                disabled={Boolean(otpChallenge)}
                className={`rounded-2xl border p-5 text-left transition ${
                  role === value
                    ? "theme-chip"
                    : "theme-card-soft hover:border-yellow-500/40"
                }`}
              >
                {React.createElement(icon, {
                  className: "theme-accent mb-4 h-8 w-8",
                })}
                <p className="text-xl font-bold">{label}</p>
                <p className="theme-text-muted mt-2 text-sm">
                  {value === "user" && "Ride booking and payment flow"}
                  {value === "partner" && "Document upload and approval tracking"}
                  {value === "admin" && "Protected admin review dashboard"}
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="theme-card rounded-[32px] p-5 sm:p-8"
        >
          <div className="theme-card-soft flex gap-2 rounded-full p-2 sm:gap-3">
            {["login", "signup"].map((currentMode) => (
              <button
                key={currentMode}
                type="button"
                onClick={() => handleModeChange(currentMode)}
                disabled={Boolean(otpChallenge)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize transition ${
                  mode === currentMode
                    ? "theme-primary-button"
                    : "theme-text-muted"
                }`}
              >
                {currentMode}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-200">
              You will be redirected to the dashboard corresponding to your account's role.
              Admin accounts require password and email OTP verification.
            </div>
          ) : null}

          <div className="mt-8 space-y-5">
            {mode === "signup" && (
              <label className="block">
                <span className="theme-text-muted mb-2 block text-sm">Full name</span>
                <div className={`theme-card-soft flex items-center gap-3 rounded-2xl px-4 py-3 ${otpChallenge ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <UserRound className="theme-accent h-5 w-5" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Mayank Kumar"
                    className="w-full bg-transparent outline-none placeholder:text-[var(--app-text-soft)] disabled:cursor-not-allowed"
                    required
                    disabled={Boolean(otpChallenge)}
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="theme-text-muted mb-2 block text-sm">Email</span>
              <div className={`theme-card-soft flex items-center gap-3 rounded-2xl px-4 py-3 ${otpChallenge ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Mail className="theme-accent h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none placeholder:text-[var(--app-text-soft)] disabled:cursor-not-allowed"
                  required
                  disabled={Boolean(otpChallenge)}
                />
              </div>
            </label>

            <label className="block">
              <span className="theme-text-muted mb-2 block text-sm">Password</span>
              <div className={`theme-card-soft flex items-center gap-3 rounded-2xl px-4 py-3 ${otpChallenge ? "opacity-50 cursor-not-allowed" : ""}`}>
                <LockKeyhole className="theme-accent h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full bg-transparent outline-none placeholder:text-[var(--app-text-soft)] disabled:cursor-not-allowed"
                  required
                  disabled={Boolean(otpChallenge)}
                />
                {!otpChallenge && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="theme-text-soft hover:text-[var(--app-text)] transition ml-2"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                )}
              </div>
            </label>

            {mode === "signup" && (
              <label className="block">
                <span className="theme-text-muted mb-2 block text-sm">
                  Confirm password
                </span>
                <div className={`theme-card-soft flex items-center gap-3 rounded-2xl px-4 py-3 ${otpChallenge ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <LockKeyhole className="theme-accent h-5 w-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full bg-transparent outline-none placeholder:text-[var(--app-text-soft)] disabled:cursor-not-allowed"
                    required
                    disabled={Boolean(otpChallenge)}
                  />
                  {!otpChallenge && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="theme-text-soft hover:text-[var(--app-text)] transition ml-2"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </label>
            )}

            {mode === "signup" && role === "admin" && (
              <label className="block">
                <span className="theme-text-muted mb-2 block text-sm">Admin key</span>
                <div className={`theme-card-soft flex items-center gap-3 rounded-2xl px-4 py-3 ${otpChallenge ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <KeyRound className="theme-accent h-5 w-5" />
                  <input
                    type="password"
                    name="adminKey"
                    value={formData.adminKey}
                    onChange={handleChange}
                    placeholder="Enter admin signup key"
                    className="w-full bg-transparent outline-none placeholder:text-[var(--app-text-soft)] disabled:cursor-not-allowed"
                    required
                    disabled={Boolean(otpChallenge)}
                  />
                </div>
              </label>
            )}

            {otpChallenge && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                      OTP sent to {otpChallenge.email}
                    </p>
                    <p className="theme-text-muted mt-1 text-sm">
                      Enter the 6-digit code to complete verification.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetOtpChallenge}
                    className="theme-text-muted text-sm font-semibold hover:text-[var(--app-text)]"
                  >
                    Change
                  </button>
                </div>
                <label className="mt-4 block">
                  <span className="theme-text-muted mb-2 block text-sm">OTP code</span>
                  <div className="theme-card-soft flex items-center gap-3 rounded-2xl px-4 py-3">
                    <MessageSquareText className="theme-accent h-5 w-5" />
                    <input
                      inputMode="numeric"
                      maxLength={6}
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="123456"
                      className="w-full bg-transparent tracking-[0.35em] outline-none placeholder:tracking-normal placeholder:text-[var(--app-text-soft)]"
                      required
                    />
                  </div>
                </label>
                <div className="mt-3 flex justify-between items-center px-1">
                  <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                    Didn't receive code?
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendingOtp || resendCooldown > 0}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingOtp
                      ? "Resending..."
                      : resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {notice && (
            <p className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
              {notice}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="theme-primary-button mt-8 w-full rounded-2xl px-6 py-4 font-bold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting
              ? "Please wait..."
              : otpChallenge
              ? "Verify OTP"
              : mode === "signup"
              ? "Create account"
              : "Login now"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

export default Auth;
