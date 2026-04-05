import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPinned } from "lucide-react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizePoint(point) {
  if (!point) {
    return null;
  }

  const x = 40 + ((point.lng - 75.78) / 0.14) * 240;
  const y = 150 - ((point.lat - 22.66) / 0.11) * 115;

  return {
    x: clamp(x, 28, 292),
    y: clamp(y, 24, 156),
    label: point.label,
  };
}

function buildPath(start, end) {
  if (!start || !end) {
    return "";
  }

  const controlOneX = start.x + (end.x - start.x) * 0.28;
  const controlOneY = start.y - 36;
  const controlTwoX = start.x + (end.x - start.x) * 0.72;
  const controlTwoY = end.y + 34;

  return `M ${start.x} ${start.y} C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${end.x} ${end.y}`;
}

function interpolatePoint(start, end, progress) {
  if (!start || !end) {
    return { x: 0, y: 0 };
  }

  const ratio = clamp(progress / 100, 0, 1);

  return {
    x: start.x + (end.x - start.x) * ratio,
    y:
      start.y +
      (end.y - start.y) * ratio -
      Math.sin(ratio * Math.PI) * 24,
  };
}

function RideMapCard({
  start,
  end,
  progress = 0,
  heading = "Route map",
  helperText = "Live route preview",
}) {
  const normalizedStart = useMemo(() => normalizePoint(start), [start]);
  const normalizedEnd = useMemo(() => normalizePoint(end), [end]);
  const routePath = useMemo(
    () => buildPath(normalizedStart, normalizedEnd),
    [normalizedEnd, normalizedStart]
  );
  const rider = useMemo(
    () => interpolatePoint(normalizedStart, normalizedEnd, progress),
    [normalizedEnd, normalizedStart, progress]
  );

  return (
    <div className="theme-card-soft rounded-[28px] p-5">
      <div className="flex items-center gap-3">
        <MapPinned className="theme-accent h-5 w-5" />
        <div>
          <h2 className="text-xl font-semibold">{heading}</h2>
          <p className="theme-text-soft text-sm">{helperText}</p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[26px] border border-[var(--app-border)] bg-[linear-gradient(180deg,#f8fafc,#dbeafe)] p-3 dark:bg-[linear-gradient(180deg,#0f172a,#111827)]">
        <svg viewBox="0 0 320 180" className="h-64 w-full rounded-2xl">
          <rect x="0" y="0" width="320" height="180" fill="rgba(255,255,255,0.42)" />
          <path d="M18 32 H302" stroke="rgba(100,116,139,0.22)" strokeWidth="10" strokeLinecap="round" />
          <path d="M24 92 H292" stroke="rgba(100,116,139,0.18)" strokeWidth="8" strokeLinecap="round" />
          <path d="M44 148 H276" stroke="rgba(100,116,139,0.2)" strokeWidth="8" strokeLinecap="round" />
          <path d="M88 16 V164" stroke="rgba(100,116,139,0.18)" strokeWidth="8" strokeLinecap="round" />
          <path d="M176 10 V170" stroke="rgba(100,116,139,0.15)" strokeWidth="6" strokeLinecap="round" />
          <path d="M254 22 V160" stroke="rgba(100,116,139,0.18)" strokeWidth="8" strokeLinecap="round" />

          <rect x="34" y="46" width="28" height="20" rx="6" fill="rgba(251,191,36,0.24)" />
          <rect x="118" y="118" width="34" height="22" rx="6" fill="rgba(34,197,94,0.18)" />
          <rect x="238" y="72" width="32" height="18" rx="6" fill="rgba(96,165,250,0.2)" />

          {routePath ? (
            <>
              <path
                d={routePath}
                fill="none"
                stroke="rgba(245,158,11,0.22)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d={routePath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="6"
                strokeDasharray="10 8"
                strokeLinecap="round"
              />
            </>
          ) : null}

          {normalizedStart ? (
            <>
              <circle cx={normalizedStart.x} cy={normalizedStart.y} r="12" fill="#16a34a" opacity="0.18" />
              <circle cx={normalizedStart.x} cy={normalizedStart.y} r="7" fill="#16a34a" />
              <text x={normalizedStart.x - 24} y={normalizedStart.y + 24} fontSize="11" fill="#0f172a">
                {normalizedStart.label}
              </text>
            </>
          ) : null}

          {normalizedEnd ? (
            <>
              <circle cx={normalizedEnd.x} cy={normalizedEnd.y} r="12" fill="#dc2626" opacity="0.18" />
              <circle cx={normalizedEnd.x} cy={normalizedEnd.y} r="7" fill="#dc2626" />
              <text x={normalizedEnd.x - 30} y={normalizedEnd.y - 14} fontSize="11" fill="#0f172a">
                {normalizedEnd.label}
              </text>
            </>
          ) : null}

          {routePath ? (
            <motion.g
              animate={{ x: rider.x - 160, y: rider.y - 90 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <rect x="152" y="82" width="18" height="10" rx="3" fill="#111827" />
              <circle cx="156" cy="94" r="4" fill="#111827" />
              <circle cx="166" cy="94" r="4" fill="#111827" />
            </motion.g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}

export default RideMapCard;
