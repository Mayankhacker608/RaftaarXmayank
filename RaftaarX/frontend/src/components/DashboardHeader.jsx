import React from "react";
import { Home, LogOut, MoonStar, SunMedium } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";
import { useTheme } from "../hooks/useTheme.js";

function DashboardHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  quickLinks = [],
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const initials = (user?.name || "RX")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="theme-card rounded-[30px] p-4 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          {eyebrow ? (
            <p className="theme-accent text-xs font-semibold uppercase tracking-[0.35em]">
              {eyebrow}
            </p>
          ) : null}
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
            {subtitle ? (
              <p className="theme-text-muted mt-3 max-w-3xl text-sm leading-6 sm:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="theme-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            >
              <Home className="h-4 w-4" />
              Home
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            >
              {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              {isDark ? "Light theme" : "Dark theme"}
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/auth");
              }}
              className="theme-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          <div className="theme-card-soft flex items-center gap-3 rounded-full px-3 py-2">
            <span className="theme-account-avatar">{initials}</span>
            <div>
              <p className="text-sm font-semibold">{user?.name || "RaftaarX account"}</p>
              <p className="theme-text-soft text-xs capitalize">
                {user?.role || "account"}
              </p>
            </div>
            {badge ? (
              <span className="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
                {badge}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {quickLinks.length ? (
        <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
          {quickLinks.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to, item.state ? { state: item.state } : undefined)}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                  isActive ? "theme-primary-button" : "theme-secondary-button"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default DashboardHeader;
