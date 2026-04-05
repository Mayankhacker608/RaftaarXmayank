import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  Moon,
  SunMedium,
  UserRound,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";
import { useTheme } from "../hooks/useTheme.js";

function Nav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Support", path: "/support" },
    { name: "Safety", path: "/safety" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  const dashboardPath = useMemo(() => {
    if (!user?.role) {
      return "/auth";
    }

    if (user.role === "partner") {
      return "/partner";
    }

    if (user.role === "admin") {
      return "/admin";
    }

    return "/user";
  }, [user?.role]);

  const accountInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "R";

  return (
    <motion.nav
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="theme-navbar fixed left-1/2 top-4 z-50 w-[calc(100%-1rem)] max-w-6xl -translate-x-1/2 rounded-[28px] backdrop-blur-md sm:top-5 sm:w-[94%] lg:w-[78%]"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
          <div className="theme-account-avatar">R</div>
          <div>
            <p className="text-lg font-black tracking-tight sm:text-xl">RaftaarX</p>
            <p className="theme-text-soft text-xs">Fast rides, cleaner dashboards</p>
          </div>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={`text-sm font-medium transition ${
                    isActive ? "theme-accent" : "theme-text-muted hover:text-[var(--app-text)]"
                  }`}
                >
                  {item.name}
                </Link>
                <span
                  className={`absolute -bottom-2 left-0 h-0.5 rounded-full bg-[var(--app-accent)] transition-all duration-300 ${
                    isActive ? "w-full" : "w-0"
                  }`}
                />
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          >
            {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? "Light" : "Dark"}
          </button>

          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="theme-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="theme-card-soft flex items-center gap-3 rounded-full px-3 py-2">
                <span className="theme-account-avatar h-9 w-9">{accountInitial}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="theme-text-soft text-xs capitalize">{user.role} account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="theme-primary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="theme-primary-button inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
            >
              <UserRound className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-secondary-button rounded-full p-2"
            aria-label="Toggle theme"
          >
            {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((previous) => !previous)}
            className="theme-secondary-button rounded-full px-3 py-2 text-sm font-semibold"
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        className="overflow-hidden md:hidden"
      >
        <div className="border-t border-[var(--app-border)] px-4 py-4">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                  location.pathname === item.path
                    ? "theme-chip"
                    : "theme-card-soft"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setIsOpen(false)}
                  className="theme-primary-button rounded-2xl px-4 py-3 text-sm font-semibold"
                >
                  Open Dashboard
                </Link>
                <div className="theme-card-soft rounded-2xl px-4 py-3">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="theme-text-soft text-xs capitalize">{user.role} account</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="theme-secondary-button rounded-2xl px-4 py-3 text-sm font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="theme-primary-button rounded-2xl px-4 py-3 text-sm font-semibold"
              >
                Login / Signup
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}

export default Nav;
