import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bike, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";
import { api } from "../lib/api.js";

const roles = [
  { label: "User", value: "user", icon: UserRound },
  { label: "Partner", value: "partner", icon: Bike },
  { label: "Admin", value: "admin", icon: ShieldCheck },
];

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Auth() {
  const navigate = useNavigate();
  const { login, signup, setAuthSession } = useAuth();
  const googleButtonRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const googleAuthStateRef = useRef({
    role: "user",
    navigate,
    setAuthSession,
  });
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminKey: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    googleAuthStateRef.current = {
      role,
      navigate,
      setAuthSession,
    };
  }, [navigate, role, setAuthSession]);

  useEffect(() => {
    if (!googleClientId) {
      return undefined;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || googleInitializedRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          const currentRole = googleAuthStateRef.current.role;

          try {
            setGoogleLoading(true);
            setError("");
            const authResponse = await api.post("/auth/google", {
              credential: response.credential,
              role: currentRole,
            });
            googleAuthStateRef.current.setAuthSession(authResponse);
            googleAuthStateRef.current.navigate(`/${authResponse.user.role}`);
          } catch (googleError) {
            setError(googleError.message);
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      googleInitializedRef.current = true;
    };

    const existingScript = document.querySelector(
      'script[data-google-identity="true"]'
    );

    if (existingScript) {
      initializeGoogle();
      return undefined;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return undefined;
  }, []);

  useEffect(() => {
    if (
      !googleClientId ||
      role === "admin" ||
      !googleButtonRef.current ||
      !window.google?.accounts?.id ||
      !googleInitializedRef.current
    ) {
      return;
    }

    googleButtonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: mode === "signup" ? "signup_with" : "signin_with",
    });
  }, [mode, role]);

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

    try {
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Password and confirm password must match.");
        }

        if (formData.password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        adminKey: formData.adminKey,
      };

      const authUser =
        mode === "signup" ? await signup(payload) : await login(payload);
      navigate(`/${authUser.role}`);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.18),_transparent_35%),linear-gradient(135deg,#050505,#111827,#000000)] px-6 py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-yellow-500/20 bg-white/5 p-8 backdrop-blur"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
            Fast Access
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Login ya signup karke seedha apne dashboard tak pahunchiye.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-300">
            Book Now ke baad yahin role choose kijiye. Successful auth ke baad app
            direct user, partner, ya admin panel open karega. Admin signup security
            key ke saath protected hai, aur user/partner roles me Google sign-in
            available hai.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {roles.map(({ label, value, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`rounded-2xl border p-5 text-left transition ${
                  role === value
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-white/10 bg-black/20 hover:border-yellow-500/40"
                }`}
              >
                {React.createElement(icon, {
                  className: "mb-4 h-8 w-8 text-yellow-400",
                })}
                <p className="text-xl font-bold">{label}</p>
                <p className="mt-2 text-sm text-gray-300">
                  {value === "user" && "Ride booking aur payment flow"}
                  {value === "partner" && "Document upload aur approval tracking"}
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
          className="rounded-[32px] border border-white/10 bg-gray-950/80 p-8 shadow-2xl"
        >
          <div className="flex gap-3 rounded-full bg-white/5 p-2">
            {["login", "signup"].map((currentMode) => (
              <button
                key={currentMode}
                type="button"
                onClick={() => setMode(currentMode)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize transition ${
                  mode === currentMode
                    ? "bg-yellow-400 text-black"
                    : "text-gray-300"
                }`}
              >
                {currentMode}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-5">
            {mode === "signup" && (
              <label className="block">
                <span className="mb-2 block text-sm text-gray-300">Full name</span>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <UserRound className="h-5 w-5 text-yellow-400" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Mayank Kumar"
                    className="w-full bg-transparent outline-none"
                    required
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Email</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Mail className="h-5 w-5 text-yellow-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <LockKeyhole className="h-5 w-5 text-yellow-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full bg-transparent outline-none"
                  required
                />
              </div>
            </label>

            {mode === "signup" && (
              <label className="block">
                <span className="mb-2 block text-sm text-gray-300">
                  Confirm password
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <LockKeyhole className="h-5 w-5 text-yellow-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full bg-transparent outline-none"
                    required
                  />
                </div>
              </label>
            )}

            {mode === "signup" && role === "admin" && (
              <label className="block">
                <span className="mb-2 block text-sm text-gray-300">Admin key</span>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <KeyRound className="h-5 w-5 text-yellow-400" />
                  <input
                    type="password"
                    name="adminKey"
                    value={formData.adminKey}
                    onChange={handleChange}
                    placeholder="Enter admin signup key"
                    className="w-full bg-transparent outline-none"
                    required
                  />
                </div>
              </label>
            )}
          </div>

          {role !== "admin" && googleClientId && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-sm text-gray-300">Quick access with Google</p>
              <div ref={googleButtonRef} className="min-h-[44px]" />
              {googleLoading && (
                <p className="mt-3 text-sm text-gray-400">Signing in with Google...</p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-4 font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting
              ? "Please wait..."
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
