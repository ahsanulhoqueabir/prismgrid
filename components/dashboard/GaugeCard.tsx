import React from "react";
import type { GaugeCardProps } from "@/types/business/component.types";
import { formatMetricValue } from "@/lib/utils/format.utils";

export const GaugeCard: React.FC<GaugeCardProps> = ({
  value,
  min,
  max,
  unit,
  label,
  icon,
  isLoading,
  statusText,
  statusColor,
  gradientId,
  gradientColors,
}) => {
  // Calculate percentage clamped between 0 and 1
  const rawPercentage = (value - min) / (max - min);
  const percentage = Math.max(0, Math.min(1, rawPercentage));

  // Gauge dimensions
  // Arc path: M 20 85 A 60 60 0 0 1 140 85 (Semi-circle with radius 60, center at 80, 85)
  // Circumference of semi-circle = pi * r = 3.14159265 * 60 = 188.5
  const strokeLength = 188.5;
  const strokeDashoffset = strokeLength - percentage * strokeLength;

  // Needle rotation angle (from -90 to +90 degrees)
  const needleAngle = (percentage - 0.5) * 180;

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md duration-300 flex flex-col items-center">
      {/* Card Header Info */}
      <div className="flex w-full items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="text-zinc-500 dark:text-zinc-400">{icon}</div>
      </div>

      {/* SVG Circular Gauge */}
      <div className="relative w-full max-w-37.5 aspect-4/3 flex items-center justify-center">
        <svg viewBox="0 0 160 100" className="w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientColors.start} />
              <stop offset="100%" stopColor={gradientColors.end} />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d="M 20 85 A 60 60 0 0 1 140 85"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-zinc-100 dark:text-zinc-800"
          />

          {/* Foreground Active Arc */}
          <path
            d="M 20 85 A 60 60 0 0 1 140 85"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={strokeLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />

          {/* Dial ticks (Start, Middle, End) */}
          <line
            x1="20"
            y1="85"
            x2="25"
            y2="85"
            stroke="currentColor"
            strokeWidth="1"
            className="text-zinc-300 dark:text-zinc-700"
          />
          <line
            x1="80"
            y1="25"
            x2="80"
            y2="30"
            stroke="currentColor"
            strokeWidth="1"
            className="text-zinc-300 dark:text-zinc-700"
          />
          <line
            x1="140"
            y1="85"
            x2="135"
            y2="85"
            stroke="currentColor"
            strokeWidth="1"
            className="text-zinc-300 dark:text-zinc-700"
          />

          {/* Needle Pointer */}
          <path
            d="M 77 85 L 80 32 L 83 85 Z"
            className="fill-zinc-800 dark:fill-zinc-200 transition-transform duration-1000 ease-out"
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: "80px 85px",
            }}
          />

          {/* Center Hub */}
          <circle
            cx="80"
            cy="85"
            r="8"
            className="fill-zinc-800 dark:fill-zinc-200"
          />
          <circle
            cx="80"
            cy="85"
            r="3.5"
            className="fill-white dark:fill-zinc-900"
          />
        </svg>

        {/* Live Value Centered at the bottom of the arc */}
        <div className="absolute -bottom-2 flex flex-col items-center">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-extrabold text-zinc-900 dark:text-white leading-none">
              {formatMetricValue(value, unit, isLoading)}
            </span>
            <span className="text-[10px] font-semibold text-zinc-400">
              {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Min / Max Range Markers under Gauge */}
      <div className="flex w-full justify-between px-2 text-[9px] font-semibold text-zinc-400 dark:text-zinc-550 -mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      {/* Status Indicators */}
      <div className="mt-3.5 flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-850 px-2.5 py-1 rounded-full border border-zinc-150/40 dark:border-zinc-800/40 w-full justify-center">
        <span
          className={`h-2 w-2 rounded-full ${isLoading ? "bg-zinc-200 animate-pulse" : statusColor}`}
        />
        <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {isLoading ? "Syncing" : statusText}
        </span>
      </div>
    </div>
  );
};
