import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, MapPinned, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import heroImage from "../assets/hero.jpeg";
import { useTheme } from "../hooks/useTheme.js";

function Hero() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeRiders, setActiveRiders] = React.useState(142);
  const [activePartners, setActivePartners] = React.useState(86);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveRiders((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next < 120 ? 120 : next > 180 ? 180 : next;
      });
      setActivePartners((prev) => {
        const delta = Math.random() > 0.6 ? 1 : -1;
        const next = prev + delta;
        return next < 70 ? 70 : next > 110 ? 110 : next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);


  return (
    <section className="theme-page relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="theme-chip inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold">
            Smart Booking Flow
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Ride booking jo dikhe bhi modern aur chale bhi smoothly.
            </h1>
            <p className="theme-text-muted max-w-2xl text-base leading-7 sm:text-lg">
              RaftaarX ek single platform me rider booking, partner onboarding,
              admin approvals, live tracking aur payment journey ko connect karta hai.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="theme-primary-button inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-semibold transition hover:scale-[1.01]"
            >
              Start Booking
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/about")}
              className="theme-secondary-button rounded-2xl px-6 py-3.5 font-semibold"
            >
              Explore Platform
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Fast Match",
                text: "User se partner tak cleaner ride lifecycle",
                icon: Clock3,
              },
              {
                title: "Route Ready",
                text: "Booking, preview aur tracking flow aligned",
                icon: MapPinned,
              },
              {
                title: "Secure Review",
                text: "Partner approvals aur admin control together",
                icon: ShieldCheck,
              },
            ].map((item) => (
              <div key={item.title} className="theme-card rounded-[24px] p-4">
                <item.icon className="theme-accent h-5 w-5" />
                <p className="mt-4 font-semibold">{item.title}</p>
                <p className="theme-text-soft mt-2 text-sm leading-6">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          className="relative"
        >
          <div className="theme-card relative overflow-hidden rounded-[34px] p-3">
            <div className="relative overflow-hidden rounded-[28px]">
              <img
                src={heroImage}
                alt="RaftaarX booking experience"
                className="h-[420px] w-full object-cover sm:h-[500px]"
              />
              <div
                className={`absolute inset-0 ${
                  isDark
                    ? "bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent"
                    : "bg-gradient-to-t from-white/70 via-white/10 to-transparent"
                }`}
              />

              <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-2">
                <div
                  className={`rounded-[24px] border border-white/25 p-4 backdrop-blur-md ${
                    isDark
                      ? "bg-slate-950/75 text-white"
                      : "bg-white/80 text-slate-900"
                  }`}
                >
                  <p
                    className={`text-xs uppercase tracking-[0.28em] ${
                      isDark ? "text-amber-300" : "text-amber-600"
                    }`}
                  >
                    Rider Flow
                  </p>
                  <p className="mt-2 text-xl font-bold">Book, Track, Pay</p>
                  <p
                    className={`mt-2 text-sm ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Multi-step journey with route preview and live state updates.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/25 bg-slate-950/80 p-4 text-white backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-300">
                    Partner Flow
                  </p>
                  <p className="mt-2 text-xl font-bold">Review to Go-Live</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Documents, onboarding, approval, booking acceptance and delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="theme-card absolute -bottom-6 -left-2 hidden rounded-[24px] px-5 py-4 sm:block lg:-left-8">
            <p className="theme-text-soft text-xs uppercase tracking-[0.3em]">
              Live Ready
            </p>
            <p className="mt-2 text-2xl font-black">User + Partner + Admin</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
